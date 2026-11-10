'use client';
import { useState } from 'react';
import { useSignStore } from '@/store/useSignStore';
import { getLiveGeometry } from '@/lib/ar/bridge';
import { uploadGlb } from '@/lib/ar/upload';
import { ArModal } from './ArModal';

type State = { kind: 'idle' } | { kind: 'busy' } | { kind: 'error'; message: string } | { kind: 'ready'; id: string };

export function ArButton() {
  const hasSign = useSignStore((s) => !!s.metrics);
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function start() {
    const geometry = getLiveGeometry();
    if (!geometry) return setState({ kind: 'error', message: 'Nothing to preview yet — add some text or a logo first.' });
    setState({ kind: 'busy' });
    try {
      const { exportSignGlb } = await import('@/lib/ar/exportGlb'); // keeps the exporter out of the initial bundle
      const { finish, color, light } = useSignStore.getState();
      const glb = await exportSignGlb(geometry, { finish, color, light });
      const id = await uploadGlb(glb);
      setState({ kind: 'ready', id });
    } catch (e) {
      setState({ kind: 'error', message: e instanceof Error ? e.message : 'Could not create the AR preview.' });
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={start} disabled={!hasSign || state.kind === 'busy'}
        className="w-full rounded border border-neutral-600 py-2 text-sm hover:border-neutral-400 disabled:opacity-40">
        {state.kind === 'busy' ? 'Preparing AR preview…' : 'View on my wall (AR)'}
      </button>
      {state.kind === 'error' && <p className="text-xs text-red-400">{state.message}</p>}
      {state.kind === 'ready' && <ArModal id={state.id} onClose={() => setState({ kind: 'idle' })} />}
    </div>
  );
}
