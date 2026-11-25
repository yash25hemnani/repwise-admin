# Phase 1: Admin Sign-In Slice - Research

**Researched:** 2026-11-25
**Domain:** Firebase Auth session cookies on Express 5 + EJS, Firestore aggregation and rules, Render deploy
**Confidence:** HIGH for APIs (read from installed source / live CDN), MEDIUM for Render and Firebase console behaviour (official docs via WebFetch)

## Summary

Most of the stack is pinned already: Express 5.3.0 and firebase-admin 14.5.1 are installed, and `src/firebase.js` plus the claim script work. The phase needs only two new runtime packages: `ejs@7.0.2` and `cookie-parser@1.4.7`. The Firebase Web SDK is loaded from `https://www.gstatic.com/firebasejs/13.4.0/` as native ES modules, with no npm install and no build step. A probe confirmed Express 5.3.0 + ejs 7.0.2 render templates and includes. It also confirmed that async route errors reach the error middleware, and that `trust proxy` makes `req.secure` true behind an `X-Forwarded-Proto: https` proxy.

The login flow is the standard Firebase session-cookie exchange. The client signs in with in-memory persistence (popup for Google, password for email). It POSTs the fresh ID token as JSON to `/session`. The server calls `verifyIdToken`, checks `auth_time` is under 5 minutes old, runs the live `getUser` checks and mints a 14-day cookie with `createSessionCookie`. The SDK caps the cookie at exactly 14 days (`MAX_SESSION_COOKIE_DURATION_SECS = 14 * 24 * 60 * 60`). Every protected request then runs `verifySessionCookie(cookie)` *without* `checkRevoked`, followed by one `getUser(uid)`. Inline, it repeats the SDK's own disabled and revoked logic and adds the admin and emailVerified checks. That is one network call per request instead of two. CSRF needs no token: a small same-origin middleware checks `Sec-Fetch-Site` and falls back to `Origin`. Add `SameSite=Lax` and require `application/json` on `/session`.

There are two blockers outside the code. First, **project `repwise-25` has no Web app registered**: `firebase apps:list` shows only the Android app. The Web SDK config (apiKey, authDomain, appId) doesn't exist yet. Second, the Render `onrender.com` host must be added to Firebase Auth's authorized domains or the Google popup will fail. Both are human or approved-CLI steps the planner must schedule. One finding goes the other way: the two pending app-repo commits from D-17 step 1 have **already landed**. `../repwise` has a clean tree, and `e5215e7` is the email-verification commit that last touched `firestore.rules`.

**Primary recommendation:** Build this as one Express app with a default-deny router order: public routes, then `requireAdmin`, then everything else. Use the gstatic 13.4.0 modular SDK with `initializeAuth(app, { persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver })` and `signInWithPopup`. Use a same-origin header check for CSRF. Deploy with a `render.yaml` that keeps secrets as `sync: false`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Exercise data contract (DATA-01)
- **D-01:** Seeded exercises use free-exercise-db's own `id` (e.g. `Barbell_Squat`) as the Firestore doc ID. Admin-created exercises get auto IDs. Each exercise has a `source` field (`free-exercise-db` | `admin`). The seed makes itself idempotent by checking whether the doc exists, not by running a query. — **Reversibility:** one-way. Doc IDs are what users' plans and session history in the app point to, so changing them means migrating every reference.
- **D-02:** Two independent fields describe review and archive state:
  - `editedAt`: a timestamp, null until an admin saves. It doubles as the "edited by admin" marker that the seed must never overwrite.
  - `archived`: a boolean.
  Unarchiving returns an exercise to its earlier imported or edited state. DESIGN.md's imported / edited / archived status bar comes from these two fields. — **Reversibility:** costly. The seed (Phase 2), the panel (Phase 3) and the app's queries all read these fields.
