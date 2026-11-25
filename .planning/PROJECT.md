# Repwise Admin

## What This Is

Repwise Admin is the web admin panel for Repwise, a public Android gym app (Flutter, in the sibling folder `../repwise`). It is where the whole exercise library lives. The admin seeds it once from an open dataset, then curates it: editing exercises, uploading GIFs and managing the muscle and equipment lists. App users only ever read the library. The panel is an Express server with server-rendered pages, used by the app's owner and any other admins they grant.

## Core Value

The admin can get hundreds of accurate, well-illustrated exercises into Firestore and keep them correct, without touching the database by hand. Everything the app shows in its library comes from here.

## Requirements

### Validated

- ✓ Express 5 (ESM) server scaffold that starts and answers `GET /` — existing

### Active

- [ ] Only admins can sign in (ADMN-01)
- [ ] Admin can list, search and filter exercises (ADMN-02)
- [ ] Admin can create and edit an exercise: name, muscle group, target muscle, equipment, guide, notes (ADMN-03)
- [ ] Admin can upload an exercise GIF, stored on Cloudinary (ADMN-04)
- [ ] Admin can archive an exercise, hiding it from the app without breaking plans or history (ADMN-05)
- [ ] Admin can run a one-time import that seeds the library from free-exercise-db (ADMN-06)
- [ ] Admin can manage the lists of muscle groups, target muscles and equipment (ADMN-07)
- [ ] The panel is deployed on Render and reachable from anywhere

### Out of Scope

- AI proxy for the protein tracker (Groq, then Gemini) — deferred to v2; it will be added when the app's protein tracker is planned
- Hard-deleting exercises — archive only, so users' plans and session history never point at a missing exercise
- A separate SPA frontend — server-rendered EJS pages keep it to one deployable with no build step
- User management beyond granting the admin claim — app users manage their own accounts in the app

## Context

- **The app side:** Repwise is Flutter + Riverpod 3 + Firebase (Auth, Firestore with offline persistence) on Firebase project `repwise-25`. The app's planning lives in `../repwise/.planning/`. This project covers Phase 2 of that roadmap (ADMN-01 to ADMN-07). The app's library screens (LIB-01 to LIB-04, LIB-08) are built in the app repo against the data this panel writes.
- **The shared data contract:** the Firestore exercise schema (field names, how muscle groups, target muscles and equipment are referenced, the archived flag, and the media URLs) is shared with the app. It must be decided once, documented, and kept stable.
- **Firestore security rules** are deployed from the app repo (`../repwise/firestore.rules`). The rule that makes the library readable by signed-in, verified users and never writable by clients has to be added there. The admin panel writes through firebase-admin, which bypasses the rules.
- **The seed dataset:** free-exercise-db (yuhonas, public domain/Unlicense) has about 800 exercises with name, level, equipment, primary/secondary muscles, instructions, category and two still JPGs each, not GIFs. The seed uploads both stills to Cloudinary. The app can show them as a 2-frame flip until the admin uploads a real GIF.
- **Media:** Cloudinary hosts all exercise media. The app requests optimised formats (MP4/WebP) through Cloudinary URL transformations.
- **Auth in the app:** Firebase Auth with Google and email/password. Email verification is required. Admins use the same Firebase accounts.

## Constraints

- **Tech stack**: Node.js 24, Express 5 (ESM), EJS templates with plain hand-written CSS, `firebase-admin`, Cloudinary SDK — server-rendered and no build step, as decided for the Repwise backend
- **Auth**: Firebase sign-in on the login page, then the server verifies the ID token, requires an `admin: true` custom claim and issues a Firebase session cookie. A small local script grants or revokes the claim — Firestore rules and the server can both read it
- **Hosting**: Render free tier, deployed from GitHub. It sleeps when idle, so the first request after a while is slow; acceptable for an admin tool. Long jobs like the seed run locally as a CLI script, not on Render
- **Secrets**: the Firebase service account, Cloudinary secret and session secret live in `.env` locally and in Render's environment, never in git. The repo may be public
- **Data safety**: no hard deletes of exercises. The seed is idempotent (re-running it must not create duplicates)
- **Shared conventions**: commit messages are one line with a `feat:`/`chore:`/`docs:` prefix and no Co-Authored-By trailer. Comments are short, with no divider comments

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Separate project `repwise-admin` next to the app repo | Keeps Node and Flutter tooling apart; it deploys on its own | — Pending |
| Seed from free-exercise-db with its JPG stills uploaded to Cloudinary | Public domain, about 800 exercises; stills now, real GIFs added by the admin over time | — Pending |
| Firebase sign-in + `admin` custom claim + session cookie | Same accounts as the app; the claim is visible to the server and the Firestore rules | — Pending |
| Host on Render free tier | No billing needed; cold starts are fine for an admin panel | — Pending |
| EJS + plain CSS | Simple templates, no build step | — Pending |
| AI proxy deferred to v2 | v1 is the exercise library; the protein tracker comes later | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-25 after initialization*
