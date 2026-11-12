import React, { useState } from "react";
import confetti from "canvas-confetti";
import { BirthdayLetter } from "../config/birthdayData";
import { playEnvelopeSound, playTapSound } from "../utils/soundEffects";
import { Sparkles, Heart, Mail, MailOpen, PartyPopper, Check, Copy } from "lucide-react";

interface LetterCardProps {
  letter: BirthdayLetter;
}

export const LetterCard: React.FC<LetterCardProps> = ({ letter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fireBigConfetti = () => {
    // Joyous multi-blast birthday confetti with stars & heart colors
    const count = 200;
    const defaults = {
      origin: { y: 0.65 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#ec4899", "#f59e0b", "#f43f5e", "#a855f7", "#38bdf8"],
    });
    fire(0.2, {
      spread: 60,
      colors: ["#fef08a", "#f472b6", "#c084fc"],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#ffd700", "#ff69b4", "#00ffff", "#ffffff"],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleOpenEnvelope = () => {
    playEnvelopeSound();
    setIsOpen(true);
    fireBigConfetti();
  };

  const handleCloseEnvelope = () => {
    playTapSound();
    setIsOpen(false);
  };

  const handleCopyText = () => {
    playTapSound();
    const fullText = `${letter.title}\n\n${letter.salutation}\n\n${letter.paragraphs.join("\n\n")}\n\n${letter.signature}\n\n${letter.postScriptum}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      {!isOpen ? (
        /* ================= CLOSED ENVELOPE VIEW ================= */
        <div className="flex flex-col items-center justify-center min-h-[440px] px-4">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Opción 1: Sobre Secreto
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-100 to-purple-200">
              Tienes una carta sorpresa sin abrir 💌
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Haz clic sobre el sobre o en el sello dorado para romper el lacre y revelar el mensaje con confeti.
            </p>
          </div>

          {/* Interactive Envelope Graphic */}
          <div
            onClick={handleOpenEnvelope}
            className="group relative w-full max-w-md h-64 sm:h-72 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            title="Haz clic para abrir la carta"
          >
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />

            {/* Envelope Base Body */}
            <div className="relative w-full h-full bg-gradient-to-b from-[#2a173d] via-[#1f1030] to-[#160a24] rounded-3xl border-2 border-amber-400/40 shadow-2xl overflow-hidden flex flex-col justify-between p-6">
              
              {/* Envelope Flap Fold Lines */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#381f50] to-[#241336] [clip-path:polygon(0_0,100%_0,50%_100%)] border-b border-amber-400/30" />

              {/* Decorative Envelope Lining */}
              <div className="relative z-10 flex justify-between items-start text-xs text-amber-300/80 uppercase tracking-widest font-mono">
                <span>{letter.badge}</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  18 Años
                </span>
              </div>

              {/* Center Seal Stamp */}
              <div className="relative z-20 self-center my-auto flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl shadow-amber-950/80 flex items-center justify-center border-2 border-amber-200 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-dashed border-amber-900/40 flex flex-col items-center justify-center text-amber-950">
                    <span className="font-bold font-cinzel text-xs leading-none">18</span>
                    <Heart className="w-4 h-4 fill-amber-950 mt-0.5" />
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-200 mt-2 bg-black/60 px-3 py-1 rounded-full border border-amber-400/30 backdrop-blur-sm group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  ¡Haz clic para abrir! ✨
                </span>
              </div>

              {/* Recipient Ribbon */}
              <div className="relative z-10 bg-black/40 backdrop-blur-sm py-2 px-4 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="font-serif-display italic text-amber-200 text-sm">
                  {letter.recipientName}
                </span>
                <span className="text-pink-300 flex items-center gap-1 font-medium">
                  Mensaje Secreto <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= OPEN LETTER VIEW ================= */
        <div className="relative animate-fadeIn">
          {/* Action Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <MailOpen className="w-3.5 h-3.5" />
                Carta Revelada
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Confeti liberado con éxito 🎉
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fireBigConfetti}
                className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-pink-950/40"
              >
                <PartyPopper className="w-3.5 h-3.5 text-pink-300" />
                <span>¡Más Confeti!</span>
              </button>

              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-all flex items-center gap-1.5 border border-white/10"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCloseEnvelope}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10"
              >
                Doblar Carta ✉️
              </button>
            </div>
          </div>

          {/* Parchment Styled Letter Container */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#fffbf2] via-[#fdf6e7] to-[#f9eed7] text-amber-950 p-7 sm:p-12 shadow-2xl shadow-purple-950/70 border-4 border-[#e2c792] overflow-hidden">
            
            {/* Subtle vintage parchment corner ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-800/40" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-800/40" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-800/40" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-800/40" />

            {/* Letter Header */}
            <div className="text-center pb-6 mb-6 border-b border-amber-800/20 relative">
              <span className="text-xs uppercase tracking-widest font-mono text-amber-800/70 font-semibold block mb-1">
                {letter.badge}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-amber-900 tracking-tight">
                {letter.title}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="h-px w-12 bg-amber-800/30" />
                <span className="text-rose-600">💖</span>
                <span className="h-px w-12 bg-amber-800/30" />
              </div>
            </div>

            {/* Salutation */}
            <p className="font-serif-display text-xl sm:text-2xl font-bold text-amber-900 mb-6 italic">
              {letter.salutation}
            </p>

            {/* Letter Paragraphs */}
            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-amber-950/90 font-serif-display">
              {letter.paragraphs.map((para, idx) => (
                <p key={idx} className="indent-6 text-justify">
                  {para}
                </p>
              ))}
            </div>

            {/* Signature Area */}
            <div className="mt-10 pt-6 border-t border-amber-800/20 flex flex-col items-end text-right">
              <p className="font-script text-3xl sm:text-4xl text-rose-700 tracking-wide font-bold">
                {letter.signature}
              </p>
            </div>

            {/* Post Scriptum */}
            {letter.postScriptum && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-100/70 border border-amber-700/20 text-sm sm:text-base font-serif-display italic text-amber-900">
                {letter.postScriptum}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
