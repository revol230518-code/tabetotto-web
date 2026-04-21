
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils.ts",
    "./types.ts",
    "./theme.ts"
  ],
  theme: {
    extend: {
      colors: {
        appBg: 'var(--app-bg)',
        cardBg: 'var(--card-bg)',
        border: 'var(--border)',
        softNeutral: 'var(--soft-neutral)',
        textPrimary: 'var(--text-primary)',
        textMuted: 'var(--text-muted)',
        textLight: 'var(--text-light)',
        textOnAccent: 'var(--text-on-accent)',
        mealPrimary: 'var(--meal-primary)',
        mealSoft: 'var(--meal-soft)',
        mealBorder: 'var(--meal-border)',
        mealPressed: 'var(--meal-pressed)',
        readPrimary: 'var(--read-primary)',
        readSoft: 'var(--read-soft)',
        readBorder: 'var(--read-border)',
        readPressed: 'var(--read-pressed)',
        posturePrimary: 'var(--posture-primary)',
        postureSoft: 'var(--posture-soft)',
        postureBorder: 'var(--posture-border)',
        posturePressed: 'var(--posture-pressed)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        // Keeping old ones temporarily if needed, but better to replace them
        primary: 'var(--meal-primary)',
        secondary: 'var(--posture-primary)',
        tabetotto_bg: 'var(--app-bg)',
      },
      fontFamily: {
        'zen-maru': ['"Zen Maru Gothic"', 'sans-serif'],
      },
      keyframes: {
        'breathe-deep': {
          '0%, 100%': { transform: 'scale(1) translateY(0) rotate(0deg)' },
          '50%': { transform: 'scale(1.05) translateY(-2px) rotate(1deg)' },
        },
        'breathe-light': {
          '0%, 100%': { transform: 'scale(1) translateY(0)' },
          '50%': { transform: 'scale(1.02) translateY(-1px)' },
        },
        'breathe-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.01)' },
        }
      },
      animation: {
        'breathe-deep': 'breathe-deep 6s ease-in-out infinite',
        'breathe-light': 'breathe-light 5s ease-in-out infinite',
        'breathe-subtle': 'breathe-subtle 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
