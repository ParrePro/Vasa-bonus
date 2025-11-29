import { cn } from "@/lib/utils";

// Skin tone options - must match ProfileCustomization.tsx
const SKIN_TONES: Record<string, string> = {
  porcelain: '#FFE5D4',
  light: '#FFDBB4',
  fair: '#EDB98A',
  medium: '#D08B5B',
  olive: '#C68642',
  tan: '#AE5D29',
  brown: '#8D5524',
  dark: '#614335',
  espresso: '#3D2314',
  zombie: '#7CB342',
  alien: '#26C6DA',
  vampire: '#E0E0E0',
  demon: '#FF5252',
  frost: '#B3E5FC',
};

// Hair style paths - must match ProfileCustomization.tsx
const HAIR_STYLES: Record<string, string> = {
  none: '',
  buzz: 'M12 4C8 4 6 5.5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5.5 16 4 12 4Z',
  short: 'M12 3C8 3 6 5 6 7.5C6 7.5 8 6.5 12 6.5C16 6.5 18 7.5 18 7.5C18 5 16 3 12 3Z',
  crew: 'M12 3.5C8 3.5 6 5 6 7C6 7 8 6 12 6C16 6 18 7 18 7C18 5 16 3.5 12 3.5Z',
  'side-part': 'M12 3C7 3 5 5.5 5 8C5 8 7 6.5 12 6.5C17 6.5 19 8 19 8C19 5.5 17 3 12 3Z M5 5L7 7',
  medium: 'M12 3C7 3 5 6 5 9C5 9 7 7 12 7C17 7 19 9 19 9C19 6 17 3 12 3Z M5 9C4 10 4 12 5 13C5 11 6 9 6 9L5 9Z M19 9L18 9C18 9 19 11 19 13C20 12 20 10 19 9Z',
  bob: 'M12 2C6 2 4 5 4 9C4 12 5 13 5 13L6 8C6 8 8 6.5 12 6.5C16 6.5 18 8 18 8L19 13C19 13 20 12 20 9C20 5 18 2 12 2Z',
  'long-straight': 'M12 2C6 2 4 6 4 10C4 10 6 7 12 7C18 7 20 10 20 10C20 6 18 2 12 2Z M4 10C3 12 3 18 4 20C4 17 5 11 5 11L4 10Z M20 10L19 11C19 11 20 17 20 20C21 18 21 12 20 10Z',
  'long-wavy': 'M12 2C6 2 4 6 4 10C4 10 6 7 12 7C18 7 20 10 20 10C20 6 18 2 12 2Z M4 10C3 11 2 14 3 16C4 14 5 11 5 11L4 10Z M4 16C3 18 3 20 4 21C5 19 5 17 4 16Z M20 10L19 11C19 11 20 14 21 16C22 14 21 11 20 10Z M21 16C20 17 20 19 20 21C21 20 22 18 21 16Z',
  ponytail: 'M12 3C7 3 5 6 5 8C5 8 7 7 12 7C17 7 19 8 19 8C19 6 17 3 12 3Z M18 8C19 9 20 11 19 14C20 12 20 9 18 8Z M19 14C18 16 17 19 18 21C19 19 20 16 19 14Z',
  pigtails: 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M6 7C5 8 4 10 4 12C4 14 5 16 5 16C6 14 6 10 6 7Z M18 7C18 10 18 14 19 16C19 16 20 14 20 12C20 10 19 8 18 7Z',
  curly: 'M8 4C6 4 5 6 6 7.5C7 6.5 8 5.5 10 5.5C9 4.5 8 4 8 4Z M16 4C18 4 19 6 18 7.5C17 6.5 16 5.5 14 5.5C15 4.5 16 4 16 4Z M12 3C10 3 9 4 9 5C11 4 13 4 15 5C15 4 14 3 12 3Z M6 7.5C5 8.5 4 11 5 13C6 11 6.5 9 6.5 9L6 7.5Z M18 7.5L17.5 9C17.5 9 18 11 19 13C20 11 19 8.5 18 7.5Z',
  afro: 'M12 1C6 1 3 5 3 9C3 13 5 14 5 14C5 14 4 10 6 8C6 10 7 7 12 7C17 7 18 10 18 8C20 10 19 14 19 14C19 14 21 13 21 9C21 5 18 1 12 1Z',
  bun: 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M10 1C9 1 8 2 9 4C10 3 11 2 10 1Z M14 1C15 1 16 2 15 4C14 3 13 2 14 1Z M12 0C11 0.5 11 2 12 3C13 2 13 0.5 12 0Z',
  shoulder: 'M12 2C7 2 5 5 5 8C5 8 6 7 12 7C18 7 19 8 19 8C19 5 17 2 12 2Z M5 8C4 10 4 14 5 16C5 14 6 10 6 10L5 8Z M19 8L18 10C18 10 19 14 19 16C20 14 20 10 19 8Z',
  pixie: 'M12 3C7 3 5 5 5 7C5 7 7 6 12 6C17 6 19 7 19 7C19 5 17 3 12 3Z M5 7C4 8 4 9 5 10L6 8L5 7Z',
  spiky: 'M12 1L10 5L8 2L7 6L5 4L6 8C6 8 8 6.5 12 6.5C16 6.5 18 8 18 8L19 4L17 6L16 2L14 5L12 1Z',
  mohawk: 'M12 0L11 3L10 1L10 6.5L14 6.5L14 1L13 3L12 0Z',
  braids: 'M12 2C7 2 5 5 5 8C5 8 7 7 12 7C17 7 19 8 19 8C19 5 17 2 12 2Z M5 8C4 10 4 13 4 16C5 14 6 11 6 11L5 8Z M5 16C4 18 4 20 5 22C6 20 6 18 5 16Z M19 8L18 11C18 11 19 14 20 16C20 13 20 10 19 8Z M20 16C19 18 19 20 19 22C20 20 21 18 20 16Z',
  dreadlocks: 'M12 1C7 1 4 4 4 8C4 8 6 6 12 6C18 6 20 8 20 8C20 4 17 1 12 1Z M4 8L3 12L4 16L5 12L4 8Z M5 16L4 20L6 18L5 16Z M20 8L21 12L20 16L19 12L20 8Z M19 16L20 20L18 18L19 16Z M7 7L6 11L7 15L8 11L7 7Z M17 7L18 11L17 15L16 11L17 7Z',
  twintails: 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M5 5L4 8L3 12L4 16L5 12L6 8L5 5Z M19 5L20 8L21 12L20 16L19 12L18 8L19 5Z',
  undercut: 'M12 2C8 2 6 4 6 6L5 7C5 7 8 6 12 6C16 6 19 7 19 7L18 6C18 4 16 2 12 2Z',
  samurai: 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M10 0L11 4L12 1L13 4L14 0L12 2L10 0Z',
  fancy: 'M12 1C8 1 5 4 5 8C5 8 7 6 12 6C17 6 19 8 19 8C19 4 16 1 12 1Z M5 8C4 10 3 14 5 17C5 14 6 10 6 10L5 8Z M19 8L18 10C18 10 19 14 19 17C21 14 20 10 19 8Z M7 2C6 3 6 4 7 4C7 3 7 2 7 2Z M17 2C18 3 18 4 17 4C17 3 17 2 17 2Z',
  'messy-bun': 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M10 2C8 1 7 2 8 4C9 3 10 2 10 2Z M14 2C16 1 17 2 16 4C15 3 14 2 14 2Z M12 0C11 0 10 1 11 2C12 1 13 2 13 2C14 1 13 0 12 0Z',
  anime: 'M12 0C6 0 3 4 3 8C3 8 5 6 12 6C19 6 21 8 21 8C21 4 18 0 12 0Z M3 8L2 12L3 10L4 14L3 8Z M21 8L20 14L21 10L22 12L21 8Z M7 2L5 6L7 4L7 2Z M17 2L19 6L17 4L17 2Z',
  royal: 'M12 1C7 1 4 4 4 8C4 8 7 6 12 6C17 6 20 8 20 8C20 4 17 1 12 1Z M4 8C3 10 2 16 4 20C4 16 5 11 5 11L4 8Z M20 8L19 11C19 11 20 16 20 20C22 16 21 10 20 8Z M8 2L7 4L8 3L8 2Z M16 2L17 4L16 3L16 2Z M12 0L11 2L12 1L13 2L12 0Z',
  wild: 'M12 0L10 4L7 1L6 5L3 3L5 8C5 8 8 6 12 6C16 6 19 8 19 8L21 3L18 5L17 1L14 4L12 0Z M3 8L1 12L3 16L4 12L3 8Z M21 8L23 12L21 16L20 12L21 8Z',
};

