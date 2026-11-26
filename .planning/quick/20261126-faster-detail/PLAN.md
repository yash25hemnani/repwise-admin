---
slug: faster-detail
date: 2026-11-26
---

Opening an exercise is slow: its 400px stills are built on first view (~2.5s), and every click reads the 3 list collections before anything else.

1. `warm-stills` also requests the detail size (`LARGE`), not just the list thumbnails.
2. `loadLists` keeps the names in memory for 5 minutes per server instance.

Not doing: loading only the detail panel with JavaScript (bigger change, only if this isn't enough).
