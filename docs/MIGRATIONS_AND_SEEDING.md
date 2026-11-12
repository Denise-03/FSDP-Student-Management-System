# Migrations and seeding

Run npm run db:migrate, npm run db:seed and npm run db:verify from the root.
Migration 001 creates the fsdp_v5 relational schema, constraints and index. Migration
002 repairs only the unchanged labels affected by an early Windows pipe encoding
issue. Migrations have checksums in fsdp_v5.Migrations; do not edit an applied file.
Add the next numbered migration when changing schema.

The seed uses parameterised INSERT IF NOT EXISTS with stable fixture IDs. Repeated
runs preserve user-edited fixtures rather than overwriting decisions, adding duplicate
attendance or multiplying bookings. Passwords are hashed in JavaScript before insert.
The seed reconstructs the private harmless synthetic PDF, which is excluded from ZIP.

Dates are based on current UTC at first seed, with Singapore display. The optional
DEMO_REFERENCE_DATE overrides the anchor for a new seed. Existing IDs are intentionally
not re-dated on repeat runs, so use a fresh demo reset before a later presentation.
The transition session starts thirty minutes before the anchor; attendance can be
marked immediately. Upcoming sessions span fifteen days, three centres and five types.

Explicit development reset (erases only prototype schema records, not migrations or
other schemas; do not use after keeping meaningful demo changes):

```powershell
$env:CONFIRM_DEMO_RESET = 'FSDPDevelopment/fsdp_v5'
npm run db:reset-demo
Remove-Item Env:CONFIRM_DEMO_RESET
```

NODE_ENV=production refuses the reset. The confirmation value is mandatory. It deletes
only the statically allowlisted fsdp_v5 tables in foreign-key order and reseeds. No
server/database drop is performed. Existing private files are not globally deleted.

The integration suite creates unique synthetic users/classes and removes its records.
Browser tests retain clearly fictional applicant records so reviewers can inspect
actual form submissions. They do not alter fixture application decisions.

Migration 003 repairs the original approved-but-unpaid Riley fixture so its beginner
rank is verified before activation. New seeds create that state correctly.
