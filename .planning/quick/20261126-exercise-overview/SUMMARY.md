---
slug: exercise-overview
status: complete
date: 2026-11-26
---

- Five count cards: mint total plus grey muscle groups, target muscles, equipment and "With a GIF". Numbers in Archivo wide so they match the wordmark.
- `loadCounts()` added next to `loadLists()`; both share one 5-minute cache helper. The "with a GIF" count is `where('media.gif', '!=', null).count()`.
- Two-column split: search and a scrolling list (4px thumb, Firefox gets `scrollbar-width: thin`) on the left, full-height dashed placeholder on the right.
- Dialog: no mint border; grey sheet, white hairline, shadow, blurred backdrop, short rise on open.
- New tokens: `--card`, `--line-2`, `--ease`.

Checked: `node --check`, EJS render with counts and with every count missing. Not yet checked in a live browser, and the count queries haven't run against Firestore yet.
