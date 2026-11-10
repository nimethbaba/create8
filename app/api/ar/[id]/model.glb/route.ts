import { NextResponse } from 'next/server';
import { arStore } from '@/lib/ar/store';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// The .glb in the URL matters: native AR viewers (Android Scene Viewer) key off it.
function respond(id: string, withBody: boolean) {
  const data = UUID.test(id) ? arStore.get(id) : null;
  if (!data) return NextResponse.json({ error: 'This AR preview has expired or does not exist.' }, { status: 404 });
  return new Response(withBody ? (data as BodyInit) : null, {
    headers: {
      'Content-Type': 'model/gltf-binary',
      'Content-Length': String(data.length),
      'Content-Disposition': 'inline; filename="cre8-sign.glb"',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return respond(params.id, true);
}
export async function HEAD(_req: Request, { params }: { params: { id: string } }) {
  return respond(params.id, false);
}
