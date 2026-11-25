---
phase: 01-admin-sign-in-slice
plan: 01
status: complete
completed: 2026-11-25
requirements: [ADMN-01]
---

# 01-01 Sign-in: summary

An admin signs in with Google or email/password at `/admin/login`. `POST /admin/session` checks the ID token (fresh, verified email, `admin` claim) and sets a 14-day httpOnly `session` cookie. The user checked both sign-in methods in the browser.

## Changes from the plan
- Routes moved under `/admin`: `/login` is `/admin/login` and `/session` is `/admin/session`.
- `/` is a public page showing the "repwise" wordmark (Archivo 900, 125% width).
- After sign-in the admin lands on `/admin`, not `/`. This overrides D-09.
- The login page was redesigned to match the home page: centered column, email form first, Google button with a one-colour icon below it.
- Added `npm run dev` (nodemon).
- The web config is a committed module (`public/js/firebase-config.js`), not injected by the server.

## Left for 01-02
`/admin` has no route yet, and there is no guard or sign-out.
