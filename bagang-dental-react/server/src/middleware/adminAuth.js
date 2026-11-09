import crypto from 'node:crypto';

// Protects staff-only routes. Send the key in the "x-api-key" header.
export function adminAuth(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || expected === 'change-me') {
    return res.status(503).json({ error: 'Admin access is not configured on the server.' });
  }

  const provided = String(req.get('x-api-key') || '');
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) return res.status(401).json({ error: 'Invalid or missing API key.' });
  next();
}