- **D-03:** Each target muscle belongs to one muscle group: a target-muscle doc stores `muscleGroupId`. An exercise stores `muscleGroupId` and `targetMuscleId`, and the two must agree. The seed (Phase 2) maps the dataset's 17 muscles onto about 6 groups (Chest, Back, Shoulders, Arms, Legs, Core). — **Reversibility:** costly. The app's browse-by-group screen and the panel's dropdowns are built on this hierarchy.
- **D-04:** Exercises reference list entries **by ID only** (`muscleGroupId`, `targetMuscleId`, `equipmentId`), so a rename carries through (ADMN-07). The app reads the lists to get display names. — **Reversibility:** one-way, because the app is built against it.
- **D-05:** An exercise has a single `targetMuscleId`. The seed also stores `secondaryMuscleIds` (an array of target-muscle IDs taken from the dataset's secondary muscles), but v1 neither shows nor edits it.
- **D-06:** The contract doc lives at `docs/data-contract.md` in this repo, the single source of truth. The app's planning (`../repwise/.planning/`) links to it by relative path. There is no copy.

#### Session & revocation (ACC-02)
- **D-07:** Every protected request verifies the session cookie and reads the account's **current** claims with `getUser(uid)`, never the copy of the claims stored inside the cookie. It requires `admin === true`, `emailVerified`, and an account that isn't disabled. A revoked admin is locked out on their next request.
- **D-08:** The session cookie lasts 14 days, the Firebase maximum.
- **D-09:** After sign-in the admin always lands on `/` (home). There is no `?next=` return path.
- **D-10:** Sign-out clears the cookie **in this browser only**. Do NOT call `revokeRefreshTokens` on sign-out. Admins share their Firebase account with the Repwise app, so revoking would sign them out of the app on their phone. (The user first chose "sign out everywhere", then changed it after this was pointed out.)

#### Sign-in & home page (ADMN-01)
- **D-11:** The login page offers Google and email/password, matching the app and DESIGN.md. It uses the Firebase Web SDK loaded from a CDN, with no build step.
- **D-12:** The panel requires `email_verified`, the same rule as the app. An unverified account is refused with a clear message telling them to verify in the app and sign in again. A non-admin is refused with DESIGN.md's copy: "This account isn't an admin. Ask the owner to grant access, then sign in again."
- **D-13:** The home page is a plain list of counts:
  - exercises: active and archived
  - muscle groups
  - target muscles
  - equipment
  Zeros are expected before the seed. There are no stat cards (see DESIGN.md "Avoid"). In Phase 3, `/` becomes or redirects to the Exercises list.
- **D-14:** In Phase 1 the top bar shows only the "Repwise admin" wordmark and Sign out. Phase 3 adds the Exercises and Lists links when those pages exist, so there are no dead links.

#### Rules & claim script (ACC-01, DATA-02)
- **D-15:** Firestore rules let signed-in users with a verified email read **all** exercises, archived ones included, plus the three list collections. Every client write is rejected. The app filters out archived exercises in browse and search (`archived == false`), but plans and history can still load an archived exercise by ID.
- **D-16:** The claim script runs as `npm run admin -- grant <email>`, `... revoke <email>` or `... list`.
  - It refuses an email with no Firebase account.
  - It merges with existing custom claims rather than replacing them.
  - `revoke` removes the claim only and does not revoke tokens. The person keeps using the app as a normal user, and D-07 locks them out of the panel.
  - `list` prints the current admins.
- **D-17:** Rules merge order in `../repwise`:
  1. Land the app repo's two pending commits first (light theme; email verification), each with the user's approval.
  2. Add the library rules on top as their own app-repo commit.
  3. Deploy with `firebase deploy --only firestore:rules` from `../repwise` to project `repwise-25`.

### Claude's Discretion
- List collection layout. Suggested: three top-level collections, `muscleGroups`, `targetMuscles` (with `muscleGroupId`) and `equipment`, each with a `name` and timestamps. A single `lists` collection with a `type` field is also acceptable if it is documented.
- Exact media fields in the contract. Two seed stills (Cloudinary URLs or public IDs), an optional GIF, and enough information for the app to build Cloudinary transformation URLs (LIB-08).
- The guide format (an ordered steps array vs prose), timestamps (`createdAt`, `updatedAt`), and field naming style.
- Cookie flags (`httpOnly`, `secure` in production, `sameSite`) and the CSRF protection on POST routes (login and sign-out).
- How the client signs out of Firebase and offers "use another account" after a refusal.
- How the service account reaches the server: one JSON env var or separate fields. It must stay out of git and work on Render.
- Whether the Firebase Web config (public keys) is injected from env or committed.
- Render service settings (build and start commands, Node version pin, health check).
- How the home page counts are read (Firestore `count()` aggregation is the natural choice).

### Deferred Ideas (OUT OF SCOPE)
None. The discussion stayed within the phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMN-01 | Only accounts with the `admin` claim can sign in; others get a clear "not an admin" message | Session exchange flow (Pattern 2), live-claims guard (Pattern 3), refusal codes → fixed copy (Pattern 5) |
| ACC-01 | Owner grants/revokes admin via a local script | **Already done** (`scripts/admin.js`, verified by orchestrator). Only remaining work: README/usage line, and D-07 guard enforces revoke |
| ACC-02 | Admin stays signed in between visits and can sign out from any page | 14-day `createSessionCookie` + persistent `Max-Age` cookie (Pattern 2), POST `/signout` form in top bar (Pattern 4), `Cache-Control: no-store` (Pitfall 6) |
| DATA-01 | One contract doc for exercise + list schema | Recommended schema in "Data Contract Recommendation", grounded in free-exercise-db schema |
| DATA-02 | App rules: verified users read library + lists, no client writes; deployed from `../repwise` | Rules block in Code Examples; `firebase deploy --only firestore:rules [--dry-run]` from `../repwise` |
| DEPL-01 | Runs on Render from GitHub, secrets only in Render env | `render.yaml` Blueprint (Pattern 6), env var quoting pitfall, authorized-domains step |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Node.js 24, Express 5 (ESM), EJS, plain hand-written CSS, `firebase-admin`, (Cloudinary later). Server-rendered, **no build step**.
- Auth: Firebase sign-in on the login page → server verifies ID token → requires `admin: true` custom claim → issues Firebase session cookie.
- Hosting: Render free tier from GitHub. Long jobs (seed) run locally, not on Render.
- Secrets: service account, Cloudinary secret, session secret live in `.env` locally and Render env, never in git. Repo may be public.
- Data safety: no hard deletes of exercises; seed idempotent.
- Commits: one line, `feat:`/`chore:`/`docs:` prefix, **no Co-Authored-By trailer**.
- Comments short, no divider comments.
- Work goes through GSD commands (planner/executor flow).
- Researcher environment note: a hook blocks reading `.env` into the conversation. Executors must not `cat .env` or print `FIREBASE_SERVICE_ACCOUNT`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Google / email sign-in UI, obtaining ID token | Browser (Firebase Web SDK from gstatic) | — | Credentials go only to Google; server never sees passwords |
| ID token verification, admin/verified/disabled checks | API (Express + firebase-admin) | — | Claims must be checked server-side, live via `getUser` (D-07) |
| Session cookie issue / verify / clear | API (Express) | Browser stores httpOnly cookie | Session cookie is a Google-signed JWT; server owns its lifecycle |
| CSRF defence | API (middleware) | Browser (sends Sec-Fetch-Site / Origin automatically) | No token plumbing needed |
| Home page counts | API (firebase-admin `count()`) | Database (Firestore aggregation) | Admin SDK bypasses rules; only the count is downloaded |
| Page rendering | Frontend server (EJS SSR) | — | No SPA, no build step |
| Library read access for app users | Database (Firestore rules in `../repwise`) | — | App reads directly; rules are the only guard |
| Admin claim management | Local CLI (`scripts/admin.js`) | — | Done; not deployed |
| TLS, routing, sleep/wake | Render edge | — | App sees plain HTTP + `X-Forwarded-Proto` |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | 5.3.0 (installed) | HTTP server, routing, `res.cookie`, `express.json`, `express.static` | Locked by CLAUDE.md [VERIFIED: node_modules/express/package.json:4 `"version": "5.3.0"`] |
| firebase-admin | 14.5.1 (installed) | `verifyIdToken`, `createSessionCookie`, `verifySessionCookie`, `getUser`, Firestore `count()` | Locked [VERIFIED: npm registry; engines `"node": ">=22"` in node_modules/firebase-admin/package.json:8-10] |
| ejs | 7.0.2 | View engine | Locked by CLAUDE.md. Exposes `ejs.__express = ejs.renderFile` [VERIFIED: scratchpad install, lib/cjs/ejs.js:849]; zero dependencies |
| cookie-parser | 1.4.7 | Populate `req.cookies` | Express 5 does not parse cookies. Unsigned use only (session cookie is already a signed JWT) [VERIFIED: npm registry, expressjs org] |
| Firebase Web SDK (CDN) | 13.4.0 | Client sign-in | `https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js` and `/firebase-auth.js` both return `200 text/javascript` [VERIFIED: curl this session; CITED: firebase.google.com/docs/web/alt-setup]. Not installed via npm |

### Supporting
None needed. Node 24 built-ins cover the rest: `node:test` and global `fetch` for tests, and `import.meta.dirname` for view paths [VERIFIED: probe returned `string`].

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| cookie-parser | Parse `req.headers.cookie` by hand | ~6 lines but must handle URL-decoding and duplicates; cookie-parser is 16M/wk, expressjs-owned |
| Same-origin header check | `csrf-csrf` / double-submit token | More moving parts (secret, hidden fields on every Phase 3 form); header check covers modern browsers, which is all an admin panel needs |
| Hand-set security headers | helmet 8.3.0 | helmet's defaults set `Cross-Origin-Opener-Policy: same-origin` and a strict CSP that would break the Google popup and the gstatic imports unless reconfigured. Four hand-set headers are simpler |
| `signInWithPopup` | `signInWithRedirect` | Redirect is broken on Chrome 115+/Firefox 109+/Safari 16.1+ unless the app is served from the authDomain (Firebase Hosting or a reverse proxy) [CITED: firebase.google.com/docs/auth/web/redirect-best-practices]. Render cannot satisfy that cheaply |
| `render.yaml` Blueprint | Dashboard-only config | Dashboard is fine too; Blueprint keeps build/start/health/Node settings reviewable in git with no secret values |

**Installation:**
```bash
npm install ejs@7.0.2 cookie-parser@1.4.7
```

**package.json additions:**
```json
"engines": { "node": "24.x" },
"scripts": { "test": "node --env-file-if-exists=.env --test" }
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| ejs | npm | latest 7.0.2 published 2026-10-18 | 62.8M/wk | github.com/mde/ejs | [OK] | Approved |
| cookie-parser | npm | 1.4.7 published 2024-10-08 | 16.1M/wk | github.com/expressjs/cookie-parser | [OK] | Approved |
| express | npm | 5.3.0 | 209.6M/wk | github.com/expressjs/express | [OK] | Approved (already installed) |
| firebase-admin | npm | 14.5.1 published 2026-11-12 | 14.4M/wk | github.com/firebase/firebase-admin-node | [SUS] reason `too-new` | Already installed and verified working against the project by the orchestrator. The only flag is release age (13 days), from the official Firebase org. No new install needed. Planner may skip the human-verify checkpoint since nothing new is installed; note it in the plan |

No package has a `postinstall` script (seam signal `postinstall: null` for all four).

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** firebase-admin (too-new only; pre-existing dependency)

## Architecture Patterns

### System Architecture Diagram

```
Browser /login (EJS page + login.js module)
   |  import from gstatic 13.4.0 (firebase-app, firebase-auth)
   |  Google: signInWithPopup ──> popup on repwise-25.firebaseapp.com ──> Google
   |  Email:  signInWithEmailAndPassword ──> identitytoolkit.googleapis.com
   v
user.getIdToken()  (fresh, auth_time = now, persistence = in-memory)
   |
   |  POST /session  Content-Type: application/json  {idToken}
   v
[sameOrigin middleware] --cross-site/no headers--> 403
   v
[POST /session]
   verifyIdToken ──invalid──> 401 {error:'invalid'}
   auth_time > 5 min ──> 401 {error:'stale'}
   getUser(uid) ──> disabled? !emailVerified? admin!==true?
        └─refuse──> 403 {error:'disabled'|'unverified'|'not-admin'}
   createSessionCookie(idToken, 14d) ──> Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600
   v
login.js: signOut(auth); location.assign('/')
   v
GET / ──> [requireAdmin]
             no cookie ──> 302 /login
             verifySessionCookie(cookie) ──fail──> clear cookie, 302 /login
             getUser(uid): disabled / tokensValidAfterTime > auth_time / !emailVerified / admin!==true
                 └─> clear cookie, 302 /login?error=<code>
          ──> Promise.all(5 x count().get())  ──> Firestore
          ──> render home.ejs (top bar: wordmark + Sign out form)

POST /signout (form, same-origin) ──> clearCookie('session') ──> 302 /login
GET /healthz ──> 200 "ok" (Render health check; no Firebase calls)

App users (Flutter) ──read──> Firestore exercises / muscleGroups / targetMuscles / equipment
                               (rules: verified email; all writes denied)
```

### Recommended Project Structure
```
src/
├── server.js          # imports app, app.listen(PORT)
├── app.js             # express app (exported for node:test)
├── firebase.js        # existing: auth, db
├── auth.js            # checkAccount(user, decoded), requireAdmin, cookie options
├── csrf.js            # sameOrigin middleware
├── counts.js          # getLibraryCounts()
└── views/
    ├── partials/head.ejs, topbar.ejs
    ├── login.ejs
    ├── home.ejs
    └── error.ejs
public/
├── css/app.css        # DESIGN.md tokens, light/dark via prefers-color-scheme
└── js/login.js        # type="module", imports gstatic SDK
docs/data-contract.md  # DATA-01
render.yaml            # DEPL-01
test/app.test.js       # node:test + fetch smoke tests
```
`src/server.js` currently holds a placeholder `GET /`. Move health to `/healthz`; the real `/` becomes the home page.

### Pattern 1: Default-deny router order
**What:** Public routes first, then `app.use(requireAdmin)`, then every protected route. Phase 3 routes added below are protected automatically.
```js
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'views'));
app.use(securityHeaders);
app.use(express.static(path.join(import.meta.dirname, '..', 'public')));
app.use(cookieParser());
app.use(sameOrigin);                       // all non-GET/HEAD
app.get('/healthz', (req, res) => res.send('ok'));
app.get('/login', loginPage);
app.post('/session', express.json({ limit: '10kb' }), createSession);
app.post('/signout', signOut);             // must work with a dead cookie
app.use(requireAdmin);                     // everything below is admin-only
app.get('/', home);
app.use((req, res) => res.status(404).render('error', { message: 'Page not found.' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).render('error', { message: 'Something went wrong.' }); });
```
Express 5 forwards rejected promises from async handlers to the error middleware. No `express-async-errors` or try/catch wrappers are needed [VERIFIED: probe `GET /boom` async throw → `handled:async boom`].

### Pattern 2: Session exchange (POST /session)
```js
// Source: firebase.google.com/docs/auth/admin/manage-cookies (adapted) + installed SDK limits
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;   // SDK max, exactly allowed

