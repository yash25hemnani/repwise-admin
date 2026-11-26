# Design: Repwise Admin

**Defined:** 2026-11-25 (revised from the user's dark dashboard reference)
**Audience:** the app's owner and other admins, at a desktop, working through a library of about 800 exercises
**Main job:** find an exercise, check it against what users will see, fix it, and move on. Most of the work is turning imported seed data into reviewed data.

## Direction

Pure black, dark only. A sidebar on the left, split from the page by a grey line. The list sits in a grey-outlined card, and an exercise opens in a mint-edged dialog over it. Mint means action, violet means "you are here". The visual risk still goes into one place, the exercise stills.

## Color

Dark only, no light mode and no theme toggle. Every surface is `#000000`; boxes are told apart by grey lines, never by grey fills.

| Token | Value | Use |
|-------|-------|-----|
| `--bg`, `--panel`, `--tile` | `#000000` | Page, cards, dialog, inputs, tiles |
| `--line` | `#2A2A2E` | The sidebar edge and every box outline |
| `--text` | `#FFFFFF` | Text |
| `--text-2` | `#9BA0A8` | Hints, counts, labels, sidebar items |
| `--accent` / `--neon` | `#5DF0A6` | Primary buttons, the active sidebar item, the dialog border. Text on it is black |
| `--violet` | `#8B53FE` | Focus outline, the focused search box, hover (14%) and the open row (30%) |
| `--red` | `#E5534B` | Archive and errors |

Mint and red come from `../repwise/lib/core/theme/app_colors.dart`. Violet is the admin's own secondary. Small text never sits on violet (white on it is 4.4:1).

## Type

- **Archivo**, weight 900, wide (`font-stretch: 125%`), for the wordmark only. Page titles use DM Sans 500, like the sidebar.
- **DM Sans** for everything else. Big figures use weight 300 with tabular numbers (`font-variant-numeric: tabular-nums`), large and thin. Body text is 400 and labels 500.
- **Scale** (ratio 1.25, base 15px): 12 / 15 / 19 / 24 / 30 / 37, plus 48 for the big figures. Body line-height is 1.5 and titles 1.1.
- **Case:** sentence case everywhere. No all-caps labels and no monospace.

## Shape

- The radius depends on how much an element holds: 28px on cards and the dialog, 16px on tiles and thumbnails, fully rounded pills on chips, inputs and buttons.
- No drop shadows and no grey fills. Boxes are set apart by a 1px `--line` outline; only the dialog gets a mint border.
- The open row becomes a violet pill.
- Visible focus: a 2px `--violet` outline with a 2px offset on every control. In the sidebar, use `--accent`.
- No status pills. The list and dialog don't show imported/edited/archived.

## The memorable element: the stills flip

Seeded exercises have two JPG stills, and the app plays them as a 2-frame flip.

- **List:** a 48px rounded thumbnail on each row shows frame 1. It switches to frame 2 while the row is hovered, focused or selected. This motion only happens in response to the user.
- **Detail panel:** both frames side by side, with a preview that plays the flip exactly as the app will. Once a GIF is uploaded, it takes their place.
- A small "GIF" marker on a thumbnail shows which exercises already have real animation.
- With `prefers-reduced-motion`, nothing flips. Both frames stay visible as stills.

## Layout

Left-aligned. A black sidebar with a grey right edge holds the wordmark, the pages (Overview, Exercises, and Lists once it exists) with the current one as a mint pill, and "Sign out" at the bottom. The page sits flush beside it, with no panel around it. A top bar holds the page title and the account's initial and email. Below 860px the sidebar slides out from a menu button in the top bar.

The wireframe below predates the all-black restyle; the progress panel and statuses are dropped for now.

**Exercises**

```
repwise   | Exercises                         (moon)  (A) you@...
Overview  |                                       (+ New exercise)
Exercises |
Sign out  |  (sidebar runs the full height; the panels below sit beside it)
+-- dark panel -------------------------------------------------------+
|  612 imported        187 edited          13 archived                |
|  [yellow==========]  [mint=====]         [grey=]                    |
+---------------------------------------------------------------------+
Filters  (Muscle group v) (Target v) (Equipment v)  (Search by name   )
+-- chalk panel ---------------+ +-- dark panel ----------------------+
| [img] Barbell squat   Legs   | |  Barbell squat         Imported    |
|(#[img] Bench press  Chest  #)| |  [frame 1] [frame 2]  flip preview |
| [img] Goblet squat    Legs   | |  [Group] [Target] [Equipment] tiles|
|  ...                         | |  Guide, notes                      |
|                              | |  Archive           (Save changes)  |
+------------------------------+ +------------------------------------+
```

- The progress panel replaces stat cards. Each count sits over its own bar segment in its status color, and clicking a segment filters the list to that status.
- The list panel holds name, muscle group and status. The detail panel is the edit form, so editing happens without leaving the list.
- Opening an exercise updates the URL (`/admin/exercises/:id`), so a reload or a shared link keeps the selection.
- Below about 1000px, the detail panel becomes a full page and the list keeps the whole width. Below about 600px, the filters fold into a "Filters" disclosure.

**Lists:** the same frame. The chalk panel holds the muscle groups, target muscles and equipment, with each entry's count. The detail panel renames the selected entry, or blocks its removal while exercises still use it.

**Admin home (Phase 1):** the progress panel on its own, showing exercise and list counts. Zeros before the seed are expected.

**Login:** the wide "repwise" wordmark centered over a dark panel holding the Google button and the email form. No illustration.

## Copy

Each action keeps the same name from button to confirmation.

- Login: "Sign in to manage the Repwise exercise library."
- Not an admin: "This account isn't an admin. Ask the owner to grant access, then sign in again."
- Empty search: "No exercises match "bulgarian". Clear the filters, or add it as a new exercise."
- Archive confirm: "Archive Barbell squat? It disappears from the app. Plans and history that use it keep working." Buttons: "Archive" / "Cancel". Toast: "Archived Barbell squat."
- Blocked list removal: "Dumbbell is used by 64 exercises. Move them to other equipment first."
- Save: "Save changes", then the toast "Saved."

## Avoid

Identical stat-card grids, gradients, shadows, all-caps eyebrows, monospace data labels, `→` on buttons, and using the accent for anything but the main action, progress and focus.
