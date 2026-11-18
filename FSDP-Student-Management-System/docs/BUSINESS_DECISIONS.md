# Business decisions and assumptions

1. Proposed workflow: **admin approval -> payment -> activation**. Official paper
   practice may take payment on submission. This redesign avoids refund handling for
   rejected applications and requires partner validation. It is not represented as
   current ASK policy.
2. Registration creates an applicant and provisional profile only. Approval verifies
   rank and creates a pending membership plus a server-priced charge. Activation needs
   a confirmed signed Stripe test webhook or an explicit, audited admin fee waiver.
3. A waiver is an independent documented decision, never a successful payment. Fixture
   memberships use waivers; illustrative failed/expired attempts carry demoFixture.
4. All centre names, addresses, schedules, fees, accounts and reduced grading rules
   are fictional and visibly marked. Official website context is cited separately.
5. The demo rule is four verified sessions and thirty days in rank. Current verified
   rank, age applicability, active membership, rank start and qualifying attendance
   govern eligibility. Eligibility is permission to apply, not a promotion.
6. External events require an external: organiser event key, a past date and assigned
   instructor verification. One student/event key counts once. Internal event keys
   use the actual session ID; the external prefix prevents collisions. Dishonest
   duplicate submissions under different organiser references still require human
   verification; the system cannot infer real-world identity of an external event.
7. Attendance opens at class start and is limited to confirmed booked students and
   the assigned instructor. Corrections retain before/after audit records. Cancelled
   classes do not accept new attendance. Grading assessment opens at the event start.
8. Membership lasts one year in demonstration fixtures. Renewal/recurring billing,
   tax, refunds, final grading administration and promotion approval are outside this
   prototype. Training price is informational, not a hidden recurring product.
9. A minor needs a named guardian and the demo consent checkbox. This is a prototype
   acknowledgement, not an assertion of production identity verification/legal consent.
10. Low-engagement means fewer than two verified visits in the last thirty days,
    considering cross-centre and external training. A supportive follow-up can be
    recorded at most once per calendar month, with no automatic public labelling.
11. Evidence is optional, synthetic PDF only. There is no identity/Singpass integration.
12. Email goes to NotificationOutbox with dev_outbox status. No delivery claims are made.
13. The original AGENTS.md was supplied after the initial build. It has now been read
    in full and copied verbatim into the project, replacing the placeholder. Its
    requirements match the implemented stack, module structure, persistence, security,
    testing and local-only boundaries; no application code changes were required.
14. Latest target-feature DOCX assigns instructor dashboard to Nicole and payments to
    Janessa; this differs from FEATURE_MODULE_TREE.md. The original DOCX allocation is
    recorded as proposed review ownership; actual authorship is not inferred.
