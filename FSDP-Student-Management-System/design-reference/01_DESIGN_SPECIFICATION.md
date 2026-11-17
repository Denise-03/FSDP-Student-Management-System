# AIKIDO SHINJU-KAI — FSDP ASSIGNMENT 1
## Visual design system, 29-page blueprint and user journeys

**Purpose:** a high-fidelity *design reference* for Codex to implement as a working, mobile-first full-stack web system. The companion `visual-reference.html` shows every screen. It is only a visual/navigation preview; it does **not** provide real authentication, APIs, uploads, notifications, attendance persistence or SQL Server operations.

**Primary users:** public visitors, applicants, approved students, instructors. **Supporting role:** membership admin for controlled application verification and centre summaries.

**Based on:** the user-provided *Centralised Student Management System* problem statement, *Assignment 1* brief, *FSDP Features for Assignment 1 target* document, and the official Aikido Shinju-Kai public website. The provided documents are the source of truth for functional scope. Designs, interactions, exact component architecture, sample names and dashboard numbers are *proposals or demo fixtures*, not verified existing features.

## 1. Product positioning and brand

One product, not three unrelated sites:

1. **Public site** — welcoming organisation website, searchable classes and training centres, clear grading/fees information.
2. **Digital enrolment** — create account, upload appropriate training evidence, acknowledge waiver, track application review.
3. **Student portal** — book classes, see verified attendance across dojos, track membership, eligibility, notifications and grading applications.
4. **Instructor portal** — own rosters, attendance verification, student trends, grading assessment.
5. **Admin portal** — new-member verification, membership records and cross-centre reports (no final belt promotion approval).

### Official logo

Use the actual organisation emblem at: `https://aikidoshinjukai.com.sg/images/logo.png`

The design-preview HTML references this HTTPS URL. For the real app, download a locally hosted copy **only with the organisation's permission**, keep the aspect ratio, show appropriate alt text (`Aikido Shinju-Kai`) and avoid redrawing/replacing the emblem. If permissions or loading fail, preserve an accessible text wordmark until an approved official asset is provided. Do not imply the Assignment 1 prototype is an official production deployment.

### Visual tokens

| Token | Proposed value | Usage |
|---|---|---|
| Navy | `#102B49` | Header, sidebar, primary buttons, headings |
| Deep navy | `#071C32` | Dark hero/footer |
| Red | `#D72F3B` | Join/submit primary CTAs and accents; do not use as sole status cue |
| Background | `#F4F6F9` | Dashboard background |
| Surface | `#FFFFFF` | Cards, forms |
| Border | `#E4E9EF` | Separators |
| Text | `#182B3D` | Main content |
| Secondary text | `#708094` | Secondary labels |
| Green | `#087D50` | Verified, active, eligible |
| Warning | `#A05C16` | Pending/review needed |
| Corner radius | `9–14px` | Inputs, cards, buttons |
| Mobile target size | at least `44×44px` | Main actions |

Typography: clear sans-serif (system UI/Inter as available). Use large editorial hero copy on public pages; tighter, scannable information hierarchy on dashboards. Photos should show authentic Aikido training where licensed/approved. Avoid random martial-arts imagery that misrepresents the school. Maintain keyboard access, focus visibility, colour contrast, labels and descriptive validation messages.

Responsive layout: **360–430px** phone (one-column, compact header, card lists, bottom portal navigation), **768px** tablet (two columns where appropriate), **1280–1440px** desktop (full header and persistent role sidebar, 3/4-column cards). Data tables on phones should become cards where possible, or scroll horizontally with a visible affordance.

## 2. Complete screen inventory (29 screens)

All `visual-reference.html` screens are navigable from the left gallery and have a Desktop/Mobile toggle. The implementation routes below are suggested and may be adjusted to the current repo conventions.

