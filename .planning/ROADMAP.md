# Roadmap: Repwise Admin

## Overview

Repwise Admin is where the app's whole exercise library is created and kept correct. The journey starts with the thinnest end-to-end slice: an admin signs in with Firebase, the server checks the `admin` claim and issues a session cookie, and a page reads real data from Firestore, all live on Render. That same phase locks the shared data contract and the app-side Firestore rules, because the app's library screens (built in `../repwise`) depend on them. Next, a local CLI seeds about 800 exercises from free-exercise-db into the lists and schema the contract defines. Finally, the curation UI lets the admin browse, edit, illustrate, archive and manage the lists, without touching the database by hand.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Admin Sign-In Slice** - Firebase sign-in, admin claim, session cookie and a Firestore-backed page live on Render, plus the shared data contract and app rules
- [ ] **Phase 2: Library Seed** - One-time local CLI import of about 800 exercises from free-exercise-db into Firestore and Cloudinary
- [ ] **Phase 3: Library Curation** - List, search, filter, edit, GIF upload, archive and list management in the panel

## Phase Details

### Phase 1: Admin Sign-In Slice
**Goal:** As the admin, I want to sign in to the deployed panel and see live Firestore data, so that the whole stack is proven end to end.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: ADMN-01, ACC-01, ACC-02, DATA-01, DATA-02, DEPL-01
**Success Criteria** (what must be TRUE):
  1. Running the local claim script with an email grants that account the `admin` claim, and running it again in revoke mode removes it
  2. A signed-in account without the claim is refused with a clear "not an admin" message and cannot open any panel page
  3. An admin signs in on the public Render URL (deployed from GitHub, every secret in Render's environment, none in git) and lands on a page showing live exercise and list counts read from Firestore
  4. The admin is still signed in after closing and reopening the browser, and can sign out from any page, after which panel pages send them back to login
  5. One contract doc defines the exercise and list schema, and the app's Firestore rules let signed-in, verified users read the library and lists but reject any client write
**Plans**: TBD
**UI hint**: yes

### Phase 2: Library Seed
**Goal:** As the admin, I want to seed about 800 exercises from free-exercise-db, so that the library starts full without hand entry.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: ADMN-06, SEED-01, SEED-02
**Success Criteria** (what must be TRUE):
  1. Running the import script locally puts about 800 exercises into Firestore, each with both stills uploaded to Cloudinary and linked by URL
  2. The muscle group, target muscle and equipment lists exist after the import, built from the dataset's values, and every imported exercise points at entries that exist in them
  3. Running the import a second time creates no duplicates and does not overwrite an exercise that was changed after the first run
  4. The Phase 1 home page now shows about 800 exercises and the new list counts
**Plans**: TBD

### Phase 3: Library Curation
**Goal:** As the admin, I want to find, edit, illustrate and archive exercises and manage the lists, so that the library stays accurate.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-07
**Success Criteria** (what must be TRUE):
  1. Admin can open the exercise list, search by name, and filter by muscle group, target muscle, equipment, and active or archived
  2. Admin can create an exercise and edit an existing one (name, muscle group, target muscle, equipment, guide, notes), and the changes are still there after a reload
  3. Admin can upload a GIF for an exercise, and it is stored on Cloudinary and replaces the seed stills on that exercise
  4. Admin can archive an exercise, which hides it from the app but keeps its record, and can unarchive it; no screen offers a hard delete
  5. Admin can add, rename and remove muscle groups, target muscles and equipment; a renamed entry shows its new name on the exercises that use it, and removing one still in use is blocked with a clear message
**Plans**:
- [ ] 03-01-PLAN.md — Exercise list, search, Load more and read-only detail
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Admin Sign-In Slice | 0/TBD | Not started | - |
| 2. Library Seed | 0/TBD | Not started | - |
| 3. Library Curation | 0/TBD | Not started | - |
