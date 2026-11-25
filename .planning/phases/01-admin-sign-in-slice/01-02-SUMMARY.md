---
phase: 01-admin-sign-in-slice
plan: 02
status: complete
completed: 2026-11-25
requirements: [ACC-02, ADMN-01]
---

# 01-02 Route guard and sign-out: summary

Every `/admin` page except login, session and logout goes through `requireAdmin` (src/require-admin.js). It verifies the session cookie, then reads the account live with `getUser`, so a revoked, disabled or unverified admin loses access on their next request. Sign out (`POST /admin/logout`) clears the cookie in this browser only, after a same-origin check. The user confirmed it works in the browser (commit e1658db).

## Left for Phase 1
- Home counts on `/admin` and the Firestore rules deploy (DATA-02).
- The deploy (DEPL-01), now on Vercel instead of Render.
