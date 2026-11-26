---
slug: warm-thumbnails
status: complete
date: 2026-11-25
---

- `src/exercises.js`: thumbnails and detail stills use `f_webp`. `THUMB` is exported for the script.
- `scripts/warm-stills.js` + `npm run warm-stills`: fetches every list thumbnail, 8 at a time, and lists any failures.
- `docs/data-contract.md`: notes the first-request build and why `f_webp`.

Checked: an `f_webp` thumbnail returned image/webp in 0.64s on its first request and 0.10s on the next one. The user still needs to run `npm run warm-stills` once.
