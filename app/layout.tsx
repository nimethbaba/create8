import type { Metadata } from 'next';
import { Roboto_Mono } from 'next/font/google';
import '@fontsource-variable/special-gothic/wght.css'; // self-hosted "Special Gothic Variable" (weights 400–700) for titles
import './globals.css';

// Roboto Mono is a variable font (weights 100–700), so no weight list is needed.
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'CRE 8', template: '%s — CRE 8' },
  description: 'Design, preview and order custom 3D signboards in real time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={robotoMono.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
