import { NextResponse } from 'next/server';
import { MAX_GLB_BYTES, validateGlb } from '@/lib/ar/glb';
import { arStore } from '@/lib/ar/store';
import { rejectCrossOrigin } from '@/lib/adminGuard';

export const runtime = 'nodejs';

/** Read the body but stop as soon as it exceeds `max` (Content-Length can be absent or lie). */
async function readCapped(req: Request, max: number): Promise<Uint8Array | null> {
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array(0);
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

export async function POST(req: Request) {
  const cross = rejectCrossOrigin(req);
  if (cross) return cross;
  if (req.headers.get('content-type')?.split(';')[0].trim() !== 'model/gltf-binary') {
    return NextResponse.json({ error: 'Expected Content-Type: model/gltf-binary.' }, { status: 415 });
  }
  if (Number(req.headers.get('content-length') ?? 0) > MAX_GLB_BYTES) {
    return NextResponse.json({ error: 'Model too large.' }, { status: 413 });
  }

  const bytes = await readCapped(req, MAX_GLB_BYTES);
  if (!bytes) return NextResponse.json({ error: 'Model too large.' }, { status: 413 });
  const problem = validateGlb(bytes);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  // x-forwarded-for is only trustworthy behind your own proxy/CDN (Vercel sets it); otherwise it can be spoofed.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const res = arStore.put(ip, bytes);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json({ id: res.id }, { status: 201 });
}
