# Requirements: Repwise Admin

**Defined:** 2026-11-25
**Core Value:** The admin can get hundreds of accurate, well-illustrated exercises into Firestore and keep them correct, without touching the database by hand.

ADMN-01 to ADMN-07 share their IDs with `../repwise/.planning/REQUIREMENTS.md`, so the two projects trace to each other.

## v1 Requirements

### Admin access

- [x] **ADMN-01**: Only accounts with the `admin` claim can sign in to the panel. Anyone else gets a clear "not an admin" message
- [x] **ACC-01**: The owner can grant or revoke admin for an email by running a local script
- [x] **ACC-02**: An admin stays signed in between visits (session cookie) and can sign out from any page

### Library management

- [ ] **ADMN-02**: Admin can list exercises, search by name, and filter by muscle group, target muscle, equipment, and active or archived
- [ ] **ADMN-03**: Admin can create and edit an exercise: name, muscle group, target muscle, equipment, guide and notes
- [ ] **ADMN-04**: Admin can upload a GIF for an exercise. It is stored on Cloudinary and replaces the seed stills
- [ ] **ADMN-05**: Admin can archive an exercise, which hides it from the app but keeps its record, and can unarchive it
- [ ] **ADMN-07**: Admin can add, rename and remove muscle groups, target muscles and equipment. Removing one that is still in use is blocked

### Seed import

- [x] **ADMN-06**: Admin can run a one-time CLI import that seeds about 800 exercises from free-exercise-db, with both stills uploaded to Cloudinary
- [x] **SEED-01**: Re-running the import creates no duplicates and does not overwrite exercises the admin has edited
- [x] **SEED-02**: The import maps the dataset's muscles and equipment onto the panel's lists, creating the list entries

### Shared data contract

- [x] **DATA-01**: The exercise and list schema is written up in one doc that the app repo builds against
- [ ] **DATA-02**: The app's Firestore rules let signed-in, verified users read the library and lists, and never write them (deployed from `../repwise`)

### Deploy

- [ ] **DEPL-01**: The panel runs on Vercel, deployed from GitHub, with every secret in Vercel's environment variables and none in git

## v2 Requirements

### AI proxy

- **AI-01**: AI proxy endpoint for the protein tracker (Groq first, Gemini as fallback), with keys kept server-side

## Out of Scope

| Feature | Reason |
|---------|--------|
| Hard-deleting exercises | Archive only, so users' plans and session history never point at a missing exercise |
| A separate frontend app (SPA) | Express renders the pages with EJS: one deployable, no build step |
| Managing app users beyond the admin claim | App users manage their own accounts in the app |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ADMN-01 | Phase 1 | Complete |
| ACC-01 | Phase 1 | Complete |
| ACC-02 | Phase 1 | Complete |
| ADMN-02 | Phase 3 | Pending |
| ADMN-03 | Phase 3 | Pending |
| ADMN-04 | Phase 3 | Pending |
| ADMN-05 | Phase 3 | Pending |
| ADMN-07 | Phase 3 | Pending |
| ADMN-06 | Phase 2 | Complete |
| SEED-01 | Phase 2 | Complete |
| SEED-02 | Phase 2 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Pending |
| DEPL-01 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-11-25*
*Last updated: 2026-11-25 after roadmap creation (total corrected from 15 to 14)*
