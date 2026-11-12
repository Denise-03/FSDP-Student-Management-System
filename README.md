# FSDP Aikido Student Management System — Windows Setup Guide

**Project:** `FSDP-Student-Management-System` (React/Vite frontend, Express backend, Microsoft SQL Server database).

> **Important:** Run setup on your **own development SQL Server/database**. Do not run seed or reset against a team's shared database with useful data. Do not send anyone your `backend/.env`, SQL passwords, Stripe keys or real documents.

## What the folders mean

```text
FSDP-Student-Management-System/
├── frontend/                     React/Vite website
├── backend/                      Express API and backend/.env.example
├── database/
│   ├── migrations/               Ordered SQL changes (001 through 004)
│   ├── seeds/                    Fictional test data
│   └── scripts/                  JavaScript migration, seed, verify, reset runners
├── package.json                  Commands to run from this folder
├── package-lock.json
└── README.md
```

**Do not manually execute all the SQL migration files in SSMS.** Create the database once in SSMS, then run `npm run db:migrate` from PowerShell. The runner applies migrations in order, tracks checksums in `fsdp_v5.Migrations`, and skips already-applied migrations.

## Step 1 — Install / check prerequisites

- **Node.js 22.12 or later**, with npm. A compatible LTS version is recommended.
- **Microsoft SQL Server Express or Developer** database engine, running locally.
- **SQL Server Management Studio (SSMS)** for managing/inspecting the database.
- **Microsoft ODBC Driver 17 for SQL Server** (or change `.env` if you have a different compatible driver).
- A **Windows account with sufficient permissions** to create `FSDPDevelopment` and its schema/tables.

Check in **PowerShell**:

```powershell
node -v
npm -v
Get-OdbcDriver | Where-Object { $_.Name -like '*ODBC Driver*SQL Server*' } | Select-Object Name
Get-Service -Name 'MSSQL*' | Select-Object Name, Status
```

The service name is often `MSSQL$SQLEXPRESS` if using SQL Server Express. A different instance name is fine; use *your own actual instance name* in Step 4.

## Step 2 — Extract the ZIP and open the root folder

1. Right-click `FSDP_Student_Management_System_Encoding_Fixed.zip` → **Extract All**.
2. Open VS Code → **File → Open Folder** → choose the extracted `FSDP-Student-Management-System` folder (the one with `package.json`).
3. Open **Terminal → New Terminal** (PowerShell).
4. Confirm your terminal is in the correct folder:

```powershell
Get-Location
Test-Path .\package.json
Test-Path .\backend\.env.example
```

Both `Test-Path` commands should return `True`.

## Step 3 — Create the database in SSMS

1. Open **SQL Server Management Studio**.
2. In **Connect to Server**, select **Database Engine**.
3. Enter **Server name** based on your installed SQL Server instance, e.g. `localhost\SQLEXPRESS` for a typical Express installation. If SSMS already connects with another name, use that exact working name.
4. Choose **Windows Authentication** and connect.
5. Click **New Query** and execute:

```sql
IF DB_ID(N'FSDPDevelopment') IS NULL
    EXEC(N'CREATE DATABASE FSDPDevelopment');
GO
```

6. Refresh **Databases** in Object Explorer. Confirm `FSDPDevelopment` appears.

If SQL Server or database creation fails, check the instance name, service, Windows permissions and whether the database already exists. You need a running **SQL Server database engine**, not only the SSMS application.

## Step 4 — Configure the backend connection (one `.env`)

From the **project root** in PowerShell:

```powershell
if (-not (Test-Path .\backend\.env)) {
    Copy-Item .\backend\.env.example .\backend\.env
}
notepad .\backend\.env
```

For the default Windows Authentication setup, use the following values, adjusting **DB_SERVER** and **DB_ODBC_DRIVER** if your computer differs:

```dotenv
PORT=4000
FRONTEND_ORIGIN=http://127.0.0.1:5173
DB_DRIVER=windows
DB_SERVER=localhost\SQLEXPRESS
DB_DATABASE=FSDPDevelopment
DB_ODBC_DRIVER=ODBC Driver 17 for SQL Server
DB_ENCRYPT=false
DB_TRUST_CERT=true
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PAYMENT_CONFIGURATION=
DEMO_REFERENCE_DATE=
NODE_ENV=development
```

The example file may also include `DB_USER=fsdp_app` and `DB_PASSWORD=`. **These are ignored when `DB_DRIVER=windows`**, because that mode uses your Windows login via `Trusted_Connection=Yes`. Do not try to create `fsdp_app` just to use the default Windows mode.

**Only `backend/.env` configures this API's database connection.** A root `.env` or a frontend `.env` will not replace it. Never commit the real `.env` file to Git or share it with the team.

If using **SQL authentication** instead, see the README's `DB_DRIVER=tcp` guidance; you must first create/configure the login and appropriate DB permissions. Do not use arbitrary credentials from another teammate.

## Step 5 — Install the project packages

Run **from the root folder**:

```powershell
npm install
```

Wait for completion. This installs the frontend, backend and root dependencies (including `concurrently`, Vite, SQL drivers and test tools).

If `concurrently is not recognized`, installation was incomplete or ran in the wrong folder. From the root, rerun `npm install` and check `npm ls concurrently`.

## Step 6 — Apply SQL migrations (creates schema and tables)

```powershell
npm run db:migrate
```

This automatically applies the migration files in `database/migrations/`:

- `001_prototype_schema.sql` — builds prototype tables, keys and constraints.
- `002_fixture_display_labels.sql` — fixes early demonstration labels.
- `003_approved_fixture_rank.sql` — fixes one approved-but-unpaid fixture's verified rank.
- `004_repair_mojibake_fixture_labels.sql` — fixes further corrupted demo labels.

All prototype tables are under the **`fsdp_v5` schema**, within the **`FSDPDevelopment` database**. This is not the same as `dbo`, so look in SSMS under `FSDPDevelopment → Tables` for entries beginning `fsdp_v5.`.

On success, you should see `Applied ...` lines for new migrations. On a subsequent run it may print fewer lines because applied migrations are skipped; that is normal. **Do not edit migrations that were already applied.**

## Step 7 — Add fictional demo data

```powershell
npm run db:seed
npm run db:verify
```

The seed populates demo users, centres, classes, bookings, attendance and grading rules.

Successful verification prints something like `SQL Server verification passed:` with counts. The exact future-class count can vary based on when the fixtures were first seeded.

**Note:** Running seed again is designed not to duplicate existing fixture data or overwrite user decisions. It also **does not update the dates** of already-existing fixtures. Do not reset a database that contains teammate work.

## Step 8 — Start the app

```powershell
npm run dev
```

Keep the terminal open. It starts two processes: Express on port 4000 and Vite on port 5173.

- **Frontend:** `http://127.0.0.1:5173/`
- **API health:** `http://127.0.0.1:4000/api/health`

A healthy API returns JSON including `"status":"ok"`, database `FSDPDevelopment`, schema `fsdp_v5`. Open the website using **127.0.0.1**, *not* `localhost`, because the project checks the exact frontend origin for login and session security.

Stop the local servers by focusing the PowerShell terminal and pressing **Ctrl+C**.

## Step 9 — Try the fictional test accounts

All accounts below use the **local-only demo password** `AikidoDemo!2026`:

| Role | Email | Use |
|---|---|---|
| Student | `jamie@fsdp.demo` | Active student, attendance and bookings |
| Student | `near@fsdp.demo` | Near grading eligibility |
| Student | `eligible@fsdp.demo` | Eligible grading candidate |
| Instructor | `instructor-central@fsdp.demo` | Central/West sessions and attendance |
| Instructor | `instructor-east@fsdp.demo` | East sessions |
| Admin | `admin@fsdp.demo` | Application reviews, payments, classes and reports |
| Applicant | `pending@fsdp.demo` | Pending membership approval |