export async function createSession(req, res) {
  const idToken = req.is('application/json') && req.body?.idToken;
  if (typeof idToken !== 'string' || idToken.length > 4096) return res.status(400).json({ error: 'invalid' });
  let decoded;
  try { decoded = await auth.verifyIdToken(idToken); }
  catch { return res.status(401).json({ error: 'invalid' }); }
  // Firebase recommends minting only from a recent sign-in
  if (Date.now() / 1000 - decoded.auth_time > 5 * 60) return res.status(401).json({ error: 'stale' });
  const user = await auth.getUser(decoded.uid);
  const refusal = checkAccount(user, decoded);
  if (refusal) return res.status(403).json({ error: refusal });
  const cookie = await auth.createSessionCookie(idToken, { expiresIn: FOURTEEN_DAYS_MS });
  res.cookie('session', cookie, sessionCookieOptions(FOURTEEN_DAYS_MS));
  res.json({ ok: true });
}

export const sessionCookieOptions = (maxAge) => ({
  maxAge, httpOnly: true, sameSite: 'lax', path: '/',
  secure: process.env.NODE_ENV === 'production',
});
```
- `expiresIn` is **milliseconds**. The SDK converts to seconds and rejects values `< 5*60` or `> 14*24*60*60` [VERIFIED: node_modules/firebase-admin/lib/auth/auth-api-request.js:59-62 `const MIN_SESSION_COOKIE_DURATION_SECS = 5 * 60;` / `const MAX_SESSION_COOKIE_DURATION_SECS = 14 * 24 * 60 * 60;`; base-auth.d.ts:77-82 "custom expiration in milliseconds. The minimum allowed is 5 minutes and the maxium allowed is 2 weeks"].
- `res.cookie` `maxAge` is also ms and becomes `Max-Age` in seconds. A persistent `Max-Age` is what keeps the admin signed in after a browser restart (success criterion 4) [VERIFIED: probe `maxAge: 1000` → `Max-Age=1`].
- The 5-minute `auth_time` window comes straight from the Firebase sample [CITED: firebase.google.com/docs/auth/admin/manage-cookies "`new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60`"]. With in-memory client persistence every token is fresh, so this never blocks a real login.
- Cookie name: use `session`. The `__session` name matters only on Firebase Hosting, which strips other cookies. Render passes all cookies through [ASSUMED].

### Pattern 3: Live-claims guard (D-07), one network call per request
```js
// Mirrors firebase-admin base-auth.js:962-983 (disabled + revoked) and adds D-07 checks
export function checkAccount(user, decoded) {
  if (user.disabled) return 'disabled';
  if (user.tokensValidAfterTime &&
      decoded.auth_time * 1000 < new Date(user.tokensValidAfterTime).getTime()) return 'revoked';
  if (!user.emailVerified) return 'unverified';
  if (user.customClaims?.admin !== true) return 'not-admin';
  return null;
}

