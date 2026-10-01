import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  Sparkles,
  Train,
  Route,
  Languages,
  WifiOff,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onComplete: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

interface FeatureSlide {
  id: string;
  iconEmoji: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  highlightBadge: Record<Language, string>;
  accentColor: string;
}

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    id: 'pandals',
    iconEmoji: '🪔',
    title: {
      en: '720+ Curated Durga Puja Pandals',
      bn: '৭২০+ বাছাইকৃত দুর্গাপূজা মণ্ডপ',
      hi: '720+ चुनिंदा दुर्गा पूजा पंडाल',
    },
    description: {
      en: 'Accurate geo-coordinates, heritage markers, theme descriptions, and crowd rush updates across Kolkata.',
      bn: 'সঠিক ভৌগোলিক অবস্থান, সাবেকি ও থিম মণ্ডপের তথ্য, এবং কলকাতার ভিড় পরিস্থিতি আপডেট।',
      hi: 'सटीक जीपीएस लोकेशन, हेरिटेज मार्कर्स, थीम विवरण और कोलकाता की वास्तविक भीड़ की जानकारी।',
    },
    highlightBadge: {
      en: 'GIS Kolkata Map',
      bn: 'জিআইএস কলকাতা ম্যাপ',
      hi: 'जीआईएस कोलकाता मैप',
    },
    accentColor: 'from-amber-400 to-amber-600',
  },
  {
    id: 'metro',
    iconEmoji: '🚇',
    title: {
      en: '5-Line Kolkata Metro Route Engine',
      bn: '৫-লাইনের কলকাতা মেট্রো রুট ইঞ্জিন',
      hi: '5-लाइन कोलकाता मेट्रो रूट इंजन',
    },
    description: {
      en: 'Full 5-line network router with Esplanade interchange calculations, gate guidance, fares, and night timetables.',
      bn: 'এসপ্ল্যানেড ইন্টারচেঞ্জ, সঠিক গেট নির্দেশিকা, ভাড়া এবং পুজো স্পেশাল রাতের সময়সূচী সহ পূর্ণ রুট প্ল্যানার।',
      hi: 'एस्प्लेनेड इंटरचेंज, स्टेशन गेट गाइड, किराया और रात की स्पेशल मेट्रो समय सारिणी।',
    },
    highlightBadge: {
      en: 'Transit Router',
      bn: 'মেট্রো নেভিগেটর',
      hi: 'मेट्रो नेविगेटर',
    },
    accentColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'trails',
    iconEmoji: '🗺️',
    title: {
      en: 'Smart Trails & Corridor Detours',
      bn: 'স্মার্ট হাঁটা ট্রেইল ও পথচলতি মণ্ডপ',
      hi: 'स्मार्ट वॉकिंग ट्रेल्स और रास्ते के पंडाल',
    },
    description: {
      en: '1-tap Traveling Salesperson route optimization, queue wait estimation, and en-route detour suggestions.',
      bn: '১-ট্যাপ রুট অপ্টিমাইজেশন, মণ্ডপ লাইনের আনুমানিক সময় এবং পথচলতি বিখ্যাত মণ্ডপ আবিষ্কার।',
      hi: '1-टैप रूट ऑप्टिमाइजेशन, पंडाल कतार प्रतीक्षा अनुमान और रास्ते में पड़ने वाले पंडाल सुझाव।',
    },
    highlightBadge: {
      en: 'Smart Hopper Trails',
      bn: 'হপার ট্রেইল প্ল্যানার',
      hi: 'हॉपर ट्रेल प्लानर',
    },
    accentColor: 'from-rose-500 to-red-600',
  },
  {
    id: 'trilingual',
    iconEmoji: '🗣️',
    title: {
      en: 'Native Trilingual Experience',
      bn: 'সহজ ত্রিভাষিক অভিজ্ঞতা',
      hi: 'स्वाभाविक त्रिभाषी अनुभव',
    },
    description: {
      en: 'Switch instantly between English, বাংলা (Bengali), and हिन्दी (Hindi) with 100% complete translation accuracy.',
      bn: 'ইংরেজি, বাংলা এবং হিন্দি ভাষার মধ্যে যেকোনো সময় তাৎক্ষণিক পরিবর্তন করুন।',
      hi: 'अंग्रेजी, बांग्ला और हिन्दी के बीच बिना किसी रुकावट के तुरंत भाषा बदलें।',
    },
    highlightBadge: {
      en: 'English · বাংলা · हिन्दी',
      bn: 'ইংলিশ · বাংলা · হিন্দি',
      hi: 'English · বাংলা · हिन्दी',
    },
    accentColor: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'offline',
    iconEmoji: '📴',
    title: {
      en: '100% Offline Crowd Resilience',
      bn: '১০০% অফলাইন নির্ভরযোগ্যতা',
      hi: '100% ऑफलाइन विश्वसनीयता',
    },
    description: {
      en: 'Zero server dependency for map navigation. Works reliably in high-density cellular network blackouts during Puja nights.',
      bn: 'সার্ভার ছাড়াই পুরো ম্যাপ ও রুট সচল থাকে। উৎসবের প্রচণ্ড ভিড়ে মোবাইল নেটওয়ার্ক জ্যাম হলেও কাজ করবে।',
      hi: 'इंटरनेट या मोबाइल नेटवर्क जाम होने पर भी पूरा मैप और नेविगेशन बिना रुकावट काम करता है।',
    },
    highlightBadge: {
      en: 'Crowd-Ready PWA',
      bn: 'অফলাইন রেডি পিডাব্লিউএ',
      hi: 'ऑफलाइन रेडी पीडब्ल्यूए',
    },
    accentColor: 'from-purple-500 to-indigo-600',
  },
];

