---
phase: 02-library-seed
plan: 01
status: complete
completed: 2026-11-25
requirements: [ADMN-06, SEED-01, SEED-02]
---

# 02-01 Data contract and seed: summary

`docs/data-contract.md` defines the exercise and list schema. `npm run seed` imported the free-exercise-db exercises (pinned commit) into `repwise-25`, with both stills uploaded to Cloudinary under `repwise/exercises/{id}/0` and `/1`, and built the muscle group, target muscle and equipment lists. It uses `create`, skips existing docs and asks y/N before writing. The user ran the full import.

## Changes from the plan
- Added `searchTokens` (word prefixes of the name, same scheme as shelf_snap) to every exercise, plus `npm run search-tokens [--write]` to backfill the docs the seed wrote before tokens existed (commit b784be6). The seed now writes them for new exercises.
- The contract has a Search section: `array-contains` on the first word, filter the rest, load more by raising the limit.

## Commits
8f1e703, 32946b7, b784be6

## Still to confirm
- The backfill run (`npm run search-tokens -- --write`) and the re-run check (adds 0).
