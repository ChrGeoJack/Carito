import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  playWaterSound,
  playSunSound,
  playBloomSound,
  playTapSound,
} from "../utils/soundEffects";
import {
  Droplets,
  Sun,
  Heart,
  Sparkles,
  RotateCcw,
  BookOpen,
  Award,
  Music,
  Lock,
  Unlock,
} from "lucide-react";

interface LilyGameProps {
  phrases: string[];
}

interface FlowerState {
  water: number;
  sun: number;
  love: number;
  stage: number; // 0 to 4
  bloomCount: number;
  unlockedPhrases: string[];
  lastCareTime: number;
}

const STORAGE_KEY_LILY = "bday_virtual_lily_progress_v1";

const STAGE_NAMES = [
  "Semilla con Amor 🌱",
  "Brote de Hojas Tiernas 🌿",
  "Tallo con Capullos 🌷",
  "¡Lirio en Floración! 🌸",
  "¡Lirio Mágico Resplandeciente! ✨🌺",
];

export const LilyGame: React.FC<LilyGameProps> = ({ phrases }) => {
  const [flower, setFlower] = useState<FlowerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LILY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      water: 35,
      sun: 40,
      love: 50,
      stage: 1,
      bloomCount: 0,
      unlockedPhrases: [phrases[0] || "¡Te quiero un montón! 💖"],
      lastCareTime: Date.now(),
    };
  });

  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [isAnimatingCare, setIsAnimatingCare] = useState<"water" | "sun" | "love" | "boost" | null>(null);
  const [isBloomingEffect, setIsBloomingEffect] = useState<boolean>(false);
  const [showJournal, setShowJournal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Save to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LILY, JSON.stringify(flower));
  }, [flower]);

  // Trigger speech popup
  const speakPhrase = (customPhrase?: string) => {
    const list = phrases.length > 0 ? phrases : ["¡Te quiero! 💖", "Eres lo mejor ✨"];
    const phrase = customPhrase || list[Math.floor(Math.random() * list.length)];
    setActiveSpeech(phrase);

    // Save phrase to unlocked list if not already there
    setFlower(prev => {
      if (!prev.unlockedPhrases.includes(phrase)) {
        return {
          ...prev,
          unlockedPhrases: [...prev.unlockedPhrases, phrase],
        };
      }
      return prev;
    });

    // Auto-hide speech bubble after 5.5s
    setTimeout(() => {
      setActiveSpeech((curr) => (curr === phrase ? null : curr));
    }, 5500);
  };

  // Check and trigger blooming if conditions met
  const checkBloomConditions = (newWater: number, newSun: number, newLove: number) => {
    const avgCare = (newWater + newSun + newLove) / 3;

    // Advance stages based on average care
    let nextStage = flower.stage;
    if (avgCare >= 85 && flower.stage < 4) {
      nextStage = 4;
    } else if (avgCare >= 65 && flower.stage < 3) {
      nextStage = 3;
    } else if (avgCare >= 35 && flower.stage < 2) {
      nextStage = 2;
    } else if (avgCare >= 15 && flower.stage < 1) {
      nextStage = 1;
    }

    // Trigger full bloom celebration when entering stage 3 or 4, or randomly when well-cared
    const shouldCelebrateBloom =
      (nextStage >= 3 && flower.stage < 3) ||
      (avgCare > 75 && Math.random() < 0.45);

    if (shouldCelebrateBloom) {
      triggerBloomCelebration(nextStage);
    } else {
      setFlower(prev => ({
        ...prev,
        water: newWater,
        sun: newSun,
        love: newLove,
        stage: nextStage,
        lastCareTime: Date.now(),
      }));
    }
  };

  const triggerBloomCelebration = (targetStage: number) => {
    setIsBloomingEffect(true);
    playBloomSound();

    // Fire cute pastel floral confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#fda4af", "#f43f5e", "#fef08a", "#a7f3d0", "#e9d5ff"],
    });

    const chosenPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    speakPhrase(chosenPhrase);

    setFlower(prev => ({
      ...prev,
      stage: targetStage >= 3 ? targetStage : 3,
      bloomCount: prev.bloomCount + 1,
      lastCareTime: Date.now(),
    }));

    setTimeout(() => {
      setIsBloomingEffect(false);
    }, 3000);
  };

  // Actions
  const handleWater = () => {
    playWaterSound();
    setIsAnimatingCare("water");
    setTimeout(() => setIsAnimatingCare(null), 1200);

    const newWater = Math.min(100, flower.water + 25);
    const newSun = Math.max(10, flower.sun - 5); // balance
    const newLove = Math.min(100, flower.love + 5);

    checkBloomConditions(newWater, newSun, newLove);
  };

  const handleSun = () => {
    playSunSound();
    setIsAnimatingCare("sun");
    setTimeout(() => setIsAnimatingCare(null), 1200);

    const newSun = Math.min(100, flower.sun + 25);
    const newWater = Math.max(10, flower.water - 5);
    const newLove = Math.min(100, flower.love + 5);

    checkBloomConditions(newWater, newSun, newLove);
  };

  const handleLove = () => {
    playTapSound();
    setIsAnimatingCare("love");
    setTimeout(() => setIsAnimatingCare(null), 1200);

    const newLove = Math.min(100, flower.love + 25);
    const newWater = flower.water;
    const newSun = flower.sun;

    // Love has high chance of making the flower speak!
    speakPhrase();
    checkBloomConditions(newWater, newSun, newLove);
  };

  const handleBirthdayBoost = () => {
    playBloomSound();
    setIsAnimatingCare("boost");
    setTimeout(() => setIsAnimatingCare(null), 1500);

    triggerBloomCelebration(4);
    setFlower(prev => ({
      ...prev,
      water: 100,
      sun: 100,
      love: 100,
      stage: 4,
    }));
  };

  const handleOpenResetDialog = () => {
    playTapSound();
    setShowResetConfirm(true);
  };

  const confirmResetFlower = () => {
    playTapSound();
    const resetState: FlowerState = {
      water: 30,
      sun: 30,
      love: 40,
      stage: 0,
      bloomCount: flower.bloomCount,
      unlockedPhrases: flower.unlockedPhrases,
      lastCareTime: Date.now(),
    };
    setFlower(resetState);
    localStorage.setItem(STORAGE_KEY_LILY, JSON.stringify(resetState));
    setActiveSpeech("¡Hola de nuevo! Cuidemos juntos esta semillita 🌱");
    setShowResetConfirm(false);
  };

  const confirmResetAndUnlockAll = () => {
    playBloomSound();
    const allPhrases = [...phrases];
    const resetState: FlowerState = {
      water: 30,
      sun: 30,
      love: 40,
      stage: 0,
      bloomCount: flower.bloomCount,
      unlockedPhrases: allPhrases,
      lastCareTime: Date.now(),
    };
    setFlower(resetState);
    localStorage.setItem(STORAGE_KEY_LILY, JSON.stringify(resetState));
    setActiveSpeech("¡Semillita plantada y las 12 frases desbloqueadas en tu diario! 🌸✨");
    setShowResetConfirm(false);
  };

  const unlockAllPhrasesDirectly = () => {
    playBloomSound();
    const allPhrases = [...phrases];
    setFlower(prev => {
      const updated = {
        ...prev,
        unlockedPhrases: allPhrases,
      };
      localStorage.setItem(STORAGE_KEY_LILY, JSON.stringify(updated));
      return updated;
    });
    setActiveSpeech("¡Las 12 frases han sido reveladas para ti! 💖📖");
  };

  const lockPhrasesToRediscover = () => {
    playTapSound();
    setFlower(prev => {
      const updated = {
        ...prev,
        unlockedPhrases: [],
      };
      localStorage.setItem(STORAGE_KEY_LILY, JSON.stringify(updated));
      return updated;
    });
    setActiveSpeech("¡Frases bloqueadas! Cuida tu lirio para volver a descubrirlas 🔒🌸");
  };

  const confirmResetAndLockAll = () => {
    playTapSound();
    const resetState: FlowerState = {
      water: 30,
      sun: 30,
      love: 40,
      stage: 0,
      bloomCount: 0,
      unlockedPhrases: [],
      lastCareTime: Date.now(),
    };
    setFlower(resetState);
    localStorage.setItem(STORAGE_KEY_LILY, JSON.stringify(resetState));
    setActiveSpeech("¡Semillita plantada y las 12 frases bloqueadas para descubrirlas otra vez! 🌱🔒");
    setShowResetConfirm(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#180d2b] via-[#120824] to-[#0a0515] border border-pink-500/30 p-6 sm:p-8 shadow-2xl shadow-purple-950/60 overflow-hidden">
        {/* Decorative background sparkles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Stage Info */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Minijuego Virtual
              </span>
              <span className="text-xs text-slate-400">Progreso guardado automáticamente</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-rose-100 to-amber-200 mt-1">
              Cuida tu Lirio Blanco Virtual 🌸
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Riégalo, dale sol y amor. Cuando florezca, te revelará hermosas frases para alegrar tus 18 años.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setShowJournal(true);
                playTapSound();
              }}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-medium text-pink-200 transition-all flex items-center gap-1.5 border border-pink-500/30"
              title="Ver frases desbloqueadas"
            >
              <BookOpen className="w-4 h-4 text-pink-400" />
              <span>Frases ({flower.unlockedPhrases.length}/{phrases.length})</span>
            </button>
            <button
              onClick={handleOpenResetDialog}
              className="px-3.5 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 border border-rose-500/30 active:scale-95 shadow-sm"
              title="Reiniciar el lirio desde el principio para volver a cuidarlo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reiniciar Lirio 🌱</span>
            </button>
          </div>
        </div>

        {/* Current Stage Badge */}
        <div className="relative z-10 my-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-xs sm:text-sm text-purple-200 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
            <span>Estado: <strong>{STAGE_NAMES[flower.stage]}</strong></span>
          </div>
          <div className="text-xs text-amber-300/90 font-medium flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Floraciones: {flower.bloomCount}</span>
          </div>
        </div>

        {/* Central Garden / Lily Pot Area */}
        <div className="relative z-10 my-6 py-6 flex flex-col items-center justify-center min-h-[340px] rounded-3xl bg-black/30 border border-white/5 relative overflow-hidden">
          
          {/* Animated Weather / Care Overlays */}
          {isAnimatingCare === "water" && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-bounce">
              <div className="flex gap-4">
                <span className="text-3xl animate-pulse">💧</span>
                <span className="text-4xl animate-bounce">💦</span>
                <span className="text-3xl animate-pulse">💧</span>
              </div>
            </div>
          )}

          {isAnimatingCare === "sun" && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 bg-amber-400/25 rounded-full blur-2xl animate-ping" />
              <div className="absolute text-5xl">☀️✨</div>
            </div>
          )}

          {isAnimatingCare === "love" && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="flex gap-6 animate-pulse">
                <span className="text-3xl text-pink-400">💖</span>
                <span className="text-4xl text-rose-400">✨</span>
                <span className="text-3xl text-pink-400">💕</span>
              </div>
            </div>
          )}

          {isBloomingEffect && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-pink-500/20 via-amber-400/10 to-transparent flex items-center justify-center animate-pulse">
              <div className="text-center">
                <span className="text-5xl animate-bounce inline-block">🌸✨🌺</span>
                <p className="text-amber-200 font-bold font-serif-display text-lg mt-2">
                  ¡EL LIRIO HA FLORECIDO CON AMOR!
                </p>
              </div>
            </div>
          )}

          {/* Interactive Speech Bubble From the Lily */}
          {activeSpeech && (
            <div className="mb-4 max-w-sm mx-4 p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 to-purple-950/90 border border-pink-400/50 shadow-xl shadow-rose-950/50 text-white text-center transform hover:scale-105 transition-transform animate-fadeIn relative">
              <span className="text-xs uppercase tracking-wider text-pink-300 font-semibold block mb-1">
                El Lirio te susurra con cariño:
              </span>
              <p className="text-base sm:text-lg font-serif-display italic font-semibold text-pink-100">
                “{activeSpeech}”
              </p>
              {/* Bubble tail */}
              <div className="w-3 h-3 bg-rose-950 border-r border-b border-pink-400/50 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
            </div>
          )}

          {/* Vector SVG Procedural Lily Flower based on Stage */}
          <div
            onClick={() => {
              playTapSound();
              speakPhrase();
            }}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95 group relative"
            title="Haz clic en la flor para escuchar una frase"
          >
            <LilyVisual stage={flower.stage} isBlooming={isBloomingEffect} />

            {/* Hint tag */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm text-[11px] text-pink-200 px-3 py-1 rounded-full whitespace-nowrap border border-pink-500/30">
              Toca la flor para hablarle 💖
            </div>
          </div>
        </div>

        {/* Status Meters (Agua, Sol, Amor) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Water Meter */}
          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/20">
            <div className="flex items-center justify-between text-xs text-blue-200 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-400" />
                Agua Fresca
              </span>
              <span className="font-bold text-blue-300">{flower.water}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${flower.water}%` }}
              />
            </div>
          </div>

          {/* Sun Meter */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/20">
            <div className="flex items-center justify-between text-xs text-amber-200 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Rayos de Sol
              </span>
              <span className="font-bold text-amber-300">{flower.sun}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500 rounded-full"
                style={{ width: `${flower.sun}%` }}
              />
            </div>
          </div>

          {/* Love Meter */}
          <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/20">
            <div className="flex items-center justify-between text-xs text-rose-200 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                Cariño & Palabras
              </span>
              <span className="font-bold text-rose-300">{flower.love}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-500 rounded-full"
                style={{ width: `${flower.love}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Care Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={handleWater}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/50 hover:to-cyan-600/50 border border-blue-400/40 text-blue-100 font-medium text-xs sm:text-sm transition-all active:scale-95 shadow-lg shadow-blue-950/30"
          >
            <Droplets className="w-4 h-4 text-cyan-300" />
            <span>Regar Agua</span>
          </button>

          <button
            onClick={handleSun}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-600/50 hover:to-yellow-600/50 border border-amber-400/40 text-amber-100 font-medium text-xs sm:text-sm transition-all active:scale-95 shadow-lg shadow-amber-950/30"
          >
            <Sun className="w-4 h-4 text-yellow-300" />
            <span>Dar Sol</span>
          </button>

          <button
            onClick={handleLove}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600/30 to-pink-600/30 hover:from-rose-600/50 hover:to-pink-600/50 border border-rose-400/40 text-rose-100 font-medium text-xs sm:text-sm transition-all active:scale-95 shadow-lg shadow-rose-950/30"
          >
            <Heart className="w-4 h-4 text-pink-300 fill-pink-300" />
            <span>Dar Cariño</span>
          </button>

          <button
            onClick={handleBirthdayBoost}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600/40 to-pink-600/40 hover:from-purple-600/60 hover:to-pink-600/60 border border-purple-400/40 text-purple-100 font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-lg shadow-purple-950/40"
            title="Hace florecer al instante con la magia de tus 18 años"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Magia 18 🎂</span>
          </button>
        </div>

        {/* Phrase Journal Modal */}
        {showJournal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1c1032] via-[#120a22] to-[#0a0515] border border-pink-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <h3 className="text-xl font-bold font-serif-display text-pink-200">
                    Diario de Frases del Lirio 📖🌸
                  </h3>
                  <p className="text-xs text-slate-300">
                    Mensajes y palabras bonitas que tu lirio ha guardado para ti.
                  </p>
                </div>
                <button
                  onClick={() => setShowJournal(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable list of phrases */}
              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
                {phrases.map((phrase, idx) => {
                  const isUnlocked = flower.unlockedPhrases.includes(phrase);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-sm transition-all ${
                        isUnlocked
                          ? "bg-pink-950/40 border-pink-500/30 text-pink-100 shadow-sm"
                          : "bg-white/5 border-white/5 text-slate-500 italic"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">
                          {isUnlocked ? "🌸" : "🔒"}
                        </span>
                        <p className={isUnlocked ? "font-serif-display" : ""}>
                          {isUnlocked ? phrase : "Sigue cuidando el lirio para desbloquear esta frase..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-400">
                <span>
                  Has revelado {flower.unlockedPhrases.length} de {phrases.length} frases
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {flower.unlockedPhrases.length > 0 && (
                    <button
                      onClick={lockPhrasesToRediscover}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="Volver a bloquear las frases para descubrirlas cuidando el lirio"
                    >
                      <Lock className="w-3.5 h-3.5 text-purple-300" />
                      <span>Bloquear frases para descubrirlas 🔒</span>
                    </button>
                  )}
                  {flower.unlockedPhrases.length < phrases.length && (
                    <button
                      onClick={unlockAllPhrasesDirectly}
                      className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="Desbloquear todas las 12 frases en el diario"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Desbloquear las 12 frases</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowJournal(false)}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Reset Confirmation Dialog with Unlock / Lock 12 Options */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#22123a] via-[#160a26] to-[#0c0517] border border-rose-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-white text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl">
                🌱
              </div>
              <h3 className="text-xl font-bold font-serif-display text-rose-200 mb-2">
                ¿Cómo deseas reiniciar el Lirio?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Elige cómo deseas comenzar de nuevo con tu experiencia floral:
              </p>

              <div className="space-y-3 mb-5">
                {/* Option 1: Reiniciar y bloquear las 12 frases para desbloquearlas otra vez */}
                <button
                  onClick={confirmResetAndLockAll}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600/40 to-pink-600/40 hover:from-purple-600/60 hover:to-pink-600/60 border border-purple-400/50 text-purple-100 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 active:scale-95 group"
                >
                  <Lock className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
                  <span>Reiniciar y bloquear frases para descubrirlas otra vez 🔒🌱</span>
                </button>

                {/* Option 2: Reiniciar y Desbloquear las 12 frases */}
                <button
                  onClick={confirmResetAndUnlockAll}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/30 via-rose-500/30 to-purple-500/30 hover:from-amber-500/50 hover:to-purple-500/50 border border-amber-400/50 text-amber-100 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95 group"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Reiniciar y desbloquear las 12 frases ✨</span>
                </button>

                {/* Option 3: Solo reiniciar la planta */}
                <button
                  onClick={confirmResetFlower}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Solo reiniciar la semillita (conservar frases) 🌱</span>
                </button>
              </div>

              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// SVG Visual Renderer of the Lily at each growth stage
const LilyVisual: React.FC<{ stage: number; isBlooming: boolean }> = ({ stage, isBlooming }) => {
  return (
    <svg
      width="240"
      height="260"
      viewBox="0 0 240 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="filter drop-shadow-lg"
    >
      <defs>
        {/* Pot Gradients */}
        <linearGradient id="potGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#1c0a00" />
        </linearGradient>

        {/* Stem Gradient */}
        <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>

        {/* Lily White-Pink Petal Gradient */}
        <linearGradient id="petalWhiteGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#fdf2f8" />
          <stop offset="90%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>

        <linearGradient id="petalBackGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        {/* Golden Anther Glow */}
        <radialGradient id="pollenGlow">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
      </defs>

      {/* Modern Ceramic Flower Pot */}
      <g id="flower-pot">
        {/* Pot Rim */}
        <ellipse cx="120" cy="205" rx="46" ry="10" fill="#f59e0b" />
        {/* Soil inside rim */}
        <ellipse cx="120" cy="205" rx="42" ry="8" fill="url(#soilGrad)" />

        {/* Pot Body */}
        <path
          d="M 76 205 L 86 248 C 88 253, 152 253, 154 248 L 164 205 Z"
          fill="url(#potGrad)"
        />
        {/* Pot decorative heart pattern */}
        <path
          d="M 120 230 C 117 225, 110 225, 110 231 C 110 236, 120 242, 120 242 C 120 242, 130 236, 130 231 C 130 225, 123 225, 120 230 Z"
          fill="#fef08a"
          opacity="0.75"
        />
      </g>

      {/* STAGE 0: Tiny cute seed with gentle sprout */}
      {stage === 0 && (
        <g id="stage-0" className="animate-pulse">
          <ellipse cx="120" cy="202" rx="6" ry="4" fill="#a16207" />
          <path d="M 120 200 Q 122 192 126 190" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="126" cy="190" r="2.5" fill="#22c55e" />
        </g>
      )}

      {/* STAGE 1: Young tender leaves emerging */}
      {stage === 1 && (
        <g id="stage-1">
          <path d="M 120 204 Q 120 180 120 165" stroke="url(#stemGrad)" strokeWidth="4" strokeLinecap="round" />
          {/* Left leaf */}
          <path
            d="M 120 180 C 105 175, 95 168, 90 172 C 95 182, 110 185, 120 182"
            fill="#4ade80"
          />
          {/* Right leaf */}
          <path
            d="M 120 175 C 135 170, 145 162, 150 166 C 145 176, 130 180, 120 177"
            fill="#22c55e"
          />
          {/* Top bud tip */}
          <ellipse cx="120" cy="162" rx="3.5" ry="5" fill="#86efac" />
        </g>
      )}

      {/* STAGE 2: Taller stem with multiple leaf tiers and a promising bud */}
      {stage === 2 && (
        <g id="stage-2">
          {/* Elegant curved main stem */}
          <path
            d="M 120 204 Q 121 160 118 125"
            stroke="url(#stemGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Lower leaves */}
          <path d="M 120 185 C 95 180, 80 170, 75 176 C 85 190, 108 192, 120 187" fill="#16a34a" />
          <path d="M 120 180 C 145 175, 160 165, 165 171 C 155 185, 132 188, 120 182" fill="#22c55e" />
          {/* Mid leaves */}
          <path d="M 119 155 C 100 148, 88 138, 85 142 C 95 152, 110 156, 119 156" fill="#4ade80" />
          <path d="M 119 150 C 138 143, 150 133, 153 138 C 143 148, 128 152, 119 151" fill="#15803d" />

          {/* Lily closed bud ready to bloom */}
          <g transform="translate(118, 125)">
            <ellipse cx="0" cy="-12" rx="9" ry="18" fill="#86efac" />
            <path d="M 0 0 C -7 -10, -8 -22, 0 -30 C 8 -22, 7 -10, 0 0 Z" fill="#bbf7d0" />
            <path d="M 0 -2 C 0 -15, 2 -26, 0 -30" stroke="#f472b6" strokeWidth="2" opacity="0.6" />
          </g>
        </g>
      )}

      {/* STAGE 3 & 4: Full Elegant White Lily in Gorgeous Bloom */}
      {(stage === 3 || stage === 4) && (
        <g id="stage-3-and-4">
          {/* Main Stem */}
          <path
            d="M 120 204 Q 122 150 120 105"
            stroke="url(#stemGrad)"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Rich arching Lily leaves */}
          <path d="M 120 182 C 85 178, 65 165, 58 174 C 72 192, 105 194, 120 185" fill="#15803d" />
          <path d="M 120 178 C 155 174, 175 160, 182 170 C 168 188, 135 190, 120 181" fill="#16a34a" />
          <path d="M 120 148 C 90 140, 75 125, 70 132 C 82 148, 108 152, 120 150" fill="#22c55e" />
          <path d="M 120 142 C 150 134, 165 120, 170 128 C 158 144, 132 148, 120 144" fill="#4ade80" />

          {/* Magic Halo for Stage 4 */}
          {stage === 4 && (
            <circle
              cx="120"
              cy="75"
              r="65"
              fill="url(#pollenGlow)"
              opacity="0.18"
              className="animate-pulse"
            />
          )}

          {/* Full Blooming Lily Flower Flowerhead (Lilium Candidum / Stargazer) */}
          <g id="lily-flowerhead" transform="translate(120, 75)">
            {/* Back Petals */}
            <path
              d="M 0 5 C -25 -10, -45 -45, -35 -60 C -15 -55, -8 -20, 0 5 Z"
              fill="url(#petalBackGrad)"
            />
            <path
              d="M 0 5 C 25 -10, 45 -45, 35 -60 C 15 -55, 8 -20, 0 5 Z"
              fill="url(#petalBackGrad)"
            />
            <path
              d="M 0 5 C -15 -25, 0 -70, 0 -75 C 0 -70, 15 -25, 0 5 Z"
              fill="url(#petalBackGrad)"
            />

            {/* Front Graceful White-Pink Petals */}
            <path
              d="M 0 6 C -40 10, -65 -15, -60 -25 C -45 -30, -18 -8, 0 6 Z"
              fill="url(#petalWhiteGrad)"
              stroke="#f472b6"
              strokeWidth="0.75"
            />
            <path
              d="M 0 6 C 40 10, 65 -15, 60 -25 C 45 -30, 18 -8, 0 6 Z"
              fill="url(#petalWhiteGrad)"
              stroke="#f472b6"
              strokeWidth="0.75"
            />
            <path
              d="M 0 8 C -22 25, -30 50, -25 55 C -10 50, -5 25, 0 8 Z"
              fill="url(#petalWhiteGrad)"
              stroke="#f472b6"
              strokeWidth="0.75"
            />
            <path
              d="M 0 8 C 22 25, 30 50, 25 55 C 10 50, 5 25, 0 8 Z"
              fill="url(#petalWhiteGrad)"
              stroke="#f472b6"
              strokeWidth="0.75"
            />
            <path
              d="M 0 5 C -12 -20, -25 -50, 0 -68 C 25 -50, 12 -20, 0 5 Z"
              fill="url(#petalWhiteGrad)"
              stroke="#f472b6"
              strokeWidth="0.75"
            />

            {/* Delicate Petal Midribs & Speckles */}
            <path d="M 0 5 Q -15 -28 0 -64" stroke="#ec4899" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 0 6 Q -35 -8 -54 -22" stroke="#ec4899" strokeWidth="1" strokeLinecap="round" />
            <path d="M 0 6 Q 35 -8 54 -22" stroke="#ec4899" strokeWidth="1" strokeLinecap="round" />

            {/* Lily Pistil & Stamens with Golden Pollen Anthers */}
            {/* Filaments */}
            <path d="M 0 5 Q -8 -15 -14 -32" stroke="#bbf7d0" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 0 5 Q 8 -15 14 -32" stroke="#bbf7d0" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 0 5 Q -18 -8 -28 -18" stroke="#bbf7d0" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 0 5 Q 18 -8 28 -18" stroke="#bbf7d0" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 0 5 Q 0 -18 0 -38" stroke="#86efac" strokeWidth="2.2" strokeLinecap="round" />

            {/* Anthers with golden pollen */}
            <ellipse cx="-14" cy="-33" rx="4" ry="2" fill="url(#pollenGlow)" transform="rotate(-20, -14, -33)" />
            <ellipse cx="14" cy="-33" rx="4" ry="2" fill="url(#pollenGlow)" transform="rotate(20, 14, -33)" />
            <ellipse cx="-28" cy="-19" rx="4" ry="2" fill="url(#pollenGlow)" transform="rotate(-40, -28, -19)" />
            <ellipse cx="28" cy="-19" rx="4" ry="2" fill="url(#pollenGlow)" transform="rotate(40, 28, -19)" />
            {/* Center Stigma */}
            <circle cx="0" cy="-39" r="3" fill="#15803d" />
          </g>

          {/* Sparkles orbiting flower for stage 4 */}
          {stage === 4 && (
            <g id="sparkle-particles">
              <circle cx="65" cy="55" r="2.5" fill="#fef08a" className="animate-ping" />
              <circle cx="175" cy="65" r="2.5" fill="#fef08a" className="animate-ping" />
              <circle cx="120" cy="15" r="3" fill="#ffffff" className="animate-pulse" />
              <circle cx="95" cy="110" r="2" fill="#f472b6" className="animate-pulse" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
};
