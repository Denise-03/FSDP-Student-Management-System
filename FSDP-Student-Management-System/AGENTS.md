# Codex instructions — FSDP Aikido standalone build

- The current workspace is `FSDP_Personal`, a personal workspace. **Work only inside the newly created child folder `FSDP-Student-Management-System/`.** Read input files in the parent, but do not modify unrelated files.
- Build from scratch. **Never clone, open, search, edit, commit to or push to the team's private repository.** Do not require an existing codebase.
- Primary specification: `CODEX_MASTER_BUILD_FROM_SCRATCH_V5.md`. Read `references/Industry_Problem_Statement.pdf`, `references/Assignment_1_Brief.pdf`, `references/Assignment_1_Target_Features.docx`, `design-reference/01_DESIGN_SPECIFICATION.md`, and `design-reference/visual-reference.html`.
- Technology: React + Vite + React Router, Node.js + Express, Microsoft SQL Server DB `FSDPDevelopment` via `mssql`; Stripe **test mode** for eligible Card and PayNow payments. Use package versions compatible with the local Node runtime.
- Put feature-specific code in `frontend/src/features/<feature-name>/` and `backend/src/modules/<feature-name>/`. Centralize shared layouts, authorization, database pool, configuration and audit logic.
- Business logic and writes are server-side and persist to SQL Server. Never claim success based only on local React state. Seed fictional demo users, classes, transactions and attendance.
- **Coding style:** short comments in simple English explaining *why* non-obvious code is needed, especially attendance, grading and payments; descriptive names; consistent formatting; split long statements, SQL, JSX props and conditions into readable multiline blocks, normally about 80–100 characters per line. Avoid repetitive or inaccurate comments.
- Secure practice: parameterized SQL, role authorization on server, safe uploads, hashed demo passwords, no plaintext payment cards, no real Singpass/NRIC, environment secrets never in repo or ZIP.
- Make all the pages responsive and the entire journey testable. Add explicit loading, error, empty, confirmation and status states.
- Verify with actual commands and tests. Record what ran and the result. If unavailable credentials/services prevent live tests, say so and create honest mocked-provider tests; never invent a successful Stripe/PayNow transaction.
- Preserve provenance of public facts and image permissions in `docs/SOURCE_REGISTER.md` and `docs/PHOTO_ASSET_REGISTER.md`.
- Package a clean source ZIP to share locally, but **do not** send to GitHub or publish automatically.