| # | Screen | Proposed URL | Role | Appearance and primary UI |
|---|---|---|---|---|
| 01 | Homepage | `/` | Guest+ | Official emblem, editorial navy hero, prominent "Explore Classes" and "How to Join", class cards, benefits, journey timeline |
| 02 | About Aikido | `/about` | Guest+ | Clean history/mission panels, training philosophy, instructor and organisation context |
| 03 | Explore Classes | `/classes` | Guest+ | Search and filters, adult/children/mixed/weapons/advanced cards, available sessions from API |
| 04 | Class Details | `/classes/:classId` | Guest+ | Big class overview, requirements, instructors, dojo/schedule/seat availability, "Book Class" CTA |
| 05 | Dojo Finder | `/dojos` | Guest+ | Location filters, cards with addresses and status, links to training sessions, closure warnings |
| 06 | Grading & Belts | `/grading-info` | Guest+ | Belt progression visual, official criteria explanation, preparation steps, non-promotional messaging |
| 07 | Membership Fees | `/fees` | Guest+ | Membership vs training fees, conditions, join CTA; database-driven prices |
| 08 | How to Join | `/how-to-join` | Guest+ | 5-step join process, waiver explanation, principal dojo selection, registration CTA |
| 09 | Sign In | `/login` | All accounts | Branded centred sign-in, forgot password, return-to-class behavior, accessible errors |
| 10 | Create Account | `/register` | Guest | Name, email, password/confirm, duplicate email validation; creates **account**, not approved student |
| 11 | Membership Application | `/enrolment` | Applicant | Multi-step personal/guardian/training/dojo/evidence/waiver form; save progress and review before submit |
| 12 | Application Status | `/enrolment/status` | Applicant | Pending/changes requested/approved/rejected status timeline, resubmit changes, notifications |
| 13 | Student Dashboard | `/student` | Approved student | Member card, next class, verified sessions, cross-dojo count, grading tracker, recent notices |
| 14 | Book Classes | `/student/classes` | Approved student | Availability filters, suitable class cards, one-click booking, conflicts/full/eligibility messages |
| 15 | My Bookings | `/student/bookings` | Approved student | Upcoming bookings, cancellation constraints, history, stable after refresh |
| 16 | Attendance History | `/student/attendance` | Approved student | Per-dojo verified sessions timeline/list, present/absent, total qualifying count |
| 17 | Grading Readiness | `/student/grading-readiness` | Approved student | Current/target belt, completed/required sessions, time in rank, missing requirements, progress tracker |
| 18 | Grading Applications | `/student/grading-applications` | Approved student | Upcoming grading sessions, apply if eligible, block duplicates, confirmation/status |
| 19 | Notifications | `/student/notifications` | Approved student | Enrolment, booking, attendance, eligibility and application notifications/read state |
| 20 | Membership & Payments | `/student/membership` | Approved student | Membership info, renewal/status, invoice/transaction history, payment states clearly labelled |
| 21 | My Profile | `/student/profile` | Approved student | Contact/preferences/principal dojo/belt, immutable verified fields, save confirmation |
| 22 | Instructor Dashboard | `/instructor` | Instructor | Assigned classes, today's attendance tasks, student readiness trends, assessment alerts |
| 23 | Class Attendance | `/instructor/classes/:sessionId/attendance` | Assigned instructor | Mobile-friendly roster, present/absent buttons, save or re-edit, duplicate prevention |
| 24 | Student Progress | `/instructor/students` | Assigned instructor | Search assigned students, aggregate qualifying sessions, indicators for near eligibility/decline |
| 25 | Grading Assessments | `/instructor/assessments` | Authorised instructor | Grading candidates, result and feedback, time in rank, signed submission for processing |
| 26 | Admin Dashboard | `/admin` | Membership admin | Pending review count, new memberships, centre summary, action queue |
| 27 | Application Reviews | `/admin/enrolments` | Membership admin | Search/filter queue, applicant detail & restricted evidence, approve/reject/request changes, audit trail |
| 28 | Membership Records | `/admin/members` | Membership admin | Search student/member number, active/pending statuses, verified belt, assigned principal dojo |
| 29 | Centre Reports | `/admin/reports` | Membership admin | Cross-dojo attendance + registration summaries, low attendance indicators, trend charts |

