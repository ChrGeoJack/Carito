import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RingMessage } from "../config/birthdayData";
import { playCosmicRingSound, playTapSound } from "../utils/soundEffects";
import { Sparkles, ZoomIn, ZoomOut, RotateCw, Info, X, Heart, Eye } from "lucide-react";

interface SaturnViewerProps {
  ringMessages: RingMessage[];
}

export const SaturnViewer: React.FC<SaturnViewerProps> = ({ ringMessages }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRing, setSelectedRing] = useState<RingMessage | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [zoomPercent, setZoomPercent] = useState<number>(50);
  const [showGuide, setShowGuide] = useState<boolean>(true);

  // References for three.js manipulation outside react render cycles
  const sceneStateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    saturnGroup: THREE.Group | null;
    ringMarkers: { mesh: THREE.Mesh; data: RingMessage; radius: number; angle: number; speed: number }[];
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    isDragging: boolean;
    prevPointer: { x: number; y: number };
    spherical: { radius: number; theta: number; phi: number };
    targetSpherical: { radius: number; theta: number; phi: number };
    minRadius: number;
    maxRadius: number;
    touchDist: number | null;
    autoRotateRef: boolean;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    saturnGroup: null,
    ringMarkers: [],
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    isDragging: false,
    prevPointer: { x: 0, y: 0 },
    spherical: { radius: 9.5, theta: 0.6, phi: 1.1 },
    targetSpherical: { radius: 9.5, theta: 0.6, phi: 1.1 },
    minRadius: 4.8, // Limit: closest zoom
    maxRadius: 17.0, // Limit: farthest zoom
    touchDist: null,
    autoRotateRef: true,
  });

  // Keep autoRotateRef in sync
  useEffect(() => {
    sceneStateRef.current.autoRotateRef = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060312, 0.025);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 9);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with SRGB color space
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x231d3e, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3db, 3.2);
    sunLight.position.set(12, 8, 14);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    rimLight.position.set(-14, -6, -10);
    scene.add(rimLight);

    // 5. Starfield Background
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xfde047),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xf472b6),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 35 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. Procedural Saturn Texture (Banded gas giant)
    const saturnCanvas = document.createElement("canvas");
    saturnCanvas.width = 1024;
    saturnCanvas.height = 512;
    const ctx = saturnCanvas.getContext("2d")!;

    // Base atmospheric bands
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.00, "#2a2438");
    grad.addColorStop(0.10, "#4a3b32");
    grad.addColorStop(0.20, "#9c7c58");
    grad.addColorStop(0.32, "#d6b588");
    grad.addColorStop(0.45, "#e8cca4");
    grad.addColorStop(0.50, "#eed7b0"); // Equator
    grad.addColorStop(0.55, "#e2c092");
    grad.addColorStop(0.68, "#b89368");
    grad.addColorStop(0.80, "#6e523e");
    grad.addColorStop(0.92, "#3d2e2b");
    grad.addColorStop(1.00, "#1f182b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Add subtle procedural noise & fine atmospheric stripes
    for (let y = 0; y < 512; y += 3) {
      const alpha = 0.04 + Math.sin(y * 0.15) * 0.03;
      ctx.fillStyle = y % 6 === 0 ? `rgba(255, 245, 225, ${alpha})` : `rgba(40, 20, 10, ${alpha})`;
      ctx.fillRect(0, y, 1024, 3);
    }

    const saturnTexture = new THREE.CanvasTexture(saturnCanvas);
    saturnTexture.colorSpace = THREE.SRGBColorSpace;

    // 7. Procedural Saturn Ring Texture (concentric rings + Cassini division)
    const ringCanvas = document.createElement("canvas");
    ringCanvas.width = 1024;
    ringCanvas.height = 64;
    const rCtx = ringCanvas.getContext("2d")!;

    const ringGrad = rCtx.createLinearGradient(0, 0, 1024, 0);
    ringGrad.addColorStop(0.00, "rgba(220, 190, 150, 0.0)");
    ringGrad.addColorStop(0.08, "rgba(200, 175, 140, 0.45)"); // Ring D
    ringGrad.addColorStop(0.20, "rgba(215, 185, 145, 0.70)"); // Ring C
    ringGrad.addColorStop(0.35, "rgba(245, 220, 180, 0.95)"); // Ring B (brightest)
    ringGrad.addColorStop(0.58, "rgba(235, 210, 170, 0.88)");
    ringGrad.addColorStop(0.64, "rgba(20, 10, 30, 0.05)");   // Cassini Division
    ringGrad.addColorStop(0.68, "rgba(225, 195, 160, 0.75)"); // Ring A
    ringGrad.addColorStop(0.88, "rgba(210, 180, 145, 0.60)");
    ringGrad.addColorStop(0.92, "rgba(20, 10, 30, 0.0)");   // Encke Gap
    ringGrad.addColorStop(0.96, "rgba(230, 200, 170, 0.50)"); // Ring F
    ringGrad.addColorStop(1.00, "rgba(200, 170, 130, 0.0)");
    rCtx.fillStyle = ringGrad;
    rCtx.fillRect(0, 0, 1024, 64);

    // Subtle fine ring dust grain
    for (let x = 0; x < 1024; x += 2) {
      if (Math.random() > 0.4) {
        rCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.08})`;
        rCtx.fillRect(x, 0, 1, 64);
      }
    }

    const ringTexture = new THREE.CanvasTexture(ringCanvas);
    ringTexture.colorSpace = THREE.SRGBColorSpace;

    // 8. Assemble Saturn Group
    const saturnGroup = new THREE.Group();
    // Saturn's authentic axial tilt (~26.7 degrees)
    saturnGroup.rotation.z = THREE.MathUtils.degToRad(26.73);
    saturnGroup.rotation.x = THREE.MathUtils.degToRad(8.0);
    scene.add(saturnGroup);

    // Planet Sphere (Saturn is slightly oblate in reality, radius 2.0)
    const planetGeo = new THREE.SphereGeometry(2.0, 64, 48);
    planetGeo.scale(1.0, 0.91, 1.0); // Polar flattening
    const planetMat = new THREE.MeshStandardMaterial({
      map: saturnTexture,
      roughness: 0.75,
      metalness: 0.08,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    saturnGroup.add(planetMesh);

    // Atmospheric Glow layer
    const glowGeo = new THREE.SphereGeometry(2.04, 32, 24);
    glowGeo.scale(1.0, 0.91, 1.0);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xf5d0a9,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    saturnGroup.add(glowMesh);

    // Planetary Rings
    const innerRadius = 2.45;
    const outerRadius = 5.3;
    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 128, 4);

    // Fix UV mapping for concentric texture mapping on RingGeometry
    const pos = ringGeo.attributes.position;
    const uvs = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const u = (dist - innerRadius) / (outerRadius - innerRadius);
      uvs.setXY(i, u, 0.5);
    }
    uvs.needsUpdate = true;

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      roughness: 0.6,
      metalness: 0.1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2; // Flat on Saturn's equatorial plane
    saturnGroup.add(ringMesh);

    // 9. Interactive Ring Message Nodes (Orbs orbiting on the rings)
    const ringMarkers: { mesh: THREE.Mesh; data: RingMessage; radius: number; angle: number; speed: number }[] = [];
    const markerGroup = new THREE.Group();
    markerGroup.rotation.x = Math.PI / 2;
    saturnGroup.add(markerGroup);

    ringMessages.forEach((msg, idx) => {
      // Distribute radii evenly across the ring span (2.65 to 4.95)
      const r = innerRadius + 0.35 + (idx / Math.max(1, ringMessages.length - 1)) * (outerRadius - innerRadius - 0.7);
      const angle = (idx / ringMessages.length) * Math.PI * 2;

      // Glowing interactive beacon orb
      const orbGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(msg.color),
        emissive: new THREE.Color(msg.color),
        emissiveIntensity: 0.85,
        roughness: 0.2,
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0.04);
      orbMesh.userData = { isRingMarker: true, ringData: msg };

      // Add a delicate glow ring around the marker
      const haloGeo = new THREE.RingGeometry(0.16, 0.22, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(msg.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      orbMesh.add(haloMesh);

      markerGroup.add(orbMesh);
      ringMarkers.push({
        mesh: orbMesh,
        data: msg,
        radius: r,
        angle: angle,
        speed: 0.003 + (1 / r) * 0.004,
      });
    });

    // Save references in ref
    const s = sceneStateRef.current;
    s.renderer = renderer;
    s.scene = scene;
    s.camera = camera;
    s.saturnGroup = saturnGroup;
    s.ringMarkers = ringMarkers;

    // Helper: Update camera from spherical coordinates with damping
    const updateCameraPosition = () => {
      // Clamp spherical target within strict bounds
      s.targetSpherical.radius = THREE.MathUtils.clamp(
        s.targetSpherical.radius,
        s.minRadius,
        s.maxRadius
      );
      // Clamp vertical phi to prevent gimbal flips
      s.targetSpherical.phi = THREE.MathUtils.clamp(
        s.targetSpherical.phi,
        0.15,
        Math.PI - 0.15
      );

      // Smooth damping interpolation
      s.spherical.radius += (s.targetSpherical.radius - s.spherical.radius) * 0.12;
      s.spherical.theta += (s.targetSpherical.theta - s.spherical.theta) * 0.12;
      s.spherical.phi += (s.targetSpherical.phi - s.spherical.phi) * 0.12;

      // Convert spherical to Cartesian
      const sinPhiRadius = Math.sin(s.spherical.phi) * s.spherical.radius;
      camera.position.x = sinPhiRadius * Math.sin(s.spherical.theta);
      camera.position.y = Math.cos(s.spherical.phi) * s.spherical.radius;
      camera.position.z = sinPhiRadius * Math.cos(s.spherical.theta);
      camera.lookAt(0, 0, 0);

      // Update zoom percentage for UI feedback
      const pct = Math.round(
        (1 - (s.spherical.radius - s.minRadius) / (s.maxRadius - s.minRadius)) * 100
      );
      setZoomPercent(pct);
    };

    // 10. Pointer & Gesture Handlers
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      s.isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      s.prevPointer = { x: clientX, y: clientY };

      if ("touches" in e && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        s.touchDist = Math.sqrt(dx * dx + dy * dy);
      } else {
        s.touchDist = null;
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!s.isDragging) return;

      if ("touches" in e && e.touches.length === 2) {
        // Pinch-to-zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (s.touchDist !== null) {
          const delta = (s.touchDist - dist) * 0.025;
          s.targetSpherical.radius += delta;
        }
        s.touchDist = dist;
        return;
      }

      // 1-finger / mouse rotation
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - s.prevPointer.x;
      const deltaY = clientY - s.prevPointer.y;

      s.targetSpherical.theta -= deltaX * 0.007;
      s.targetSpherical.phi -= deltaY * 0.007;

      s.prevPointer = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      s.isDragging = false;
      s.touchDist = null;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Zoom with mouse wheel, clamped strictly
      const delta = e.deltaY * 0.008;
      s.targetSpherical.radius += delta;
    };

    const handleClickOrTap = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;

      s.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      s.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      s.raycaster.setFromCamera(s.mouse, camera);

      // Check intersection with markers first
      const markerMeshes = s.ringMarkers.map(m => m.mesh);
      const markerHits = s.raycaster.intersectObjects(markerMeshes, true);

      if (markerHits.length > 0) {
        // Clicked a specific marker orb
        const hit = markerHits[0];
        let root = hit.object;
        while (root.parent && !root.userData?.isRingMarker) {
          root = root.parent as THREE.Mesh;
        }
        const data = root.userData?.ringData as RingMessage;
        if (data) {
          setSelectedRing(data);
          playCosmicRingSound(1.2);
          return;
        }
      }

      // Check intersection with the ring surface
      const ringHits = s.raycaster.intersectObject(ringMesh);
      if (ringHits.length > 0) {
        const hitPoint = ringHits[0].point;
        // Find closest message on the rings
        let closestMsg: RingMessage = ringMessages[0];
        let minD = Infinity;

        s.ringMarkers.forEach(m => {
          const worldPos = new THREE.Vector3();
          m.mesh.getWorldPosition(worldPos);
          const d = worldPos.distanceTo(hitPoint);
          if (d < minD) {
            minD = d;
            closestMsg = m.data;
          }
        });

        setSelectedRing(closestMsg);
        playCosmicRingSound(1.0);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    dom.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);
    dom.addEventListener("wheel", handleWheel, { passive: false });
    dom.addEventListener("click", handleClickOrTap);

    // Handle container resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 11. Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Gentle auto-rotation of planet and rings if not manually dragging
      if (s.autoRotateRef && !s.isDragging) {
        planetMesh.rotation.y += delta * 0.15;
        s.targetSpherical.theta += delta * 0.04;
      }

      // Update ring markers position in orbit
      s.ringMarkers.forEach(m => {
        m.angle += m.speed;
        m.mesh.position.x = Math.cos(m.angle) * m.radius;
        m.mesh.position.y = Math.sin(m.angle) * m.radius;
        // Subtle pulsing scale
        const scale = 1 + Math.sin(clock.getElapsedTime() * 3 + m.radius) * 0.15;
        m.mesh.scale.set(scale, scale, scale);
      });

      // Slowly rotate starfield for cosmic grandeur
      starField.rotation.y += delta * 0.005;

      // Update camera with smooth damping
      updateCameraPosition();

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      dom.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      dom.removeEventListener("wheel", handleWheel);
      dom.removeEventListener("click", handleClickOrTap);
      window.removeEventListener("resize", handleResize);

      saturnGeoDispose(scene);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [ringMessages]);

  // Helper to zoom in/out with UI buttons
  const zoomIn = () => {
    playTapSound();
    const s = sceneStateRef.current;
    s.targetSpherical.radius = Math.max(s.minRadius, s.targetSpherical.radius - 1.5);
  };

  const zoomOut = () => {
    playTapSound();
    const s = sceneStateRef.current;
    s.targetSpherical.radius = Math.min(s.maxRadius, s.targetSpherical.radius + 1.5);
  };

  const resetView = () => {
    playTapSound();
    const s = sceneStateRef.current;
    s.targetSpherical.radius = 9.5;
    s.targetSpherical.theta = 0.6;
    s.targetSpherical.phi = 1.1;
  };

  const ringView = () => {
    playTapSound();
    const s = sceneStateRef.current;
    s.targetSpherical.radius = 5.8;
    s.targetSpherical.theta = 1.2;
    s.targetSpherical.phi = 0.45; // Top-down angle to admire rings
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#080415] via-[#0d0922] to-[#050210] border border-amber-500/20 shadow-2xl shadow-purple-950/40">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[520px] sm:h-[620px] cursor-grab active:cursor-grabbing touch-none select-none relative"
      />

      {/* Top Banner Guide */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs sm:text-sm text-slate-200 flex items-center gap-2 pointer-events-auto shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>
            Toca o haz clic en los <strong>anillos luminosos</strong> para leer mensajes
          </span>
        </div>

        {/* Zoom Level Indicator */}
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-amber-200 font-mono hidden sm:flex items-center gap-1.5 pointer-events-auto">
          <span>Zoom:</span>
          <span className="font-bold text-amber-400">{zoomPercent}%</span>
        </div>
      </div>

      {/* Ring Message Cards Selector - Quick Access Pills */}
      <div className="absolute top-16 left-4 right-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none pointer-events-auto">
        {ringMessages.map((msg, i) => (
          <button
            key={msg.id}
            onClick={() => {
              setSelectedRing(msg);
              playCosmicRingSound(1.0 + i * 0.1);
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all backdrop-blur-md flex items-center gap-1.5 border ${
              selectedRing?.id === msg.id
                ? "bg-amber-400/20 border-amber-400 text-white shadow-lg shadow-amber-400/20 scale-105"
                : "bg-black/50 border-white/10 text-slate-300 hover:border-amber-400/50 hover:text-white"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: msg.color }}
            />
            <span>{msg.ringName.split("•")[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Floating Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-none">
        <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 pointer-events-auto text-xs sm:text-sm">
          {/* Zoom In/Out Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={zoomIn}
              title="Acercar (Límite cercano)"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 transition-colors flex items-center gap-1 active:scale-95"
            >
              <ZoomIn className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Acercar</span>
            </button>
            <button
              onClick={zoomOut}
              title="Alejar (Límite lejano)"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 transition-colors flex items-center gap-1 active:scale-95"
            >
              <ZoomOut className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Alejar</span>
            </button>
          </div>

          {/* Camera Presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={ringView}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-all flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Anillos</span>
            </button>
            <button
              onClick={resetView}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
            >
              Centrar
            </button>
          </div>

          {/* Auto-Rotation Toggle */}
          <button
            onClick={() => {
              setAutoRotate(!autoRotate);
              playTapSound();
            }}
            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 border ${
              autoRotate
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-white/5 border-white/10 text-slate-400"
            }`}
            title="Giro automático del universo"
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
            <span className="hidden md:inline">{autoRotate ? "Giro On" : "Giro Off"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Modal when Ring is Clicked / Touched */}
      {selectedRing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#18112e] via-[#100a20] to-[#0a0614] border border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/80 text-white">
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedRing(null);
                playTapSound();
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Ring Tag */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-lg"
                style={{ backgroundColor: selectedRing.color, boxShadow: `0 0 12px ${selectedRing.color}` }}
              />
              <span className="text-xs uppercase tracking-widest font-semibold text-amber-300/90">
                {selectedRing.ringName}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-serif-display text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 mb-4">
              {selectedRing.theme}
            </h3>

            {/* The Main Heartfelt Message */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-5 relative">
              <span className="text-3xl text-amber-400/30 font-serif absolute top-1 left-2">“</span>
              <p className="text-base sm:text-lg text-amber-50 font-medium leading-relaxed pl-4 font-serif-display italic">
                {selectedRing.message}
              </p>
            </div>

            {/* Positive Reflection */}
            <div className="space-y-1.5 mb-6 text-sm text-slate-300 bg-purple-950/30 p-4 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Reflexión para tus 18 años</span>
              </div>
              <p className="leading-relaxed text-slate-200">
                {selectedRing.reflection}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                Un mensaje que viaja a la velocidad de la luz
              </span>
              <button
                onClick={() => {
                  setSelectedRing(null);
                  playTapSound();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium hover:opacity-95 transition-opacity"
              >
                Continuar Viaje 🪐
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memory cleanup helper for Three.js
function saturnGeoDispose(scene: THREE.Scene) {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
  });
}
