# FSDP display text encoding fix

This patch fixes incorrect characters in the uploaded 10 November 2026 project ZIP.
It repairs presentation text and seed fixture labels without changing attendance,
authentication, payment, booking, or grading business logic.

Changed files:
- frontend/src/features/dojos-classes/pages/ClassesPages.jsx
- frontend/src/shared/components/ui.jsx
- frontend/tests/browser.spec.js (matches the updated loading message)
- database/seeds/seed-data.js (future seed inserts use proper Unicode)
- database/migrations/004_repair_mojibake_fixture_labels.sql

For an existing local project:
1. Stop `npm run dev` (Ctrl+C).
2. Back up your current project, especially backend/.env and any locally edited files.
3. Unzip `FSDP_Encoding_Patch.zip` into your existing project root, preserving
   the `frontend/` and `database/` subfolders and overwriting only matching files.
4. With PowerShell opened in the project root, run:
      npm run db:migrate
      npm run db:verify
      npm run build
      npm test
      npm run dev
5. Refresh your browser with Ctrl+Shift+R. Verify the class lists and grading panels.

Why migrate? The seed script uses insert-if-missing. Updating the seed source
won't automatically change existing labels already stored in FSDPDevelopment.
Migration 004 only replaces the exact corrupted dash in known fictional labels.
It does not reset records or reseed your database. Never run db:reset-demo
merely to correct text. If your existing SQL records were already fixed by
migration 002, migration 004 will leave them untouched.

Pre-existing screenshots under docs/screenshots/ still show the old rendering.
Regenerate them by running `npm run e2e` once your website is working.

This patch does not include or alter backend/.env, node_modules, or any private data.
