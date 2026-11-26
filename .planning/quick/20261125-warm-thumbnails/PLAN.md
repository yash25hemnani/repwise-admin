---
slug: warm-thumbnails
date: 2026-11-25
---

Rows load slowly because Cloudinary builds each sized still on its first request (~2.5s), and `f_auto` builds one copy per browser format.

1. Use `f_webp` instead of `f_auto` for the list and detail sizes (`src/exercises.js`).
2. Add `scripts/warm-stills.js` and `npm run warm-stills`: request every list thumbnail once. The user runs it (needs `.env`).

Skipped at the user's request: loading frame 2 only on hover.
