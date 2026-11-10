'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function ArModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const url = `${window.location.origin}/ar/${id}`;
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || /^(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))/.test(host);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 240, margin: 1 }).then(setQr).catch(() => setQr(null));
  }, [url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="View in AR"
        className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-700 bg-neutral-950 p-5 text-center"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">See it on your wall</h3>
        <p className="text-sm text-neutral-400">Scan with your phone to place the sign, at its real size, on a wall in your space.</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr ? <img src={qr} alt="QR code for the AR preview" className="mx-auto h-48 w-48 rounded bg-white p-1" />
            : <div className="mx-auto grid h-48 w-48 place-items-center rounded bg-neutral-900 text-xs text-neutral-600">QR unavailable</div>}

        <a href={url} target="_blank" rel="noopener noreferrer"
          className="block rounded bg-white py-2 text-sm font-medium text-black hover:bg-neutral-200">
          Already on your phone? Open AR viewer
        </a>

        {isLocal && (
          <p className="rounded bg-amber-950/40 p-2 text-left text-xs text-amber-200">
            You&apos;re on <code>{host}</code>, which a phone can&apos;t reach, and AR needs HTTPS. Use a tunnel (e.g. Cloudflare Tunnel or ngrok) or a deployed URL to test on a device.
          </p>
        )}
        <p className="text-xs text-neutral-500">Link works for 24 hours. Glow and brushed-grain effects are not shown in AR.</p>
        <button onClick={onClose} className="text-sm text-neutral-400 underline">Close</button>
      </div>
    </div>
  );
}
