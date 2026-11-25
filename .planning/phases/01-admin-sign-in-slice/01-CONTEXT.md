# Phase 1: Admin Sign-In Slice - Context

**Gathered:** 2026-11-25
**Status:** Ready for planning

<domain>
## Phase Boundary

The thinnest end-to-end slice, live on Render. An admin signs in with Firebase (Google or email/password). The server verifies the ID token, requires a verified email and the `admin: true` claim, and issues a 14-day Firebase session cookie. A home page then shows live Firestore counts. The phase also delivers:

- a local claim script (grant / revoke / list)
- the shared data contract doc (DATA-01)
- the app's library read rules in `../repwise/firestore.rules` (DATA-02)
- a Render deploy from GitHub with every secret in Render's environment (DEPL-01)

Requirements: ADMN-01, ACC-01, ACC-02, DATA-01, DATA-02, DEPL-01.

Not in this phase: the seed import (Phase 2) and the exercise and list pages (Phase 3). The contract must still be shaped for both.

</domain>

<decisions>
## Implementation Decisions

### Exercise data contract (DATA-01)
- **D-01:** Seeded exercises use free-exercise-db's own `id` (e.g. `Barbell_Squat`) as the Firestore doc ID. Admin-created exercises get auto IDs. Each exercise has a `source` field (`free-exercise-db` | `admin`). The seed makes itself idempotent by checking whether the doc exists, not by running a query. — **Reversibility:** one-way. Doc IDs are what users' plans and session history in the app point to, so changing them means migrating every reference.
- **D-02:** Two independent fields describe review and archive state:
  - `editedAt`: a timestamp, null until an admin saves. It doubles as the "edited by admin" marker that the seed must never overwrite.
  - `archived`: a boolean.
  Unarchiving returns an exercise to its earlier imported or edited state. DESIGN.md's imported / edited / archived status bar comes from these two fields. — **Reversibility:** costly. The seed (Phase 2), the panel (Phase 3) and the app's queries all read these fields.
- **D-03:** Each target muscle belongs to one muscle group: a target-muscle doc stores `muscleGroupId`. An exercise stores `muscleGroupId` and `targetMuscleId`, and the two must agree. The seed (Phase 2) maps the dataset's 17 muscles onto about 6 groups (Chest, Back, Shoulders, Arms, Legs, Core). — **Reversibility:** costly. The app's browse-by-group screen and the panel's dropdowns are built on this hierarchy.
- **D-04:** Exercises reference list entries **by ID only** (`muscleGroupId`, `targetMuscleId`, `equipmentId`), so a rename carries through (ADMN-07). The app reads the lists to get display names. — **Reversibility:** one-way, because the app is built against it.
- **D-05:** An exercise has a single `targetMuscleId`. The seed also stores `secondaryMuscleIds` (an array of target-muscle IDs taken from the dataset's secondary muscles), but v1 neither shows nor edits it.
- **D-06:** The contract doc lives at `docs/data-contract.md` in this repo, the single source of truth. The app's planning (`../repwise/.planning/`) links to it by relative path. There is no copy.

### Session & revocation (ACC-02)
- **D-07:** Every protected request verifies the session cookie and reads the account's **current** claims with `getUser(uid)`, never the copy of the claims stored inside the cookie. It requires `admin === true`, `emailVerified`, and an account that isn't disabled. A revoked admin is locked out on their next request.
- **D-08:** The session cookie lasts 14 days, the Firebase maximum.
- **D-09:** After sign-in the admin always lands on `/` (home). There is no `?next=` return path.
- **D-10:** Sign-out clears the cookie **in this browser only**. Do NOT call `revokeRefreshTokens` on sign-out. Admins share their Firebase account with the Repwise app, so revoking would sign them out of the app on their phone. (The user first chose "sign out everywhere", then changed it after this was pointed out.)

### Sign-in & home page (ADMN-01)
- **D-11:** The login page offers Google and email/password, matching the app and DESIGN.md. It uses the Firebase Web SDK loaded from a CDN, with no build step.
- **D-12:** The panel requires `email_verified`, the same rule as the app. An unverified account is refused with a clear message telling them to verify in the app and sign in again. A non-admin is refused with DESIGN.md's copy: "This account isn't an admin. Ask the owner to grant access, then sign in again."
- **D-13:** The home page is a plain list of counts:
  - exercises: active and archived
  - muscle groups
  - target muscles
  - equipment
  Zeros are expected before the seed. There are no stat cards (see DESIGN.md "Avoid"). In Phase 3, `/` becomes or redirects to the Exercises list.
- **D-14:** In Phase 1 the top bar shows only the "Repwise admin" wordmark and Sign out. Phase 3 adds the Exercises and Lists links when those pages exist, so there are no dead links.

### Rules & claim script (ACC-01, DATA-02)
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and constraints
- `.planning/PROJECT.md`: stack, auth, hosting, secrets and data-safety constraints
- `.planning/REQUIREMENTS.md`: ADMN-01, ACC-01/02, DATA-01/02, DEPL-01 wording
- `.planning/ROADMAP.md` § Phase 1: goal and the 5 success criteria
- `.planning/STATE.md` § Blockers/Concerns: the rules merge caution and the contract must-haves (now settled above)

### Visual design
- `.planning/DESIGN.md`: color tokens (chalk and dark), Archivo and DM Sans, shape, login layout, top bar, the "not an admin" copy, the Avoid list

### App side (sibling repo)
- `../repwise/firestore.rules`: the current rules (the `users/{uid}` rule with an email-verification check, uncommitted). The library rules go here (D-15, D-17)
- `../repwise/.planning/REQUIREMENTS.md`: LIB-01..04 and LIB-08, which read the contract this phase defines
- `../repwise/lib/core/theme/app_colors.dart`: the source of DESIGN.md's color tokens

### External
- free-exercise-db (yuhonas, Unlicense): source of the seed IDs (D-01), the 17 muscle values (D-03) and the secondary muscles (D-05)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/server.js`: Express 5 ESM app with `express.urlencoded` already mounted and `PORT` from env. It is a placeholder `GET /` health check that the real home page replaces (or that moves to `/healthz` for Render).

### Established Patterns
- ESM (`"type": "module"`); `npm run dev` = `node --watch --env-file-if-exists=.env`; `npm start` = plain `node`
- Only `express` is installed so far. `firebase-admin`, `ejs` and a cookie parser still need adding.
- `.gitignore` already excludes `.env` and service-account JSON; `.env.example` holds only `PORT`.

### Integration Points
- Firebase project `repwise-25` (shared with the app): Auth users and custom claims, Firestore
- `../repwise` for the rules deploy
- Render (deployed from a GitHub repo that doesn't exist yet; the user creates it)

</code_context>

<specifics>
## Specific Ideas

- Admins are ordinary app users with an extra claim. Nothing in the panel's auth flow (sign-out, revoke) may disturb their app session (D-10, D-16).
- Copy comes from DESIGN.md word for word where it exists.

</specifics>

<deferred>
## Deferred Ideas

None. The discussion stayed within the phase scope.

</deferred>

---

*Phase: 01-admin-sign-in-slice*
*Context gathered: 2026-11-25*
