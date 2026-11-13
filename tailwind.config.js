/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ner: {
          navy: '#0b1329',
          dark: '#0f172a',
          blue: '#1e3a8a',
          accent: '#06b6d4',
          light: '#f8fafc',
          card: 'rgba(255, 255, 255, 0.75)',
          border: 'rgba(255, 255, 255, 0.4)',
        },
        risk: {
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