// Hair colors - must match ProfileCustomization.tsx
const HAIR_COLORS: Record<string, string> = {
  black: '#1a1a1a',
  'dark-brown': '#3d2314',
  brown: '#4a3728',
  'light-brown': '#6b4423',
  blonde: '#c9a567',
  platinum: '#e8e4c9',
  ginger: '#b55239',
  red: '#8b3a3a',
  auburn: '#922724',
  strawberry: '#cc7755',
  gray: '#808080',
  silver: '#c0c0c0',
  white: '#f5f5f5',
  blue: '#4a90d9',
  navy: '#1e3a5f',
  cyan: '#00bcd4',
  purple: '#8b5cf6',
  lavender: '#b794f4',
  pink: '#ec4899',
  'hot-pink': '#ff1493',
  green: '#22c55e',
  teal: '#14b8a6',
  rainbow: 'url(#rainbow)',
  fire: 'url(#fire)',
  galaxy: 'url(#galaxy)',
  'neon-green': '#39ff14',
  holographic: 'url(#holo)',
};

// Background classes - must match ProfileCustomization.tsx
const BACKGROUNDS: Record<string, string> = {
  gray: 'bg-gray-200 dark:bg-gray-700',
  'light-gray': 'bg-gray-100 dark:bg-gray-800',
  slate: 'bg-slate-300 dark:bg-slate-700',
  stone: 'bg-stone-300 dark:bg-stone-700',
  cream: 'bg-amber-50 dark:bg-amber-900',
  blue: 'bg-blue-500',
  'light-blue': 'bg-blue-300',
  sky: 'bg-sky-400',
  green: 'bg-green-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  purple: 'bg-purple-500',
  violet: 'bg-violet-500',
  indigo: 'bg-indigo-500',
  rose: 'bg-rose-400',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  yellow: 'bg-yellow-400',
  lime: 'bg-lime-500',
  pink: 'bg-pink-500',
  fuchsia: 'bg-fuchsia-500',
  red: 'bg-red-500',
  cyan: 'bg-cyan-400',
  'gradient-gold': 'bg-gradient-to-br from-yellow-400 to-amber-600',
  'gradient-ocean': 'bg-gradient-to-br from-blue-400 to-cyan-600',
  'gradient-forest': 'bg-gradient-to-br from-green-400 to-emerald-600',
  'gradient-sunset': 'bg-gradient-to-br from-orange-400 to-pink-600',
  'gradient-rainbow': 'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500',
  'gradient-ruby': 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-600',
  'gradient-aurora': 'bg-gradient-to-r from-green-400 via-cyan-500 to-purple-600',
  'gradient-fire': 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600',
  'gradient-galaxy': 'bg-gradient-to-br from-purple-900 via-violet-600 to-pink-500',
  'gradient-neon': 'bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500',
  'gradient-midnight': 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
  'gradient-holographic': 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400',
  black: 'bg-black',
};

