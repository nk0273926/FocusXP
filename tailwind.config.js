/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['"Exo 2"', 'sans-serif'],
      },
      colors: {
        cyber: {
          bg: '#05060a',
          surface: '#0a0e1a',
          card: '#0d1220',
          border: '#1a2340',
          cyan: '#00f0ff',
          green: '#00ff9d',
          pink: '#ff2d95',
          amber: '#ffb800',
          violet: '#7c5cff',
          red: '#ff4d6d',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(0,240,255,0.15)',
        'glow-green': '0 0 20px rgba(0,255,157,0.15)',
        'glow-pink': '0 0 20px rgba(255,45,149,0.15)',
        'glow-amber': '0 0 20px rgba(255,184,0,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 15px rgba(0,240,255,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(0,240,255,0.5)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
