import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Lock, Check, Sparkles, Crown, Star, Palette, User, Zap } from "lucide-react";
import { cn, API_URL } from "@/lib/utils";

interface AvatarCustomization {
  avatar_skin: string;
  avatar_hair: string;
  avatar_hair_color: string;
  avatar_eyes: string;
  avatar_accessory: string;
  avatar_background: string;
  avatar_border: string;
  avatar_effect: string;
}

interface ProfileCustomizationProps {
  tier: 'basic' | 'silver' | 'gold' | 'ruby';
}

// Skin tone options - expanded
const SKIN_TONES = [
  { id: 'porcelain', name: 'Porcelain', tier: 'basic', color: '#FFE5D4' },
  { id: 'light', name: 'Light', tier: 'basic', color: '#FFDBB4' },
  { id: 'fair', name: 'Fair', tier: 'basic', color: '#EDB98A' },
  { id: 'medium', name: 'Medium', tier: 'basic', color: '#D08B5B' },
  { id: 'olive', name: 'Olive', tier: 'basic', color: '#C68642' },
  { id: 'tan', name: 'Tan', tier: 'basic', color: '#AE5D29' },
  { id: 'brown', name: 'Brown', tier: 'basic', color: '#8D5524' },
  { id: 'dark', name: 'Dark', tier: 'basic', color: '#614335' },
  { id: 'espresso', name: 'Espresso', tier: 'basic', color: '#3D2314' },
  // Fun fantasy colors
  { id: 'zombie', name: 'Zombie', tier: 'gold', color: '#7CB342' },
  { id: 'alien', name: 'Alien', tier: 'gold', color: '#26C6DA' },
  { id: 'vampire', name: 'Vampire', tier: 'ruby', color: '#E0E0E0' },
  { id: 'demon', name: 'Demon', tier: 'ruby', color: '#FF5252' },
  { id: 'frost', name: 'Frost', tier: 'ruby', color: '#B3E5FC' },
];

