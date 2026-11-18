# CODEX MASTER TASK V5 — BUILD ALL FSDP AIKIDO FEATURES FROM SCRATCH

## 0. ACT NOW: actual source code, not a plan

You are the lead full-stack engineer in **a personal, local VS Code workspace named `FSDP_Personal`**. Create a NEW, self-contained project directory:

`FSDP_Personal/FSDP-Student-Management-System/`

**Do not inspect, clone, pull, copy from, or touch the team's private GitHub repository or teammates' code.** There is no existing project you need to preserve. You may read only the attached requirements and design/reference files in the parent workspace. The user wants a **fully working prototype source tree** with React, Express, SQL Server scripts, realistic seeded demo data, tests, documentation, and a clean distributable ZIP so team members can later review/integrate their own modules. **Write and run the actual code.** Continue implementation and verification instead of stopping at brainstorming, architecture proposals or empty folders.

If the target folder already exists, inspect its contents and avoid destructive overwrites. Never delete unrelated personal files. Make a safe backup or create a clearly named clean build if necessary, documenting what you did.

## 1. Primary basis and boundaries

Read all source files and follow their actual requirements. For the PDFs/DOCX, use the matching `references/*_EXTRACTED.md` copies if your environment cannot directly read the original formats; the original attached files remain authoritative:

1. `references/Industry_Problem_Statement.pdf` — centralised management of student enrolment, attendance, membership and progress across multiple Aikido Shinju-Kai centres; five user-facing plus admin processes; student self-service; training/eligibility/notification/application/assessment.
2. `references/Assignment_1_Brief.pdf` — working prototype and pitch; assess challenge fit, innovation, business value/usability, technical features, presentation; submission 19 Nov 2026 at 12 PM and ByteHackz 20 Nov 2026. Academic integrity warning applies.
3. `references/Assignment_1_Target_Features.docx` — nine named feature areas and latest teammate ownership. Include **ALL** target features as implemented or explicitly documented as blocked, not just a clickable UI.
4. `design-reference/01_DESIGN_SPECIFICATION.md` and `design-reference/visual-reference.html` — responsive visual blueprint with 29 screen concepts. Use as a design target, not as the final application or a source of real data.
5. `FEATURE_MODULE_TREE.md`, `DEMO_DATA_AND_SCENARIOS.md`, `TEAM_HANDOFF_AND_INTEGRATION.md`, `AGENTS.md` — module naming, data, workflows and handoff expectations.
6. `https://aikidoshinjukai.com.sg/` — official public context, when web access is available. If inaccessible, use only vetted supplied reference facts, clearly label missing/unverified ones and put them in admin-configurable seed data rather than inventing official details.
7. Team Figma link for OPTIONAL design comparison only, if access is explicitly available: `https://www.figma.com/design/PyxEjK1PKeF8AkTQljhBE9/FSDP?node-id=0-1`. Do not make Figma/GitHub access a blocker; do not claim you inspected a design you could not access.

The project uses **React + Node.js/Express + Microsoft SQL Server (`FSDPDevelopment`)** as requested. The original industry brief suggests other databases but explicitly allows exploring alternatives; do not switch from SQL Server. Stripe **test mode** only.

## 2. Business outcome: a connected student lifecycle

The system is a professional mobile-first Aikido website and role-based platform, with ONE database and ONE set of APIs:

**Guest browsing** → view Home, About, Aikido process, class types, dojo locations, public schedule, fees, grading/belt explanations → select Book/Enrol → **Sign In** (existing user) or **Register** (new user) → preserve selected class → create applicant account → multi-step membership application (basic information, previous Aikido history, claimed belt, preferred/principal dojo, valid optional demo evidence, waiver/guardian consent) → **admin** reviews and approves/requests changes/rejects → approved-pending-payment with a charge when needed → **Stripe test Card or PayNow** payment → signed server webhook confirms paid → student membership activates and user gets confirmation → student books suitable class → assigned instructor views live roster and verifies attendance → student attendance is consolidated across multiple dojos → eligibility recalculates from **configurable grading rules** → eligible student receives notification → applies for grading session → authorised instructor records assessment/feedback/time in rank and digital acknowledgement for later processing.

