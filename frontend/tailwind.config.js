/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        ivory: '#FDFAF5',
        caramel: '#8B6914',
        'pen-blue': '#1A3A5C',
        'correction-red': '#C0392B',
        parchment: '#E8DFC8',
        leather: '#6B4C1E',
        ink: '#2C1810',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        paper: '0 1px 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.6)',
        'paper-lg': '0 4px 6px rgba(0,0,0,0.07), 0 8px 24px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.6)',
        'btn-3d': '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)',
        'btn-3d-pressed': '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 2px rgba(0,0,0,0.2)',
        stamp: '0 0 0 3px rgba(192,57,43,0.25), inset 0 0 0 2px rgba(192,57,43,0.15)',
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'lined-paper': 'repeating-linear-gradient(transparent, transparent 1.6rem, #9BB5C9 1.6rem, #9BB5C9 1.65rem)',
      },
    },
  },
  plugins: [],
};