export async function requireAdmin(req, res, next) {
  const cookie = req.cookies.session;
  if (!cookie) return res.redirect('/login');
  let decoded;
  try { decoded = await auth.verifySessionCookie(cookie); }   // no checkRevoked: getUser below covers it
  catch { return clearAndRedirect(res, null); }
  const user = await auth.getUser(decoded.uid);
  const refusal = checkAccount(user, decoded);
  if (refusal) return clearAndRedirect(res, refusal);
  res.set('Cache-Control', 'no-store');
  res.locals.admin = { email: user.email };
  next();
}
```
- `verifySessionCookie(cookie, true)` would call `getUser` internally and throw away the record. A second `getUser` for claims would then double the latency. The SDK's revoke check is exactly `user.disabled` plus `auth_time * 1000 < new Date(user.tokensValidAfterTime).getTime()` [VERIFIED: node_modules/firebase-admin/lib/auth/base-auth.js:962-983, quoted: `if (user.disabled) {` … `const authTimeUtc = decodedIdToken.auth_time * 1000;` … `const validSinceUtc = new Date(user.tokensValidAfterTime).getTime();` … `if (authTimeUtc < validSinceUtc) {`].
- `UserRecord` fields used: `readonly emailVerified: boolean`, `readonly disabled: boolean`, `readonly customClaims?: {...}`, `readonly tokensValidAfterTime?: string` [VERIFIED: node_modules/firebase-admin/lib/auth/user-record.d.ts:216,233,264,278].
- The revoked check is consistent with D-10. The panel never *calls* revoke, but it honours revocation that happens elsewhere, such as a password reset or a revoke from the Firebase console.
- If `getUser` throws `auth/user-not-found` (account deleted), treat it like a refusal. Clear the cookie and redirect.

### Pattern 4: Sign-out (D-10)
```js
export function signOut(req, res) {
  const { maxAge, ...opts } = sessionCookieOptions(0);
  res.clearCookie('session', opts);   // same path/flags as when set
  res.redirect(303, '/login');
}
```
In the top bar: `<form method="post" action="/signout"><button type="submit">Sign out</button></form>`. No `revokeRefreshTokens`. Express 5's `clearCookie` sets `expires: new Date(1)` and deletes any `maxAge` [VERIFIED: node_modules/express/lib/response.js:715-722, `const opts = { path: '/', ...options, expires: new Date(1)};` / `delete opts.maxAge`]. Clearing doesn't invalidate the JWT. A stolen cookie stays valid until expiry [CITED: manage-cookies "even though the cookie is cleared, it remains active until its natural expiration"]. That is an accepted consequence of D-10. httpOnly + Secure limit how it could be stolen.

### Pattern 5: Login page client (gstatic modules, in-memory persistence)
```html
<script type="application/json" id="firebase-config"><%- firebaseConfigJson %></script>
<script type="module" src="/js/login.js"></script>
```
```js
// public/js/login.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import { initializeAuth, inMemoryPersistence, browserPopupRedirectResolver,
  GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut }
  from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';

const config = JSON.parse(document.getElementById('firebase-config').textContent);
const auth = initializeAuth(initializeApp(config), {
  persistence: inMemoryPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});
const google = new GoogleAuthProvider();
google.setCustomParameters({ prompt: 'select_account' });   // "use another account" for free

async function exchange(user) {
  const idToken = await user.getIdToken();
  const res = await fetch('/session', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }), credentials: 'same-origin',
  });
  await signOut(auth);                       // client SDK holds nothing after the exchange
  if (res.ok) return location.assign('/');
  const { error } = await res.json().catch(() => ({ error: 'invalid' }));
  showError(error);                          // map code -> fixed copy, never echo server text
}
```
- All names imported above are exported by the 13.4.0 bundle: `getAuth`, `initializeAuth`, `inMemoryPersistence`, `browserPopupRedirectResolver`, `GoogleAuthProvider`, `signInWithPopup`, `signInWithEmailAndPassword`, `signOut`, `setPersistence`, `onAuthStateChanged`, `getIdToken` [VERIFIED: export clause of the downloaded https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js]. `initializeAuth` reads `t?.popupRedirectResolver` from its deps [VERIFIED: same bundle].
- Error code copy map. Server codes: `not-admin` → DESIGN.md copy verbatim, "This account isn't an admin. Ask the owner to grant access, then sign in again." `unverified` → e.g. "Verify your email in the Repwise app, then sign in again." (DESIGN.md has no exact copy; UI phase owns the wording.) `disabled`, `revoked`, `stale` and `invalid` → generic "Sign-in failed. Try again." Client SDK codes present in the bundle: `auth/invalid-credential` (wrong email or password; email-enumeration protection maps to this) → "Email or password is incorrect."; `auth/popup-closed-by-user` and `auth/cancelled-popup-request` → no message; `auth/popup-blocked` → "Allow pop-ups for this site, then try again."; `auth/too-many-requests`, `auth/network-request-failed`, `auth/user-disabled` → short messages [VERIFIED: strings present in bundle].
- `?error=not-admin` (a revoked admin bounced by `requireAdmin`) is mapped on the server to the same fixed copy. Never reflect the query value into HTML.
- Web config injection: render `JSON.stringify(cfg).replace(/</g, '\\u003c')` so a `</script>` can't break out, even though the values are trusted.

### Pattern 6: Render Blueprint
```yaml
services:
  - type: web
    name: repwise-admin
    runtime: node
    plan: free
    buildCommand: npm ci
    startCommand: npm start
    healthCheckPath: /healthz
    autoDeployTrigger: commit
    envVars:
      - key: NODE_ENV
        value: production
      - key: FIREBASE_SERVICE_ACCOUNT
        sync: false
      - key: FIREBASE_API_KEY
        sync: false
      - key: FIREBASE_AUTH_DOMAIN
        sync: false
      - key: FIREBASE_APP_ID
        sync: false