Also show an inactive student being identified for an appropriate follow-up, attendance from legitimate external sessions after authorised verification, membership status and transaction history. **No automated belt promotion approval:** detailed final grading-result administration is out of scope. Keep the new admin dashboard limited to membership decisions, content/class coordination, payments overview and reporting.

**Product decision needing partner validation:** Official paper application practice may involve paying on submission. For this redesigned demo use **admin approval → payment → membership activation** so rejected applications do not require refund workflows. Document this proposed change as an assumption in `docs/BUSINESS_DECISIONS.md`. Do not present it as current Shinju-Kai policy. Create a provisional profile on registration; activate approved membership only after any required payment is confirmed or a documented waiver is applied.

## 3. Feature-based folder architecture — create all needed code

Create:

```text
FSDP-Student-Management-System/
├── frontend/
│   ├── public/assets/{brand,photos,icons}/
│   ├── src/
│   │   ├── app/{App.jsx,routes.jsx,providers.jsx}/
│   │   ├── features/
│   │   │   ├── public-site/
│   │   │   ├── authentication/
│   │   │   ├── student-profiles/
│   │   │   ├── membership-enrolment/
│   │   │   ├── dojos-classes/
│   │   │   ├── attendance/
│   │   │   ├── grading-readiness/
│   │   │   ├── grading-applications/
│   │   │   ├── notifications/
│   │   │   ├── student-dashboard/
│   │   │   ├── instructor-dashboard/
│   │   │   ├── instructor-assessment/
│   │   │   ├── payments/
│   │   │   └── admin-dashboard/
│   │   └── shared/{components,layouts,hooks,lib,styles}/
│   ├── tests/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── modules/  # same named feature directories
│   │   └── core/{config,middleware,errors,utils}/
│   ├── tests/
│   ├── uploads/   # private; ignored by git and ZIP
│   ├── package.json
│   └── .env.example
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── scripts/{migrate.js,seed.js,verify.js}/
├── scripts/   # build/test/package scripts
├── docs/
├── design-reference/
├── references/
├── .gitignore
├── AGENTS.md
├── package.json  # workspace scripts
└── README.md
```

There should be a named React page/API component/service for each feature. For example:

```text
frontend/src/features/attendance/
├── pages/{StudentAttendanceHistoryPage.jsx,InstructorTakeAttendancePage.jsx}
├── components/{AttendanceRoster.jsx,AttendanceStatusBadge.jsx}
├── api/attendanceApi.js
└── hooks/useAttendance.js

backend/src/modules/attendance/
├── attendance.routes.js
├── attendance.controller.js
├── attendance.service.js
├── attendance.repository.js
├── attendance.validation.js
└── attendance.test.js
```

Use the same convention throughout; avoid unnecessary empty boilerplate if a layer is genuinely trivial. Shared auth, database pool, API client, design primitives and error handling belong in `shared/` or `core/`, never copied into each feature. All feature routes must actually be mounted and linked. See `FEATURE_MODULE_TREE.md` for examples and ownership.

## 4. Full frontend requirements (all mobile-friendly, all integrated)

Implement the **29 design reference screens and any essential subpages/states** in React (Vite, React Router; use a consistent accessible component approach):

- **Public:** Homepage hero with approved ASK logo and photo; About; class catalogue and class details/schedule; dojos and active centres; grading/belt levels; fees; How to Join. Guests can view without authentication.
- **Auth:** Login, Register, logout/session resume, role redirect, form errors and safe reset/recovery placeholder only if functional (do not show dead links).
- **Enrolment:** Four-step application, optional synthetic/redacted evidence upload, guardian/waiver confirmation, save draft, review, submit, application status, requested changes. Selected class persists through the flow.
- **Student:** Dashboard, discover/book classes, my bookings, own attendance and cross-dojo totals, grading readiness progress and reasons, grading session application, notifications, membership/profile, checkout, payment results/history.
- **Instructor:** Assigned sessions, roster/attendance edit with authorised verification, student progression/low-attendance insights, grading candidates and assessment form.
- **Admin:** Dashboard metrics, pending application details and private document review, approve/request changes/reject decisions, member directory, basic dojo/class session management and cross-centre reports, payment statuses.

