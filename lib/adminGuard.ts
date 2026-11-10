import { NextResponse } from 'next/server';

/**
 * Basic-auth credentials are attached by the browser automatically, which makes state-changing admin
 * requests CSRF-able from other sites. Require same-origin + a JSON content type (which forces a CORS
 * preflight for cross-site callers). Returns an error response, or null when the request is fine.
 */
export function rejectCrossOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: 'Cross-site request blocked.' }, { status: 403 });
  return null;
}

export function rejectCrossSiteWrites(req: Request): NextResponse | null {
  const cross = rejectCrossOrigin(req);
  if (cross) return cross;
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected application/json.' }, { status: 415 });
  }
  return null;
}