**Note:** Early conversation called this 28 pages; detailed enumeration totals **29** because class booking and booking history are separate student screens. Use 29.

## 3. Required end-to-end stories and exact navigation

### A. Guest → registered applicant → approved student

1. Guest visits `/` and navigates `/classes`, `/dojos`, `/grading-info`, `/fees` without login.
2. Guest views `/classes/:id` and clicks **Book this class**.
3. App stores **intended class/session ID server-side or in securely managed short-lived pending flow**; presents sign-in and link to registration.
4. New guest signs up. Creating an authentication account does **not** mark membership active.
5. After registration, applicant completes `/enrolment`: personal contact, training history, desired principal dojo, optional *safe* supporting document, relevant guardian info for minors, waiver acknowledgment, confirmation.
6. Server validates and saves an application with `pending_review`; app shows `/enrolment/status` and an in-app confirmation.
7. Admin opens `/admin/enrolments`, checks form and limited accessible documents, chooses **approve**, **request changes** (with reason), or **reject** (with reason). Every decision is audited.
8. Approval transaction creates/activates student profile, generates unique member ID, attaches verified/default belt and principal dojo, creates notification; prevents duplicate member creation.
9. Student sees updated status and may now confirm original desired booking (capacity/age/belt/time restrictions still checked). A rejected or pending applicant cannot book.

### B. Approved student → cross-dojo verified attendance

1. Student books suitable classes at their principal dojo and another eligible dojo.
2. Booking is persisted and appears on the assigned instructor's roster.
3. Instructor marks `present`/`absent` for the correct class session; only verified `present` counts where required.
4. Backend writes a unique attendance record keyed to **session + student**, with instructor ID, dojo, timestamp, change audit.
5. Student sees consolidated verified attendance from all dojos, and total training/qualifying sessions are recomputed without duplicate counts. Repeated save must not add sessions.
6. Instructor dashboards show full relevant progression and low-engagement indicators across dojos.

### C. Training → eligibility → notification → grading application → assessment

1. Grading rules are stored in SQL Server per age group/grade transition, including qualifying-session minimums, minimum time at rank and other applicability conditions.
2. When verified attendance changes, backend recalculates readiness using the authoritative DB data.
3. Student sees current grade → target grade, counted sessions, requirement gaps, precise status and explanation.
4. When readiness becomes eligible, create a deduplicated in-app notification; optional email if transport configured.
5. Eligible student sees upcoming events within the application window and submits **one** valid application; duplicates/ineligible submissions blocked by server.
6. Instructor accesses assigned candidate, records assessment result/time-in-rank/feedback, signs and submits record. Final promotion approval is not implemented in Assignment 1 (out of scope).

### D. Student missing sessions

Instructor dashboard flags low attendance using configurable *recent verified attendance* logic; give appropriate reminder/notification. Do not treat training at another dojo as inactivity. Never automatically shame students or send arbitrary reminder spam.

### E. Returning student

Applicant supplies previous school/dojo experience and optional legitimate evidence. Previous belt is a **claim** until reviewed; approved student grade is verified by the appropriate authority. Allow request-for-changes flow, not automatic previous-grade acceptance.

## 4. Roles and security

- **Guest:** browse public catalogue only; can create account.
- **Applicant:** authenticated account; enrolment draft/submission/status; no class booking or student-only resources until approved.
- **Student:** own membership, bookings, attendance, grading, notifications and payment history only.
- **Instructor:** assigned classes, enrolled students in own classes, aggregated student training needed for instruction, assigned grading assessments; **no unrestricted private application uploads**.
- **Admin:** enrolment approval/member management/reporting with least-privilege audit; **not** a final belt promotion approval workflow.

