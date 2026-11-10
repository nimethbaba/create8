import { NextResponse } from 'next/server';
import { z } from 'zod';
import { advanceTo } from '@/lib/orders';
import { rejectCrossSiteWrites } from '@/lib/adminGuard';

export const runtime = 'nodejs';

const body = z.object({ status: z.enum(['configured', 'manufacturing', 'quality_check', 'shipped']) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const blocked = rejectCrossSiteWrites(req);
  if (blocked) return blocked;

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });

  const result = advanceTo(params.id, parsed.data.status);
  if (typeof result === 'string') return NextResponse.json({ error: result }, { status: result === 'Order not found.' ? 404 : 409 });
  return NextResponse.json({ status: result.status, history: result.history });
}
