import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Utensils, BarChart3, HeartHandshake } from 'lucide-react';
import { FOOD_IMAGES } from '../utils/foodImages';
import { AyurWellLogo } from './AyurWellLogo';

import step1Img from '../assets/onboarding/step1_lifestyle.avif';
import step2Img from '../assets/onboarding/step2_ideal_balance.webp';
import step4Img from '../assets/onboarding/step4_progress_tracking.avif';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  id: number;
  category: string;
  title: string;
  description: string;
  image: string;
  icon: React.ElementType;
  badge: string;
  fit?: 'object-contain' | 'object-cover';
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      category: 'STEP 01 / ASSESSMENT',
      title: 'Measure Your Current Balance',
      description: 'Understand your current nutritional and wellness balance with a quick assessment.',
      image: step1Img,
      icon: Sparkles,
      badge: 'Lifestyle Assessment',
      fit: 'object-contain'
    },
    {
      id: 2,
      category: 'STEP 02 / WELLNESS INSIGHTS',
      title: 'Find Your Ideal Balance',
      description: 'Get personalized wellness insights based on your body, habits, lifestyle, and nutrition.',
      image: step2Img,
      icon: ShieldCheck,
      badge: 'Tridosha & Agni Balance',
      fit: 'object-contain'
    },
    {
      id: 3,
      category: 'STEP 03 / DAILY MEAL PLAN',
      title: 'Your Daily Personalized Diet Plan',
      description: 'Get daily meal recommendations tailored to your goals, preferences, and nutritional requirements.',
      image: FOOD_IMAGES['Tridoshic Moong Dal Khichdi'],
      icon: Utensils,
      badge: 'Pathya Timetables',
      fit: 'object-cover'
    },
    {
      id: 4,
      category: 'STEP 04 / PROGRESS TRACKING',
      title: 'Track Your Wellness Journey',
      description: 'Monitor your progress and see your wellness improvements over time.',
      image: step4Img,
      icon: BarChart3,
      badge: 'Predictive ML Analytics',
      fit: 'object-contain'
    }
  ];

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem('ayurwell_onboarded', 'true');
    sessionStorage.setItem('ayurwell_onboarded_session', 'true');
    onComplete();
  };

  // Touch & Mouse Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTouchStartX(clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX === null) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = touchStartX - clientX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const currentSlide = slides[currentStep];
  const Icon = currentSlide.icon;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0F2F25] via-[#1B4D3E] to-[#0A221A] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none overflow-hidden">
      
      {/* MINIMAL ABSTRACT SAAS BACKGROUND ELEMENTS */}
      
      {/* Soft Ambient Radial Glow Behind Center Card */}
      <div className="absolute w-[600px] h-[600px] bg-sage/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2C5E4E]/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sage/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Translucent Organic SVG Shapes */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-10 transition-transform duration-700"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <circle cx={200 + currentStep * 80} cy={150 + currentStep * 30} r="320" fill="#87A96B" />
        <circle cx={1240 - currentStep * 60} cy={750 - currentStep * 40} r="360" fill="#2C5E4E" />
      </svg>

      {/* Top Bar: Brand Badge & Skip Button */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto z-10">
        <div className="flex items-center space-x-3 max-w-[70vw] sm:max-w-none">
          <AyurWellLogo size="sm" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-white text-sm sm:text-base tracking-tight leading-none">
              AyurWell
            </span>
            <span className="text-[10px] sm:text-xs text-gold font-medium tracking-wide truncate max-w-[200px] sm:max-w-none pt-0.5">
              Ayurvedic Diet Planning and Nutrient Analysis System
            </span>
          </div>
        </div>

        <button
          onClick={finishOnboarding}
          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-ivory font-bold text-xs transition-all border border-white/20 shadow-sm"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Carousel Container */}
      <div
        className="max-w-4xl w-full mx-auto my-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        
        {/* Left Visual Illustration Frame */}
        <div className="md:col-span-6 relative h-64 sm:h-80 md:h-96 w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 group bg-forest-dark/40 flex items-center justify-center p-3">
          <img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={currentSlide.title}
            className={`w-full h-full ${currentSlide.fit === 'object-cover' ? 'object-cover' : 'object-contain'} transform transition-all duration-700 hover:scale-105 drop-shadow-lg`}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-transparent to-transparent flex items-end p-5 pointer-events-none">
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-forest border border-white/40 shadow-sm pointer-events-auto">
              <Icon className="w-3.5 h-3.5 text-sage" />
              <span>{currentSlide.badge}</span>
            </div>
          </div>
        </div>

        {/* Right Content Section */}
        <div className="md:col-span-6 space-y-5 text-left flex flex-col justify-center">
          
          <div className="inline-flex items-center space-x-2 bg-white/10 text-gold px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/15 backdrop-blur-md">
            <span>{currentSlide.category}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
            {currentSlide.title}
          </h2>

          <p className="text-sm text-ivory/90 leading-relaxed font-normal">
            {currentSlide.description}
          </p>

          <div className="pt-2 flex items-center space-x-2 text-xs text-ivory/80 font-semibold">
            <HeartHandshake className="w-4 h-4 text-gold" />
            <span>Formulated with Ayurvedic Wisdom & Modern AI</span>
          </div>

        </div>

      </div>

      {/* Bottom Bar: Indicator Dots & Navigation Arrow / CTA */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between border-t border-white/15 pt-4 z-10">
        
        {/* Step Progress Dots */}
        <div className="flex items-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentStep === index ? 'w-8 bg-gold' : 'w-2.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Button: Next Arrow OR Let's Start */}
        <div>
          {currentStep < slides.length - 1 ? (
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-forest text-white hover:bg-forest-light transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 border border-gold/30 group"
              aria-label="Next Slide"
            >
              <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              onClick={finishOnboarding}
              className="px-6 py-3 rounded-full bg-gold text-forest font-bold text-xs hover:bg-yellow-400 transition-all shadow-lg hover:shadow-gold/20 flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <span>Let's Start</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
