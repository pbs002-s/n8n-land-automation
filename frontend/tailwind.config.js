/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // Every color is a token. No raw hex in components.
    extend: {
      colors: {
        ground: 'var(--ground)',
        'ground-sunk': 'var(--ground-sunk)',
        sheet: 'var(--sheet)',
        'sheet-raised': 'var(--sheet-raised)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        'line-hair': 'var(--line-hair)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        indigo: 'var(--indigo)',
        'indigo-ink': 'var(--indigo-ink)',
        'indigo-soft': 'var(--indigo-soft)',
        seal: 'var(--seal)',
        'seal-soft': 'var(--seal-soft)',
        state: 'var(--state)',
        'state-soft': 'var(--state-soft)',
        amber: 'var(--amber)',
        'amber-soft': 'var(--amber-soft)',
      },
      fontFamily: {
        sans: ['"Anek Latin"', '"Anek Bangla"', '-apple-system', 'sans-serif'],
        bangla: ['"Anek Bangla"', '"Anek Latin"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // 1.2 ratio, capped — a register has few sizes, used consistently
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.9375rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.45' }],
        xl: ['1.375rem', { lineHeight: '1.3' }],
        '2xl': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        '3xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '4xl': ['3rem', { lineHeight: '1.04', letterSpacing: '-0.025em' }],
        '5xl': ['4rem', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        // Sharp. This is a document, not a bubble.
        none: '0',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },
      transitionTimingFunction: {
        sheet: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      },
      transitionDuration: { 1: '140ms', 2: '260ms', 3: '520ms' },
      maxWidth: { measure: '62ch', shell: '1240px' },
    },
  },
  plugins: [],
};
