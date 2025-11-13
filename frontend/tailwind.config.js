/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      colors: {
        // Primary Colors
        navy: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A', // Main Navy
        },
        beige: {
          50: '#FDFCFA',
          100: '#FAF9F5',
          200: '#F5F5F0', // Main Beige
          300: '#F0EFE8',
          400: '#EBEAE0',
        },
        cream: {
          50: '#FEFDFB',
          100: '#FDFBF7',
          200: '#FBF8F0',
          300: '#F8F4E9', // Main Cream
          400: '#F5F0E0',
        },
        // Accent Colors
        gold: {
          100: '#F5E8C9',
          200: '#EED9A3',
          300: '#E6C97D',
          400: '#DEBA57',
          500: '#D4AF37', // Main Gold
          600: '#B08C2C',
          700: '#8C6921',
        },
        // Neutral Colors
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6', // Light Gray
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151', // Dark Gray
          800: '#1F2937',
          900: '#111827',
        },
        // Alias for backward compatibility
        primary: {
          DEFAULT: '#1E3A8A',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          DEFAULT: '#D4AF37',
          100: '#F5E8C9',
          200: '#EED9A3',
          300: '#E6C97D',
          400: '#DEBA57',
          500: '#D4AF37',
          600: '#B08C2C',
          700: '#8C6921',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        // Body text
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        // Headings
        display: ['Playfair Display', 'serif']
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      }
    }
  },
  plugins: []
};