```
Field names `type`, `runtime` (replaces deprecated `env`), `plan: free`, `buildCommand`, `startCommand`, `healthCheckPath`, `autoDeployTrigger` (replaces `autoDeploy`) and `sync: false` (prompted at Blueprint creation, never stored in the yaml) [CITED: render.com/docs/blueprint-spec]. Node is pinned with `engines.node: "24.x"`. Render's precedence is `NODE_VERSION` env > `.node-version` > `.nvmrc` > `engines.node`, and Render says to include an upper bound [CITED: render.com/docs/node-version]. `PORT` defaults to `10000` on Render, and the existing `process.env.PORT || 3000` already handles it [CITED: render.com/docs/web-services]. `projectId` can come from the service account JSON (`project_id`), so it doesn't need its own env var.

### Anti-Patterns to Avoid
- **Trusting cookie claims:** `decoded.admin` from `verifySessionCookie` is a 14-day-old copy. Always use `getUser(uid).customClaims` (D-07).
- **`verifySessionCookie(cookie, true)` + `getUser`:** two Auth backend calls per page view. Use Pattern 3.
- **Persisted client auth (`browserLocalPersistence`):** leaves a Firebase session in IndexedDB that outlives panel sign-out and lets stale tokens be POSTed. Use `inMemoryPersistence`.
- **`signInWithRedirect` on Render:** broken by third-party storage partitioning. Use popup.
- **helmet with defaults:** COOP `same-origin` blocks the popup's `window.closed` polling, and the default CSP blocks gstatic.
- **Reflecting `?error=` text:** map codes to fixed strings.
- **Stat cards / dashboard tiles on home:** DESIGN.md "Avoid". Use a plain list with `tabular-nums`.
- **`revokeRefreshTokens` anywhere in the panel:** violates D-10 and D-16.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session tokens | Own JWT/HMAC session, `express-session` store | `auth.createSessionCookie` / `verifySessionCookie` | Google-signed, verified against cached public certs; no store on an ephemeral Render disk; no `SESSION_SECRET` needed |
| Revocation / disabled check | Custom "revoked" Firestore flag | `getUser` fields `disabled`, `tokensValidAfterTime`, `customClaims` | Same data the SDK uses |
| Password / OAuth handling | Server-side password form or Google OAuth | Firebase Web SDK popup / password sign-in | Server never sees credentials |
| Counting docs | Fetch all docs and `.length` | `query.count().get()` → `snap.data().count` | Downloads only the number; billed per 1000 index entries [CITED: firebase.google.com/docs/firestore/query-data/aggregation-queries] |
| Async error plumbing | try/catch wrappers, `express-async-errors` | Express 5 native promise handling | Verified by probe |

**Key insight:** Firebase already provides signed sessions, revocation timestamps and claim storage. The server's only job is the policy (admin + verified + not disabled + not revoked) and putting the cookie on the response.

## Data Contract Recommendation (DATA-01, Claude's discretion items)

Grounded in the free-exercise-db schema: `id` matching `^[0-9a-zA-Z_-]+$`; `equipment` one of `null`, `medicine ball`, `dumbbell`, `body only`, `bands`, `kettlebells`, `foam roll`, `cable`, `machine`, `barbell`, `exercise ball`, `e-z curl bar`, `other`; `primaryMuscles`/`secondaryMuscles` arrays from `abdominals`, `abductors`, `adductors`, `biceps`, `calves`, `chest`, `forearms`, `glutes`, `hamstrings`, `lats`, `lower back`, `middle back`, `neck`, `quadriceps`, `shoulders`, `traps`, `triceps`; `instructions` array of strings; `images` array of strings [CITED: raw.githubusercontent.com/yuhonas/free-exercise-db/main/schema.json].

**Collections:** three top-level collections, `muscleGroups`, `targetMuscles` and `equipment`. Each list query stays a single-collection read, and the rules are three identical blocks.

| Collection | Field | Type | Notes |
|---|---|---|---|
| `exercises/{id}` | `name` | string | |
| | `source` | `'free-exercise-db'` \| `'admin'` | D-01 |
| | `muscleGroupId` | string | must equal the target muscle's `muscleGroupId` (D-03) |
| | `targetMuscleId` | string | from `primaryMuscles[0]` (D-05) |
| | `secondaryMuscleIds` | string[] | stored, not shown in v1 (D-05) |
| | `equipmentId` | string | **always set**. Dataset `null` maps to a list entry (suggest the `other` entry or a "None" entry) so app filters never see null. Phase 2 confirms the mapping |
| | `guide` | string[] | ordered steps; maps 1:1 from `instructions` |
| | `notes` | string | `''` default |
| | `media` | `{ stills: [{publicId, url}, {publicId, url}], gif: {publicId, url} \| null }` | `url` is Cloudinary `secure_url` (carries version for cache busting). The app inserts transformations after `/upload/` (LIB-08) [ASSUMED: Cloudinary specifics to be confirmed in Phase 2 research] |
| | `archived` | boolean | **required on every doc** (count and app queries filter on it) |
| | `editedAt` | Timestamp \| null | D-02 |
| | `createdAt`, `updatedAt` | Timestamp | server timestamps |
| `muscleGroups/{id}` | `name`, `order` (number), `createdAt`, `updatedAt` | | `order` gives the app a stable browse order (Chest, Back, …) |
| `targetMuscles/{id}` | `name`, `muscleGroupId`, `createdAt`, `updatedAt` | | D-03 |
| `equipment/{id}` | `name`, `createdAt`, `updatedAt` | | |

Seeded list entries use slug doc IDs (`chest`, `lower-back`, `body-only`) so the Phase 2 seed can be idempotent with exists-checks. A rename changes `name` only, never the ID (D-04). Admin-created list entries get auto IDs. Field style: camelCase. The app links to `../repwise-admin/docs/data-contract.md` from `../repwise/.planning/` (D-06). That needs a small app-repo edit and commit, with the user's approval.

## Common Pitfalls

### Pitfall 1: No Web app registered in Firebase
**What goes wrong:** No `apiKey`/`appId` exists for the browser, so the login page can't initialise.
**Evidence:** `firebase apps:list --project repwise-25` returns 1 app, `repwise (android)`, platform ANDROID [VERIFIED: CLI this session].
**How to avoid:** a checkpoint task, with the user's approval since it changes the shared project. Run `firebase apps:create WEB "repwise-admin" --project repwise-25`, then `firebase apps:sdkconfig WEB <appId>` [VERIFIED: `firebase apps:create --help` / `apps:sdkconfig --help` usage]. Put `apiKey`, `authDomain` (`repwise-25.firebaseapp.com`) and `appId` into `.env` and Render env.

### Pitfall 2: Google popup fails on the Render host
**What goes wrong:** `auth/unauthorized-domain` on `https://<service>.onrender.com`.
**How to avoid:** add the exact onrender host in Firebase console → Authentication → Settings → Authorized domains, after the first deploy reveals the URL. `localhost` is normally authorized by default [ASSUMED]. This is a human checkpoint.

