import { Router } from 'express';
import { auth } from '../firebase.js';
import { checkAccount, cookieOptions } from '../require-admin.js';

const router = Router();

const SESSION_DAYS = 14;
const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;

// Blocks other sites from posting a token here
function isSameOrigin(req) {
  const site = req.get('Sec-Fetch-Site');
  if (site) return site === 'same-origin';
  const origin = req.get('Origin');
  return !origin || origin === `${req.protocol}://${req.get('host')}`;
}

const loginErrors = {
  'not-admin': "This account isn't an admin. Ask the owner to grant access, then sign in again.",
};

router.get('/login', async (req, res) => {
  const cookie = req.cookies?.session;
  if (cookie) {
    try {
      const decoded = await auth.verifySessionCookie(cookie);
      const user = await auth.getUser(decoded.uid);
      if (!checkAccount(user, decoded)) return res.redirect('/admin');
    } catch {
      // Stale cookie: show the form
    }
  }
  res.set('Cache-Control', 'no-store');
  res.render('login', { error: loginErrors[req.query.error] ?? null });
});

router.post('/logout', (req, res) => {
  if (!isSameOrigin(req)) return res.status(403).send('Cross-site sign-out is not allowed.');
  res.clearCookie('session', cookieOptions);
  res.redirect(303, '/admin/login');
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
    res.cookie('session', cookie, { ...cookieOptions, maxAge: expiresIn });
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'Sign-in failed. Try again.' });
  }
});

export default router;
