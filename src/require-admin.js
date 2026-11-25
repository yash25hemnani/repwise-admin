import { auth } from './firebase.js';

const production = process.env.NODE_ENV === 'production';

export const cookieOptions = {
  httpOnly: true,
  secure: production,
  sameSite: 'lax',
  path: '/',
};

// Reads live account state, so revoking admin takes effect on the next request
export function checkAccount(user, decoded) {
  if (user.disabled) return 'disabled';
  if (decoded.auth_time * 1000 < new Date(user.tokensValidAfterTime).getTime()) return 'revoked';
  if (!user.emailVerified) return 'unverified';
  if (user.customClaims?.admin !== true) return 'not-admin';
  return null;
}

export async function requireAdmin(req, res, next) {
  const cookie = req.cookies?.session;
  if (!cookie) return res.redirect('/admin/login');

  let refusal = 'invalid';
  try {
    const decoded = await auth.verifySessionCookie(cookie);
    const user = await auth.getUser(decoded.uid);
    refusal = checkAccount(user, decoded);
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
