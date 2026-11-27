---
slug: admin-plate-reskin
status: complete
date: 2026-11-27
---

- The admin (sign-in, overview, exercises) now has the landing page's look. It's chalk and light only, with Archivo for all text, 3px ink outlines and hard offset shadows on cards, inputs and buttons. Buttons sink into their shadow when pressed.
- Green, the library's plate colour, marks the primary action, the total count, the open row and the empty-state disc. The black and violet tokens and Hanken Grotesk are gone.
- Sidebar: a paper strip with an ink rule. Each nav icon sits in a plate disc (Overview white, Exercises green). The current page is an ink pill.
- Layout and markup are unchanged.

Files: `public/css/app.css`, `views/partials/head.ejs`, `views/login.ejs`, `views/partials/sidebar.ejs`.

Checked: the EJS views compile; the dev server serves `/admin/login` and `/css/app.css` with 200, and `/admin` redirects to sign-in. Not yet checked by eye in a browser.
