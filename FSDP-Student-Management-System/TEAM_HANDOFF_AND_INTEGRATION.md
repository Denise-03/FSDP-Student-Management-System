# Sharing the generated code with teammates — safe handoff

**Goal:** Produce one complete ZIP that runs independently, then let each teammate review and integrate a feature into the team's existing private repository. Codex should NOT access that repository.

## What the handoff ZIP must include

- Full source code for `frontend/`, `backend/`, `database/`, test files, README, feature map, design references, docs and required legal/approved local static assets.
- `.env.example` only, never `.env`, Stripe secret, SQL passwords, real identity files, uploads, node_modules, `.git`, logs or local data backups.
- Explicit root directory `FSDP-Student-Management-System/` inside the ZIP. A `package:handoff` command should generate and validate the ZIP.
- `docs/TEAM_HANDOFF.md` mapping module paths, API endpoints/contract, migration files, root dependencies and test commands to features.

## VERY IMPORTANT — why copying isolated files can break

An attendance React page imports a shared API client and expects Express attendance routes, database schema, middleware and grading updates. Simply pasting `AttendancePage.jsx` into another repository usually **does not create a working feature**.

When integrating a feature, move/reconcile its:

1. Frontend pages/components/hooks/API files and feature route registration.
2. Backend routes/controller/service/repository/validation and server route mounting.
3. Required SQL migrations (including dependent tables and unique/FK constraints), and demo fixtures where applicable.
4. Shared libraries and package dependencies; standardised `env.example` keys.
5. The tests and the API contracts, running the feature against the team's actual database.

Use separate Git feature branches and reviewed Pull Requests if possible. One person should own `database/migrations/` ordering and global API contracts to prevent collisions. Integration tests must run after merging; only then should the team call the shared version "working".

## Academic integrity / presentation accountability

The actual Assignment 1 handout warns students against submitting work not done by them. AI generation alone is not evidence that team members completed or understood the assessed work. Follow the lecturer's rules about AI-assisted work, review/adapt the generated code personally, document contributions and be able to explain API/database logic and fixes during the pitch. Never misrepresent the source of others' work.
