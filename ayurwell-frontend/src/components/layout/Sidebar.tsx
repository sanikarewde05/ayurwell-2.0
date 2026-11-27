import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  UtensilsCrossed,
  HeartHandshake,
  ShieldAlert,
  BookOpen,
  DollarSign,
  SunMoon,
  BarChart3,
  Bell,
  User,
  Bot,
  Database,
  X
} from 'lucide-react';
import { AyurWellLogo } from '../AyurWellLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen = false,
  setMobileOpen
}) => {
  const sections = [
    {
      title: 'CORE MODULES',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'dosha', label: 'Dosha Assessment (Prakriti)', icon: Sparkles },
        { id: 'disease-diet', label: 'Disease Diet Planner', icon: UtensilsCrossed },
        { id: 'womens-health', label: "Women's Health Module", icon: HeartHandshake, highlight: true },
      ]
    },
    {
      title: 'NUTRITION & DATA',
      items: [
        { id: 'viruddha', label: 'Food Compatibility Checker', icon: ShieldAlert },
        { id: 'dataset', label: 'Nutrition Dataset Explorer', icon: Database },
        { id: 'budget', label: 'Budget Diet Planner', icon: DollarSign },
        { id: 'recipes', label: 'Ayurvedic Recipe Hub', icon: BookOpen },
      ]
    },
    {
      title: 'AI & PREDICTIVE ML',
      items: [
        { id: 'ai-assistant', label: 'AI Health Assistant', icon: Bot, highlight: true },
        { id: 'analytics', label: 'ML Nutrient Deficiency Risk', icon: BarChart3 },
      ]
    },
    {
      title: 'WELLNESS & LIFESTYLE',
      items: [
        { id: 'seasonal', label: 'Seasonal Ritucharya', icon: SunMoon },
        { id: 'reminders', label: 'Timetable & Reminders', icon: Bell },
        { id: 'profile', label: 'Profile & Health Settings', icon: User },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-white text-charcoal">
      
      {/* Mobile Drawer Header */}
      <div className="md:hidden flex items-center justify-between pb-3 border-b border-ivory-dark mb-2">
        <div className="flex items-center space-x-2.5 max-w-[80%]">
          <AyurWellLogo size="sm" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-forest text-sm leading-none">
              AyurWell
            </span>
            <span className="text-[10px] text-charcoal-muted font-medium tracking-wide truncate max-w-[170px] pt-0.5">
              Ayurvedic Diet Planning and Nutrient Analysis System
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen?.(false)}
          className="p-1 rounded-lg hover:bg-ivory text-charcoal-muted"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto pr-1">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="px-3 text-[10px] font-bold text-sage uppercase tracking-wider">
              {sec.title}
            </div>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen?.(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-forest text-white shadow-md font-semibold'
                      : 'text-charcoal hover:bg-sage-light/80 hover:text-forest'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-gold' : 'text-sage'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-terracotta animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Ritucharya Sidebar Footer Card */}
      <div className="mt-4 p-3.5 rounded-2xl bg-sage-light/80 border border-sage/20 text-xs text-forest shadow-sm shrink-0">
        <div className="flex items-center space-x-1.5 font-bold mb-1">
          <span>🍂 Sharad Ritucharya</span>
        </div>
        <p className="text-[11px] text-charcoal-muted leading-snug">
          Autumn season. Favor sweet, bitter, and astringent foods for Pitta pacification.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-ivory-dark min-h-[calc(100vh-4rem)] shadow-ayur shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen?.(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