Mobile width 360px to large desktop: responsive navigation, no unwanted horizontal scrolling, well-spaced tap targets, accessible labels/keyboard use, semantic forms and contrast. Public pages are photo-led navy/white with restrained red accents; dashboard uses clean readable tables/cards. On mobile, match reference class cards with real approved Aikido photo thumbnail, name, description and arrow. All screens must fetch state from API; loading/empty/error/confirmation states and full refresh persistence are required. Do not ship the static HTML preview as the app.

**Photo/logo integrity:** Use organisation-supplied/approved or correctly licensed authentic Aikido photography, not invented people disguised as official members. If license/approved files are missing, use clearly labelled placeholder images and a documented asset register; no misleading attribution or unauthorized scraping/rehosting. The low-res sample crops in design reference are for layout only. The genuine logo can be included when authorised; keep its aspect ratio.

## 5. Backend API, validation and security

Implement actual Express REST routes (names may differ only if consistency is preserved), with request validation and back-end role authorization:

- Auth: registration, login/logout, current session, role guard.
- Public content: dojos, class types, schedules/sessions, grading public information, fees.
- Enrolment: create/update draft, document upload, submit, status, resubmission after changes.
- Admin: list/review/approve/request changes/reject applications, membership records, reports, manage permitted class/dojo/fee data.
- Student: dashboard, profile, eligible classes, bookings (create/cancel where permitted), attendance history, readiness, grading sessions/applications, notifications/read, payment charges/history.
- Instructor: assigned sessions/rosters, mark and correct attendance with audit, progression, alerts, grading candidate assessment/submit.
- Payments: create server-priced Stripe Checkout Session in **test mode** with Card and eligible **PayNow** for SGD one-time payments. Verify signed webhooks; reconcile charge/payment attempt; record pending/succeeded/failed/expired; return server-truth state. Do not claim paid from redirect alone.

Requirements: hashed passwords (argon2/bcrypt), server-owned session or safe tokens, secure logout, parametrised SQL, schema validation, SQL transactions and unique constraints, booking capacity/concurrency-safe checks, error middleware, rate limiting on login, minimal information exposure, authorised instructor assignment checks, no raw sensitive uploads. Safe upload type/size validation with private filenames and admin-only download. Optional email: implement a configurable outbound provider and dev outbox; if no credentials, demonstrate in-app notification and test outbox rather than claiming a real email sent.

## 6. Microsoft SQL Server `FSDPDevelopment` — real relational persistence

Design a coherent versioned migration sequence and idempotent seeding. Required entities (names can vary if model explains mapping):

- `Users`, `Roles`/role mapping, `StudentProfiles`, `InstructorProfiles`/`InstructorAssignments`
- `MembershipApplications`, `ApplicationDocuments`, `Memberships`, `WaiverConsents`
- `Dojos`, `ClassTypes`, `ClassSessions`, `ClassBookings`, `ClassRequirements`
- `AttendanceRecords`, `ExternalTrainingRecords` or appropriately modelled verified external sessions
- `BeltLevels`, `GradingRules`, `StudentBeltHistory`, `GradingSessions`, `GradingApplications`, `InstructorAssessments`
- `Notifications`, `NotificationOutbox`, `PaymentCharges`, `Payments`/`PaymentAttempts`, `AuditLogs`
- Content/fees settings as needed.

Use primary keys, foreign keys, unique constraints, indexes and constraints for valid statuses; use UTC timestamps with consistent Singapore display timezone. One shared DB pool and a non-destructive migration runner; no dangerous drop/recreate on every start. Do not hardcode editable data in JSX. Provide a safe explicit demo reset for local development only.

### Critical business rules to implement and test

