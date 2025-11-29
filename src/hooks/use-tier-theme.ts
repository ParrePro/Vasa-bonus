// Tier theme configuration for dynamic styling based on student's tier level

export type TierLevel = 'basic' | 'silver' | 'gold' | 'ruby';

export interface TierTheme {
  // Main colors
  primaryGradient: string;
  secondaryGradient: string;
  accentGradient: string;
  
  // Background
  pageBg: string;
  headerBg: string;
  headerOverlay: string;
  
  // Cards
  cardBorder: string;
  cardBg: string;
  cardGlow: string;
  
  // Text
  titleColor: string;
  accentText: string;
  
  // Buttons and tabs
  tabActiveGradient: string;
  buttonGradient: string;
  
  // Special effects
  sparkleColor: string;
  glowEffect: string;
  
  // Badge/Points display
  pointsGradient: string;
  
  // Tier specific decorations
  tierName: string;
  tierIcon: string;
}

export const getTierTheme = (tier: TierLevel): TierTheme => {
  switch (tier) {
    case 'ruby':
      return {
        primaryGradient: 'from-red-600 via-red-500 to-rose-600',
        secondaryGradient: 'from-rose-500 to-red-700',
        accentGradient: 'from-amber-500 to-red-600',
        
        pageBg: 'bg-gradient-to-br from-red-950/20 via-background to-rose-950/20',
        headerBg: 'from-red-900/90 via-rose-800/80 to-red-900/90',
        headerOverlay: 'from-transparent via-red-950/60 to-background',
        
        cardBorder: 'border-red-400/50',
        cardBg: 'bg-gradient-to-br from-card via-red-950/10 to-rose-950/20',
        cardGlow: 'shadow-red-500/20 shadow-xl',
        
        titleColor: 'text-red-100',
        accentText: 'text-red-400',
        
        tabActiveGradient: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-rose-600',
        buttonGradient: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500',
        
        sparkleColor: 'text-amber-400',
        glowEffect: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
        
        pointsGradient: 'from-red-500 via-rose-500 to-amber-500',
        
        tierName: 'Ruby',
        tierIcon: '/favicon-ruby.png',
      };
      
    case 'gold':
      return {
        primaryGradient: 'from-yellow-500 via-amber-500 to-yellow-600',
        secondaryGradient: 'from-amber-400 to-yellow-600',
        accentGradient: 'from-orange-400 to-amber-500',
        
        pageBg: 'bg-gradient-to-br from-yellow-950/20 via-background to-amber-950/20',
        headerBg: 'from-yellow-800/90 via-amber-700/80 to-yellow-800/90',
        headerOverlay: 'from-transparent via-yellow-950/60 to-background',
        
        cardBorder: 'border-yellow-400/50',
        cardBg: 'bg-gradient-to-br from-card via-yellow-950/10 to-amber-950/20',
        cardGlow: 'shadow-yellow-500/20 shadow-xl',
        
        titleColor: 'text-yellow-100',
        accentText: 'text-yellow-400',
        
        tabActiveGradient: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-500',
        buttonGradient: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400',
        
        sparkleColor: 'text-yellow-300',
        glowEffect: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
        
        pointsGradient: 'from-yellow-400 via-amber-400 to-orange-400',
        
        tierName: 'Gold',
        tierIcon: '/favicon-gold.png',
      };
      
    case 'silver':
      return {
        primaryGradient: 'from-slate-400 via-gray-400 to-slate-500',
        secondaryGradient: 'from-gray-300 to-slate-500',
        accentGradient: 'from-blue-400 to-slate-400',
        
        pageBg: 'bg-gradient-to-br from-slate-900/20 via-background to-gray-900/20',
        headerBg: 'from-slate-700/90 via-gray-600/80 to-slate-700/90',
        headerOverlay: 'from-transparent via-slate-900/60 to-background',
        
        cardBorder: 'border-slate-400/50',
        cardBg: 'bg-gradient-to-br from-card via-slate-900/10 to-gray-900/20',
        cardGlow: 'shadow-slate-400/20 shadow-xl',
        
        titleColor: 'text-slate-100',
        accentText: 'text-slate-300',
        
        tabActiveGradient: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-500',
        buttonGradient: 'bg-gradient-to-r from-slate-500 to-gray-500 hover:from-slate-400 hover:to-gray-400',
        
        sparkleColor: 'text-slate-300',
        glowEffect: 'shadow-[0_0_30px_rgba(148,163,184,0.3)]',
        
        pointsGradient: 'from-slate-600 via-gray-600 to-slate-700',
        
        tierName: 'Silver',
        tierIcon: '/favicon-silver.png',
      };
      
    default: // basic
      return {
        primaryGradient: 'from-blue-500 via-indigo-500 to-blue-600',
        secondaryGradient: 'from-indigo-400 to-blue-600',
        accentGradient: 'from-cyan-400 to-blue-500',
        
        pageBg: 'bg-gradient-to-br from-blue-950/20 via-background to-indigo-950/20',
        headerBg: 'from-blue-800/90 via-indigo-700/80 to-blue-800/90',
        headerOverlay: 'from-transparent via-blue-950/60 to-background',
        
        cardBorder: 'border-blue-400/30',
        cardBg: 'bg-gradient-to-br from-card via-blue-950/5 to-indigo-950/10',
        cardGlow: 'shadow-blue-500/10 shadow-lg',
        
        titleColor: 'text-blue-100',
        accentText: 'text-blue-400',
        
        tabActiveGradient: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500',
        buttonGradient: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400',
        
        sparkleColor: 'text-cyan-400',
        glowEffect: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        
        pointsGradient: 'from-blue-400 via-indigo-400 to-cyan-400',
        
        tierName: 'Basic',
        tierIcon: '/favicon.png',
      };
  }
};

// Hook to get current tier theme
import { useMemo } from 'react';

export const useTierTheme = (tier: TierLevel): TierTheme => {
  return useMemo(() => getTierTheme(tier), [tier]);
};
