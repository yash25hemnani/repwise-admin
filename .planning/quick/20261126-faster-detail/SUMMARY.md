---
slug: faster-detail
status: complete
date: 2026-11-26
---

- `scripts/warm-stills.js`: warms the 400px detail stills as well as the thumbnails (about 3,400 images).
- `src/exercises.js`: `LARGE` exported. `loadLists` keeps the names for 5 minutes per server instance, and drops a failed read.
- `docs/data-contract.md`: notes that warm-stills covers detail stills too.

Checked: both files pass `node --check`. The user still needs to run `npm run warm-stills` once.

When list editing lands (Phase 3), a rename shows up to 5 minutes late unless the edit clears the cache.
