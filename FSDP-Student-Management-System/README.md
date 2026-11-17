# FSDP Aikido Shinju-Kai student management prototype

A standalone Assignment 1 prototype built from the supplied requirements: React 19/Vite,
Node.js/Express 5 and Microsoft SQL Server **FSDPDevelopment**. All 29 design concepts have
live routes; additional administration and payment pages complete the workflow.
No team repository was inspected or used, and nothing was committed, pushed or deployed.

## Run on Windows

Prerequisites: Node.js 22.12+ (tested with 25.4.0), npm, SQL Server Express or Developer,
Microsoft ODBC Driver 17 for SQL Server, and a Windows login allowed to create objects
in FSDPDevelopment. Python 3 is needed only for the ZIP command.

```powershell
cd FSDP-Student-Management-System
npm install
Copy-Item backend/.env.example backend/.env
# Edit backend/.env if your SQL Server instance differs.
npm run db:migrate
npm run db:seed
npm run db:verify
npm run dev
```

Open **http://127.0.0.1:5173**. API: **http://127.0.0.1:4000/api/health**.
Use 127.0.0.1 consistently for cookie/origin handling. The API binds to loopback only.
Vite proxies /api to Express. Stop both development servers with Ctrl+C.

The default Windows connection is `localhost\SQLEXPRESS` using integrated authentication
through one mssql/msnodesqlv8 pool. No database password is required for that mode.
If FSDPDevelopment does not exist, create it once in SSMS using:

```sql
IF DB_ID(N'FSDPDevelopment') IS NULL
  EXEC(N'CREATE DATABASE FSDPDevelopment');
```

All prototype objects live in **fsdp_v5**, preserving unrelated schemas and tables.
Migrations are ordered, checksum tracked and transactional. Startup never resets data.
For Linux or SQL authentication, set DB_DRIVER=tcp, DB_SERVER to the host,
DB_USER/DB_PASSWORD to a local app login, and configure encryption/certificate settings.
The optional Windows driver can be omitted on non-Windows systems.

## Fictional development accounts

Every fixture below uses **AikidoDemo!2026**. These are local development accounts,
not real people or production credentials. Passwords are stored as bcrypt hashes.

| Email                        | Demonstration                                            |
| ---------------------------- | -------------------------------------------------------- |
| admin@fsdp.demo              | Membership review, reports, classes, fees, grading rules |
| instructor-central@fsdp.demo | Mei Chen, Central and West classes; assessments          |
| instructor-east@fsdp.demo    | Daniel Wong, East classes                                |
| pending@fsdp.demo            | Alex Tan, pending review; private synthetic PDF          |
| changes@fsdp.demo            | Morgan Koh, changes requested                            |
| payment@fsdp.demo            | Riley Teo, approved but unpaid                           |
| draft@fsdp.demo              | Taylor Goh, draft                                        |
| rejected@fsdp.demo           | Casey Ong, rejected                                      |
| jamie@fsdp.demo              | Jamie Lim, active, cross-centre training and assessment  |
| near@fsdp.demo               | Sam Lee, one verified session from eligibility           |
| eligible@fsdp.demo           | Jordan Ng, eligible; grading assessment candidate        |
| ineligible@fsdp.demo         | Chris Low, insufficient sessions and time in rank        |

Guest booking remembers the selected session for 24 hours in sessionStorage through
registration/login. Application drafts, memberships, bookings, attendance, notifications
and payments are stored in SQL Server. Each role has server-enforced access controls.

## Commands and verification

```powershell
npm run build
npm test
npm run e2e
npm run package:handoff
```

The browser suite uses installed Microsoft Edge by default. Else set BROWSER_CHANNEL=chrome
or install Playwright Chromium and set BROWSER_CHANNEL=chromium. It starts local servers
when needed and records evidence under docs/screenshots. See docs/TEST_RESULTS.md for
actual runs and the distinction between provider stubs and hosted payments.
The ZIP is written beside the project folder and contains a SHA-256 source manifest.
It excludes secrets, private uploads, node_modules, dist, caches, logs and test traces.

## Stripe test Checkout and PayNow

Hosted Checkout is implemented but **not externally verified** in this build: no local
test API key or webhook forwarding was supplied. The connected account exposed live
mode only and was not used for payment operations.

Set a minimally scoped test restricted key (`rk_test_...`) or test secret key in
backend/.env as STRIPE_SECRET_KEY. Never use a live key. Enable Card and PayNow in your
Stripe **test/sandbox** payment-method settings. Checkout uses SGD one-time amounts
from persisted charges and dynamic eligible payment methods. No fake QR is generated.
Optionally set STRIPE_PAYMENT_CONFIGURATION to the appropriate test configuration.

Run Stripe CLI forwarding locally:

```powershell
stripe listen --forward-to http://127.0.0.1:4000/api/payments/webhook
```

Put its signing secret into STRIPE_WEBHOOK_SECRET and restart the backend. Handle
checkout.session.completed, checkout.session.async_payment_succeeded,
checkout.session.async_payment_failed and checkout.session.expired.
Only a valid signed test webhook with matching attempt, charge, currency and amount
can confirm payment. The return page only reads server state. PayNow availability
depends on account eligibility; use Stripe's generated test QR and authorise/fail on
its test page. Do not scan a test QR as a live payment.

Without test credentials, membership can be demonstrated using a clearly documented
admin fee waiver in Payment overview. This is recorded as **waived**, never paid.

## Troubleshooting and constraints

- SQL login failure for fsdp_app: Windows mode uses your Windows account, not fsdp_app.
  For tcp mode create/configure the app login yourself in SSMS, grant the prototype
  schema permissions needed, and verify SQL authentication and TCP/IP are enabled.
  Do not change existing teammate credentials or grant unrestricted production rights.
- Native-driver errors: use an LTS Node release with a compatible msnodesqlv8 build
  and the named ODBC driver, or switch to tcp mode. No alternative database is used.
- Backend reads **backend/.env only** using an absolute path. A root .env or duplicate
  frontend .env does not configure SQL or Stripe. Frontend secrets are never needed.
- Encryption: DB_ENCRYPT=false / DB_TRUST_CERT=true are local-development examples.
  Use validated certificates and encryption outside local development.
- Browser 403: use http://127.0.0.1:5173, refresh for a current CSRF token, and check
  FRONTEND_ORIGIN. Login endpoints are rate limited.
- Evidence: maximum three PDFs, 2 MB each; files are private and admin download only.
  Use synthetic PDFs only. File signature checks are not production malware scanning.
- Email is a persisted **development outbox**, with no external transport configured.
  The system does not claim a real email was delivered.
- Prices, centres, schedules and grading thresholds are labelled demonstrations.
  Official logo permission is pending. A licensed illustrative photograph is included
  with attribution; it does not depict ASK members. See the source and asset registers.
- Reseeding does not overwrite user actions or duplicate fixtures. Dates are relative
  to the first seed. To generate a fresh presentation fixture use the explicit
  development reset documented in docs/MIGRATIONS_AND_SEEDING.md.

Read docs/DEMO_SCRIPT.md for the walkthrough, docs/TEAM_HANDOFF.md for integration,
and docs/BUSINESS_DECISIONS.md for scope assumptions. The team must review, adapt,
understand and attribute AI-assisted work according to the tutor's coursework rules.
