import React, { useState } from "react";
import {
  loadLetterData,
  loadLilyPhrases,
  loadSaturnRings,
  BirthdayLetter,
  RingMessage,
} from "./config/birthdayData";
import { setSoundEnabled } from "./utils/soundEffects";
import { Header } from "./components/Header";
import { LetterCard } from "./components/LetterCard";
import { LilyGame } from "./components/LilyGame";
import { SaturnViewer } from "./components/SaturnViewer";
import { Sparkles, Heart } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"letter" | "lily" | "saturn">("letter");
  const [letterData] = useState<BirthdayLetter>(() => loadLetterData());
  const [lilyPhrases] = useState<string[]>(() => loadLilyPhrases());
  const [saturnRings] = useState<RingMessage[]>(() => loadSaturnRings());
  const [soundOn, setSoundOn] = useState<boolean>(true);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  return (
    <div className="min-h-screen bg-[#070412] text-slate-100 flex flex-col justify-between selection:bg-pink-500 selection:text-white relative overflow-x-hidden">
      {/* Background Animated Bokeh Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px]" />
      </div>

      {/* Main Header with "Felicidades", "18", and the 3 options */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />

      {/* Main Content Area based on selected Tab */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pb-12">
        {activeTab === "letter" && (
          <div className="animate-fadeIn">
            <LetterCard letter={letterData} />
          </div>
        )}

        {activeTab === "lily" && (
          <div className="animate-fadeIn">
            <LilyGame phrases={lilyPhrases} />
          </div>
        )}

        {activeTab === "saturn" && (
          <div className="animate-fadeIn">
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Opcion 3: El Universo en tus 18 Años
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-amber-200 to-rose-200">
                Saturno y sus Anillos Mágicos 🪐
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-1">
                Arrastra para rotar en 3D con tus dedos o ratón. Usa la rueda o pellizca para acercar y alejar (con límites). Toca los anillos luminosos para descubrir reflexiones estelares.
              </p>
            </div>
            <SaturnViewer ringMessages={saturnRings} />
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full border-t border-white/10 bg-black/40 backdrop-blur-md py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>Creado con amor para la persona más importante en mi vida • Felices 18 Años</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>
      </footer>
    </div>
  );
}