### Pitfall 3: Service account JSON quoting on Render
**What goes wrong:** `JSON.parse` throws at boot and the deploy fails the health check.
**Why:** locally, `.env` wraps the value in single quotes (per `.env.example`). Node's env-file parser keeps `\n` literal inside single quotes and `JSON.parse` turns it into a newline [VERIFIED: probe, `X='{"k":"a\nb"}'` → `JSON.parse(...).k === "a\nb"`]. Render's dashboard value field takes the raw value, so pasting the surrounding `'...'` makes it invalid JSON [ASSUMED: Render docs don't describe quoting].
**How to avoid:** paste the one-line JSON **without** outer quotes into Render. Optionally make `src/firebase.js` throw a clearer error, without printing the value.

### Pitfall 4: CSRF on the token exchange and sign-out
**What goes wrong:** login CSRF (forcing a victim into another session) or a forced sign-out from a hostile page.
**How to avoid:** the `sameOrigin` middleware (Code Examples) on all non-GET/HEAD requests, `SameSite=Lax`, and `/session` accepting only `application/json`, which is a non-simple type and triggers a CORS preflight that this server never answers. OWASP calls `Sec-Fetch-Site` "the primary signal", requires an origin-verification fallback, and treats SameSite as defence-in-depth only [CITED: cheatsheetseries.owasp.org CSRF Prevention Cheat Sheet]. Fail-safe (reject when both headers are missing) is fine: every current browser sends them on POST.
**Warning signs:** curl tests need `-H "Origin: http://localhost:3000"` or they get 403. That is expected.

### Pitfall 5: `secure` cookie and protocol behind Render's proxy
**What goes wrong:** without `trust proxy`, `req.protocol` is `http`, so the same-origin check compares `http://…` to `Origin: https://…` and rejects every POST.
**How to avoid:** `app.set('trust proxy', 1)`. Express then reads the first `X-Forwarded-Proto` value [VERIFIED: node_modules/express/lib/request.js:297-315; probe gives `{"secure":true,"proto":"https"}`]. Key `secure` off `NODE_ENV === 'production'` (set in render.yaml), not `req.secure`, so a misconfigured proxy can't silently drop the flag. Chrome and Firefox accept Secure cookies on `http://localhost`, but keeping `secure: false` in dev avoids Safari differences [ASSUMED].

### Pitfall 6: Back button shows the home page after sign-out
**How to avoid:** `Cache-Control: no-store` on every `requireAdmin` response (Pattern 3).

### Pitfall 7: `archived` missing on a doc skews counts
**What goes wrong:** `where('archived','==',false)` skips docs without the field.
**How to avoid:** compute `active = total - archivedTrue`, using `count()` on the whole collection and on `archived == true`, and make `archived` required in the contract.

### Pitfall 8: Deprecation warning at boot
**What:** console line "The `fromJSON` method is deprecated. Please use the `JWT` constructor instead…".
**Why:** firebase-admin's `cert()` credential calls `auth.fromJSON(keyFile)` internally [VERIFIED: node_modules/firebase-admin/lib/app/credential-internal.js:422 `client = auth.fromJSON(keyFile);`]. google-auth-library 11.3.4 warns unless its internal suppression is active [VERIFIED: node_modules/google-auth-library/build/src/auth/googleauth.js:488-492]. It's not caused by our code, and app code can't fix it. **Ignore it.** It's not an error and doesn't affect auth. Don't swap to a hand-built `JWT` credential.

### Pitfall 9: COOP / CSP breaking the popup
Don't send `Cross-Origin-Opener-Policy: same-origin`. If a COOP header is set at all, use `same-origin-allow-popups` [CITED: community sources + developer.chrome.com COOP docs; LOW-MEDIUM]. Skip a full CSP in Phase 1. Firebase Auth needs gstatic, apis.google.com, the firebaseapp.com iframe and the identitytoolkit/securetoken endpoints, and a wrong allow-list silently breaks sign-in. Only send `frame-ancestors 'none'`.

### Pitfall 10: Clock skew
The `auth_time` check is `now - auth_time > 300`. A server clock running *behind* only loosens it, and one running far *ahead* would reject logins. Render hosts use NTP, so the risk is negligible [ASSUMED]. firebase-admin verifies with `jsonwebtoken` ^9 and no extra clock tolerance [VERIFIED: node_modules/firebase-admin/package.json:214].

### Pitfall 11: Free-tier sleep
The service spins down after 15 minutes without traffic, and the first request takes about 1 minute [CITED: render.com/docs/free]. The browser shows Render's loading page, which is accepted per CLAUDE.md. Don't add keep-alive pingers.

## Code Examples

### Same-origin CSRF middleware
```js
// src/csrf.js — Fetch Metadata first, Origin fallback, fail closed
export function sameOrigin(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const site = req.get('sec-fetch-site');
  if (site) return site === 'same-origin' ? next() : res.status(403).send('Forbidden');
  const origin = req.get('origin');
  if (origin && origin === `${req.protocol}://${req.get('host')}`) return next();
  res.status(403).send('Forbidden');
}
```

### Security headers (no helmet)
```js
function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "frame-ancestors 'none'",
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  });
  next();
}
```

### Home counts (D-13)
```js
// src/counts.js
import { db } from './firebase.js';
export async function getLibraryCounts() {
  const ex = db.collection('exercises');
  const [total, archived, groups, muscles, equipment] = await Promise.all([
    ex.count().get(),
    ex.where('archived', '==', true).count().get(),
    db.collection('muscleGroups').count().get(),
    db.collection('targetMuscles').count().get(),
    db.collection('equipment').count().get(),
  ]).then((snaps) => snaps.map((s) => s.data().count));
  return { active: total - archived, archived, groups, muscles, equipment };
}
```
`count()` returns `AggregateQuery<{ count: AggregateField<number> }>` and is read via `snapshot.data().count` [VERIFIED: node_modules/@google-cloud/firestore/types/firestore.d.ts:1998-2008 (@google-cloud/firestore 9.4.1)]. A single-field equality filter uses the automatic index, so no composite index is needed. Counting a collection that doesn't exist yet should return `0` [ASSUMED: the docs don't say this, and a live probe was blocked by the `.env` read guard. Verify during UAT; zeros are expected before the seed]. Aggregations bypass the local cache and time out after 60s [CITED: aggregation-queries docs].

### Firestore rules (DATA-02), `../repwise/firestore.rules`
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isVerified() {
      return request.auth != null && request.auth.token.email_verified == true;
    }

    // Each user can only read and write their own profile, once verified
    match /users/{uid} {
      allow read, write: if isVerified() && request.auth.uid == uid;
    }

    // Exercise library and its lists: read-only for verified users, written only by the admin panel
    match /exercises/{exerciseId} {
      allow read: if isVerified();
      allow write: if false;
    }
    match /muscleGroups/{id} {
      allow read: if isVerified();
      allow write: if false;
    }
    match /targetMuscles/{id} {
      allow read: if isVerified();
      allow write: if false;
    }
    match /equipment/{id} {
      allow read: if isVerified();
      allow write: if false;
    }
  }
}
```
- The existing `users/{uid}` rule is quoted from `../repwise/firestore.rules:6-10`: `allow read, write: if request.auth != null && request.auth.uid == uid && request.auth.token.email_verified == true;`. The refactor keeps identical semantics [VERIFIED: file read this session].
- `read` covers `get` and `list`, so it also covers app-side `count()`. The admin panel uses the Admin SDK, which bypasses rules, so `write: if false` never blocks the panel.
- Deploy from `../repwise`: firebase.json has `"firestore":{"rules":"firestore.rules"}` and `.firebaserc` has `"default": "repwise-25"` [VERIFIED: files read]. Validate first with `firebase deploy --only firestore:rules --dry-run` (`--dry-run` "Validates your…" [VERIFIED: `firebase deploy --help`, CLI 15.34.0]), then `firebase deploy --only firestore:rules`.
- **D-17 step 1 already satisfied:** `../repwise` `git status --short` is empty, and the log shows `e5215e7 feat: made email verification required before using the app` and `6c70818 feat: added light theme and system/light/dark setting` [VERIFIED: git this session]. The planner should drop the "land pending commits" step, or turn it into a quick confirmation.

