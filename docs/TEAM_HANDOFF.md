# Team handoff

This is an independent source tree. No private GitHub repository or teammate source
was read or used. No commits, pushes, remote builds or deployments were made.
The ZIP root is FSDP-Student-Management-System and includes a SHA-256 manifest.

Start with README, FEATURE_OWNERSHIP, API_CONTRACTS and DB_SCHEMA. Verify npm install,
db:migrate, db:seed, db:verify, build, test and e2e in a local review checkout first.
Keep backend/.env local. Required environment keys are in the templates. The lockfile
pins actual packages; optional msnodesqlv8 is the Windows integrated-auth transport.

Each proposed feature owner reviews the frontend feature folder, matching backend
module, shared dependencies, mounted routes, migration graph, seed fixtures and tests.
Do not copy a single page and assume the feature will function in another repository.
Reconcile the target project's framework/router conventions, shared API client,
role/CSRF middleware, SQL schema and data contracts before integration. A teammate can
later use a reviewed feature branch and PR manually; this agent did not access it.

One person should coordinate numbered migrations and shared API contracts. Avoid editing
an already-applied migration; use a new version. fsdp_v5 deliberately avoids collisions
with existing FSDPDevelopment objects; migrate/reconcile explicitly if the team uses a
different schema. Never overwrite an existing production/team schema with demo reset.

## Per-module review checklist

- Authentication/profiles: applicant role only, bcrypt, session/logout persistence,
  CSRF and immutable verified fields. No password hash in responses.
- Enrolment/admin: draft/resubmission/reasons, private PDF authorization, repeated
  approval, one membership/charge, payment-before-activation and audited waiver.
- Classes: correct age/rank, expiry and consent, capacity races, duplicate/overlap,
  future availability, cancellation and instructor/centre assignment.
- Attendance: correct assigned roster, no future marking, present/absent correction,
  unique session counting, cross-centre totals and external verification.
- Readiness/grading: persisted thresholds, verified rank/time/age/membership, explainable
  gaps, deduplicated notice, current application window and duplicate prevention.
- Assessment: assigned grading instructor, event start, signature attribution, computed
  rank duration, immutable signed record and no promotion side effect.
- Payments: test keys only, authoritative server amounts, signed raw-body webhook,
  asynchronous pending/success/failure/expiry and replay/no-regression; real hosted
  Card/PayNow must still be checked using the team's configured test account.
- Dashboard/notifications: own/assigned scope, persistence, loading/empty/error feedback,
  cross-centre engagement and development outbox labels.
- UI: all 29 concepts, mobile 360px/desktop, keyboard labels, no whole-page overflow,
  official branding permission and included CC photo attribution.

The original AGENTS.md was supplied after the initial build, read in full and copied
verbatim into the project. Its instructions match the implemented requirements and
boundaries; the placeholder has been replaced. The latest DOCX reviewer allocation
differs from FEATURE_MODULE_TREE for two features;
FEATURE_OWNERSHIP documents the discrepancy rather than attributing generated work.

The coursework brief warns against submitting work not done by students. Treat this
as AI-assisted prototype source: understand, review and adapt it, document actual
contributions, follow tutor rules and explain the implementation and test evidence.
