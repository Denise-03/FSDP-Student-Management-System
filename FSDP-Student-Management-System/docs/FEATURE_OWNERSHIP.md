# Feature ownership and review map

Ownership below follows the latest supplied target-feature DOCX. It describes proposed
reviewers, not proof of authorship. The supplied FEATURE_MODULE_TREE.md differs for
instructor dashboard/payments; reconcile these allocations with the team.

| Feature               | Responsibility                                 | Proposed reviewer | API prefix         |
| --------------------- | ---------------------------------------------- | ----------------- | ------------------ |
| public-site           | Public pages and reference content             | Team assign       | /api/public        |
| authentication        | Registration, sessions and roles               | Than Thar         | /api/auth          |
| student-profiles      | Own profile and verified membership display    | Than Thar         | /api/profile       |
| membership-enrolment  | Draft, private evidence and review lifecycle   | Team assign       | /api/enrolment     |
| dojos-classes         | Schedules, suitability and bookings            | Denise            | /api/classes       |
| attendance            | Assigned verification and external training    | Than Thar         | /api/attendance    |
| grading-readiness     | Explainable configurable eligibility           | Janessa           | /api/readiness     |
| grading-applications  | Open events and unique applications            | Denise            | /api/grading       |
| notifications         | In-app messages and dev outbox                 | Denise            | /api/notifications |
| student-dashboard     | Connected student summary                      | Kenneth           | /api/student       |
| instructor-dashboard  | Assigned sessions, progression and engagement  | Nicole            | /api/instructor    |
| instructor-assessment | Signed recommendations for further processing  | Nicole            | /api/assessments   |
| payments              | Server-priced Stripe test Checkout and history | Janessa           | /api/payments      |
| admin-dashboard       | Membership decisions, content and reports      | Team assign       | /api/admin         |

Each feature uses frontend/src/features/<feature>/pages and
backend/src/modules/<feature>. Shared UI, API loading and layout live under
frontend/src/shared; the mounted route map is frontend/src/app/App.jsx. Backend route
mounting is backend/src/app.js; SQL pool, auth/CSRF, validation errors and transaction
helpers live under backend/src/core. No empty boilerplate layers were added.

All features depend on the same migration sequence, not independent per-teammate DBs.
Migration 001 creates the relational graph; 002 repairs only unchanged fixture labels.
The seed and integration suite cover the connected graph. Read TEAM_HANDOFF before
moving a module: page-only copying does not carry its dependencies or authorization.

Migration 003 repairs the original approved-but-unpaid Riley fixture so its beginner
rank is verified before activation. New seeds create that state correctly.
