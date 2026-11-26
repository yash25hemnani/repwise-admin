---
slug: cards-and-fit
date: 2026-11-26
---

1. Body text in Hanken Grotesk instead of DM Sans (head partial, login page, `body` rule).
2. Stop the exercises page scrolling on wide screens: the split's grid row grew to the list's full height, so pin it with `grid-template-rows: minmax(0, 1fr)`.
3. Taller count cards: label top left, 40px number bottom left, a big line icon in the bottom right.

Files: `views/partials/head.ejs`, `views/login.ejs`, `views/exercises.ejs`, `public/css/app.css`. Check with an EJS render.
