import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import {
  getAuth,
  setPersistence,
  inMemoryPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

const auth = getAuth(initializeApp(firebaseConfig));
// The server cookie is the session, so the browser keeps no Firebase sign-in
await setPersistence(auth, inMemoryPersistence);

const googleButton = document.getElementById('google');
const form = document.getElementById('email-form');
const message = document.getElementById('message');

const authMessages = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  'auth/popup-blocked': 'The browser blocked the sign-in popup. Allow popups for this site and try again.',
  'auth/network-request-failed': "Couldn't reach Firebase. Check your connection and try again.",
};
// The user closed the popup; nothing to report
const quietCodes = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

function setBusy(busy) {
  for (const el of document.querySelectorAll('button, input')) el.disabled = busy;
}

function showMessage(text) {
  message.textContent = text;
  message.hidden = false;
}

async function createSession(credential) {
  const idToken = await credential.user.getIdToken();
  const res = await fetch('/admin/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (res.ok) return;
  const body = await res.json().catch(() => ({}));
  throw new Error(body.error || 'Sign-in failed. Try again.');
}

// signIn must start synchronously so the popup counts as a user click
async function run(signIn) {
  message.hidden = true;
  setBusy(true);
  try {
    await createSession(await signIn());
    location.assign('/admin');
  } catch (err) {
    await signOut(auth);
    if (!quietCodes.has(err.code)) {
      showMessage(err.code ? authMessages[err.code] ?? 'Sign-in failed. Try again.' : err.message);
    }
    setBusy(false);
  }
}

googleButton.addEventListener('click', () => {
  run(() => signInWithPopup(auth, new GoogleAuthProvider()));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  run(() => signInWithEmailAndPassword(auth, form.email.value.trim(), form.password.value));
});
