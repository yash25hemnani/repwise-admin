import { Router } from 'express';
import { auth } from '../firebase.js';

const router = Router();

const SESSION_DAYS = 14;
const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;
const production = process.env.NODE_ENV === 'production';

// Blocks other sites from posting a token here
function isSameOrigin(req) {
  const site = req.get('Sec-Fetch-Site');
  if (site) return site === 'same-origin';
  const origin = req.get('Origin');
  return !origin || origin === `${req.protocol}://${req.get('host')}`;
}

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/session', async (req, res) => {
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Cross-site sign-in is not allowed.' });
  }

  let decoded;
  try {
    decoded = await auth.verifyIdToken(req.body?.idToken, true);
  } catch {
    return res.status(401).json({ error: 'Sign-in failed. Try again.' });
  }

  // Only mint a cookie from a sign-in that just happened
  if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
    return res.status(401).json({ error: 'Your sign-in is too old. Sign in again.' });
  }
  if (!decoded.email_verified) {
    return res.status(403).json({ error: 'Verify your email in the Repwise app, then sign in again.' });
  }
  if (decoded.admin !== true) {
    return res.status(403).json({ error: "This account isn't an admin. Ask the owner to grant access, then sign in again." });
  }

  try {
    const cookie = await auth.createSessionCookie(req.body.idToken, { expiresIn });
    res.cookie('session', cookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: production,
      sameSite: 'lax',
      path: '/',
    });
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'Sign-in failed. Try again.' });
  }
});

export default router;
