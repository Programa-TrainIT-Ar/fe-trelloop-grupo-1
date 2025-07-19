/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          100: 'var(--global-color-primary-100)',
          200: 'var(--global-color-primary-200)',
          300: 'var(--global-color-primary-300)',
          400: 'var(--global-color-primary-400)',
          500: 'var(--global-color-primary-500)',
          600: 'var(--global-color-primary-600)',
          700: 'var(--global-color-primary-700)',
          800: 'var(--global-color-primary-800)',
          900: 'var(--global-color-primary-900)',
        },
        'secondary': {
          100: 'var(--global-color-secondary-100)',
          200: 'var(--global-color-secondary-200)',
          300: 'var(--global-color-secondary-300)',
          400: 'var(--global-color-secondary-400)',
          500: 'var(--global-color-secondary-500)',
          600: 'var(--global-color-secondary-600)',
          700: 'var(--global-color-secondary-700)',
          800: 'var(--global-color-secondary-800)',
          900: 'var(--global-color-secondary-900)',
        },
        'neutral': {
          100: 'var(--global-color-neutral-100)',
          200: 'var(--global-color-neutral-200)',
          300: 'var(--global-color-neutral-300)',
          400: 'var(--global-color-neutral-400)',
          500: 'var(--global-color-neutral-500)',
          600: 'var(--global-color-neutral-600)',
          700: 'var(--global-color-neutral-700)',
          800: 'var(--global-color-neutral-800)',
          900: 'var(--global-color-neutral-900)',
          1000: 'var(--global-color-neutral-1000)',
        },
        'blue': {
          100: 'var(--global-color-blue-100)',
          200: 'var(--global-color-blue-200)',
          300: 'var(--global-color-blue-300)',
          400: 'var(--global-color-blue-400)',
          500: 'var(--global-color-blue-500)',
          600: 'var(--global-color-blue-600)',
          700: 'var(--global-color-blue-700)',
          800: 'var(--global-color-blue-800)',
          900: 'var(--global-color-blue-900)',
        },
        'yellow': {
          100: 'var(--global-color-yellow-100)',
          200: 'var(--global-color-yellow-200)',
          300: 'var(--global-color-yellow-300)',
          400: 'var(--global-color-yellow-400)',
          500: 'var(--global-color-yellow-500)',
          600: 'var(--global-color-yellow-600)',
          700: 'var(--global-color-yellow-700)',
          800: 'var(--global-color-yellow-800)',
          900: 'var(--global-color-yellow-900)',
        },
        'green': {
          100: 'var(--global-color-green-100)',
          200: 'var(--global-color-green-200)',
          300: 'var(--global-color-green-300)',
          400: 'var(--global-color-green-400)',
          500: 'var(--global-color-green-500)',
          600: 'var(--global-color-green-600)',
          700: 'var(--global-color-green-700)',
          800: 'var(--global-color-green-800)',
          900: 'var(--global-color-green-900)',
        },
        'red': {
          100: 'var(--global-color-red-100)',
          200: 'var(--global-color-red-200)',
          300: 'var(--global-color-red-300)',
          400: 'var(--global-color-red-400)',
          500: 'var(--global-color-red-500)',
          600: 'var(--global-color-red-600)',
          700: 'var(--global-color-red-700)',
          800: 'var(--global-color-red-800)',
          900: 'var(--global-color-red-900)',
        },


        'background': {
          body: 'var(--global-color-neutral-900)',
          height: 'var(--global-color-neutral-600)',
          medium: 'var(--global-color-neutral-800)',
          low: 'var(--global-color-neutral-1000)'
        },
        'text': {
          default: 'var(--global-color-neutral-0)',
          inverted: 'var(--global-color-neutral-1000)',
          subtle: 'var(--global-color-neutral-500)'
        },
        'state': {
          default: 'var(--global-color-primary-500)',
          hover: 'var(--global-color-primary-600)',
          disabled: 'var(--global-color-neutral-200)'
        },
        'border': {
          subtle: 'var(--global-color-neutral-900)',
          medium: 'var(--global-color-neutral-500)',
          heavy: 'var(--global-color-neutral-200)'
        },
      },

    },
  },
  plugins: [],
}