// Border classes - must match ProfileCustomization.tsx
const BORDERS: Record<string, string> = {
  none: '',
  'thin-gray': 'ring-2 ring-gray-400',
  white: 'ring-4 ring-white shadow-md',
  dark: 'ring-4 ring-gray-800 shadow-md',
  blue: 'ring-4 ring-blue-500 shadow-md',
  green: 'ring-4 ring-green-500 shadow-md',
  purple: 'ring-4 ring-purple-500 shadow-md',
  red: 'ring-4 ring-red-500 shadow-md',
  gold: 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/30',
  'glow-blue': 'ring-4 ring-blue-400 shadow-lg shadow-blue-400/50',
  'glow-green': 'ring-4 ring-green-400 shadow-lg shadow-green-400/50',
  'glow-purple': 'ring-4 ring-purple-400 shadow-lg shadow-purple-400/50',
  'glow-pink': 'ring-4 ring-pink-400 shadow-lg shadow-pink-400/50',
  'glow-orange': 'ring-4 ring-orange-400 shadow-lg shadow-orange-400/50',
  double: 'ring-4 ring-white ring-offset-4 ring-offset-primary',
  rainbow: 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/50 animate-pulse',
  diamond: 'ring-4 ring-cyan-300 shadow-xl shadow-cyan-300/60',
  fire: 'ring-4 ring-orange-500 shadow-xl shadow-orange-500/60 animate-pulse',
  ice: 'ring-4 ring-cyan-200 shadow-xl shadow-cyan-200/80',
  electric: 'ring-4 ring-yellow-300 shadow-xl shadow-yellow-300/70 animate-pulse',
  neon: 'ring-4 ring-green-400 shadow-xl shadow-green-400/70',
  galaxy: 'ring-4 ring-violet-500 shadow-xl shadow-violet-500/60',
  legendary: 'ring-[6px] ring-amber-400 shadow-2xl shadow-amber-400/70 animate-pulse',
};

// Effect classes - must match ProfileCustomization.tsx
const EFFECTS: Record<string, string> = {
  none: '',
  shadow: 'drop-shadow-lg',
  'shadow-colored': 'drop-shadow-[0_4px_6px_rgba(59,130,246,0.5)]',
  glow: 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]',
  'glow-blue': 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]',
  'glow-green': 'drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]',
  'glow-purple': 'drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]',
  'glow-pink': 'drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
  ping: 'animate-ping',
  'glow-intense': 'drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]',
  'rainbow-glow': 'drop-shadow-[0_0_15px_rgba(168,85,247,0.7)]',
  'fire-glow': 'drop-shadow-[0_0_15px_rgba(249,115,22,0.7)]',
  'ice-glow': 'drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]',
  'legendary-glow': 'drop-shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-pulse',
};

