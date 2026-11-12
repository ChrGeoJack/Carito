import React from "react";
import confetti from "canvas-confetti";
import { PartyPopper, Volume2, VolumeX, Heart } from "lucide-react";
import { playBloomSound, playTapSound } from "../utils/soundEffects";

interface HeaderProps {
  activeTab: "letter" | "lily" | "saturn";
  onTabChange: (tab: "letter" | "lily" | "saturn") => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  soundOn,
  onToggleSound,
}) => {
  const triggerCelebrationBurst = () => {
    playBloomSound();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.3 },
      colors: ["#fb7185", "#f43f5e", "#f59e0b", "#38bdf8", "#c084fc", "#ffd700"],
    });
  };

  return (
    <header className="relative w-full pt-8 pb-6 px-4 flex flex-col items-center text-center">
      {/* Top Utilities Floating Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span>Para la mas importante en mi vida</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Confetti Trigger */}
          <button
            onClick={triggerCelebrationBurst}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-amber-200 transition-all flex items-center gap-1.5 border border-amber-400/30"
            title="Lanzar confeti festivo"
          >
            <PartyPopper className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">¡Celebrar!</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors border border-white/10"
            title={soundOn ? "Silenciar efectos de sonido" : "Activar efectos de sonido"}
          >
            {soundOn ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Big Greeting as requested: "felicidades" and below "18" */}
      <div className="relative my-2 select-none">
        {/* Ambient Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/25 via-amber-500/25 to-purple-500/25 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Big "¡Felicidades!" */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-cinzel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-purple-200 filter drop-shadow-[0_10px_20px_rgba(244,63,94,0.35)] uppercase">
          ¡Felicidades!
        </h1>

        {/* Big "18" badge right below it */}
        <div className="relative inline-flex flex-col items-center mt-2 group cursor-pointer" onClick={triggerCelebrationBurst}>
          {/* Subtle Golden Crown */}
          <span className="text-2xl sm:text-3xl filter drop-shadow-md -mb-1 animate-bounce">
            👑
          </span>

          <div className="relative px-8 py-1 rounded-3xl bg-gradient-to-b from-amber-400/20 to-purple-900/40 border border-amber-300/40 shadow-2xl backdrop-blur-sm flex items-center justify-center">
            <span className="text-6xl sm:text-8xl md:text-9xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-[#fff3b0] via-[#ffd700] to-[#e6a817] filter drop-shadow-[0_4px_12px_rgba(255,215,0,0.45)] leading-none">
              18
            </span>
          </div>

          <span className="mt-2 text-xs sm:text-sm font-semibold tracking-widest text-amber-200/90 uppercase font-mono">
            Bienvenida a la Mayoria de Edad Carito✨
          </span>
        </div>
      </div>

      {/* 3 Main Options Navigation Tabs */}
      <div className="mt-8 w-full max-w-2xl px-2">
        <div className="p-1.5 bg-black/50 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-between gap-1 shadow-2xl">
          {/* Option 1: La Carta */}
          <button
            onClick={() => {
              playTapSound();
              onTabChange("letter");
            }}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === "letter"
                ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-950/50 scale-[1.02]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-base sm:text-lg">💌</span>
            <span>1. La Carta Secreta</span>
          </button>

          {/* Option 2: El Lirio Virtual */}
          <button
            onClick={() => {
              playTapSound();
              onTabChange("lily");
            }}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === "lily"
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-950/50 scale-[1.02]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-base sm:text-lg">🌸</span>
            <span>2. Lirio Virtual</span>
          </button>

          {/* Option 3: Saturno y sus Anillos */}
          <button
            onClick={() => {
              playTapSound();
              onTabChange("saturn");
            }}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === "saturn"
                ? "bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-lg shadow-amber-950/50 scale-[1.02]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-base sm:text-lg">🪐</span>
            <span>3. Saturno 3D</span>
          </button>
        </div>
      </div>
    </header>
  );
};