// Hair style options - massively expanded
const HAIR_STYLES = [
  // Basic tier - simple styles
  { id: 'none', name: 'Bald', tier: 'basic', path: '' },
  { id: 'buzz', name: 'Buzz Cut', tier: 'basic', path: 'M12 4C8 4 6 5.5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5.5 16 4 12 4Z' },
  { id: 'short', name: 'Short', tier: 'basic', path: 'M12 3C8 3 6 5 6 7.5C6 7.5 8 6.5 12 6.5C16 6.5 18 7.5 18 7.5C18 5 16 3 12 3Z' },
  { id: 'crew', name: 'Crew Cut', tier: 'basic', path: 'M12 3.5C8 3.5 6 5 6 7C6 7 8 6 12 6C16 6 18 7 18 7C18 5 16 3.5 12 3.5Z' },
  { id: 'side-part', name: 'Side Part', tier: 'basic', path: 'M12 3C7 3 5 5.5 5 8C5 8 7 6.5 12 6.5C17 6.5 19 8 19 8C19 5.5 17 3 12 3Z M5 5L7 7' },
  { id: 'medium', name: 'Medium', tier: 'basic', path: 'M12 3C7 3 5 6 5 9C5 9 7 7 12 7C17 7 19 9 19 9C19 6 17 3 12 3Z M5 9C4 10 4 12 5 13C5 11 6 9 6 9L5 9Z M19 9L18 9C18 9 19 11 19 13C20 12 20 10 19 9Z' },
  { id: 'bob', name: 'Bob', tier: 'basic', path: 'M12 2C6 2 4 5 4 9C4 12 5 13 5 13L6 8C6 8 8 6.5 12 6.5C16 6.5 18 8 18 8L19 13C19 13 20 12 20 9C20 5 18 2 12 2Z' },
  { id: 'long-straight', name: 'Long Straight', tier: 'basic', path: 'M12 2C6 2 4 6 4 10C4 10 6 7 12 7C18 7 20 10 20 10C20 6 18 2 12 2Z M4 10C3 12 3 18 4 20C4 17 5 11 5 11L4 10Z M20 10L19 11C19 11 20 17 20 20C21 18 21 12 20 10Z' },
  { id: 'long-wavy', name: 'Long Wavy', tier: 'basic', path: 'M12 2C6 2 4 6 4 10C4 10 6 7 12 7C18 7 20 10 20 10C20 6 18 2 12 2Z M4 10C3 11 2 14 3 16C4 14 5 11 5 11L4 10Z M4 16C3 18 3 20 4 21C5 19 5 17 4 16Z M20 10L19 11C19 11 20 14 21 16C22 14 21 11 20 10Z M21 16C20 17 20 19 20 21C21 20 22 18 21 16Z' },
  // Silver tier
  { id: 'ponytail', name: 'Ponytail', tier: 'silver', path: 'M12 3C7 3 5 6 5 8C5 8 7 7 12 7C17 7 19 8 19 8C19 6 17 3 12 3Z M18 8C19 9 20 11 19 14C20 12 20 9 18 8Z M19 14C18 16 17 19 18 21C19 19 20 16 19 14Z' },
  { id: 'pigtails', name: 'Pigtails', tier: 'silver', path: 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M6 7C5 8 4 10 4 12C4 14 5 16 5 16C6 14 6 10 6 7Z M18 7C18 10 18 14 19 16C19 16 20 14 20 12C20 10 19 8 18 7Z' },
  { id: 'curly', name: 'Curly', tier: 'silver', path: 'M8 4C6 4 5 6 6 7.5C7 6.5 8 5.5 10 5.5C9 4.5 8 4 8 4Z M16 4C18 4 19 6 18 7.5C17 6.5 16 5.5 14 5.5C15 4.5 16 4 16 4Z M12 3C10 3 9 4 9 5C11 4 13 4 15 5C15 4 14 3 12 3Z M6 7.5C5 8.5 4 11 5 13C6 11 6.5 9 6.5 9L6 7.5Z M18 7.5L17.5 9C17.5 9 18 11 19 13C20 11 19 8.5 18 7.5Z' },
  { id: 'afro', name: 'Afro', tier: 'silver', path: 'M12 1C6 1 3 5 3 9C3 13 5 14 5 14C5 14 4 10 6 8C6 10 7 7 12 7C17 7 18 10 18 8C20 10 19 14 19 14C19 14 21 13 21 9C21 5 18 1 12 1Z' },
  { id: 'bun', name: 'Top Bun', tier: 'silver', path: 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M10 1C9 1 8 2 9 4C10 3 11 2 10 1Z M14 1C15 1 16 2 15 4C14 3 13 2 14 1Z M12 0C11 0.5 11 2 12 3C13 2 13 0.5 12 0Z' },
  { id: 'shoulder', name: 'Shoulder Length', tier: 'silver', path: 'M12 2C7 2 5 5 5 8C5 8 6 7 12 7C18 7 19 8 19 8C19 5 17 2 12 2Z M5 8C4 10 4 14 5 16C5 14 6 10 6 10L5 8Z M19 8L18 10C18 10 19 14 19 16C20 14 20 10 19 8Z' },
  { id: 'pixie', name: 'Pixie', tier: 'silver', path: 'M12 3C7 3 5 5 5 7C5 7 7 6 12 6C17 6 19 7 19 7C19 5 17 3 12 3Z M5 7C4 8 4 9 5 10L6 8L5 7Z' },
  // Gold tier
  { id: 'spiky', name: 'Spiky', tier: 'gold', path: 'M12 1L10 5L8 2L7 6L5 4L6 8C6 8 8 6.5 12 6.5C16 6.5 18 8 18 8L19 4L17 6L16 2L14 5L12 1Z' },
  { id: 'mohawk', name: 'Mohawk', tier: 'gold', path: 'M12 0L11 3L10 1L10 6.5L14 6.5L14 1L13 3L12 0Z' },
  { id: 'braids', name: 'Braids', tier: 'gold', path: 'M12 2C7 2 5 5 5 8C5 8 7 7 12 7C17 7 19 8 19 8C19 5 17 2 12 2Z M5 8C4 10 4 13 4 16C5 14 6 11 6 11L5 8Z M5 16C4 18 4 20 5 22C6 20 6 18 5 16Z M19 8L18 11C18 11 19 14 20 16C20 13 20 10 19 8Z M20 16C19 18 19 20 19 22C20 20 21 18 20 16Z' },
  { id: 'dreadlocks', name: 'Dreads', tier: 'gold', path: 'M12 1C7 1 4 4 4 8C4 8 6 6 12 6C18 6 20 8 20 8C20 4 17 1 12 1Z M4 8L3 12L4 16L5 12L4 8Z M5 16L4 20L6 18L5 16Z M20 8L21 12L20 16L19 12L20 8Z M19 16L20 20L18 18L19 16Z M7 7L6 11L7 15L8 11L7 7Z M17 7L18 11L17 15L16 11L17 7Z' },
  { id: 'twintails', name: 'Twin Tails', tier: 'gold', path: 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M5 5L4 8L3 12L4 16L5 12L6 8L5 5Z M19 5L20 8L21 12L20 16L19 12L18 8L19 5Z' },
  { id: 'undercut', name: 'Undercut', tier: 'gold', path: 'M12 2C8 2 6 4 6 6L5 7C5 7 8 6 12 6C16 6 19 7 19 7L18 6C18 4 16 2 12 2Z' },
  { id: 'samurai', name: 'Samurai', tier: 'gold', path: 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M10 0L11 4L12 1L13 4L14 0L12 2L10 0Z' },
  // Ruby tier - epic styles
  { id: 'fancy', name: 'Elegant', tier: 'ruby', path: 'M12 1C8 1 5 4 5 8C5 8 7 6 12 6C17 6 19 8 19 8C19 4 16 1 12 1Z M5 8C4 10 3 14 5 17C5 14 6 10 6 10L5 8Z M19 8L18 10C18 10 19 14 19 17C21 14 20 10 19 8Z M7 2C6 3 6 4 7 4C7 3 7 2 7 2Z M17 2C18 3 18 4 17 4C17 3 17 2 17 2Z' },
  { id: 'messy-bun', name: 'Messy Bun', tier: 'ruby', path: 'M12 3C8 3 6 5 6 7C6 7 8 6.5 12 6.5C16 6.5 18 7 18 7C18 5 16 3 12 3Z M10 2C8 1 7 2 8 4C9 3 10 2 10 2Z M14 2C16 1 17 2 16 4C15 3 14 2 14 2Z M12 0C11 0 10 1 11 2C12 1 13 2 13 2C14 1 13 0 12 0Z' },
  { id: 'anime', name: 'Anime', tier: 'ruby', path: 'M12 0C6 0 3 4 3 8C3 8 5 6 12 6C19 6 21 8 21 8C21 4 18 0 12 0Z M3 8L2 12L3 10L4 14L3 8Z M21 8L20 14L21 10L22 12L21 8Z M7 2L5 6L7 4L7 2Z M17 2L19 6L17 4L17 2Z' },
  { id: 'royal', name: 'Royal', tier: 'ruby', path: 'M12 1C7 1 4 4 4 8C4 8 7 6 12 6C17 6 20 8 20 8C20 4 17 1 12 1Z M4 8C3 10 2 16 4 20C4 16 5 11 5 11L4 8Z M20 8L19 11C19 11 20 16 20 20C22 16 21 10 20 8Z M8 2L7 4L8 3L8 2Z M16 2L17 4L16 3L16 2Z M12 0L11 2L12 1L13 2L12 0Z' },
  { id: 'wild', name: 'Wild', tier: 'ruby', path: 'M12 0L10 4L7 1L6 5L3 3L5 8C5 8 8 6 12 6C16 6 19 8 19 8L21 3L18 5L17 1L14 4L12 0Z M3 8L1 12L3 16L4 12L3 8Z M21 8L23 12L21 16L20 12L21 8Z' },
];

// Hair color options - massively expanded
const HAIR_COLORS = [
  // Natural colors - Basic
  { id: 'black', name: 'Black', tier: 'basic', color: '#1a1a1a' },
  { id: 'dark-brown', name: 'Dark Brown', tier: 'basic', color: '#3d2314' },
  { id: 'brown', name: 'Brown', tier: 'basic', color: '#4a3728' },
  { id: 'light-brown', name: 'Light Brown', tier: 'basic', color: '#6b4423' },
  { id: 'blonde', name: 'Blonde', tier: 'basic', color: '#c9a567' },
  { id: 'platinum', name: 'Platinum', tier: 'basic', color: '#e8e4c9' },
  { id: 'ginger', name: 'Ginger', tier: 'basic', color: '#b55239' },
  // Silver tier colors
  { id: 'red', name: 'Red', tier: 'silver', color: '#8b3a3a' },
  { id: 'auburn', name: 'Auburn', tier: 'silver', color: '#922724' },
  { id: 'strawberry', name: 'Strawberry', tier: 'silver', color: '#cc7755' },
  { id: 'gray', name: 'Gray', tier: 'silver', color: '#808080' },
  { id: 'silver', name: 'Silver', tier: 'silver', color: '#c0c0c0' },
  { id: 'white', name: 'White', tier: 'silver', color: '#f5f5f5' },
  // Gold tier - fantasy colors
  { id: 'blue', name: 'Blue', tier: 'gold', color: '#4a90d9' },
  { id: 'navy', name: 'Navy', tier: 'gold', color: '#1e3a5f' },
  { id: 'cyan', name: 'Cyan', tier: 'gold', color: '#00bcd4' },
  { id: 'purple', name: 'Purple', tier: 'gold', color: '#8b5cf6' },
  { id: 'lavender', name: 'Lavender', tier: 'gold', color: '#b794f4' },
  { id: 'pink', name: 'Pink', tier: 'gold', color: '#ec4899' },
  { id: 'hot-pink', name: 'Hot Pink', tier: 'gold', color: '#ff1493' },
  { id: 'green', name: 'Green', tier: 'gold', color: '#22c55e' },
  { id: 'teal', name: 'Teal', tier: 'gold', color: '#14b8a6' },
  // Ruby tier - ultra rare
  { id: 'rainbow', name: 'Rainbow', tier: 'ruby', color: 'url(#rainbow)' },
  { id: 'fire', name: 'Fire', tier: 'ruby', color: 'url(#fire)' },
  { id: 'galaxy', name: 'Galaxy', tier: 'ruby', color: 'url(#galaxy)' },
  { id: 'neon-green', name: 'Neon', tier: 'ruby', color: '#39ff14' },
  { id: 'holographic', name: 'Holo', tier: 'ruby', color: 'url(#holo)' },
];

// Eye style options - massively expanded
const EYE_STYLES = [
  // Basic
  { id: 'normal', name: 'Normal', tier: 'basic' },
  { id: 'happy', name: 'Happy', tier: 'basic' },
  { id: 'sleepy', name: 'Sleepy', tier: 'basic' },
  { id: 'surprised', name: 'Surprised', tier: 'basic' },
  { id: 'serious', name: 'Serious', tier: 'basic' },
  // Silver
  { id: 'wink', name: 'Wink', tier: 'silver' },
  { id: 'cool', name: 'Cool', tier: 'silver' },
  { id: 'angry', name: 'Angry', tier: 'silver' },
  { id: 'sad', name: 'Sad', tier: 'silver' },
  { id: 'suspicious', name: 'Suspicious', tier: 'silver' },
  { id: 'flirty', name: 'Flirty', tier: 'silver' },
  // Gold
  { id: 'stars', name: 'Star Eyes', tier: 'gold' },
  { id: 'sparkle', name: 'Sparkle', tier: 'gold' },
  { id: 'cat', name: 'Cat Eyes', tier: 'gold' },
  { id: 'anime', name: 'Anime', tier: 'gold' },
  { id: 'dizzy', name: 'Dizzy', tier: 'gold' },
  { id: 'crying', name: 'Crying', tier: 'gold' },
  // Ruby
  { id: 'hearts', name: 'Heart Eyes', tier: 'ruby' },
  { id: 'fire', name: 'Fire Eyes', tier: 'ruby' },
  { id: 'diamond', name: 'Diamond', tier: 'ruby' },
  { id: 'hypno', name: 'Hypnotic', tier: 'ruby' },
  { id: 'laser', name: 'Laser', tier: 'ruby' },
  { id: 'galaxy', name: 'Galaxy', tier: 'ruby' },
];

// Accessory options - massively expanded
const ACCESSORIES = [
  // Basic
  { id: 'none', name: 'None', tier: 'basic' },
  { id: 'earrings-stud', name: 'Stud Earrings', tier: 'basic' },
  { id: 'bandaid', name: 'Band-Aid', tier: 'basic' },
  // Silver
  { id: 'glasses', name: 'Glasses', tier: 'silver' },
  { id: 'glasses-round', name: 'Round Glasses', tier: 'silver' },
  { id: 'sunglasses', name: 'Sunglasses', tier: 'silver' },
  { id: 'earrings-hoop', name: 'Hoop Earrings', tier: 'silver' },
  { id: 'hat-beanie', name: 'Beanie', tier: 'silver' },
  { id: 'hat-cap', name: 'Cap', tier: 'silver' },
  { id: 'headband', name: 'Headband', tier: 'silver' },
  { id: 'bow', name: 'Hair Bow', tier: 'silver' },
  { id: 'freckles', name: 'Freckles', tier: 'silver' },
  // Gold
  { id: 'headphones', name: 'Headphones', tier: 'gold' },
  { id: 'crown', name: 'Crown', tier: 'gold' },
  { id: 'tiara', name: 'Tiara', tier: 'gold' },
  { id: 'mask', name: 'Eye Mask', tier: 'gold' },
  { id: 'monocle', name: 'Monocle', tier: 'gold' },
  { id: 'piercing-nose', name: 'Nose Ring', tier: 'gold' },
  { id: 'piercing-eyebrow', name: 'Eyebrow Piercing', tier: 'gold' },
  { id: 'bandana', name: 'Bandana', tier: 'gold' },
  { id: 'flowers', name: 'Flower Crown', tier: 'gold' },
  { id: 'cat-ears', name: 'Cat Ears', tier: 'gold' },
  { id: 'bunny-ears', name: 'Bunny Ears', tier: 'gold' },
  // Ruby
  { id: 'halo', name: 'Halo', tier: 'ruby' },
  { id: 'horns', name: 'Horns', tier: 'ruby' },
  { id: 'devil-horns', name: 'Devil Horns', tier: 'ruby' },
  { id: 'angel-wings', name: 'Wings (Mini)', tier: 'ruby' },
  { id: 'third-eye', name: 'Third Eye', tier: 'ruby' },
  { id: 'antenna', name: 'Antenna', tier: 'ruby' },
  { id: 'vr-headset', name: 'VR Headset', tier: 'ruby' },
  { id: 'robot', name: 'Robot Parts', tier: 'ruby' },
  { id: 'flames', name: 'Flames', tier: 'ruby' },
  { id: 'ice-crown', name: 'Ice Crown', tier: 'ruby' },
];

// Background color options - massively expanded
const BACKGROUNDS = [
  // Basic
  { id: 'gray', name: 'Gray', tier: 'basic', class: 'bg-gray-200 dark:bg-gray-700' },
  { id: 'light-gray', name: 'Light Gray', tier: 'basic', class: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'slate', name: 'Slate', tier: 'basic', class: 'bg-slate-300 dark:bg-slate-700' },
  { id: 'stone', name: 'Stone', tier: 'basic', class: 'bg-stone-300 dark:bg-stone-700' },
  { id: 'cream', name: 'Cream', tier: 'basic', class: 'bg-amber-50 dark:bg-amber-900' },
  // Silver
  { id: 'blue', name: 'Blue', tier: 'silver', class: 'bg-blue-500' },
  { id: 'light-blue', name: 'Light Blue', tier: 'silver', class: 'bg-blue-300' },
  { id: 'sky', name: 'Sky', tier: 'silver', class: 'bg-sky-400' },
  { id: 'green', name: 'Green', tier: 'silver', class: 'bg-green-500' },
  { id: 'emerald', name: 'Emerald', tier: 'silver', class: 'bg-emerald-500' },
  { id: 'teal', name: 'Teal', tier: 'silver', class: 'bg-teal-500' },
  { id: 'purple', name: 'Purple', tier: 'silver', class: 'bg-purple-500' },
  { id: 'violet', name: 'Violet', tier: 'silver', class: 'bg-violet-500' },
  { id: 'indigo', name: 'Indigo', tier: 'silver', class: 'bg-indigo-500' },
  { id: 'rose', name: 'Rose', tier: 'silver', class: 'bg-rose-400' },
  // Gold
  { id: 'orange', name: 'Orange', tier: 'gold', class: 'bg-orange-500' },
  { id: 'amber', name: 'Amber', tier: 'gold', class: 'bg-amber-500' },
  { id: 'yellow', name: 'Yellow', tier: 'gold', class: 'bg-yellow-400' },
  { id: 'lime', name: 'Lime', tier: 'gold', class: 'bg-lime-500' },
  { id: 'pink', name: 'Pink', tier: 'gold', class: 'bg-pink-500' },
  { id: 'fuchsia', name: 'Fuchsia', tier: 'gold', class: 'bg-fuchsia-500' },
  { id: 'red', name: 'Red', tier: 'gold', class: 'bg-red-500' },
  { id: 'cyan', name: 'Cyan', tier: 'gold', class: 'bg-cyan-400' },
  { id: 'gradient-gold', name: 'Gold', tier: 'gold', class: 'bg-gradient-to-br from-yellow-400 to-amber-600' },
  { id: 'gradient-ocean', name: 'Ocean', tier: 'gold', class: 'bg-gradient-to-br from-blue-400 to-cyan-600' },
  { id: 'gradient-forest', name: 'Forest', tier: 'gold', class: 'bg-gradient-to-br from-green-400 to-emerald-600' },
  { id: 'gradient-sunset', name: 'Sunset', tier: 'gold', class: 'bg-gradient-to-br from-orange-400 to-pink-600' },
  // Ruby
  { id: 'gradient-rainbow', name: 'Rainbow', tier: 'ruby', class: 'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500' },
  { id: 'gradient-ruby', name: 'Ruby', tier: 'ruby', class: 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-600' },
  { id: 'gradient-aurora', name: 'Aurora', tier: 'ruby', class: 'bg-gradient-to-r from-green-400 via-cyan-500 to-purple-600' },
  { id: 'gradient-fire', name: 'Fire', tier: 'ruby', class: 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600' },
  { id: 'gradient-galaxy', name: 'Galaxy', tier: 'ruby', class: 'bg-gradient-to-br from-purple-900 via-violet-600 to-pink-500' },
  { id: 'gradient-neon', name: 'Neon', tier: 'ruby', class: 'bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500' },
  { id: 'gradient-midnight', name: 'Midnight', tier: 'ruby', class: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' },
  { id: 'gradient-holographic', name: 'Holographic', tier: 'ruby', class: 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400' },
  { id: 'black', name: 'Black', tier: 'ruby', class: 'bg-black' },
];

// Border styles - massively expanded
const BORDERS = [
  // Basic
  { id: 'none', name: 'None', tier: 'basic', class: '' },
  { id: 'thin-gray', name: 'Thin Gray', tier: 'basic', class: 'ring-2 ring-gray-400' },
  // Silver
  { id: 'white', name: 'White', tier: 'silver', class: 'ring-4 ring-white shadow-md' },
  { id: 'dark', name: 'Dark', tier: 'silver', class: 'ring-4 ring-gray-800 shadow-md' },
  { id: 'blue', name: 'Blue', tier: 'silver', class: 'ring-4 ring-blue-500 shadow-md' },
  { id: 'green', name: 'Green', tier: 'silver', class: 'ring-4 ring-green-500 shadow-md' },
  { id: 'purple', name: 'Purple', tier: 'silver', class: 'ring-4 ring-purple-500 shadow-md' },
  { id: 'red', name: 'Red', tier: 'silver', class: 'ring-4 ring-red-500 shadow-md' },
  // Gold
  { id: 'gold', name: 'Gold', tier: 'gold', class: 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/30' },
  { id: 'glow-blue', name: 'Blue Glow', tier: 'gold', class: 'ring-4 ring-blue-400 shadow-lg shadow-blue-400/50' },
  { id: 'glow-green', name: 'Green Glow', tier: 'gold', class: 'ring-4 ring-green-400 shadow-lg shadow-green-400/50' },
  { id: 'glow-purple', name: 'Purple Glow', tier: 'gold', class: 'ring-4 ring-purple-400 shadow-lg shadow-purple-400/50' },
  { id: 'glow-pink', name: 'Pink Glow', tier: 'gold', class: 'ring-4 ring-pink-400 shadow-lg shadow-pink-400/50' },
  { id: 'glow-orange', name: 'Orange Glow', tier: 'gold', class: 'ring-4 ring-orange-400 shadow-lg shadow-orange-400/50' },
  { id: 'double', name: 'Double', tier: 'gold', class: 'ring-4 ring-white ring-offset-4 ring-offset-primary' },
  // Ruby
  { id: 'rainbow', name: 'Rainbow', tier: 'ruby', class: 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/50 animate-pulse' },
  { id: 'diamond', name: 'Diamond', tier: 'ruby', class: 'ring-4 ring-cyan-300 shadow-xl shadow-cyan-300/60' },
  { id: 'fire', name: 'Fire', tier: 'ruby', class: 'ring-4 ring-orange-500 shadow-xl shadow-orange-500/60 animate-pulse' },
  { id: 'ice', name: 'Ice', tier: 'ruby', class: 'ring-4 ring-cyan-200 shadow-xl shadow-cyan-200/80' },
  { id: 'electric', name: 'Electric', tier: 'ruby', class: 'ring-4 ring-yellow-300 shadow-xl shadow-yellow-300/70 animate-pulse' },
  { id: 'neon', name: 'Neon', tier: 'ruby', class: 'ring-4 ring-green-400 shadow-xl shadow-green-400/70' },
  { id: 'galaxy', name: 'Galaxy', tier: 'ruby', class: 'ring-4 ring-violet-500 shadow-xl shadow-violet-500/60' },
  { id: 'legendary', name: 'Legendary', tier: 'ruby', class: 'ring-[6px] ring-amber-400 shadow-2xl shadow-amber-400/70 animate-pulse' },
];

// Special effects - massively expanded
const EFFECTS = [
  // Basic
  { id: 'none', name: 'None', tier: 'basic', class: '' },
  // Silver
  { id: 'shadow', name: 'Shadow', tier: 'silver', class: 'drop-shadow-lg' },
  { id: 'shadow-colored', name: 'Blue Shadow', tier: 'silver', class: 'drop-shadow-[0_4px_6px_rgba(59,130,246,0.5)]' },
  // Gold
  { id: 'glow', name: 'Glow', tier: 'gold', class: 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' },
  { id: 'glow-blue', name: 'Blue Glow', tier: 'gold', class: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' },
  { id: 'glow-green', name: 'Green Glow', tier: 'gold', class: 'drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]' },
  { id: 'glow-purple', name: 'Purple Glow', tier: 'gold', class: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]' },
  { id: 'glow-pink', name: 'Pink Glow', tier: 'gold', class: 'drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]' },
  { id: 'pulse', name: 'Pulse', tier: 'gold', class: 'animate-pulse' },
  // Ruby
  { id: 'bounce', name: 'Bounce', tier: 'ruby', class: 'animate-bounce' },
  { id: 'spin', name: 'Spin', tier: 'ruby', class: 'animate-spin' },
  { id: 'ping', name: 'Ping', tier: 'ruby', class: 'animate-ping' },
  { id: 'glow-intense', name: 'Intense Glow', tier: 'ruby', class: 'drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' },
  { id: 'rainbow-glow', name: 'Rainbow Glow', tier: 'ruby', class: 'drop-shadow-[0_0_15px_rgba(168,85,247,0.7)]' },
  { id: 'fire-glow', name: 'Fire Glow', tier: 'ruby', class: 'drop-shadow-[0_0_15px_rgba(249,115,22,0.7)]' },
  { id: 'ice-glow', name: 'Ice Glow', tier: 'ruby', class: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]' },
  { id: 'legendary-glow', name: 'Legendary', tier: 'ruby', class: 'drop-shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-pulse' },
];

const TIER_ORDER = ['basic', 'silver', 'gold', 'ruby'] as const;
const getTierIndex = (tier: string) => TIER_ORDER.indexOf(tier as typeof TIER_ORDER[number]);

// SVG Avatar Component
const AvatarSVG = ({ customization, size = 96 }: { customization: AvatarCustomization; size?: number }) => {
  const skin = SKIN_TONES.find(s => s.id === customization.avatar_skin) || SKIN_TONES[0];
  const hair = HAIR_STYLES.find(h => h.id === customization.avatar_hair) || HAIR_STYLES[1];
  const hairColor = HAIR_COLORS.find(c => c.id === customization.avatar_hair_color) || HAIR_COLORS[0];
  const eyes = EYE_STYLES.find(e => e.id === customization.avatar_eyes) || EYE_STYLES[0];
  const accessory = ACCESSORIES.find(a => a.id === customization.avatar_accessory) || ACCESSORIES[0];

  const renderEyes = () => {
    switch (eyes.id) {
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
            <path d="M7 10L11 10" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M13 10L17 10" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
          </>
        );
      case 'surprised':
        return (
          <>
            <circle cx="9" cy="10" r="2" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
            <circle cx="9" cy="10" r="1" fill="#1a1a1a"/>
            <circle cx="15" cy="10" r="2" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
            <circle cx="15" cy="10" r="1" fill="#1a1a1a"/>
          </>
        );
      case 'serious':
        return (
          <>
            <path d="M7 9L11 10" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="9" cy="11" r="1.2" fill="#1a1a1a"/>
            <path d="M17 9L13 10" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="15" cy="11" r="1.2" fill="#1a1a1a"/>
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
            <path d="M7 8L10 9.5" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="9" cy="11" r="1.2" fill="#1a1a1a"/>
            <path d="M17 8L14 9.5" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="15" cy="11" r="1.2" fill="#1a1a1a"/>
          </>
        );
      case 'sad':
        return (
          <>
            <path d="M7 10L10 9" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="9" cy="11" r="1.2" fill="#1a1a1a"/>
            <path d="M17 10L14 9" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="15" cy="11" r="1.2" fill="#1a1a1a"/>
          </>
        );
      case 'suspicious':
        return (
          <>
            <path d="M7 9L11 10.5" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="9" cy="11" r="1" fill="#1a1a1a"/>
            <path d="M13 10.5L17 9" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="15" cy="11" r="1" fill="#1a1a1a"/>
          </>
        );
      case 'flirty':
        return (
          <>
            <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
            <circle cx="9" cy="9.5" r="0.5" fill="#fff"/>
            <path d="M13 10C14 9 16 9 17 10" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
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
            <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
            <circle cx="8.5" cy="9.5" r="0.7" fill="#fff"/>
            <circle cx="9.5" cy="10.5" r="0.3" fill="#fff"/>
            <circle cx="15" cy="10" r="1.5" fill="#1a1a1a"/>
            <circle cx="14.5" cy="9.5" r="0.7" fill="#fff"/>
            <circle cx="15.5" cy="10.5" r="0.3" fill="#fff"/>
          </>
        );
      case 'cat':
        return (
          <>
            <ellipse cx="9" cy="10" rx="2" ry="1.5" fill="#1a1a1a"/>
            <ellipse cx="9" cy="10" rx="0.5" ry="1.2" fill="#22c55e"/>
            <ellipse cx="15" cy="10" rx="2" ry="1.5" fill="#1a1a1a"/>
            <ellipse cx="15" cy="10" rx="0.5" ry="1.2" fill="#22c55e"/>
          </>
        );
      case 'anime':
        return (
          <>
            <ellipse cx="9" cy="10" rx="2.5" ry="2" fill="#1a1a1a"/>
            <circle cx="8.5" cy="9.5" r="1" fill="#fff"/>
            <circle cx="9.5" cy="10.5" r="0.5" fill="#fff"/>
            <ellipse cx="15" cy="10" rx="2.5" ry="2" fill="#1a1a1a"/>
            <circle cx="14.5" cy="9.5" r="1" fill="#fff"/>
            <circle cx="15.5" cy="10.5" r="0.5" fill="#fff"/>
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
            <path d="M8 12L7 16" stroke="#4fc3f7" strokeWidth="1" strokeLinecap="round"/>
            <path d="M10 12L11 16" stroke="#4fc3f7" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="15" cy="10" r="1.5" fill="#1a1a1a"/>
            <path d="M14 12L13 16" stroke="#4fc3f7" strokeWidth="1" strokeLinecap="round"/>
            <path d="M16 12L17 16" stroke="#4fc3f7" strokeWidth="1" strokeLinecap="round"/>
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
            <path d="M9 12C9 10 8 9 8 8C9 8.5 10 9 10 10C10 9 10.5 8 11 8C10.5 9 10 10 10 12C10 12 9.5 12 9 12Z" fill="#ff6b35"/>
            <path d="M9 11C9 10.5 9.5 10 9.5 9.5C9.5 10 10 10.5 10 11C10 11 9.5 11.5 9 11Z" fill="#ffd700"/>
            <path d="M15 12C15 10 14 9 14 8C15 8.5 16 9 16 10C16 9 16.5 8 17 8C16.5 9 16 10 16 12C16 12 15.5 12 15 12Z" fill="#ff6b35"/>
            <path d="M15 11C15 10.5 15.5 10 15.5 9.5C15.5 10 16 10.5 16 11C16 11 15.5 11.5 15 11Z" fill="#ffd700"/>
          </>
        );
      case 'diamond':
        return (
          <>
            <path d="M9 8L11 10L9 12L7 10Z" fill="#4fc3f7" stroke="#29b6f6" strokeWidth="0.5"/>
            <path d="M15 8L17 10L15 12L13 10Z" fill="#4fc3f7" stroke="#29b6f6" strokeWidth="0.5"/>
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
    switch (accessory.id) {
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ borderRadius: '50%' }}>
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
        <clipPath id="circleClip">
          <circle cx="12" cy="12" r="12"/>
        </clipPath>
      </defs>
      
      <g clipPath="url(#circleClip)">
        {/* Face */}
        <circle cx="12" cy="12" r="12" fill={skin.color}/>
        
        {/* Hair */}
        {hair.path && (
          <path d={hair.path} fill={
            hairColor.id === 'rainbow' ? 'url(#rainbow)' : 
            hairColor.id === 'fire' ? 'url(#fire)' : 
            hairColor.id === 'galaxy' ? 'url(#galaxy)' : 
            hairColor.id === 'holographic' ? 'url(#holo)' : 
            hairColor.color
          }/>
        )}
        
        {/* Eyes */}
        {renderEyes()}
        
        {/* Mouth */}
        <path d="M9 15C10 16 14 16 15 15" stroke="#1a1a1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
        
        {/* Accessory */}
        {renderAccessory()}
      </g>
    </svg>
  );
};

const ProfileCustomization = ({ tier }: ProfileCustomizationProps) => {
  const [customization, setCustomization] = useState<AvatarCustomization>({
    avatar_skin: 'light',
    avatar_hair: 'short',
    avatar_hair_color: 'brown',
    avatar_eyes: 'normal',
    avatar_accessory: 'none',
    avatar_background: 'gray',
    avatar_border: 'none',
    avatar_effect: 'none',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const currentTierIndex = getTierIndex(tier);

  useEffect(() => {
    loadCustomization();
  }, []);

  const loadCustomization = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/profiles/customization`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setCustomization(prev => ({
            ...prev,
            ...data,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading customization:', error);
    }
  };

  const saveCustomization = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/profiles/customization`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(customization),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save customization');
      }

      toast({
        title: "Avatar updated!",
        description: "Your profile customization has been saved.",
      });
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Error",
        description: "Failed to save customization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isOptionUnlocked = (optionTier: string) => {
    return getTierIndex(optionTier) <= currentTierIndex;
  };

  const getBackgroundClass = () => {
    const bg = BACKGROUNDS.find(b => b.id === customization.avatar_background);
    return bg?.class || BACKGROUNDS[0].class;
  };

  const getBorderClass = () => {
    const border = BORDERS.find(b => b.id === customization.avatar_border);
    return border?.class || '';
  };

  const getEffectClass = () => {
    const effect = EFFECTS.find(e => e.id === customization.avatar_effect);
    return effect?.class || '';
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      case 'silver': return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      case 'gold': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      case 'ruby': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'basic': return 'Basic';
      case 'silver': return 'Silver';
      case 'gold': return 'Gold';
      case 'ruby': return 'Ruby';
      default: return tier;
    }
  };

  const renderOptionButton = (
    option: { id: string; name: string; tier: string; color?: string; class?: string },
    category: keyof AvatarCustomization,
    preview?: React.ReactNode
  ) => {
    const unlocked = isOptionUnlocked(option.tier);
    const selected = customization[category] === option.id;
    
    return (
      <button
        key={option.id}
        onClick={() => unlocked && setCustomization({ ...customization, [category]: option.id })}
        disabled={!unlocked}
        className={cn(
          "relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all min-w-[70px]",
          selected ? "border-primary bg-primary/10" : "border-muted",
          unlocked ? "hover:border-primary/50 cursor-pointer" : "opacity-50 cursor-not-allowed"
        )}
      >
        {preview || (
          option.color ? (
            <div 
              className="w-6 h-6 rounded-full border border-gray-300" 
              style={{ background: option.color }}
            />
          ) : option.class ? (
            <div className={cn("w-6 h-6 rounded-full", option.class)} />
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
              {option.name.charAt(0)}
            </div>
          )
        )}
        <span className="text-[10px] text-center leading-tight font-medium">{option.name}</span>
        <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium", getTierBadgeColor(option.tier))}>
          {getTierLabel(option.tier)}
        </span>
        {!unlocked && <Lock className="absolute top-0.5 right-0.5 w-3 h-3 text-muted-foreground" />}
        {selected && <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-primary" />}
      </button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Create Your Avatar
        </CardTitle>
        <CardDescription>
          Customize your avatar appearance. Higher tiers unlock more options!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-lg">
          <Label className="text-sm text-muted-foreground">Live Preview</Label>
          <div
            className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center overflow-visible",
              getBackgroundClass(),
              getBorderClass(),
              getEffectClass()
            )}
          >
            <AvatarSVG customization={customization} size={100} />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            This is how your avatar will appear in class lists
          </p>
        </div>

        {/* Skin Tone */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" /> Skin Tone
          </Label>
          <div className="flex flex-wrap gap-2">
            {SKIN_TONES.map((skin) => renderOptionButton(skin, 'avatar_skin'))}
          </div>
        </div>

        {/* Hair Style */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" /> Hair Style
          </Label>
          <div className="flex flex-wrap gap-2">
            {HAIR_STYLES.map((hair) => renderOptionButton(hair, 'avatar_hair'))}
          </div>
        </div>

        {/* Hair Color */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" /> Hair Color
          </Label>
          <div className="flex flex-wrap gap-2">
            {HAIR_COLORS.map((color) => renderOptionButton(color, 'avatar_hair_color'))}
          </div>
        </div>

        {/* Eye Style */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4" /> Eyes
          </Label>
          <div className="flex flex-wrap gap-2">
            {EYE_STYLES.map((eyes) => renderOptionButton(eyes, 'avatar_eyes'))}
          </div>
        </div>

        {/* Accessories */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Crown className="w-4 h-4" /> Accessories
          </Label>
          <div className="flex flex-wrap gap-2">
            {ACCESSORIES.map((acc) => renderOptionButton(acc, 'avatar_accessory'))}
          </div>
        </div>

        {/* Background */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" /> Background
          </Label>
          <div className="flex flex-wrap gap-2">
            {BACKGROUNDS.map((bg) => renderOptionButton(bg, 'avatar_background'))}
          </div>
        </div>

        {/* Border */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Border
          </Label>
          <div className="flex flex-wrap gap-2">
            {BORDERS.map((border) => (
              <button
                key={border.id}
                onClick={() => isOptionUnlocked(border.tier) && setCustomization({ ...customization, avatar_border: border.id })}
                disabled={!isOptionUnlocked(border.tier)}
                className={cn(
                  "relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all min-w-[70px]",
                  customization.avatar_border === border.id ? "border-primary bg-primary/10" : "border-muted",
                  isOptionUnlocked(border.tier) ? "hover:border-primary/50 cursor-pointer" : "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full bg-gray-400", border.class)} />
                <span className="text-[10px] text-center font-medium">{border.name}</span>
                <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium", getTierBadgeColor(border.tier))}>
                  {getTierLabel(border.tier)}
                </span>
                {!isOptionUnlocked(border.tier) && <Lock className="absolute top-0.5 right-0.5 w-3 h-3 text-muted-foreground" />}
                {customization.avatar_border === border.id && <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Effects */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" /> Effects
          </Label>
          <div className="flex flex-wrap gap-2">
            {EFFECTS.map((effect) => renderOptionButton(effect, 'avatar_effect'))}
          </div>
        </div>

        {/* Tier Progress Hint */}
        {tier !== 'ruby' && (
          <div className="p-4 bg-muted/50 rounded-lg border border-muted">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-sm">Unlock More Options!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Earn more tier points to reach higher tiers and unlock additional styles.
              {tier === 'basic' && " Silver tier unlocks at 50 tier points!"}
              {tier === 'silver' && " Gold tier unlocks at 100 tier points!"}
              {tier === 'gold' && " Ruby tier unlocks at 200 tier points!"}
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button onClick={saveCustomization} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Avatar"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCustomization;