interface AvatarCustomization {
  avatar_skin?: string;
  avatar_hair?: string;
  avatar_hair_color?: string;
  avatar_eyes?: string;
  avatar_accessory?: string;
  avatar_background?: string;
  avatar_border?: string;
  avatar_effect?: string;
}

interface StyledAvatarProps {
  name: string;
  customization?: AvatarCustomization;
  className?: string;
  size?: number;
}

// SVG Avatar rendering component
const AvatarSVG = ({ customization, size = 40 }: { customization: AvatarCustomization; size?: number }) => {
  const skinColor = SKIN_TONES[customization.avatar_skin || 'light'] || SKIN_TONES.light;
  const hairPath = HAIR_STYLES[customization.avatar_hair || 'short'] || '';
  const hairColor = HAIR_COLORS[customization.avatar_hair_color || 'brown'] || HAIR_COLORS.brown;
  const eyeStyle = customization.avatar_eyes || 'normal';
  const accessory = customization.avatar_accessory || 'none';

  const renderEyes = () => {
    switch (eyeStyle) {
      case 'happy':
        return (
          <>
            <path d="M8 11C8.5 10 9.5 10 10 11" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M14 11C14.5 10 15.5 10 16 11" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </>
        );
      case 'sleepy':
        return (
          <>
            <path d="M7 10C8 9 10 9 11 10" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M13 10C14 9 16 9 17 10" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </>
        );
      case 'surprised':
        return (
          <>
            <circle cx="9" cy="10" r="2" fill="#1a1a1a"/>
            <circle cx="15" cy="10" r="2" fill="#1a1a1a"/>
            <circle cx="9" cy="9.5" r="0.5" fill="#fff"/>
            <circle cx="15" cy="9.5" r="0.5" fill="#fff"/>
          </>
        );
      case 'serious':
        return (
          <>
            <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
            <circle cx="15" cy="10" r="1.5" fill="#1a1a1a"/>
            <path d="M7 8L11 8.5" stroke="#1a1a1a" strokeWidth="0.8" fill="none"/>
            <path d="M17 8L13 8.5" stroke="#1a1a1a" strokeWidth="0.8" fill="none"/>
          </>
        );
      case 'wink':
        return (
          <>
            <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
            <path d="M14 10C14.5 9 15.5 9 16 10" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </>
        );
      case 'cool':
        return (
          <>
            <rect x="6" y="9" width="5" height="2" rx="1" fill="#1a1a1a"/>
            <rect x="13" y="9" width="5" height="2" rx="1" fill="#1a1a1a"/>
          </>
        );
      case 'angry':
        return (
          <>
            <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
            <circle cx="15" cy="10" r="1.5" fill="#1a1a1a"/>
            <path d="M6 8L11 9" stroke="#1a1a1a" strokeWidth="1" fill="none"/>
            <path d="M18 8L13 9" stroke="#1a1a1a" strokeWidth="1" fill="none"/>
          </>
        );
      case 'sad':
        return (
          <>
            <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
            <circle cx="15" cy="10" r="1.5" fill="#1a1a1a"/>
            <path d="M6 9L11 8" stroke="#1a1a1a" strokeWidth="0.8" fill="none"/>
            <path d="M18 9L13 8" stroke="#1a1a1a" strokeWidth="0.8" fill="none"/>
          </>
        );
      case 'suspicious':
        return (
          <>
            <ellipse cx="9" cy="10" rx="2" ry="1" fill="#1a1a1a"/>
            <ellipse cx="15" cy="10" rx="2" ry="1" fill="#1a1a1a"/>
          </>
        );
      case 'flirty':
        return (
          <>
            <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
            <path d="M14 10C14.5 9 15.5 9 16 10" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M7 8C7 8 8 7.5 9 8" stroke="#1a1a1a" strokeWidth="0.8" fill="none"/>
          </>
        );
      case 'stars':
        return (
          <>
            <path d="M9 8L9.5 9.5L11 10L9.5 10.5L9 12L8.5 10.5L7 10L8.5 9.5Z" fill="#FFD700"/>
            <path d="M15 8L15.5 9.5L17 10L15.5 10.5L15 12L14.5 10.5L13 10L14.5 9.5Z" fill="#FFD700"/>
          </>
        );
      case 'sparkle':
        return (
          <>
            <circle cx="9" cy="10" r="1.8" fill="#1a1a1a"/>
            <circle cx="15" cy="10" r="1.8" fill="#1a1a1a"/>
            <circle cx="8" cy="9" r="0.6" fill="#fff"/>
            <circle cx="14" cy="9" r="0.6" fill="#fff"/>
            <path d="M10.5 8.5L11 9L11.5 8.5L11 9.5L10.5 8.5Z" fill="#FFD700"/>
            <path d="M16.5 8.5L17 9L17.5 8.5L17 9.5L16.5 8.5Z" fill="#FFD700"/>
          </>
        );
      case 'cat':
        return (
          <>
            <ellipse cx="9" cy="10" rx="1.5" ry="2" fill="#1a1a1a"/>
            <ellipse cx="15" cy="10" rx="1.5" ry="2" fill="#1a1a1a"/>
            <ellipse cx="9" cy="9" rx="0.3" ry="1" fill="#22c55e"/>
            <ellipse cx="15" cy="9" rx="0.3" ry="1" fill="#22c55e"/>
          </>
        );
      case 'anime':
        return (
          <>
            <ellipse cx="9" cy="10" rx="2.5" ry="3" fill="#1a1a1a"/>
            <ellipse cx="15" cy="10" rx="2.5" ry="3" fill="#1a1a1a"/>
            <ellipse cx="8" cy="9" rx="1" ry="1.2" fill="#fff"/>
            <ellipse cx="14" cy="9" rx="1" ry="1.2" fill="#fff"/>
          </>
        );
      case 'dizzy':
        return (
          <>
            <path d="M7 8L11 12M11 8L7 12" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M13 8L17 12M17 8L13 12" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
          </>
        );
      case 'crying':
        return (
          <>
            <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
            <circle cx="15" cy="10" r="1.5" fill="#1a1a1a"/>
            <path d="M9 12L9 15" stroke="#00BFFF" strokeWidth="1" strokeLinecap="round"/>
            <path d="M15 12L15 15" stroke="#00BFFF" strokeWidth="1" strokeLinecap="round"/>
          </>
        );
      case 'hearts':
        return (
          <>
            <path d="M9 9C8 8 6.5 8 6.5 9.5C6.5 11 9 12.5 9 12.5C9 12.5 11.5 11 11.5 9.5C11.5 8 10 8 9 9Z" fill="#FF4D6D"/>
            <path d="M15 9C14 8 12.5 8 12.5 9.5C12.5 11 15 12.5 15 12.5C15 12.5 17.5 11 17.5 9.5C17.5 8 16 8 15 9Z" fill="#FF4D6D"/>
          </>
        );
      case 'fire':
        return (
          <>
            <ellipse cx="9" cy="10" rx="1.5" ry="2" fill="#ff6600"/>
            <ellipse cx="9" cy="9.5" rx="0.8" ry="1.2" fill="#ffff00"/>
            <ellipse cx="15" cy="10" rx="1.5" ry="2" fill="#ff6600"/>
            <ellipse cx="15" cy="9.5" rx="0.8" ry="1.2" fill="#ffff00"/>
          </>
        );
      case 'diamond':
        return (
          <>
            <path d="M9 8L11 10L9 12L7 10Z" fill="#00ffff"/>
            <path d="M9 8.5L10 10L9 11.5L8 10Z" fill="#87ceeb"/>
            <path d="M15 8L17 10L15 12L13 10Z" fill="#00ffff"/>
            <path d="M15 8.5L16 10L15 11.5L14 10Z" fill="#87ceeb"/>
          </>
        );
      case 'hypno':
        return (
          <>
            <circle cx="9" cy="10" r="2.5" fill="none" stroke="#8b5cf6" strokeWidth="0.5"/>
            <circle cx="9" cy="10" r="1.5" fill="none" stroke="#8b5cf6" strokeWidth="0.5"/>
            <circle cx="9" cy="10" r="0.5" fill="#8b5cf6"/>
            <circle cx="15" cy="10" r="2.5" fill="none" stroke="#8b5cf6" strokeWidth="0.5"/>
            <circle cx="15" cy="10" r="1.5" fill="none" stroke="#8b5cf6" strokeWidth="0.5"/>
            <circle cx="15" cy="10" r="0.5" fill="#8b5cf6"/>
          </>
        );
      case 'laser':
        return (
          <>
            <circle cx="9" cy="10" r="1.5" fill="#ff0000"/>
            <circle cx="9" cy="10" r="0.7" fill="#ff6666"/>
            <circle cx="15" cy="10" r="1.5" fill="#ff0000"/>
            <circle cx="15" cy="10" r="0.7" fill="#ff6666"/>
          </>
        );
      case 'galaxy':
        return (
          <>
            <circle cx="9" cy="10" r="2" fill="#1a0533"/>
            <circle cx="8.5" cy="9.5" r="0.5" fill="#fff"/>
            <circle cx="9.5" cy="10.5" r="0.3" fill="#a855f7"/>
            <circle cx="8" cy="10.5" r="0.2" fill="#22d3ee"/>
            <circle cx="15" cy="10" r="2" fill="#1a0533"/>
            <circle cx="14.5" cy="9.5" r="0.5" fill="#fff"/>
            <circle cx="15.5" cy="10.5" r="0.3" fill="#a855f7"/>
            <circle cx="14" cy="10.5" r="0.2" fill="#22d3ee"/>
          </>
        );
      default:
        return (
          <>
            <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
            <circle cx="15" cy="10" r="1.5" fill="#1a1a1a"/>
          </>
        );
    }
  };

  const renderAccessory = () => {
    switch (accessory) {
      case 'earrings-stud':
        return (
          <>
            <circle cx="5" cy="12" r="0.8" fill="#FFD700"/>
            <circle cx="19" cy="12" r="0.8" fill="#FFD700"/>
          </>
        );
      case 'bandaid':
        return (
          <g>
            <rect x="14" y="13" width="4" height="2" rx="0.5" fill="#f5d0c5" stroke="#e8b4a8" strokeWidth="0.3"/>
            <line x1="14.5" y1="13.5" x2="14.5" y2="14.5" stroke="#e8b4a8" strokeWidth="0.3"/>
            <line x1="17.5" y1="13.5" x2="17.5" y2="14.5" stroke="#e8b4a8" strokeWidth="0.3"/>
          </g>
        );
      case 'glasses':
        return (
          <g stroke="#1a1a1a" strokeWidth="0.8" fill="none">
            <circle cx="9" cy="10" r="3"/>
            <circle cx="15" cy="10" r="3"/>
            <path d="M12 10L12 10"/>
            <path d="M6 10L4 9"/>
            <path d="M18 10L20 9"/>
          </g>
        );
      case 'glasses-round':
        return (
          <g stroke="#8b5cf6" strokeWidth="1" fill="none">
            <circle cx="9" cy="10" r="2.5"/>
            <circle cx="15" cy="10" r="2.5"/>
            <path d="M11.5 10L12.5 10"/>
            <path d="M6.5 10L4 9"/>
            <path d="M17.5 10L20 9"/>
          </g>
        );
      case 'sunglasses':
        return (
          <g>
            <rect x="5.5" y="8" width="5" height="4" rx="1" fill="#1a1a1a"/>
            <rect x="13.5" y="8" width="5" height="4" rx="1" fill="#1a1a1a"/>
            <path d="M10.5 10L13.5 10" stroke="#1a1a1a" strokeWidth="1"/>
            <path d="M5.5 10L3 9" stroke="#1a1a1a" strokeWidth="1"/>
            <path d="M18.5 10L21 9" stroke="#1a1a1a" strokeWidth="1"/>
          </g>
        );
      case 'earrings-hoop':
        return (
          <>
            <circle cx="4.5" cy="13" r="1.5" fill="none" stroke="#FFD700" strokeWidth="0.8"/>
            <circle cx="19.5" cy="13" r="1.5" fill="none" stroke="#FFD700" strokeWidth="0.8"/>
          </>
        );
      case 'hat-beanie':
        return (
          <g>
            <path d="M5 7C5 4 8 2 12 2C16 2 19 4 19 7L5 7Z" fill="#e74c3c"/>
            <rect x="5" y="6" width="14" height="2" fill="#c0392b"/>
            <circle cx="12" cy="1.5" r="1" fill="#e74c3c"/>
          </g>
        );
      case 'hat-cap':
        return (
          <g>
            <path d="M5 8C5 5 8 3 12 3C16 3 19 5 19 8L5 8Z" fill="#3498db"/>
            <path d="M4 8L10 6L4 6Z" fill="#2980b9"/>
          </g>
        );
      case 'headband':
        return (
          <rect x="5" y="5" width="14" height="1.5" rx="0.5" fill="#e91e63"/>
        );
      case 'bow':
        return (
          <g fill="#e91e63">
            <path d="M15 4L17 2L19 4L17 5Z"/>
            <path d="M15 4L17 6L19 4L17 5Z"/>
            <circle cx="17" cy="4" r="1" fill="#c2185b"/>
          </g>
        );
      case 'freckles':
        return (
          <>
            <circle cx="6" cy="13" r="0.4" fill="#a0522d"/>
            <circle cx="7" cy="14" r="0.4" fill="#a0522d"/>
            <circle cx="5.5" cy="14.5" r="0.4" fill="#a0522d"/>
            <circle cx="18" cy="13" r="0.4" fill="#a0522d"/>
            <circle cx="17" cy="14" r="0.4" fill="#a0522d"/>
            <circle cx="18.5" cy="14.5" r="0.4" fill="#a0522d"/>
          </>
        );
      case 'headphones':
        return (
          <g stroke="#333" strokeWidth="1.5" fill="none">
            <path d="M5 12C5 7 8 4 12 4C16 4 19 7 19 12"/>
            <rect x="3" y="11" width="3" height="5" rx="1" fill="#333"/>
            <rect x="18" y="11" width="3" height="5" rx="1" fill="#333"/>
          </g>
        );
      case 'crown':
        return (
          <g fill="#FFD700">
            <path d="M6 6L8 3L10 5L12 2L14 5L16 3L18 6L17 8L7 8L6 6Z"/>
          </g>
        );
      case 'tiara':
        return (
          <g>
            <path d="M7 6C8 4 10 3 12 3C14 3 16 4 17 6L7 6Z" fill="none" stroke="#FFD700" strokeWidth="1"/>
            <circle cx="12" cy="3" r="1" fill="#FF69B4"/>
            <circle cx="9" cy="4.5" r="0.7" fill="#87CEEB"/>
            <circle cx="15" cy="4.5" r="0.7" fill="#87CEEB"/>
          </g>
        );
      case 'mask':
        return (
          <path d="M5 8L7 7L12 8L17 7L19 8L19 11L17 12L12 11L7 12L5 11Z" fill="#1a1a1a"/>
        );
      case 'monocle':
        return (
          <g>
            <circle cx="15" cy="10" r="2.5" fill="none" stroke="#FFD700" strokeWidth="0.8"/>
            <path d="M17.5 10L20 14" stroke="#FFD700" strokeWidth="0.5"/>
          </g>
        );
      case 'piercing-nose':
        return (
          <circle cx="12" cy="13" r="0.6" fill="#c0c0c0"/>
        );
      case 'piercing-eyebrow':
        return (
          <>
            <circle cx="7" cy="8" r="0.5" fill="#c0c0c0"/>
            <circle cx="8" cy="7.8" r="0.5" fill="#c0c0c0"/>
          </>
        );
      case 'bandana':
        return (
          <g>
            <path d="M5 6C5 5 8 4 12 4C16 4 19 5 19 6L19 7.5L5 7.5Z" fill="#e74c3c"/>
            <path d="M5 7L4 9L6 8Z" fill="#e74c3c"/>
            <path d="M19 7L20 9L18 8Z" fill="#e74c3c"/>
          </g>
        );
      case 'flowers':
        return (
          <g>
            <circle cx="8" cy="4" r="1.5" fill="#ff69b4"/>
            <circle cx="10" cy="3" r="1.2" fill="#ffb6c1"/>
            <circle cx="12" cy="2.5" r="1.5" fill="#ff1493"/>
            <circle cx="14" cy="3" r="1.2" fill="#ffb6c1"/>
            <circle cx="16" cy="4" r="1.5" fill="#ff69b4"/>
            <circle cx="8" cy="4" r="0.5" fill="#ffff00"/>
            <circle cx="12" cy="2.5" r="0.5" fill="#ffff00"/>
            <circle cx="16" cy="4" r="0.5" fill="#ffff00"/>
          </g>
        );
      case 'cat-ears':
        return (
          <g fill="#ffa07a">
            <path d="M5 7L7 2L9 7Z"/>
            <path d="M19 7L17 2L15 7Z"/>
            <path d="M6 6L7 3L8 6Z" fill="#ffb6c1"/>
            <path d="M18 6L17 3L16 6Z" fill="#ffb6c1"/>
          </g>
        );
      case 'bunny-ears':
        return (
          <g fill="#fff">
            <ellipse cx="8" cy="0" rx="2" ry="4"/>
            <ellipse cx="16" cy="0" rx="2" ry="4"/>
            <ellipse cx="8" cy="0" rx="1" ry="3" fill="#ffb6c1"/>
            <ellipse cx="16" cy="0" rx="1" ry="3" fill="#ffb6c1"/>
          </g>
        );
      case 'halo':
        return (
          <ellipse cx="12" cy="3" rx="6" ry="2" fill="none" stroke="#FFD700" strokeWidth="1.5"/>
        );
      case 'horns':
        return (
          <g fill="#8B0000">
            <path d="M6 7L4 2L8 6Z"/>
            <path d="M18 7L20 2L16 6Z"/>
          </g>
        );
      case 'devil-horns':
        return (
          <g fill="#ff0000">
            <path d="M6 6L3 1L8 5Z"/>
            <path d="M18 6L21 1L16 5Z"/>
          </g>
        );
      case 'angel-wings':
        return (
          <g fill="#fff" opacity="0.9">
            <path d="M2 12C0 10 0 8 2 7C2 9 3 11 4 12L2 12Z"/>
            <path d="M22 12C24 10 24 8 22 7C22 9 21 11 20 12L22 12Z"/>
          </g>
        );
      case 'third-eye':
        return (
          <g>
            <ellipse cx="12" cy="6" rx="1.5" ry="1" fill="#8b5cf6"/>
            <circle cx="12" cy="6" r="0.5" fill="#1a1a1a"/>
          </g>
        );
      case 'antenna':
        return (
          <g>
            <path d="M10 4L10 1" stroke="#22c55e" strokeWidth="0.8"/>
            <path d="M14 4L14 1" stroke="#22c55e" strokeWidth="0.8"/>
            <circle cx="10" cy="0.5" r="1" fill="#22c55e"/>
            <circle cx="14" cy="0.5" r="1" fill="#22c55e"/>
          </g>
        );
      case 'vr-headset':
        return (
          <g>
            <rect x="5" y="7" width="14" height="6" rx="2" fill="#333"/>
            <rect x="6" y="8" width="5" height="4" rx="1" fill="#1a1a1a"/>
            <rect x="13" y="8" width="5" height="4" rx="1" fill="#1a1a1a"/>
            <path d="M5 10L3 10" stroke="#333" strokeWidth="1"/>
            <path d="M19 10L21 10" stroke="#333" strokeWidth="1"/>
          </g>
        );
      case 'robot':
        return (
          <g>
            <rect x="7" y="8" width="4" height="3" rx="0.5" fill="#4fc3f7"/>
            <rect x="13" y="8" width="4" height="3" rx="0.5" fill="#4fc3f7"/>
            <path d="M11 5L12 2L13 5" stroke="#666" strokeWidth="0.8"/>
            <circle cx="12" cy="1.5" r="0.8" fill="#ff0000"/>
          </g>
        );
      case 'flames':
        return (
          <g>
            <path d="M6 5C5 3 6 1 7 0C7 2 8 3 8 4C8 3 9 2 10 2C9 3 8 4 8 5C8 5 7 5 6 5Z" fill="#ff6b35"/>
            <path d="M18 5C19 3 18 1 17 0C17 2 16 3 16 4C16 3 15 2 14 2C15 3 16 4 16 5C16 5 17 5 18 5Z" fill="#ff6b35"/>
          </g>
        );
      case 'ice-crown':
        return (
          <g>
            <path d="M6 6L7 2L9 5L12 1L15 5L17 2L18 6L7 6Z" fill="#87CEEB" opacity="0.8"/>
            <path d="M6 6L7 2L9 5L12 1L15 5L17 2L18 6" fill="none" stroke="#4fc3f7" strokeWidth="0.5"/>
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff0000"/>
          <stop offset="25%" stopColor="#ffff00"/>
          <stop offset="50%" stopColor="#00ff00"/>
          <stop offset="75%" stopColor="#0000ff"/>
          <stop offset="100%" stopColor="#ff00ff"/>
        </linearGradient>
        <linearGradient id="fire" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff0000"/>
          <stop offset="50%" stopColor="#ff6600"/>
          <stop offset="100%" stopColor="#ffff00"/>
        </linearGradient>
        <linearGradient id="galaxy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a0533"/>
          <stop offset="50%" stopColor="#4a1a7a"/>
          <stop offset="100%" stopColor="#ff69b4"/>
        </linearGradient>
        <linearGradient id="holo" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff69b4"/>
          <stop offset="25%" stopColor="#87ceeb"/>
          <stop offset="50%" stopColor="#98fb98"/>
          <stop offset="75%" stopColor="#ffd700"/>
          <stop offset="100%" stopColor="#ff69b4"/>
        </linearGradient>
      </defs>
      
      {/* Face */}
      <circle cx="12" cy="12" r="10" fill={skinColor}/>
      
      {/* Hair */}
      {hairPath && (
        <path d={hairPath} fill={hairColor}/>
      )}
      
      {/* Eyes */}
      {renderEyes()}
      
      {/* Mouth */}
      <path d="M9 15C10 16 14 16 15 15" stroke="#1a1a1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
      
      {/* Accessory */}
      {renderAccessory()}
    </svg>
  );
};

const StyledAvatar = ({ name, customization, className, size = 40 }: StyledAvatarProps) => {
  const getInitials = () => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  };

  // If no customization, show initials with a nice gradient background
  const hasCustomization = customization && (
    customization.avatar_skin || 
    customization.avatar_hair || 
    customization.avatar_background
  );

  const backgroundClass = BACKGROUNDS[customization?.avatar_background || 'gray'] || BACKGROUNDS.gray;
  const borderClass = BORDERS[customization?.avatar_border || 'none'] || '';
  const effectClass = EFFECTS[customization?.avatar_effect || 'none'] || '';

  if (!hasCustomization) {
    return (
      <div 
        className={cn(
          "rounded-full flex items-center justify-center bg-gradient-to-br from-primary/80 to-secondary text-white font-semibold",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {getInitials()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center",
        backgroundClass,
        borderClass,
        effectClass,
        className
      )}
      style={{ width: size, height: size }}
    >
      <AvatarSVG customization={customization} size={size * 0.9} />
    </div>
  );
};

export default StyledAvatar;
