/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'castiq-blue-dark': '#0c1f3d',
        'castiq-blue': '#1a3a5c',
        'castiq-teal': '#06b6d4',
        'castiq-green': '#22c55e',
        'castiq-yellow': '#eab308',
        'castiq-gray': '#6b7280',
        'castiq-red': '#ef4444',
        'castiq-white': '#f8fafc',
        'castiq-muted': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
