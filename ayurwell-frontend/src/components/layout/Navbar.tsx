import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { clearDoshaState } from '../../store/slices/doshaSlice';
import { clearDietState } from '../../store/slices/dietSlice';
import { clearAnalyticsState } from '../../store/slices/analyticsSlice';
import { LogOut, Menu, User } from 'lucide-react';
import { AyurWellLogo } from '../AyurWellLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setMobileOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setActiveTab, setMobileOpen }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { result } = useSelector((state: RootState) => state.dosha);

  const prakritiLabel = result?.primaryPrakriti;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearDoshaState());
    dispatch(clearDietState());
    dispatch(clearAnalyticsState());
  };

  return (
    <header className="bg-white border-b border-ivory-dark sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Branding & Mobile Hamburger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileOpen?.(true)}
            className="md:hidden p-2 rounded-xl text-charcoal hover:bg-ivory transition-all"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-5 h-5 text-forest" />
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <AyurWellLogo size="sm" />
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-bold text-forest tracking-tight leading-none group-hover:text-forest-light transition-colors">
                AyurWell
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-charcoal-muted tracking-wide truncate max-w-[170px] sm:max-w-xs md:max-w-sm lg:max-w-md pt-0.5">
                Ayurvedic Diet Planning and Nutrient Analysis System
              </span>
            </div>
          </div>
        </div>

        {/* Right Badges & Profile Dropdown */}
        <div className="flex items-center space-x-3">
          
          {/* Prakriti Badge */}
          <div
            onClick={() => setActiveTab('dosha')}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sage-light border border-sage/20 cursor-pointer hover:bg-sage/20 transition-all text-xs"
          >
            <span className={`w-2 h-2 rounded-full ${prakritiLabel ? 'bg-forest animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-charcoal-muted font-medium">Prakriti:</span>
            <span className="font-bold text-forest">{prakritiLabel || 'Pending'}</span>
          </div>

          {/* User Profile */}
          <div
            onClick={() => setActiveTab('profile')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-ivory border border-ivory-dark cursor-pointer hover:bg-sage-light/50 transition-all text-xs"
          >
            <User className="w-4 h-4 text-forest" />
            <span className="font-semibold text-charcoal hidden md:inline truncate max-w-[120px]">
              {user?.fullName || 'User'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-charcoal-muted hover:text-terracotta hover:bg-amber-50 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
