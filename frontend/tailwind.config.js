/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', '"Anek Bangla"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        bangla: ['"Anek Bangla"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['Geist', 'Inter', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#030303',
          surface: '#18181B',
          surfaceHover: '#202024',
          card: '#121215',
          border: '#27272A',
          borderSubtle: '#1f1f23',
          textPrimary: '#FFFFFF',
          textSecondary: '#A1A1AA',
          textMuted: '#71717A',
        },
        nova: {
          primary: '#34D399',
          secondary: '#60A5FA',
          accent: '#60A5FA',
        },
        gov: {
          50: '#f0fdf4',
          100: '#dcfce7',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'dark-card': '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'dark-glow': '0 0 20px -5px rgba(52, 211, 153, 0.15)',
      }
    },
  },
  plugins: [],
}
