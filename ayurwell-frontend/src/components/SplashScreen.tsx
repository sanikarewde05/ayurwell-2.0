import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 2500 }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, duration);

    const finishTimer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, duration + 600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-600 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 48% 42%, #2f5846 0%, #25493a 52%, #1b382c 100%)',
      }}
    >
      {/* Organic Curved Atmospheric Overlays matching reference image */}
      <div className="absolute -left-48 top-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full border border-white/[0.05] bg-white/[0.02] pointer-events-none blur-[1px]" />
      <div className="absolute -right-48 bottom-0 w-[600px] h-[600px] rounded-full border border-white/[0.04] bg-black/[0.06] pointer-events-none blur-[1px]" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#40735d]/15 blur-[120px] pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-xl animate-fade-in">
        
        {/* Double-Ring White Circular Emblem */}
        <div className="relative flex items-center justify-center">
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-white/35 flex items-center justify-center p-2.5 backdrop-blur-[2px] transition-transform duration-700 ease-out hover:scale-105">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.22)] p-2">
              <img
                src={logoImg}
                alt="AyurWell Logo"
                className="w-full h-full object-contain rounded-full select-none"
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-normal mt-7 mb-4 select-none"
          style={{ fontFamily: '"Cinzel", "Georgia", "Merriweather", serif' }}
        >
          AyurWell
        </h1>

        {/* Badge Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#16382b]/60 backdrop-blur-md mb-4 shadow-sm select-none">
          <Sparkles className="w-3.5 h-3.5 text-[#E6BF55]" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#E6BF55]">
            AI Health-Tech Platform
          </span>
        </div>

        {/* Subtitle / Tagline */}
        <p className="text-sm sm:text-base font-normal text-white/90 tracking-wide font-sans max-w-md leading-relaxed select-none">
          Your Personalized Ayurvedic Wellness Companion
        </p>

      </div>
    </div>
  );
};

export default SplashScreen;
