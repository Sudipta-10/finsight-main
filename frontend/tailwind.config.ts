import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A2540', // Deep richer blue
          hover: '#0052FF'    // Vibrant hover
        },
        accent: {
          DEFAULT: '#635BFF', // Modern vibrant purple/blue
          light: '#E2E1FF'
        },
        income: {
          DEFAULT: '#10B981',
          bg: '#ECFDF5'
        },
        expense: {
          DEFAULT: '#EF4444',
          bg: '#FEF2F2'
        },
        bg: '#F8FAFC', // Slightly cooler slate background
        surface: 'rgba(255, 255, 255, 0.7)', // Default to glass
        border: {
          DEFAULT: 'rgba(229, 231, 235, 0.6)',
          strong: 'rgba(209, 213, 219, 0.8)'
        },
        sidebar: {
          bg: '#0A2540',
          text: '#F1F5F9',
          hover: 'rgba(255, 255, 255, 0.08)',
          active: '#635BFF'
        }
      },
      fontFamily: {
        display: ['var(--font-dm-serif)', 'serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px -1px rgba(0,0,0,0.07)',
        lg: '0 10px 15px -3px rgba(0,0,0,0.08)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        glow: '0 0 20px rgba(99, 91, 255, 0.4)'
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px', // Rounded edges for a softer look
        xl: '20px',
        '2xl': '24px'
      },
      animation: {
        blob: "blob 7s infinite",
        shimmer: "shimmer 2.5s linear infinite",
        pulseGlow: "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
