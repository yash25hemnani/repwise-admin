# Phase 1: Admin Sign-In Slice - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md. This log keeps the alternatives that were considered.

**Date:** 2026-11-25
**Phase:** 01-admin-sign-in-slice
**Areas discussed:** Exercise data contract, Session & revocation, Sign-in & home page, Rules & claim script

---

## Exercise data contract

| Option | Description | Selected |
|--------|-------------|----------|
| Dataset ID as doc ID | Seeded exercises use free-exercise-db's ID; admin-created get auto IDs; `source` field | ✓ |
| Auto IDs + sourceId field | Random IDs everywhere; the seed queries `sourceId` | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Two separate flags | `editedAt` + `archived` boolean | ✓ |
| One status field | `imported` / `edited` / `archived` enum | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Target has a parent group | Target muscle stores `muscleGroupId`; the seed maps 17 muscles to about 6 groups | ✓ |
| Independent lists | Group and target picked separately | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| One target, keep secondary IDs | `targetMuscleId` + stored `secondaryMuscleIds` | ✓ |
| One target only | Drop the secondary muscles | |
| Multiple targets | `targetMuscleIds` array | |

**Notes:** List layout, media fields, guide format and the doc location were left open at first. The doc location was settled later under Rules & claim script.

---

## Session & revocation

| Option | Description | Selected |
|--------|-------------|----------|
| Check on every request | Verify the cookie and check revocation and the claim each request | ✓ |
| Trust the cookie | Signature only | |

| Option | Description | Selected |
|--------|-------------|----------|
| 14 days | Firebase maximum | ✓ |
| 5 days | | |
| 1 day | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Back to the page they asked for | Same-origin `?next=` | |
| Always the home page | | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Everywhere | Clear the cookie and revoke refresh tokens | first pick, then changed |
| This browser only | Clear the cookie | ✓ |

**Notes:** The user first chose "Everywhere". Claude then pointed out that `revokeRefreshTokens` applies to the whole Firebase account, so it would also sign the admin out of the Repwise app on their phone. The user switched to "This browser only". For the same reason, the revoke script removes the claim without revoking tokens, and the server reads the live claim with `getUser` on each request.

---

## Sign-in & home page

| Option | Description | Selected |
|--------|-------------|----------|
| Google + email/password | Same as the app and DESIGN.md | ✓ |
| Google only | | |
| Email/password only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Require email_verified | Same rule as the app | ✓ |
| Admin claim is enough | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Plain counts list, becomes Exercises later | | ✓ |
| Status bar preview | | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Wordmark + Sign out only | No dead links | ✓ |
| Full bar, disabled tabs | | |

---

## Rules & claim script

| Option | Description | Selected |
|--------|-------------|----------|
| Readable; app filters them | All exercises readable by verified users | ✓ |
| Hide archived in rules | | |

| Option | Description | Selected |
|--------|-------------|----------|
| grant / revoke / list | | ✓ |
| grant / revoke only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| App commits first, then rules | Land the two pending app commits, then a separate rules commit | ✓ |
| Edit on top of the uncommitted file | | |

| Option | Description | Selected |
|--------|-------------|----------|
| repwise-admin/docs/data-contract.md | The panel owns the schema; the app links to it | ✓ |
| In the app repo | | |
| Both, kept in sync | | |

---

## Claude's Discretion

- List collection layout, media fields, guide format, timestamps and field naming
- Cookie flags and CSRF protection
- The refusal flow on the client
- How the service account is provided as an env var, and whether the Firebase Web config is injected or committed
- Render service settings and the health check
- How the counts are read

## Deferred Ideas

None.