Use separate browser profiles/private sessions for multiple roles, or log out between accounts.

## Step 10 — Verify the database in SSMS

In a new SSMS query window, run:

```sql
USE FSDPDevelopment;
GO
SELECT name, appliedAt FROM fsdp_v5.Migrations ORDER BY name;
SELECT COUNT(*) AS UserCount FROM fsdp_v5.Users;
SELECT TOP (12) email, role FROM fsdp_v5.Users;
SELECT TOP (10) id, name FROM fsdp_v5.Dojos;
SELECT COUNT(*) AS AttendanceCount FROM fsdp_v5.AttendanceRecords;
```

You should see the four tracked migration filenames after a fresh setup, seeded demo accounts, centres and attendance records. These queries **only read data**.

## Step 11 — Run code and browser tests (optional, recommended)

From the project root:

```powershell
npm run build
npm test
npm run e2e
```

## Common errors and fixes

| Symptom | What to check / do |
|---|---|
| `'concurrently' is not recognized` | Run `npm install` in the root containing `package.json`; check `npm ls concurrently`. |
| `Login failed for user 'fsdp_app'` | You may be using SQL auth (`DB_DRIVER=tcp`) or the wrong config. For default Windows mode use `DB_DRIVER=windows`; check `backend/.env` and your Windows login's permissions. |
| Database connection refused / cannot find instance | Check SQL Server service is running, SSMS server name matches `DB_SERVER`, installed ODBC driver name, firewall/instance configuration. |
| `ODBC Driver ... not found` | Run `Get-OdbcDriver` and install a supported driver or set `DB_ODBC_DRIVER` to the installed one. |
| `Invalid object name 'fsdp_v5....'` | Create `FSDPDevelopment` and run `npm run db:migrate` against the **same database** as `backend/.env`. |
| `403 Forbidden` when logging in | Open `http://127.0.0.1:5173/` rather than `http://localhost:5173/`. Set matching `FRONTEND_ORIGIN`; refresh/clear stale session. In DevTools → Network → login → Response, check for origin or CSRF errors. |
| Login says invalid credentials | Confirm `npm run db:seed` succeeded and use a listed fictional demo account/password. |
| `VITE ready` but website data is blank | Check API health, backend terminal logs, DB migration and browser Network errors. |
| Upcoming classes/attendance dates look wrong | Seed dates are anchored to the first seed. Use a **fresh, disposable** dev database for repeatable presentation testing. |
| Payments/real email do not work | Stripe hosted test Checkout needs test-mode keys and webhook setup. Real email transport is **not configured**; the app uses local in-app/outbox records. Neither is required for basic local browsing. |

## Do NOT do these without understanding the consequences

- **Do not run `npm run db:reset-demo` on a shared or valuable database.** It deletes prototype (`fsdp_v5`) records and reseeds; it is guarded by `CONFIRM_DEMO_RESET` but remains destructive.
- Do not run individual migration SQL files manually *and* then use the runner; this can cause tracking/conflicts.
- Do not modify applied migration files; add a new numbered migration for schema changes.
- Do not share or commit `.env`, SQL passwords, Stripe keys or real membership/student documents.
- Do not assume a running frontend means SQL Server is working: check `/api/health` and `npm run db:verify`.

## Setup completion checklist

- [ ] Node/npm, SQL Server engine, SSMS and ODBC driver installed.
- [ ] Project extracted and opened from root directory.
- [ ] `FSDPDevelopment` created in SSMS.
- [ ] Correct `backend/.env` for this PC.
- [ ] `npm install` completes.
- [ ] `npm run db:migrate` completes.
- [ ] `npm run db:seed` and `npm run db:verify` pass.
- [ ] `npm run dev` starts backend and frontend.
- [ ] `http://127.0.0.1:4000/api/health` returns OK.
- [ ] Student, instructor and admin can log in on `http://127.0.0.1:5173`.
- [ ] `npm run build`, `npm test`, and `npm run e2e` have been run and results recorded.