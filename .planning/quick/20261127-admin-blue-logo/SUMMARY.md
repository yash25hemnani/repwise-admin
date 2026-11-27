---
slug: admin-blue-logo
status: complete
date: 2026-11-27
---

- Blue (#2B52EB, white text) is the primary colour, as in the app. It's used for the main buttons, the total count, the open row, the empty-state disc and the current page's nav disc. The other nav discs are plain ink rings.
- The app's logo (`../repwise/assets/icons/repwise_logo.svg`) is inlined from `views/partials/logo.ejs`, so its ring text gets Archivo. It sits before the sidebar wordmark and above the sign-in form. A copy at `public/logo.svg` is the admin favicon.
- Light only. A dark mode was tried and removed at the user's request.

Files: `public/css/app.css`, `views/partials/logo.ejs`, `public/logo.svg`, `views/partials/sidebar.ejs`, `views/partials/head.ejs`, `views/login.ejs`.

Checked: the views compile and the JS parses. Not yet checked by eye in a browser.
