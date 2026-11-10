import { NextResponse, type NextRequest } from 'next/server';

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };

/** Constant-time-ish string compare (Edge runtime has no crypto.timingSafeEqual). */
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/**
 * Minimal admin gate: HTTP Basic auth (user "admin", password from ADMIN_PASSWORD). Secure by default —
 * if the variable is missing the admin area is simply off. Use HTTPS in production (Basic auth is
 * plain text on the wire). Replace with real auth (NextAuth/Clerk + roles) when you add staff accounts.
 */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return new NextResponse('Admin is disabled: set ADMIN_PASSWORD in .env.local', { status: 503 });

  const [scheme, encoded] = (req.headers.get('authorization') ?? '').split(' ');
  if (scheme === 'Basic' && encoded) {
    try {
      const decoded = atob(encoded);
      const i = decoded.indexOf(':');
      if (i > -1 && safeEqual(decoded.slice(0, i), 'admin') && safeEqual(decoded.slice(i + 1), password)) {
        return NextResponse.next();
      }
    } catch { /* fall through to 401 */ }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="CRE 8 admin", charset="UTF-8"' },
  });
}
