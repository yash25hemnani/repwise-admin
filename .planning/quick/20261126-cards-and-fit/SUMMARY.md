---
slug: cards-and-fit
status: complete
date: 2026-11-26
---

- Hanken Grotesk (300–700) replaces DM Sans for all body text; Archivo stays for the wordmark and numbers.
- Page scroll fixed: `.main-fit .split` gets `grid-template-rows: minmax(0, 1fr)` and `.split-list` `min-height: 0`, so only the list scrolls and the right card ends at the window's bottom edge.
- Sidebar toggle: a borderless panel icon (rounded rectangle, divider) replaces the « chevrons; its left pane is filled while open and fades out when collapsed. Square-ish violet hover.
- Count cards are 112px tall (100px on phones), cut down from a first pass at 140px: label top left, 34px Archivo number bottom left, 56px line icon bottom right (dumbbell, body, target, kettlebell, play). Faint white on grey, faint black on mint. The icon sits in the `dd` to keep the `dl` valid.

- Fixes: the toggle kept the `.icon-button` ring because that rule comes later at the same specificity, so the toggle rules are now `.sidebar .sidebar-toggle`. The search field has a magnifier icon on the left. The right panel has one dashed border (28px radius) instead of a solid card around a dashed box.
- Scroll: the list scrolls in an inner `.list-scroll` with standard `scrollbar-width: thin` (the custom `::-webkit-scrollbar` thumb was painted off the scroll thread and lagged), sitting in the panel's padding clear of the corners, with `overscroll-behavior: contain` so the page doesn't move after the list ends. The focused search box shows only its violet border, without the global outline on top.

Checked: EJS render with counts and with every count missing. Not yet checked in a live browser.