export const OnboardingSplash: React.FC<Props> = ({
  isOpen,
  onComplete,
  language,
  onLanguageChange,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const t = TRANSLATIONS[language];
  const slide = FEATURE_SLIDES[currentSlide];
  const totalSlides = FEATURE_SLIDES.length;
  const isLastSlide = currentSlide === totalSlides - 1;

  // Auto-advance slider every 4.5 seconds unless paused
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
    }, 4500);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, totalSlides]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
    setIsPaused(false);
  };

  return (
    <div
      id="onboarding-splash-modal"
      className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-[#050811]/95 backdrop-blur-2xl animate-fade-in select-none"
    >
      {/* Festive Background Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-indigo-500/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div
        className="relative w-full max-w-md bg-[#0A0F1D]/90 border border-slate-750/90 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-hidden min-h-[580px] max-h-[92vh]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top Header: Language Switcher & Instant Skip */}
        <div className="flex items-center justify-between z-10 shrink-0 pb-3 border-b border-slate-800/80">
          {/* Trilingual Pill */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-750 shadow-xs">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 text-xs rounded-lg font-bold transition ${
                language === 'en'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('bn')}
              className={`px-2 py-1 text-xs rounded-lg font-bold transition ${
                language === 'bn'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাং
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-1 text-xs rounded-lg font-bold transition ${
                language === 'hi'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              हिं
            </button>
          </div>

          {/* Skip Button */}
          <button
            id="onboarding-skip-btn"
            onClick={onComplete}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95"
          >
            {language === 'bn' ? 'এড়িয়ে যান →' : language === 'hi' ? 'छोड़ें →' : 'Skip →'}
          </button>
        </div>

        {/* Central Lotus Brand Insignia with Ambient Pulse */}
        <div className="flex flex-col items-center justify-center my-3 relative shrink-0">
          {/* Pulsing Concentric Aura */}
          <div className="absolute w-28 h-28 rounded-full bg-amber-500/20 animate-ping opacity-30 pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full bg-rose-500/20 blur-md pointer-events-none" />

          {/* Official App Icon */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/20 ring-2 ring-amber-400/40 transform transition-transform hover:scale-105 duration-300">
            <img
              src="/favicon.png"
              alt="Hoppers App Logo"
              className="w-full h-full object-cover select-none"
              onError={(e) => {
                // Fallback to SVG if PNG fails
                (e.target as HTMLImageElement).src = '/icon.svg';
              }}
            />
          </div>

          {/* App Title & Edition */}
          <div className="text-center mt-3">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>Hoppers</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                2026
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {language === 'bn'
                ? 'কলকাতা দুর্গাপূজা স্মার্ট কম্প্যানিয়ন'
                : language === 'hi'
                ? 'कोलकाता दुर्गा पूजा स्मार्ट साथी'
                : 'Kolkata Durga Puja Smart Companion'}
            </p>
          </div>
        </div>

        {/* Dynamic Feature Slide Card */}
        <div className="flex-1 flex flex-col justify-center px-2 py-2">
          <div
            key={slide.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-750/80 shadow-lg text-center space-y-2.5 transition-all duration-300 animate-fade-in"
          >
            {/* Slide Category Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-400">
              <span className="text-xs">{slide.iconEmoji}</span>
              <span>{slide.highlightBadge[language] || slide.highlightBadge.en}</span>
            </div>

            {/* Slide Title */}
            <h2 className="text-base font-extrabold text-white tracking-tight leading-snug">
              {slide.title[language] || slide.title.en}
            </h2>

            {/* Slide Description */}
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              {slide.description[language] || slide.description.en}
            </p>
          </div>
        </div>

        {/* Bottom Navigation & Indicator Controls */}
        <div className="space-y-3 pt-2 shrink-0">
          {/* Progress Indicator Dots */}
          <div className="flex items-center justify-center gap-2">
            {FEATURE_SLIDES.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-7 bg-amber-400 shadow-sm shadow-amber-400/50'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 active:scale-95 transition"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <button
              id="onboarding-primary-btn"
              onClick={handleNext}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-extrabold text-xs transition active:scale-98 shadow-xl ${
                isLastSlide
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:brightness-110 text-slate-950 shadow-amber-500/20'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
              }`}
            >
              <span>
                {isLastSlide
                  ? language === 'bn'
                    ? 'শুরু করুন (ম্যাপ দেখুন)'
                    : language === 'hi'
                    ? 'शुरू करें (मैप देखें)'
                    : 'Get Started (Explore Map)'
                  : language === 'bn'
                  ? 'পরবর্তী'
                  : language === 'hi'
                  ? 'आगे बढ़ें'
                  : 'Next'}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
