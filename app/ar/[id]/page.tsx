'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

/**
 * Public AR viewer (the QR code points here). <model-viewer> picks the right AR mode per device:
 *   Android → WebXR or Scene Viewer · iOS → Quick Look (it generates the USDZ from the GLB in the browser).
 * ar-scale="fixed" keeps the sign at its real-world size; ar-placement="wall" asks for vertical-surface placement.
 */
export default function ArViewerPage() {
  const { id } = useParams<{ id: string }>();
  const src = `/api/ar/${id}/model.glb`;
  const [lib, setLib] = useState(false);
  const [status, setStatus] = useState<'checking' | 'ok' | 'gone'>('checking');

  useEffect(() => {
    import('@google/model-viewer').then(() => setLib(true)).catch(() => setStatus('gone'));
    fetch(src, { method: 'HEAD' }).then((r) => setStatus(r.ok ? 'ok' : 'gone')).catch(() => setStatus('gone'));
  }, [src]);

  if (status === 'gone') {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="space-y-3">
          <h1 className="text-xl font-semibold">This AR preview has expired</h1>
          <p className="text-sm text-neutral-400">Previews are kept for 24 hours. Open the designer and tap “View on my wall” again.</p>
          <Link href="/design" className="inline-block rounded bg-white px-4 py-2 text-sm font-medium text-black">Back to designer</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="relative flex-1">
        {lib && status === 'ok' ? (
          <model-viewer
            src={src}
            alt="3D preview of your custom CRE 8 sign"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="wall"
            ar-scale="fixed"
            camera-controls
            touch-action="pan-y"
            shadow-intensity="1"
            exposure="1"
            environment-image="neutral"
            style={{ width: '100%', height: '75dvh', background: '#0b0b0d' }}
          >
            <button slot="ar-button"
              style={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)', padding: '12px 20px', borderRadius: 9999, background: '#fff', color: '#000', fontWeight: 600, border: 0 }}>
              View on your wall
            </button>
          </model-viewer>
        ) : (
          <div className="grid h-[75dvh] place-items-center text-sm text-neutral-500">Loading preview…</div>
        )}
      </div>
      <div className="space-y-1 p-4 text-center text-sm text-neutral-400">
        <p>Tap <strong className="text-neutral-200">View on your wall</strong>, point your camera at a wall and move slowly until it detects the surface.</p>
        <p className="text-xs text-neutral-500">No AR button? Your device or browser may not support AR — open this page on a recent iPhone (Safari) or Android phone (Chrome).</p>
      </div>
    </main>
  );
}
