# Feature ownership and complete file-name architecture

The user requests **independent feature modules** in both React and Express so teammates can later review/integrate their respective work into the team repository. This build is **a new standalone codebase**, not a migration from an existing repo.

| Feature directory (use in both `frontend/src/features` and `backend/src/modules`) | Functional responsibility | Proposed reviewer from latest feature-target document |
|---|---|---|
| `public-site` | Public pages, verified organisation content | Team assign |
| `authentication` | Register, sign in/out, role/sessions | Than Thar |
| `student-profiles` | Student membership, verified grade, self-service profile | Than Thar |
| `membership-enrolment` | Application, evidence upload, review lifecycle | Team assign |
| `dojos-classes` | Dojos, class types, sessions, bookings, conflicts | Denise |
| `attendance` | Instructor verified present/absent, cross-dojo totals, external sessions | Than Thar |
| `grading-readiness` | Eligibility rules, time-in-rank, progress tracker | Janessa |
| `grading-applications` | Sessions and eligible grading applications | Denise |
| `notifications` | Membership/attendance/grading notices | Denise |
| `student-dashboard` | Membership/training/grading summary | Kenneth |
| `instructor-dashboard` | Assigned classes, member progress, low attendance | Kenneth |
| `instructor-assessment` | Results/feedback/time in rank/digital acknowledgement | Nicole |
| `payments` | Fee charges, Stripe test Card/PayNow, transaction history | Nicole |
| `admin-dashboard` | Application decisions, membership, reports, basic session settings | Team assign |

The final column indicates the target-features document's allocations, not validated code authorship. The admin and public modules are additional proposed scope; agree ownership together.

## Every feature follows this pattern as relevant

```text
frontend/src/features/dojos-classes/
├── pages/
│   ├── DojosPage.jsx
│   ├── ClassesPage.jsx
│   ├── ClassDetailsPage.jsx
│   ├── BookClassPage.jsx
│   └── MyBookingsPage.jsx
├── components/
│   ├── DojoCard.jsx
│   ├── ClassSessionCard.jsx
│   └── BookingSummary.jsx
├── api/dojosClassesApi.js
├── hooks/useClassSessions.js
└── dojosClasses.routes.jsx

backend/src/modules/dojos-classes/
├── dojosClasses.routes.js
├── dojosClasses.controller.js
├── dojosClasses.service.js
├── dojosClasses.repository.js
├── dojosClasses.validation.js
└── dojosClasses.test.js
```

Use domain-specific equivalents for all fourteen feature names. All business mutations go to the API. Central route registration imports each feature's routes. No duplicated versions of pages in `frontend/src/pages/` and feature folders. The `student-dashboard` module reads attendance/eligibility/booking summaries through shared services, not duplicate SQL logic.

## One SQL Server database, migration ownership

```text
database/migrations/
├── 001_authentication_users.sql
├── 002_dojos_classes.sql
├── 003_membership_enrolment.sql
├── 004_bookings_attendance.sql
├── 005_grading_rules_progress.sql
├── 006_grading_applications_notifications.sql
├── 007_instructor_assessment.sql
├── 008_payments_and_charges.sql
└── 009_reports_audit.sql

database/seeds/
├── 001_public_reference_seed.sql
├── 002_demo_users.sql OR seed-users.js (for hashed demo passwords)
├── 003_demo_classes_bookings.sql
└── 004_demo_attendance_grading_payments.sql

database/scripts/
├── migrate.js
├── seed.js
└── verify.js
```

These are suggested names; adapt dependencies while ensuring migrations are ordered, tracked, repeatable and safe. Foreign keys and shared schema require coordinated review. SQL Server is the single shared DB (`FSDPDevelopment`) for all modules, not a database per teammate.