### Smoke test (node:test + fetch, no supertest)
```js
// test/app.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

let server, base;
before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://localhost:${server.address().port}`; r(); }); }));
after(() => server.close());

test('healthz is public', async () => assert.equal((await fetch(`${base}/healthz`)).status, 200));
test('home redirects when signed out', async () => {
  const res = await fetch(`${base}/`, { redirect: 'manual' });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), '/login');
});
test('cross-site POST is rejected', async () => {
  const res = await fetch(`${base}/session`, { method: 'POST', headers: { 'Sec-Fetch-Site': 'cross-site', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 403);
});
test('garbage token is refused', async () => {
  const res = await fetch(`${base}/session`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: 'x' }) });
  assert.equal(res.status, 401);
});
test('bad session cookie bounces to login', async () => {
  const res = await fetch(`${base}/`, { redirect: 'manual', headers: { cookie: 'session=garbage' } });
  assert.equal(res.status, 302);
});
```
Node's `fetch` (undici) sends no `Sec-Fetch-Site`, so the `Origin` fallback path gets exercised. Garbage tokens fail at JWT decode. Importing `src/firebase.js` still needs `FIREBASE_SERVICE_ACCOUNT`, which `npm test` loads via `--env-file-if-exists=.env`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `firebase.auth().setPersistence(NONE)` (namespaced v8, still in the manage-cookies sample) | `initializeAuth(app, { persistence: inMemoryPersistence, popupRedirectResolver })` | modular SDK v9+ | Use the modular names; the doc sample is outdated |
| `signInWithRedirect` as default | `signInWithPopup` off-Firebase-Hosting | Chrome 115 storage partitioning (enforced from June 2024) | Popup only |
| `express-async-errors` | Native in Express 5 | Express 5.0 | Drop the wrapper |
| CSRF tokens everywhere | Fetch Metadata + Origin fallback | OWASP cheat sheet current | No token plumbing for Phase 3 forms |
| Render `env:` / `autoDeploy:` keys | `runtime:` / `autoDeployTrigger:` | Blueprint spec | Use the new keys |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `count()` on a not-yet-existing collection returns 0 | Code Examples / counts | Home page errors before seed; quick fix (catch → 0). Verify in UAT |
| A2 | Render passes all cookies through (so the name `session` is fine) | Pattern 2 | Rename cookie to `__session`; trivial |
| A3 | Render's env UI wants the raw JSON without outer quotes | Pitfall 3 | Boot failure on first deploy; visible in Render logs |
| A4 | `localhost` is in authorized domains by default | Pitfall 2 | Local Google sign-in fails until added |
| A5 | Free plan supports `healthCheckPath` and Blueprints | Pattern 6 | Drop the field / configure in dashboard |
| A6 | Google and email/password providers are enabled for the project (app uses both), and the Web OAuth client exists | Pattern 5 | Enable in console. App code imports google_sign_in 7.2 and email sign-in, so very likely already on |
| A7 | Cloudinary `media` shape (`publicId` + `secure_url`) suits LIB-08 | Data contract | Contract edit before Phase 2; cheap now, costly after seed |
| A8 | `equipmentId` always set (dataset `null` → a list entry) | Data contract | App filter handles null instead; decide before the seed |
| A9 | COOP `same-origin-allow-popups` is safe for the Firebase popup | Pitfall 9 | Remove the header if popup misbehaves |
| A10 | Render NTP keeps clock skew negligible | Pitfall 10 | Login rejected as `stale`; widen window |

## Open Questions

1. **Web config: env or committed?** Recommendation: env vars (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_APP_ID`). The values are public, but keeping them out of a public repo avoids GitHub secret-scanning alerts on Google API keys [ASSUMED] and keeps the project identifiers out of git. Optionally restrict the browser API key by HTTP referrer (onrender host + localhost) in Google Cloud console.
2. **`SESSION_SECRET` from CLAUDE.md.** It isn't needed in Phase 1: the Firebase session cookie is Google-signed, and cookie-parser is used unsigned. The planner should not create an unused secret. Mention this to the user so CLAUDE.md can be corrected later, or keep the variable reserved.
3. **Unverified-email copy.** DESIGN.md has no string. The UI phase should fix the wording (draft: "Verify your email in the Repwise app, then sign in again.").
4. **Who creates the GitHub repo and the Render service?** Both need the user's accounts (`gh` 2.96.0 is installed, so `gh repo create` is possible with approval). The Render Blueprint connection is a dashboard action. These are human checkpoints.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | runtime | ✓ | v24.13.0 | — |
| npm | install | ✓ | 11.9.0 | — |
| Firebase CLI | rules deploy, web app registration | ✓ | 15.34.0 (logged in; `apps:list` worked) | Firebase console |
| git | commits | ✓ | mingw git | — |
| GitHub CLI | repo create/push | ✓ | 2.96.0 | GitHub web UI |
| Java | Firestore emulator (rules unit tests) | ✗ | — | `--dry-run` validation + manual rules check; skip emulator tests |
| Firebase Web app (repwise-25) | login page config | ✗ | — | **Create via CLI (checkpoint)** |
| Render account / service | DEPL-01 | unknown | — | Human checkpoint |

