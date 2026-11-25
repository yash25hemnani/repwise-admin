# Data contract

The shape of the exercise library in Firestore project `repwise-25`. The admin panel and the seed write it, and the Repwise app only reads it.

Lists are referenced by ID only (D-04). Display names live on the list docs, so renaming an entry never touches exercises.

## `exercises/{datasetId}`

The doc ID is the free-exercise-db `id`, e.g. `Barbell_Full_Squat` (D-01). Exercises the admin creates get their own ID with `source: 'admin'`.

| Field | Type | Notes |
|---|---|---|
| `name` | string | Kept as the dataset has it, Title Case (D-25) |
| `searchTokens` | string[] | Word prefixes of `name`, see Search below. Rewritten whenever `name` changes |
| `source` | `'free-exercise-db'` \| `'admin'` | Where the exercise came from (D-01) |
| `muscleGroupId` | string | A `muscleGroups` ID, from the target muscle (D-03) |
| `targetMuscleId` | string | A `targetMuscles` ID. The first primary muscle (D-05) |
| `secondaryMuscleIds` | string[] | `targetMuscles` IDs. Any extra primaries come first, then the dataset's secondaries, with no duplicates |
| `equipmentId` | string | An `equipment` ID. Always set (D-20) |
| `steps` | string[] | The guide, one step per entry, in order (D-24) |
| `level` | string | `beginner`, `intermediate` or `expert` (D-23) |
| `category` | string | e.g. `strength`, `stretching`, `cardio` (D-23) |
| `force` | string \| null | `push`, `pull`, `static` or null (D-23) |
| `mechanic` | string \| null | `compound`, `isolation` or null (D-23) |
| `media` | map | See below |
| `editedAt` | timestamp \| null | Null until the admin edits it (D-02) |
| `archived` | boolean | `false` on import. Exercises are archived, never deleted (D-02) |
| `createdAt` | timestamp | Server time of the write |

### `media`

```js
media: {
  stills: [{ publicId, url, width, height }],  // 0 and 1, in order
  gif: null                                     // set in Phase 3
}
```

- Stills are our own copies in Cloudinary, public IDs `repwise/exercises/{datasetId}/0` and `/1` (D-31).
- An imported exercise has both stills or none. The 3 dataset exercises without stills have `stills: []` and show a placeholder (D-26).
- `gif` becomes `{ publicId, url, width, height }` when Phase 3 uploads one.
- Until then, the app plays the two stills as a flip, 1 second per frame. The panel's preview uses the same rate. With reduced motion, both show as stills.

### Image URLs

`url` is the full-size original. The app builds sized versions from `publicId` (LIB-08):

```
https://res.cloudinary.com/{cloud}/image/upload/{transform}/{publicId}
```

e.g. `.../image/upload/w_400,c_fill,f_auto,q_auto/repwise/exercises/Barbell_Full_Squat/0`.

### Status

The panel derives an exercise's status from these fields:

- **Imported**: `source` is `'free-exercise-db'` and `editedAt` is null
- **Edited**: `editedAt` is set
- **Archived**: `archived` is true. The app hides it

### Search

Firestore can't search inside text, so each exercise stores its name's word prefixes (the same scheme as shelf_snap, in `src/search.js`):

- Lowercase it, remove accents, then split on anything that isn't a letter or digit. Drop words shorter than 2 letters and cut words to 15.
- Store every prefix of 2 letters or more: `Barbell Squat` gives `ba, bar, barb, barbe, barbel, barbell, sq, squ, squa, squat`.

To search, split the typed text the same way. Query `searchTokens array-contains <first word>`, then keep results whose tokens contain every other word. The app also filters `archived == false` and orders by `name`, which needs a composite index: `archived` ASC, `searchTokens` CONTAINS, `name` ASC.

Pages load by raising the query's `limit` (load more), as in shelf_snap.

`npm run search-tokens` (add `--write` to save) backfills or repairs the field on existing docs.

## `muscleGroups/{id}`

| Field | Type |
|---|---|
| `name` | string |
| `order` | number |

The six groups and the dataset muscles under each (D-18):

| ID | `name` | `order` | Target muscles |
|---|---|---|---|
| `chest` | Chest | 1 | chest |
| `back` | Back | 2 | lats, middle-back, lower-back, traps |
| `shoulders` | Shoulders | 3 | shoulders, neck |
| `arms` | Arms | 4 | biceps, triceps, forearms |
| `legs` | Legs | 5 | quadriceps, hamstrings, glutes, calves, adductors, abductors |
| `core` | Core | 6 | abdominals |

## `targetMuscles/{slug}`

| Field | Type | Notes |
|---|---|---|
| `name` | string | The dataset value in sentence case, e.g. `Middle back` (D-19) |
| `muscleGroupId` | string | A `muscleGroups` ID, from the table above |

The slug is the dataset value, lowercased, with spaces replaced by hyphens: `middle back` becomes `middle-back`. It never changes on a rename (D-21).

## `equipment/{slug}`

| Field | Type |
|---|---|
| `name` | string |

The slug comes from the dataset value in the same way. Names are cleaned up lightly (D-20):

| Dataset value | ID | `name` |
|---|---|---|
| `body only` or null | `body-only` | Bodyweight |
| `barbell` | `barbell` | Barbell |
| `dumbbell` | `dumbbell` | Dumbbell |
| `kettlebells` | `kettlebells` | Kettlebell |
| `cable` | `cable` | Cable |
| `machine` | `machine` | Machine |
| `bands` | `bands` | Band |
| `e-z curl bar` | `e-z-curl-bar` | EZ bar |
| `medicine ball` | `medicine-ball` | Medicine ball |
| `exercise ball` | `exercise-ball` | Exercise ball |
| `foam roll` | `foam-roll` | Foam roller |
| `other` | `other` | Other |

## Seed rules

- Source: free-exercise-db pinned at commit `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5` (D-32).
- An existing exercise doc is never overwritten, whether it was edited or not (D-27).
- A list doc is written only when an exercise added in that run needs it and the doc is missing (D-29).
- An exercise doc is written only after both of its stills have uploaded (D-33).
