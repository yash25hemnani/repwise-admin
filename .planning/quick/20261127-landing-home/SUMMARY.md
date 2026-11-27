---
slug: landing-home
status: complete
date: 2026-11-27
---

- The public home page (`/`, `views/home.ejs`) is now the plate-colour landing page from `../repwise-site`, in place of the lone repwise wordmark. Same markup, with asset paths made absolute.
- Styles in `public/css/site.css`, the widget demo in `public/js/site.js`, and the red-plate favicon in `public/favicon.svg`. The home page loads only these, not `app.css`, so the admin styles and the site styles never meet (both define `.wordmark` and `.lede`).
- The old `.home` and `.home-mark` styles and their flex animation are gone from `app.css`.

Files: `views/home.ejs`, `public/css/site.css`, `public/js/site.js`, `public/favicon.svg`, `public/css/app.css`.

Checked: EJS render; `node --check public/js/site.js`; the running dev server returns 200 for `/`, `/css/site.css`, `/js/site.js` and `/favicon.svg`. Not yet checked by eye in a browser.
