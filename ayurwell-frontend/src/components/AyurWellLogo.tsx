import React from 'react';
import logoImg from '../assets/logo.png';

export interface AyurWellLogoProps {
  /**
   * Preset sizes:
   * - 'sm': 36px x 36px (Navbar compact / mobile header)
   * - 'md': 48px x 48px (Header logo)
   * - 'lg': 80px x 80px (Auth forms / Card headers)
   * - 'xl': 128px x 128px (Splash Screen / Hero)
   * - '2xl': 160px x 160px (Extra large)
   * - 'custom': Size controlled via `className`
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  imgClassName?: string;
  onClick?: () => void;
  alt?: string;
}

export const AyurWellLogo: React.FC<AyurWellLogoProps> = ({
  size = 'md',
  className = '',
  imgClassName = '',
  onClick,
  alt = 'AyurWell – Ayurvedic Diet Planning and Nutrient Analysis System'
}) => {
  const sizeMap: Record<string, string> = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
    '2xl': 'w-40 h-40',
    custom: ''
  };

  const containerClass = `relative inline-flex items-center justify-center shrink-0 ${sizeMap[size] || ''} ${className}`;

  return (
    <div
      onClick={onClick}
      className={containerClass}
    >
      <img
        src={logoImg}
        alt={alt}
        className={`w-full h-full object-contain rounded-full shadow-sm select-none transition-transform duration-300 hover:scale-105 ${imgClassName}`}
        loading="eager"
      />
    </div>
  );
};

export default AyurWellLogo;
