# Verification evidence

Verified on **10 November 2026, Asia/Singapore**, in the local Windows workspace.
Runtime: Node 25.4.0, npm 11.7.0, SQL Server Express, ODBC Driver 17, Microsoft Edge
headless through Playwright. No deployment, GitHub access or live payment operation.

| Command                         | Actual outcome                                                                                                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm install                     | Passed after replacing an incomplete generated node_modules folder and installing sequentially. Lockfile included.                                                                                              |
| npm run db:migrate              | Passed on FSDPDevelopment/fsdp_v5. Three tracked migrations; existing other schemas preserved.                                                                                                                  |
| npm run db:seed                 | Passed repeatedly. Base fixtures: 12 users, 3 centres, 22 sessions, 15 attendance rows, 7 rules. No duplicate fixture rows.                                                                                     |
| npm run db:verify               | Passed against real SQL Server. The base contains 12 users; retained fictional browser applicants add review records. Verified: 3 active centres, 15 upcoming sessions, 7 rules, 15 fixture attendance records. |
| npm run build                   | Passed. Vite 7.3.8 compiled the production React app; approximately 324 kB JS / 100 kB gzip and 15 kB CSS / 4 kB gzip.                                                                                          |
| npm test                        | **17 passed, 0 failed, 0 skipped**. Real Express requests and SQL Server transactions, not an in-memory substitute. Latest full run about 4.7 seconds.                                                          |
| npm run e2e -- --max-failures=1 | **6 passed** using real local frontend/API/SQL, latest full run 19.9 seconds. Desktop 1440px and phone 360px; screenshots included.                                                                             |
| npm audit --omit=dev            | Passed, zero known vulnerabilities in installed runtime dependencies. Full install audit also reported zero after removing the unnecessary archiver dependency.                                                 |

## SQL-backed scenarios

1. Migration and seed idempotency.
2. Public guest catalogue and unauthenticated admin rejection.
3. Applicant-only registration, duplicate email and booking/admin denial.
4. CSRF rejection, valid session resume and logout invalidation.
5. Persisted draft, genuine synthetic PDF upload, invalid file rejection and admin-only download.
6. Requested-change reason validation and corrected resubmission.
7. Atomic repeated approval: one charge/membership, unpaid member still blocked.
8. Provider adapter prices from stored charges and retries using stable idempotency key.
9. Bad signature, wrong amount, live event and redirect-query attempts do not activate.
10. Signed synthetic asynchronous pending-to-success event, replay and late-event handling.
11. Persistent bookings, duplicate/overlap, age/rank and inactive-session rejection.
12. Concurrent one-seat capacity race: one 201, one 409; explicit waiver stays waived.
13. Assigned attendance across two centres, no future/unbooked/wrong-instructor marking,
    repeated save without inflation and audited absent/present correction.
14. Unverified external event excluded; verified event included once; duplicate rejected.
15. Attendance changes readiness; one eligibility notice; changed stored rule takes effect.
16. Unique/open-window grading application, attributed signature, assessment-time check,
    recorded recommendation and unchanged belt.
17. Own notifications/profile invariants, instructor scope and admin-only reports.

The integration suite sets isolated temporary fixtures into historical time to exercise
attendance/assessment without waiting for real future classes. That setup is test-only
SQL, limited to its unique test IDs. The application exposes no bypass for future
attendance or grading assessment. Test users/classes are removed afterwards; browsers
retain clearly fictional form submissions for manual review.

## Browser coverage

All 29 design concepts are represented: ten public/auth screens, enrolment and status,
nine student views, four instructor views and four admin views. Additional admin
management/payment and student payment/result routes are implemented. Browser tests
visit every reference concept, complete registration and the four-step application,
confirm refresh persistence, preserve intended session selection, check role guards,
inspect private document review links and confirm whole-page mobile overflow is absent.

Screenshots: home-desktop.png, home-mobile.png, student-mobile.png in docs/screenshots.
The local licensed JPEG was decoded and verified as 1024 x 683 before use. Author,
licence, illustrative context and official-logo limitation are documented in the asset
register and UI footer. No generated person is presented as an ASK member.

## Failures found and corrected

- Initial overlapping dependency installations caused generated-file conflicts; the
  isolated node_modules tree was replaced and dependencies installed sequentially.
- An admin monthly report referenced a missing createdAt column. It now groups the
  persisted submission/update timestamp; the failing integration scenario then passed.
- Mobile grid min-content sizing expanded the page beyond 360px. Sidebar/review/main
  tracks now shrink correctly, with intentional horizontal navigation only.
- Windows PowerShell pipe encoding damaged punctuation and test selectors. UTF-8
  source was repaired using explicit character codes; tests select stable action words.
- Missing photo downloads returned HTTP 429 from Wikimedia. The verified original
  Flickr source was available; the actual licensed image is included and no placeholder
  or broken photo is used in the final app.
- Final seed review found an approved-but-unpaid fixture still had an unverified rank.
  Migration 003 and corrected seed logic align that fictional fixture with approval.

## External-service and environment limits

**Hosted Stripe Card and PayNow not verified.** No local test key or webhook forwarding
was supplied. The connector exposed only a live account, which was not used. Checkout
SDK calls were tested with a provider stub; webhook signature verification used a
synthetic signing secret and synthetic test-mode events over the actual Express route.
Those tests prove local validation/idempotency/database behavior, not that a real Stripe
account accepted a payment or offered PayNow. No live funds or real bank payment.

**Real email not tested or sent.** Notifications and development-outbox rows persist;
no SMTP/API transport credentials were supplied or delivery claimed.

**Official emblem permission pending.** Accessible text branding is used. The original
AGENTS.md was supplied after the initial build and has now been read in full and
included verbatim, replacing the placeholder. Optional Figma comparison was not
performed. This reconciliation changed instructions and documentation only; existing
application test results remain applicable. The updated source ZIP was regenerated
and validated for integrity, manifest hashes and excluded runtime/secrets files.

The explicit destructive demo reset was not executed on retained review data. Its
confirmation and NODE_ENV guards are documented; migrations/seeding and core journeys
were exercised against the real database. This is a local coursework prototype, not
an assertion of production readiness or final promotion administration.

## Source archive

npm run package:handoff successfully created and validated the source ZIP. The archive
contains 114 source/document/asset files plus HANDOFF_MANIFEST.json under one explicit
FSDP-Student-Management-System/ root. Validation checks ZIP integrity, required files,
SHA-256 content hashes and exclusions for .env credentials, uploads, node_modules,
build output, caches, browser traces and logs. The archive is about 2 MB.

Final UI review also aligned recommended class lists with the student's verified rank
and age at the scheduled session, with API validation still authoritative. The browser
suite asserts that the adult fixture is not offered children-only sessions.
