# Business demonstration

Use separate browser profiles/windows for the student, instructor and admin so role
switching does not accidentally replace another role's session. All names are fictional.
All times in the interface are Singapore time. Demo prices/rules/centres are labelled.

## A connected new-member journey

1. On a 360px phone, open Home, explore Adult Aikido and a future session. Press Book.
   The platform remembers the session and asks for sign-in or a new account.
2. Register a fictional account. Explain that registration creates a provisional
   profile, not an active member. Complete the four steps, choose a principal dojo,
   describe experience, optionally upload a harmless synthetic PDF, accept the demo
   waiver and submit. Refresh: pending review remains saved.
3. In the admin window, open Application reviews and select the same applicant.
   Review fields and private evidence. Request changes with a reason if demonstrating
   resubmission; the same student can revise their draft and submit again.
4. Approve the same applicant with a verified belt and genuine demo rank-start date.
   The applicant sees approved pending payment, not active. Repeating approval cannot
   create another membership or charge.
5. If locally configured, open Stripe test Checkout with Card or eligible PayNow.
   It uses the charge amount. The page stays pending until a signed test webhook
   confirms the payment. Use Stripe's test QR flow for PayNow, never a real bank transfer.
   **Hosted payment was not verified in this build.** Without keys, openly use admin
   Payment overview -> enter an explicit demonstration fee waiver reason -> Record
   waiver. Show that the status reads waived, not paid, and membership becomes active.
6. Refresh the student's application/payment status, return to the selected session
   and book. Refresh My bookings: the same booking persists. Show a second session
   at another demo centre; duplicate/overlapping/full/unsuitable bookings are rejected.
7. At each session's start, its assigned instructor opens the roster and marks the
   same student present. Student attendance consolidates both centres. Repeating the
   save updates one record; correcting to absent removes its qualifying contribution.
   Future sessions cannot be prematurely marked; no hidden demo bypass is provided.
8. Over real training days, that same student's tracker reaches the configured demo
   threshold. A verified external training event can contribute after instructor review.
   The tracker explains missing sessions and days; eligibility creates one notice.
9. The same eligible student applies once to an open grading event. At event start,
   the assigned instructor records feedback, recommendation and a named acknowledgement.
   Submit for further processing. Show that the student's verified belt did not change.
10. Admin reports show the same records in cross-centre totals. Instructor insights
    consider all centres before suggesting a supportive private follow-up.

## Immediate presentation fixtures (no pretending that time elapsed)

The full new-member journey has genuine future-session and time-in-rank checks. Use
these separate named fixture examples to show later stages immediately, explicitly
introducing them as a prepared training history rather than switching identities silently:

- **Sam Lee (near@fsdp.demo)** has two internal present sessions plus one verified
  external seminar = 3/4 qualifying sessions and more than 30 days in rank. Sign in as
  instructor-central, open transition-session roster and mark Sam present. Refresh Sam's
  readiness: 4/4, eligible, one notification. Save again: still four. Sam can apply to
  DEMO upcoming grading. That future event cannot yet receive a signed assessment.
- **Jordan Ng (eligible@fsdp.demo)** is registered for today's prepared assessment
  workshop. Mei Chen can submit Jordan's assessment now using her authenticated name.
  The belt remains 6th Kyu. Jamie's fixture contains a previously signed assessment.
- **Chris Low** remains ineligible: insufficient qualifying sessions and time in rank.
  The instructor's cross-centre engagement view suggests an appropriate follow-up.
- **Riley Teo** is approved but unpaid. Without test keys the system displays an honest
  unconfigured Checkout state. No payment success is invented.

Run seed near the presentation or use the explicit development reset to refresh dates.
It preserves fixture edits on repeat runs, so a previous Sam transition stays saved.
Never reset meaningful review data without intentionally accepting the documented reset.

## Negative examples to show

Pending applicant booking -> denied. Wrong instructor roster -> denied. Student or
instructor private evidence download -> denied. Duplicate booking/grading application
-> denied. Unverified external event -> no count. Payment redirect query -> no activation.
Changing the UI total cannot change the server's stored fee. Assessment -> no promotion.
