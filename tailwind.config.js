/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with 'class' strategy
  theme: {
    extend: {
      colors: {
        'book': {
          'bg': '#fffcf6',      // Light sepia background
          'card': '#f8f3e8',    // Slightly darker sepia for cards
          'border': '#e6d9c3',  // Sepia border color
          'text': '#5b4636',    // Dark sepia text
          'text-light': '#8b7355', // Medium sepia text
          'accent': '#8b7355',  // Accent color for buttons
          'accent-hover': '#5b4636', // Darker accent for hover states
        },
        // Dark theme colors - updated to pure black
        'dark': {
          'bg': '#000000',          // Pure black background
          'card': '#0a0a0a',        // Slightly lighter black for cards
          'secondary': '#121212',   // Dark gray for secondary backgrounds
          'border': '#1a1a1a',      // Very dark gray for borders
          'text': '#ffffff',        // Pure white for text
          'text-light': '#b0b0b0',  // Light gray for secondary text
          'accent': '#ff9800',      // Orange accent color
          'accent-hover': '#ffb74d', // Lighter orange for hover
        }
      },
      backgroundColor: {
        'dark-primary': '#000000',    // Pure black primary background
        'dark-secondary': '#0a0a0a',  // Very dark gray secondary background
        'dark-tertiary': '#121212',   // Dark gray tertiary background
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
} 