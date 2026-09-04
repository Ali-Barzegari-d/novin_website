import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  // Tailwind v4 discovers sources automatically; these legacy paths retain
  // predictable coverage when this config is consumed by another build tool.
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          950: '#0d0f12',
          900: '#161a20',
          800: '#242930',
          700: '#363c45',
          600: '#4e5663',
          500: '#697282',
          400: '#8a95a3',
          300: '#aeb7c2',
          200: '#d0d6dd',
          100: '#eaedf0',
          50: '#f6f7f9'
        },
        primary: {
          950: '#0b2545',
          900: '#153a63',
          500: '#2651d4',
          400: '#4f72e0',
          300: '#7b96e8',
          200: '#adbcf2',
          100: '#dde4fa',
          50: '#f0f3fd'
        },
        accent: {
          700: '#006f6a',
          600: '#008f88',
          500: '#00aea6',
          400: '#00c8bf',
          300: '#33d8d0',
          200: '#80e8e3',
          100: '#ccf6f4'
        },
        success: { 700: '#155f2e', 500: '#22a05a', 100: '#d1f5e2' },
        warning: { 700: '#7a4a00', 500: '#e08c00', 100: '#fff3cc' },
        danger: { 700: '#8b1a1a', 500: '#dc3030', 100: '#fde8e8' },
        info: { 700: '#0c4a7a', 500: '#1e82d4', 100: '#dceefa' }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
        display: ['Estedad', 'Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.875rem', { lineHeight: '1.375rem' }],
        base: ['1rem', { lineHeight: '1.625rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }]
      },
      spacing: {
        '0.5': '2px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px'
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.06)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        float: '0 20px 40px -8px rgb(0 0 0 / 0.18), 0 0 0 1px rgb(0 0 0 / 0.04)'
      },
      transitionDuration: { fast: '120ms', DEFAULT: '180ms', slow: '240ms' },
      transitionTimingFunction: { DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)' }
    }
  },
  plugins: []
};

export default config;