Enforce roles on the **Express API** and SQL queries, not only by hiding React menu items. No sensitive uploaded docs in public URLs. Secure authorization, content-type/size validation, controlled storage, encryption/access rules as appropriate, audit metadata. For the assignment demo use fake/redacted documents; **do not solicit or use real Singpass PDFs, NRIC, passports, medical records or other high-risk personal material.** If actual identity verification were needed in production, confirm PDPC/Membership requirements and implement official consent-based workflows separately.

## 5. Business-friendly visual flow

**Scene 1: Discovery** — Start public Home on mobile. Open Dojo Finder, Classes, the Adult class details. Press Book Class.

**Scene 2: Digital enrolment** — Explain sign-in/register, show online multi-step application, prior training field, uploaded synthetic evidence, waiver, application status.

**Scene 3: Administrative approval** — Switch role to Admin, review application, approve, demonstrate instant student status and notification.

**Scene 4: Student training** — Switch to Student; book two suitable sessions at different dojos; show instructor roster updating.

**Scene 5: Innovation** — Switch to Instructor; verify attendance. Switch to Student; show combined attendance, automatically updated grading readiness and eligibility notice.

**Scene 6: Grading** — Eligible student selects grading session and applies; instructor records and submits assessment without doing out-of-scope belt promotion.

Show the **same student and connected records** throughout. Never reset numbers between screens or use inconsistent fixture IDs.

## 6. Scope / implementation caveats

- *Assignment 1* emphasizes challenge fit, innovation, business usability, technical effort and presentation. The prototype must **work end-to-end**, not only look good.
- Original scope includes registration, enrolment, payment integration, attendance, grading progression, notifications and instructor assessment. It explicitly excludes detailed administration and promotion approvals; this blueprint adds **limited membership verification administration** needed to make student enrolment real.
- Official public rules for 2026 may change. Treat the site as a source of initial seed/reference data, document its date, and allow configuration. Demo student counts (e.g., `20/20`) illustrate UI only and are **not universal belt requirements**.
- Payment integration: support Stripe **test mode** only when developer test credentials are available; verify payment on backend/webhook. If no test credentials, keep correct Pending/Unpaid states and do not fabricate payment success. Include a transaction history and admin-recorded demo payments if feasible.
- Automated emails: send through configured transport if available; always persist in-app notifications. If no SMTP/API credentials, create a test outbox and explain clearly.
- Reuse and improve the team's current Figma/project where accessible. Maintain consistent navy/white look, do not overwrite team code casually.

## 7. Acceptance / visual quality checklist

- [ ] All 29 routes/screens exist, are responsive and have no dead end.
- [ ] Official logo appears with permission on public header and portals, correctly proportioned.
- [ ] Public pages work without login; only privileged actions are gated.
- [ ] Mobile 360–430px has no horizontal overflow except intentionally scrollable tables.
- [ ] Application changes and booking selection survive refresh and navigation as appropriate.
- [ ] A complete admin approval updates membership and notification in real DB.
- [ ] Instructor only sees assigned classes; attendance persists and is duplicate-safe.
- [ ] Cross-dojo count is accurate and linked to verification.
- [ ] Eligibility is explained and recalculated from stored rules; not determined by a hardcoded UI progress bar.
- [ ] Ineligible/duplicate grading applications blocked on server.
- [ ] Instructor assessment saved with author and status, not automatic promotion.
- [ ] No live high-risk personal identity documents in testing; private file access restricted.
- [ ] All screenshots/demo data are explicitly marked as demonstration content.

## 8. External reference pages

- https://aikidoshinjukai.com.sg/
- https://aikidoshinjukai.com.sg/how-to-join/
- https://aikidoshinjukai.com.sg/our-dojos/
- https://aikidoshinjukai.com.sg/class-schedules/
- https://aikidoshinjukai.com.sg/grading-information/
- https://aikidoshinjukai.com.sg/training-fees/

The official site is a **content reference**, not an invitation to scrape personal data or duplicate copyrighted text/photos without permission. Keep public marketing wording authored afresh where necessary.
