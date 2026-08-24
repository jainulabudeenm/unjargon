import { createHash, timingSafeEqual } from 'node:crypto';

// Server only. Never import this into a client component.
//
// ADMIN_KEY has no NEXT_PUBLIC_ prefix on purpose: that prefix inlines a value
// into the browser bundle, which is what made the previous gate cosmetic.
// The editor types the key, the server is the only thing that checks it.

// Compared as sha256 digests so timingSafeEqual always gets equal-length
// buffers, whatever length the caller sent.
function digest(value: string) {
  return createHash('sha256').update(value).digest();
}

export function isAdminKeyValid(provided: string | null | undefined): boolean {
  const expected = process.env.ADMIN_KEY;
  // Fails closed: no key configured means no writes, not open writes.
  if (!expected || !provided) return false;
  return timingSafeEqual(digest(provided), digest(expected));
}

/** Returns a 401 Response to return early, or null when the caller is authorised. */
export function requireAdmin(req: Request): Response | null {
  if (isAdminKeyValid(req.headers.get('x-admin-key'))) return null;
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
