import { auth } from './firebase.js';

// Vercel serves every deployment over https, previews included
const production = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

export const cookieOptions = {
  httpOnly: true,
  secure: production,
  sameSite: 'lax',
  path: '/',
};

export function checkAccount(user, decoded) {
  if (user.disabled) return 'disabled';
  if (decoded.auth_time * 1000 < new Date(user.tokensValidAfterTime).getTime()) return 'revoked';
  if (!user.emailVerified) return 'unverified';
  if (user.customClaims?.admin !== true) return 'not-admin';
  return null;
}

// An admin's account record is kept for a minute per server instance, so a
// revoked or disabled admin loses access within a minute. Only accounts that
// passed are kept, so a newly granted admin is never refused from the cache
const USER_TTL = 60 * 1000;
const users = new Map();

async function loadUser(uid) {
  const hit = users.get(uid);
  if (hit && Date.now() - hit.at < USER_TTL) return hit.user;
  users.delete(uid);
  return auth.getUser(uid);
}

export async function requireAdmin(req, res, next) {
  const cookie = req.cookies?.session;
  if (!cookie) return res.redirect('/admin/login');

  let refusal = 'invalid';
  try {
    const decoded = await auth.verifySessionCookie(cookie);
    const user = await loadUser(decoded.uid);
    refusal = checkAccount(user, decoded);
    if (refusal) users.delete(decoded.uid);
    else if (!users.has(decoded.uid)) users.set(decoded.uid, { at: Date.now(), user });
    if (!refusal) {
      res.set('Cache-Control', 'no-store');
      res.locals.admin = { email: user.email };
      return next();
    }
  } catch {
    // Bad cookie or deleted account: treated as a refusal
  }

  res.clearCookie('session', cookieOptions);
  res.redirect(refusal === 'not-admin' ? '/admin/login?error=not-admin' : '/admin/login');
}
