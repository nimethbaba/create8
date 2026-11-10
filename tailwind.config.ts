import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Tailwind applies `sans` to the whole site, so this switches every page (landing, gallery, designer…) to Roboto Mono.
      fontFamily: {
        display: ['"Special Gothic Variable"', 'system-ui', 'sans-serif'],
        sans: ['var(--font-roboto-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