1. Guest browsing works. Booking redirects to sign in/register and remembers intended session.
2. A registered **applicant** cannot skip enrolment approval/payment requirements via API manipulation.
3. Admin approval is idempotent and atomic; status, profile/activation, audit and notifications remain consistent.
4. Enrolment application changes/rejection have reasons and persist, with correct applicant visibility.
5. Class booking enforces role, confirmed membership, waiver, belt/age suitability, active schedule, capacity, overlaps and duplicates.
6. Instructor may record attendance ONLY for assigned sessions and appropriately booked students; mark Present/Absent. Same student+session must not be counted twice; corrections audit who changed what.
7. Aggregate qualifying verified attendance across **different dojos** AND authorised external training records, excluding unverified/absent/nonqualifying sessions. Do not double-count the same training event.
8. Eligibility calculation uses verified belt, configurable grade transition, minimum qualifying sessions, time-in-rank and applicable requirements; return explainable deficiencies, refresh on data changes, notify exactly once on eligibility transition. Never equate eligibility with promotion.
9. Eligible and active members can apply to an open grading session once; ineligible/duplicate/out-of-window attempts are blocked at the API.
10. Assigned instructor can record candidate result, time in rank, feedback and digital acknowledgement for *further processing*; no admin final promotion UI.
11. Pay amounts are calculated server-side from persisted charges, fees and validated discounts. Checkout and on-screen totals match. Stripe signed webhook (including async outcome) is idempotent. Test PayNow uses Stripe-provided QR; do not generate fake permanent PayNow confirmation. Activation after confirmed payment/waiver, never from front-end success redirect.
12. Student sees only own data, instructor only permitted students, admin only authorised admin functions; all actions survive page refresh.

## 7. Seed realistic demonstration data (REQUIRED)

Read `DEMO_DATA_AND_SCENARIOS.md`. Implement `npm run db:migrate`, `npm run db:seed`, `npm run db:verify` and a development-only seed/reset command. Seed coherent connected fixtures in SQL Server, not array constants in components:

- **Public reference data**: at least 3 distinct active training centres, several class types, recurring schedules and upcoming sessions. Where actual official dojo details/fees/schedules are verifiable, record source URL and verification date; otherwise explicitly label demo placeholders, never invent official names or fees as facts.
- **Fictional accounts**: admin; 2 instructors assigned to different dojos; new applicant pending; applicant requiring changes; approved active student with cross-dojo history; eligible student; ineligible student. Provide demo email/password details in a clearly marked **development-only** instruction; password hashes in SQL, no production accounts.
- Membership states: draft/pending review/changes requested/approved pending payment/active/rejected. Existing belt/current dojo/rank-start dates. Only approved verified rank counts.
- Several student bookings: future sessions at multiple dojos, instructor rosters, absent + present verified records, and one low-attendance example.
- A grading rule and at least one demonstrable **transition** (e.g. one more instructor-verified qualifying attendance moves a student from not-yet-eligible to eligible), plus a student remaining ineligible with clear reasons. If using a reduced synthetic requirement to make the demo quick, label it as **DEMO RULE — NOT OFFICIAL**. Source any authentic belt grading requirements where documented.
- Grading session, existing/pending applications, in-app notifications, instructor assessment sample; test payment charges and statuses. No invented successful real bank payments.
- Date fixtures must be useful when demo is launched: generate upcoming sessions relative to a configurable demo date or current Singapore time; ensure demo repeatable for the presentation.
- Seed scripts must run repeatedly without multiplying rows or duplicate attendance.

## 8. Stripe Test Card and PayNow integration

Use `stripe` server SDK, hosted Stripe Checkout and valid payment-method configuration. Require test environment keys supplied locally in `.env`; provide `.env.example` with names but NO secrets. PayNow support depends on eligible account/payment/currency conditions and is for supported SGD one-time payments. Show card and PayNow if confirmed available. Do not create a fake QR or fabricate successful payment. Signed webhook is authoritative for paid states; enforce event idempotency and meaningful failed/expired/pending UI. Log trusted references, never PAN/CVV. If no working test credentials or webhook forwarding are available, implement provider adapter and API-level tests, and report **Hosted checkout not verified** clearly.

## 9. Presentation-ready tests and evidence

