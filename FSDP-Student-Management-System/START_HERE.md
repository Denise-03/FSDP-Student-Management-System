# START HERE — FSDP Aikido fresh build in VS Code

**Goal:** Ask Codex to create a brand-new, runnable full-stack prototype inside `FSDP_Personal/FSDP-Student-Management-System/` without reading, cloning, changing or committing to the team's private GitHub repo.

## The simplest Windows VS Code workflow

1. Open **VS Code → File → Open Folder** and select your existing `FSDP_Personal` folder. The screenshot from your chat showed that folder open and empty; that is acceptable for a new build.
2. Extract **all contents of this ZIP directly into `FSDP_Personal/`**. Check that `CODEX_MASTER_BUILD_FROM_SCRATCH_V5.md`, `AGENTS.md`, `design-reference/` and `references/` appear directly under `FSDP_Personal/` (not hidden under another ZIP folder).
3. Complete the Codex sign-in/onboarding if necessary. Codex must be granted permission to edit files and run commands in this *local* workspace. It does **not** need private GitHub access.
4. The `references/` folder also contains `_EXTRACTED.md` readable copies of the uploaded PDF/Word requirements. Paste into Codex:

   > Read `AGENTS.md` and `CODEX_MASTER_BUILD_FROM_SCRATCH_V5.md` in full, including all referenced files. Create the complete working FSDP Aikido project **from scratch in a new child folder `FSDP-Student-Management-System/` inside my current `FSDP_Personal` workspace**. Do not clone, open, modify, commit or push to our team's GitHub repository. Implement the actual React frontend, Express backend, Microsoft SQL Server migrations and seeded fictional demo data. Include the additional admin enrolment dashboard, approved-photo design, card/PayNow Stripe test integration where available, role-based workflows and real database persistence. Run the app, tests and demo scenarios; fix errors; package the deliverable as a source ZIP with no secrets or node_modules. Follow our short simple-English comments and readable multiline formatting rules. Report what passed, what was blocked and how to run it. **Do the implementation rather than merely preparing a plan.**

5. Codex should create a **second folder** under this workspace: `FSDP_Personal/FSDP-Student-Management-System/`. The reference documents are input; don't mistake them for a completed application.
6. To verify functionality: configure your SQL Server connection and Stripe **test** credentials (if available) in locally created `.env` files; run database migrations/seeds, backend, frontend and tests per the generated README. No real card details/real identity uploads in the demonstration.
7. Codex must provide a `FSDP-Student-Management-System.zip` source ZIP, excluding `.env`/secrets, `node_modules`, logs and user uploads. Give this to teammates only after the team has reviewed the run instructions and confirmed the main journeys.

## Things Codex cannot magically supply

- Access to the team's private repository (not requested).
- Real organisation photos or logo ownership permission; approved originals should be supplied by your team or partner.
- Actual private membership records or student data. Use fictional fixture data.
- A successful **hosted** Stripe/PayNow payment without a configured Stripe **test** account, eligible payment methods and webhook endpoint.
- A claim that an end-to-end SQL Server or Stripe test passed if it was never run.

## Important coursework note

The uploaded Assignment 1 handout warns against submitting work not done by students. Your team should follow the school/tutor's rules on AI assistance, understand and substantively develop/review the code, document contributions and test results, and not present unreviewed AI output as their own work. This package is a development specification, not proof of a completed assignment.
