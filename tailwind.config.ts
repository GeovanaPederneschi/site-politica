import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#1a1a1a',
          light: '#2d2d2d',
          muted: '#6b6b6b',
        },
        paper: {
          DEFAULT: '#fafaf8',
          warm: '#f5f4f0',
        },
        accent: {
          DEFAULT: '#8b1a1a',
          light: '#a52020',
          muted: '#c0504d',
        },
        border: '#e2e0da',
      },
    },
  },
  plugins: [],
}

export default config