Set up scripts so a student can run on Windows from the repo root. Prefer root npm scripts such as `npm install`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`, `npm run build`, `npm test`, `npm run e2e` and `npm run package:handoff`. Do not claim a command exists unless implemented.

Test actual end-to-end flows against local SQL Server when available, otherwise distinguish code tests from DB integration:

- Public guest browses, selects class → sign in/register → completed membership application persisted, uploaded synthetic training evidence with access controls.
- Admin reviews and approves; payment required/pending; test-mode card or PayNow if available → webhook confirms → applicant becomes active member; correct receipt/notification.
- Student returns to intended session and books it; cannot overbook or double-book; booking still present after browser refresh.
- Instructor views matching roster and marks present; student views updated attendance; second dojo session counted. Duplicate submissions cannot inflate totals; external session must be verified.
- Student's grading readiness changes based on stored rule; one notification generated; application created once; instructor signs assessment for further processing; no belt promotion performed.
- Pending/ineligible user blocked; cross-role access blocked; sample cancelled/failed payment states clearly shown.

Unit/integration tests: API auth and roles, SQL migration/seed idempotency, admin state transitions, capacity concurrency, payment webhook replay, wrong payment totals, cross-dojo and external attendance aggregation, eligibility rule changes, notification deduplication, grading eligibility and invalid applications, private uploads. Include responsive browser smoke testing if browser support exists. **Capture real outcomes** in `docs/TEST_RESULTS.md`: command, result, date, blockers, screenshots if available.

## 10. Documentation, full source ZIP and team handoff

Inside generated project create:

- Root `README.md`: prerequisite Node version, SQL Server/SSMS configuration, exact database creation/migration/seed/run commands, ports, troubleshooting `fsdp_app` login failure, duplicate `.env` files, MSSQL encryption/trust cert local-dev setting, test credentials and Stripe webhook setup.
- `docs/ARCHITECTURE.md`, `docs/FEATURE_OWNERSHIP.md`, `docs/API_CONTRACTS.md`, `docs/DB_SCHEMA.md`, `docs/MIGRATIONS_AND_SEEDING.md`, `docs/DEMO_SCRIPT.md`, `docs/TEST_RESULTS.md`, `docs/BUSINESS_DECISIONS.md`, `docs/SOURCE_REGISTER.md`, `docs/PHOTO_ASSET_REGISTER.md`, `docs/TEAM_HANDOFF.md`.
- `docs/DEMO_SCRIPT.md` should be appropriate for nontechnical business judges, with one consistent fictional student's journey across roles and data.
- `scripts/package-handoff.mjs` or equivalent and root `npm run package:handoff`: generate a `FSDP-Student-Management-System.zip` containing all source, SQL migrations/seeds, env templates, docs, design references, test code and necessary assets, under the root `FSDP-Student-Management-System/` directory **without** `.env` credentials, production data, `node_modules`, private uploads, DB backups, `.git`, logs or generated caches. Validate the ZIP contents.
- Feature owner guide: explain which React feature folder, Express module folder, migrations, route mounting, dependencies and API contracts belong to each teammate; do **not** suggest that isolated file-copying always works. Warn of integration/migration conflicts and give a test checklist per module. See `TEAM_HANDOFF_AND_INTEGRATION.md`.
- `AGENTS.md` copied into the generated root so Codex instructions stay next to source.

All code is built in the personal workspace. **Do not commit, push, publish or deploy to GitHub**. No fake test-pass statements. Show the actual generated file tree and verified commands at the end.

## 11. Coding standards — mandatory

- Add **short, useful comments in simple English**, explaining *why* important business logic exists; especially eligibility, verified attendance, webhook and access controls. Do not comment every ordinary line.
- Use clearly named functions and variables. Keep functions focused, DRY/shared logic in correct layers. Where a line becomes long, break into 2–3 logical lines (or more if clearer) using proper formatting. Split multiline JSX attributes, conditions, SQL query fragments and service calls. Aim for ~80–100 characters/line where reasonable; use Prettier/ESLint consistency.
- Error messages are actionable. Protect against null/empty data and unexpected states. Never swallow errors or pretend success.
- Academic context: the uploaded coursework brief warns against submitting work not done by students. Leave clear implementation notes, test evidence and straightforward code that the team can review, adapt, explain and use in compliance with their course's AI and attribution rules.

**Begin by reading all input files, then create the project and implement the actual working system. Continue through integration, testing, documentation and ZIP generation, describing any blockers truthfully.**
