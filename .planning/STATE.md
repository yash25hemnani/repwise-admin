---
gsd_state_version: "1.0"
current_phase: 3
current_phase_name: Library Curation
status: executing
stopped_at: 03-01 Task 2 checkpoint (list and search)
last_updated: "2026-11-25T14:00:00.000Z"
last_activity: 2026-11-25
last_activity_desc: Exercise list built, hosting moved to Vercel, finished plans marked complete
state_head: bd6da86
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: 4
  completed_plans: 3
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-11-25)

**Core value:** The admin can get hundreds of accurate, well-illustrated exercises into Firestore and keep them correct, without touching the database by hand.
**Current focus:** Phase 3 - Library Curation (exercise list first, at the user's request)

## Current Position

Phase: 3 (Library Curation) — EXECUTING
Plan: 03-01 (exercise list), waiting at Task 2 (list and search check)
Status: 01-01, 01-02 and 02-01 complete. Still open: home counts + rules deploy, the Vercel deploy, 02-02
Last activity: 2026-11-25 — Exercise list built, hosting moved from Render to Vercel

Progress: [█████░░░░░] 50% (7 of 14 v1 requirements)

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: - min
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Vertical slices. Phase 1 is the thinnest end-to-end slice (sign-in, claim, session cookie, claim script, Firestore-backed page, live on Vercel)
- [2026-11-25]: Hosting moved from Render to Vercel (user). Express runs as a Vercel Function; vercel.json bundles views/
- [2026-11-25]: Search and pagination follow shelf_snap: searchTokens + array-contains, load more by raising the limit
- [2026-11-25]: The exercise list (03-01) goes ahead of the home counts (02-02), at the user's request
- [Roadmap]: DATA-01 and DATA-02 land in Phase 1 because the app's library screens build against the contract and rules
- [Roadmap]: Seed (Phase 2) comes before the curation UI (Phase 3); the seed creates the list entries, the UI manages them afterwards

### Pending Todos

- Run `npm run search-tokens -- --write` (the user runs it; it needs .env)
- Run `npm run warm-stills` once (the user runs it; it needs .env)
- Create the Vercel project, add the env vars and add the Vercel domain to Firebase Auth's authorized domains

### Blockers/Concerns

- [Phase 1]: DATA-02 edits `../repwise/firestore.rules`, which showed uncommitted changes in the app repo when this roadmap was written. Merge with care and deploy to project `repwise-25`
- [Phase 1]: The contract (DATA-01) must settle three things the later phases rely on: a stable seed identity per exercise and a way to tell admin-edited exercises apart (SEED-01), whether lists are referenced by ID so a rename carries through (ADMN-07), and the archived flag
- [Resolved 2026-11-26]: The admin claim is re-checked at most once a minute per server instance (quick/20261126-detail-only), so a revoked admin loses access within a minute

### Quick Tasks Completed

| Date | Task | Directory |
|------|------|-----------|
| 2026-11-25 | Thumbnails in f_webp, warm-stills script | quick/20261125-warm-thumbnails |
| 2026-11-26 | Warm detail stills, cache list names for 5 minutes | quick/20261126-faster-detail |
| 2026-11-26 | Exercise opens in a dialog from a detail-only fetch, admin check cached 60s | quick/20261126-detail-only |
| 2026-11-26 | Sidebar and top bar shell, light and dark mode | quick/20261126-admin-shell |
| 2026-11-26 | Dark only, all black, grey sidebar line, violet secondary, no status pills | quick/20261126-black-neon |
| 2026-11-26 | Collapsible sidebar: animated icon strip, cookie-remembered | quick/20261126-collapsible-sidebar |
| 2026-11-26 | Exercises page: count cards, list and detail split, borderless dialog | quick/20261126-exercise-overview |
| 2026-11-26 | Hanken Grotesk body text, page fits the window, taller count cards with corner icons | quick/20261126-cards-and-fit |
| 2026-11-26 | Exercise detail in the right panel on wide screens, new detail layout, email off the top bar | quick/20261126-detail-panel |

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| *(none)* | | | | |

## Session Continuity

Last session: 2026-11-25
Stopped at: 03-01 Task 2 checkpoint (list and search)
Resume file: .planning/phases/03-library-curation/03-01-PLAN.md
