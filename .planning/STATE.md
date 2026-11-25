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
- Create the Vercel project, add the env vars and add the Vercel domain to Firebase Auth's authorized domains

### Blockers/Concerns

- [Phase 1]: DATA-02 edits `../repwise/firestore.rules`, which showed uncommitted changes in the app repo when this roadmap was written. Merge with care and deploy to project `repwise-25`
- [Phase 1]: The contract (DATA-01) must settle three things the later phases rely on: a stable seed identity per exercise and a way to tell admin-edited exercises apart (SEED-01), whether lists are referenced by ID so a rename carries through (ADMN-07), and the archived flag
- [Phase 1]: Decide whether the admin claim is re-checked on every request, so a revoked admin loses access before the session cookie expires

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| *(none)* | | | | |

## Session Continuity

Last session: 2026-11-25
Stopped at: 03-01 Task 2 checkpoint (list and search)
Resume file: .planning/phases/03-library-curation/03-01-PLAN.md
