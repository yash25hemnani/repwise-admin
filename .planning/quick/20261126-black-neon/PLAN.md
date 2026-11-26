---
slug: black-neon
date: 2026-11-26
---

Restyle the exercise pages from the user's notes on the dark screenshot.

1. Page title in the top bar uses DM Sans 500, like the sidebar items, not wide Archivo.
2. No review status: drop the status pill from list rows and the detail dialog.
3. Dark theme is all black: page panel, list card, dialog, tiles and inputs are `#000`. The page panel and dialog get a 1px mint (`#5DF0A6`) border; inner boxes get a dimmer mint line.
4. Secondary `#8B53FE`: focus outline, row hover and the selected row.
5. Light theme keeps its fills; it only takes the violet focus and selection.

Files: `public/css/app.css`, `views/exercises.ejs`, `views/partials/exercise-detail.ejs`. Check with the scratchpad render and Edge screenshots.