**Missing dependencies with no fallback:** Firebase Web app registration (must be created), Render service (must be created by the user).
**Missing dependencies with fallback:** Java/emulator. Use `firebase deploy --only firestore:rules --dry-run` plus a manual check.

## Verification Approach

`workflow.nyquist_validation` is `false` in `.planning/config.json`, so there is no full Validation Architecture section. The lightest approach that fits "no build step":

- **Automated (seconds):** `npm test` → `node --env-file-if-exists=.env --test` runs `test/app.test.js` (the smoke tests above): health public, signed-out redirect, cross-site POST 403, garbage token 401, garbage cookie redirect. It uses the Node 24 built-ins `node:test` and `fetch`. No new dependencies.
- **Rules:** `firebase deploy --only firestore:rules --dry-run` from `../repwise` before the real deploy.
- **Manual UAT (end of phase, maps to success criteria):**
  1. `npm run admin -- grant/revoke/list` (already verified).
  2. A non-admin Google account → refusal copy; `/` stays on login.
  3. On the Render URL: admin Google sign-in → home with counts (zeros); repeat with email/password.
  4. Close and reopen the browser → still signed in. Sign out → `/` redirects to login; back button shows nothing cached. Revoke via script → next request bounces with the not-admin copy.
  5. `docs/data-contract.md` exists. The deployed rules are visible in the Firebase console, and the app (or Rules Playground) can read `exercises` as a verified user and is denied a write.
- `git ls-files | grep -Ei "\.env$|service-account|adminsdk"` returns nothing, as the DEPL-01 secret check.

## Security Domain

`security_enforcement: true`, ASVS level 1.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Firebase Auth (Google, email/password); server `verifyIdToken` + 5-min `auth_time` |
| V3 Session Management | yes | Firebase session cookie: HttpOnly, Secure (prod), SameSite=Lax, 14-day absolute; logout clears cookie; `no-store` on protected pages |
| V4 Access Control | yes | Default-deny router; live `getUser` claim check per request (D-07); rules deny all client writes |
| V5 Input Validation | yes | `/session` accepts JSON only, `idToken` string ≤ 4096 chars, `express.json({ limit: '10kb' })`; EJS `<%= %>` escaping; error codes mapped to fixed copy |
| V6 Cryptography | no hand-rolled crypto | All signing/verification by Google / firebase-admin |
| V7 Error Handling & Logging | yes | Final error middleware renders generic message; never log ID tokens, cookies or the service account |
| V14 Configuration | yes | Secrets only in `.env`/Render env (`sync: false`); `x-powered-by` disabled; security headers set by hand |

### Known Threat Patterns for Express + Firebase session cookies

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Login CSRF / forced sign-out | Tampering | `sameOrigin` middleware + JSON-only `/session` + SameSite=Lax |
| Revoked admin keeps access via old cookie | Elevation of privilege | `getUser` per request (D-07), not cookie claims |
| Stale or replayed ID token minted into a cookie | Spoofing | `auth_time` within 5 min; `verifyIdToken` checks signature and expiry |
| Cookie theft via XSS | Information disclosure | HttpOnly; EJS escaping; no reflected query text |
| Clickjacking | Tampering | `X-Frame-Options: DENY` + `frame-ancestors 'none'` |
| Secret leak in public repo | Information disclosure | `.gitignore` already covers `.env` and key files; Render `sync: false`; pre-push `git ls-files` check |
| Stolen cookie after sign-out | Spoofing | Accepted per D-10 (no revoke). Mitigated by HttpOnly/Secure; owner can revoke manually in an emergency |

## Sources

### Primary (HIGH confidence, read this session)
- `node_modules/firebase-admin` 14.5.1: `lib/auth/auth-api-request.js:59-62`, `lib/auth/base-auth.d.ts:77-82,357,383`, `lib/auth/base-auth.js:962-983`, `lib/auth/user-record.d.ts`, `lib/app/credential-internal.js:422`
- `node_modules/google-auth-library` 11.3.4: `build/src/auth/googleauth.js:488-492`
- `node_modules/@google-cloud/firestore` 9.4.1: `types/firestore.d.ts:1985-2008`
- `node_modules/express` 5.3.0: `lib/response.js:715-722`, `lib/request.js:297-315`
- `https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js` export clause (downloaded)
- Runtime probes: Express 5 + ejs 7.0.2 render, async errors, trust proxy, cookie Max-Age; env-file quoting
- Firebase CLI: `apps:list`, `deploy --help`, `apps:create --help`
- npm registry + `gsd-tools package-legitimacy check`

### Secondary (MEDIUM, official docs via WebFetch)
- https://firebase.google.com/docs/auth/admin/manage-cookies
- https://firebase.google.com/docs/web/alt-setup
- https://firebase.google.com/docs/auth/web/redirect-best-practices
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/firestore/query-data/aggregation-queries
- https://render.com/docs/node-version, /docs/free, /docs/web-services, /docs/blueprint-spec, /docs/health-checks, /docs/configure-environment-variables
- https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/schema.json

### Tertiary (LOW)
- COOP and Firebase popup: community write-ups (codegenes.net, Auth0 community) plus https://developer.chrome.com/blog/coop-restrict-properties

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Versions from registry and installed source; Express + ejs combination probed.
- Architecture: HIGH. Session flow from official doc, plus SDK internals read directly.
- Render / console steps: MEDIUM. Official docs, but free-tier health check and env quoting are not explicitly documented.
- Pitfalls: HIGH for SDK/Express items, MEDIUM for COOP/CSP.

**Research date:** 2026-11-25
**Valid until:** 2026-12-25 (Firebase JS SDK ships often; re-check the gstatic version when executing)
