import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  safelist: [
    // ===== AVATAR BACKGROUNDS =====
    // Basic backgrounds
    'bg-gray-200', 'dark:bg-gray-700', 'bg-gray-100', 'dark:bg-gray-800',
    'bg-slate-300', 'dark:bg-slate-700', 'bg-stone-300', 'dark:bg-stone-700',
    'bg-amber-50', 'dark:bg-amber-900',
    // Silver backgrounds  
    'bg-blue-500', 'bg-blue-300', 'bg-sky-400', 'bg-green-500', 'bg-emerald-500',
    'bg-teal-500', 'bg-purple-500', 'bg-violet-500', 'bg-indigo-500', 'bg-rose-400',
    // Gold backgrounds
    'bg-orange-500', 'bg-amber-500', 'bg-yellow-400', 'bg-lime-500', 'bg-pink-500',
    'bg-fuchsia-500', 'bg-red-500', 'bg-cyan-400',
    // Ruby backgrounds (gradients)
    'bg-gradient-to-br', 'bg-gradient-to-r',
    'from-yellow-400', 'to-amber-600', 'from-blue-400', 'to-cyan-600',
    'from-green-400', 'to-emerald-600', 'from-orange-400', 'to-pink-600',
    'from-red-500', 'via-yellow-500', 'to-purple-500', 'via-pink-500', 'to-rose-600',
    'from-green-400', 'via-cyan-500', 'to-purple-600', 'from-yellow-500', 'via-orange-500', 'to-red-600',
    'from-purple-900', 'via-violet-600', 'to-pink-500', 'via-cyan-400', 'to-blue-500',
    'from-slate-900', 'via-purple-900', 'from-pink-400', 'via-purple-400', 'to-cyan-400',
    'bg-black',
    
    // ===== AVATAR BORDERS =====
    'ring-2', 'ring-4', 'ring-[6px]',
    'ring-gray-400', 'ring-white', 'ring-gray-800',
    'ring-blue-500', 'ring-green-500', 'ring-purple-500', 'ring-red-500',
    'ring-yellow-400', 'ring-blue-400', 'ring-green-400', 'ring-purple-400',
    'ring-pink-400', 'ring-orange-400', 'ring-cyan-300', 'ring-orange-500',
    'ring-cyan-200', 'ring-yellow-300', 'ring-violet-500', 'ring-amber-400',
    'ring-offset-4', 'ring-offset-primary',
    
    // ===== AVATAR SHADOWS =====
    'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
    'shadow-yellow-400/30', 'shadow-blue-400/50', 'shadow-green-400/50',
    'shadow-purple-400/50', 'shadow-pink-400/50', 'shadow-orange-400/50',
    'shadow-purple-500/50', 'shadow-cyan-300/60', 'shadow-orange-500/60',
    'shadow-cyan-200/80', 'shadow-yellow-300/70', 'shadow-green-400/70',
    'shadow-violet-500/60', 'shadow-amber-400/70',
    
    // ===== AVATAR EFFECTS =====
    'drop-shadow-lg',
    'drop-shadow-[0_4px_6px_rgba(59,130,246,0.5)]',
    'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]',
    'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]',
    'drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]',
    'drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]',
    'drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]',
    'drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]',
    'drop-shadow-[0_0_15px_rgba(168,85,247,0.7)]',
    'drop-shadow-[0_0_15px_rgba(249,115,22,0.7)]',
    'drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]',
    'drop-shadow-[0_0_25px_rgba(251,191,36,0.9)]',
    'animate-pulse', 'animate-bounce', 'animate-spin', 'animate-ping',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
