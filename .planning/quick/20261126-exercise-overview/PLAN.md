---
slug: exercise-overview
date: 2026-11-26
---

New exercises page layout, UI only. The exercise still opens in the dialog; loading it into the right panel comes later.

1. Count cards above everything: a mint card for total exercises, then four grey (`#161618`) cards for muscle groups, target muscles, equipment and exercises with a GIF. Totals come from Firestore `count()` aggregations, the list sizes from `loadLists()`, both cached 5 minutes. A failed count shows a dash.
2. Two columns below. Left: search, then the list in a panel that scrolls on its own with a 4px scrollbar. Right: a card as tall as search plus list, holding a dashed box with a violet icon and "Select an exercise to view its details".
3. Wide screens fit the window and only the list scrolls. At 1000px and below it is one column, the right card is hidden and the page scrolls.
4. The dialog loses its mint border: a raised grey sheet with a faint white hairline, a deep shadow and a blurred backdrop, rising in on open.

Files: `views/exercises.ejs`, `public/css/app.css`, `src/exercises.js`, `src/routes/exercises.js`. Check with `node --check` and an EJS render.
