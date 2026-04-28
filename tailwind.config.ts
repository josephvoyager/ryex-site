import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background scale
        'bg-0': 'var(--bg-0)',
        'bg-1': 'var(--bg-1)',
        'bg-2': 'var(--bg-2)',
        // Ink (text) scale
        'ink-1': 'var(--ink-1)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        'ink-4': 'var(--ink-4)',
        // Accent semantic colors
        lime: 'var(--lime)',
        'lime-soft': 'var(--lime-soft)',
        'lime-line': 'var(--lime-line)',
        cobalt: 'var(--cobalt)',
        'cobalt-soft': 'var(--cobalt-soft)',
        'cobalt-line': 'var(--cobalt-line)',
        violet: 'var(--violet)',
        'violet-soft': 'var(--violet-soft)',
        amber: 'var(--amber)',
        'amber-soft': 'var(--amber-soft)',
        // Lines/borders
        'line-1': 'var(--line-1)',
        'line-2': 'var(--line-2)',
        'line-3': 'var(--line-3)',
        // Status
        pos: 'var(--pos)',
        neg: 'var(--neg)',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        'extra-tight': '-0.035em',
      },
      animation: {
        'fade-up': 'fadeUp 1s cubic-bezier(.2,.7,.25,1) forwards',
        'pulse-soft': 'pulse 1.8s ease-in-out infinite',
        breathe: 'breathe 8s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        breathe: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.5' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
