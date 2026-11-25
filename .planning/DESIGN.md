# Design: Repwise Admin

**Defined:** 2026-11-25
**Audience:** the app's owner and other admins, at a desktop, working through a library of about 800 exercises
**Main job:** find an exercise, check it against what users will see, fix it, and move on. Most of the work is turning imported seed data into reviewed data.

## Direction

The panel uses the app's own brand: the "gym chalk" light palette, the black-and-mint dark palette and DM Sans. Admins see each exercise the way users will see it in the app. The visual risk goes into one place, the exercise stills. Everything else stays quiet and dense.

## Color

Tokens are copied from `../repwise/lib/core/theme/app_colors.dart`, so the two products match. The panel follows the system light or dark setting.

| Token | Light (chalk) | Dark | Use |
|-------|---------------|------|-----|
| `--bg` | `#F4F5F3` | `#000000` | Page |
| `--surface` | `#E6E8E5` | `#1C1C1F` | Filter column, media panel, table row hover. Surfaces are filled, not shadowed |
| `--border` | `#D5D8D4` | `#2A2A2E` | Inputs and table rules |
| `--text` | `#000000` | `#FFFFFF` | Body and titles. Pure black, as in the app |
| `--text-2` | `#5C6066` | `#A1A1A8` | Hints, counts and column headers |
| `--green` | `#0A7A4B` | `#5DF0A6` | Primary buttons, links, the "Edited" status |
| `--yellow` | `#F9C356` | `#F9C356` | The "Imported" status (needs review) |
| `--red` | `#C7362F` | `#E5534B` | Archive and errors |

The status colors come from the app's accent set, which is a nod to colored bumper plates. They only ever mean status. They are never decoration.

## Type

- **Archivo**, condensed (`wdth` 75) at weight 800, for page titles and the login wordmark only. Its narrow, heavy letters look like gym wall signage.
- **DM Sans** for everything else, matching the app. Counts use tabular figures (`font-variant-numeric: tabular-nums`).
- **Scale** (ratio 1.25, base 15px): 12 / 15 / 19 / 24 / 30 / 37. Body line-height is 1.5 and titles 1.1.
- **Case:** sentence case everywhere. No all-caps labels and no monospace.

## Shape

- 6px radius on inputs, buttons and chips. 10px on media frames, so the images read as the largest objects on the page.
- No drop shadows. A raised element is shown with the `--surface` fill.
- Visible focus: a 2px `--green` outline with a 2px offset on every control.

## The memorable element: the stills flip

Seeded exercises have two JPG stills, and the app plays them as a 2-frame flip.

- **List:** a 56px thumbnail on each row shows frame 1 and switches to frame 2 while the row is hovered or focused. This motion only happens in response to the user.
- **Edit page:** both frames sit side by side at full size, like a contact sheet, with a preview that plays the flip exactly as the app will. Once a GIF is uploaded, it takes their place.
- A small "GIF" marker on a thumbnail shows which exercises already have real animation.
- With `prefers-reduced-motion`, nothing flips; both frames stay visible as stills.

## Layout

Left-aligned throughout. The panel has a top bar with two sections (Exercises, Lists) and no sidebar, because there are only two places to go.

**Exercise list**

```
Repwise admin      Exercises   Lists                     Sign out
------------------------------------------------------------------
Exercises                                          [New exercise]
[Search by name                          ]
[yellow======================|green=========|grey=]
 612 imported   187 edited   13 archived       <- segments are status filters
+---------------+  +-------------------------------------------------+
| Muscle group  |  | [img] Barbell squat   Legs   Quadriceps  Barbell |
|  Legs     142 |  | [img] Bench press     Chest  Pectorals   Barbell |
|  Chest     96 |  | [img] Goblet squat    Legs   Quadriceps  Kettle..|
| Target muscle |  |  ...                                             |
| Equipment     |  |                                                  |
+---------------+  +-------------------------------------------------+
```

The status bar replaces a dashboard of number cards. It shows curation progress and also works as the status filter, so it does a job instead of decorating the page.

**Edit exercise**

```
Exercises / Barbell squat
Barbell squat                                  Imported, not reviewed
+------------- media panel -------------+   Name           [        ]
| [ frame 1 ]          [ frame 2 ]      |   Muscle group   [Legs   v]
| Plays as a 2-frame flip in the app    |   Target muscle  [Quads  v]
| until you upload a GIF.               |   Equipment      [Barbell v]
| [Upload GIF]                          |   Guide          [        ]
+---------------------------------------+   Notes          [        ]
                                            [Save changes]    Archive
```

Below about 900px, both pages stack into one column. The filter column becomes a "Filters" disclosure above the list.

**Login:** the condensed "Repwise admin" wordmark large on the left, with Google sign-in and the email form below it. No illustration.

## Copy

Each action keeps the same name from button to confirmation.

- Login: "Sign in to manage the Repwise exercise library."
- Not an admin: "This account isn't an admin. Ask the owner to grant access, then sign in again."
- Empty search: "No exercises match "bulgarian". Clear the filters, or add it as a new exercise."
- Archive confirm: "Archive Barbell squat? It disappears from the app. Plans and history that use it keep working." Buttons: "Archive" / "Cancel". Toast: "Archived Barbell squat."
- Blocked list removal: "Dumbbell is used by 64 exercises. Move them to other equipment first."
- Save: "Save changes", then the toast "Saved."

## Avoid

Card grids, stat cards, gradients, shadows, all-caps eyebrows, monospace data labels, and `→` on buttons.
