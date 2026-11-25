<!-- GSD:project-start source:PROJECT.md -->

## Project

**Repwise Admin**

Repwise Admin is the web admin panel for Repwise, a public Android gym app (Flutter, in the sibling folder `../repwise`). It is where the whole exercise library lives. The admin seeds it once from an open dataset, then curates it: editing exercises, uploading GIFs and managing the muscle and equipment lists. App users only ever read the library. The panel is an Express server with server-rendered pages, used by the app's owner and any other admins they grant.

**Core Value:** The admin can get hundreds of accurate, well-illustrated exercises into Firestore and keep them correct, without touching the database by hand. Everything the app shows in its library comes from here.

### Constraints

- **Tech stack**: Node.js 24, Express 5 (ESM), EJS templates with plain hand-written CSS, `firebase-admin`, Cloudinary SDK — server-rendered and no build step, as decided for the Repwise backend
- **Auth**: Firebase sign-in on the login page, then the server verifies the ID token, requires an `admin: true` custom claim and issues a Firebase session cookie. A small local script grants or revokes the claim — Firestore rules and the server can both read it
- **Hosting**: Render free tier, deployed from GitHub. It sleeps when idle, so the first request after a while is slow; acceptable for an admin tool. Long jobs like the seed run locally as a CLI script, not on Render
- **Secrets**: the Firebase service account, Cloudinary secret and session secret live in `.env` locally and in Render's environment, never in git. The repo may be public
- **Data safety**: no hard deletes of exercises. The seed is idempotent (re-running it must not create duplicates)
- **Shared conventions**: commit messages are one line with a `feat:`/`chore:`/`docs:` prefix and no Co-Authored-By trailer. Comments are short, with no divider comments

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-fast` for a trivial task inline, with no subagents and no PLAN.md
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
