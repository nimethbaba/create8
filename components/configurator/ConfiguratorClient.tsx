'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ControlsSidebar } from './ControlsSidebar';
import Link from 'next/link';
import { CartLink } from '../CartLink';
import { getPreset } from '@/lib/presets';
import { useSignStore } from '@/store/useSignStore';

// WebGL needs the browser: skip SSR for the canvas.
const SignViewport = dynamic(() => import('./SignViewport'), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-neutral-500">Loading 3D viewer…</div>,
});

export default function ConfiguratorClient({ presetId }: { presetId?: string }) {
  // Gallery links open /design?preset=<id>. Only known ids are applied (see lib/presets.ts).
  useEffect(() => {
    const preset = getPreset(presetId);
    if (preset) useSignStore.getState().patch({ source: 'text', ...preset.config });
  }, [presetId]);

  return (
    <main className="grid h-dvh grid-rows-[55%_45%] lg:grid-cols-[1fr_380px] lg:grid-rows-1">
      <section className="relative min-h-0">
        <SignViewport />
        <Link href="/" className="absolute left-4 top-4 rounded-full bg-neutral-900/80 px-4 py-2 text-sm backdrop-blur hover:bg-neutral-800">← CRE 8</Link>
        <div className="absolute right-4 top-4"><CartLink /></div>
      </section>
      <aside className="min-h-0 overflow-y-auto border-t border-neutral-800 bg-neutral-950 lg:border-l lg:border-t-0">
        <ControlsSidebar />
      </aside>
    </main>
  );
}
