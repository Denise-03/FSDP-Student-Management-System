# Connected demo data and business walkthroughs (implement in real SQL Server)

## Source data vs synthetic demonstration data

- **Official public reference details**: Public dojos, addresses, class categories, published schedules, belt descriptions and fees only when independently verified. Save source URL and check date in `docs/SOURCE_REGISTER.md`. If unavailable, label `DEMO CENTRE`, `DEMO RULE`, `DEMO PRICE`; do not invent as official current practice.
- **All private member data**: Fictional. No actual ID/Singpass/NRIC, bank accounts, card data or real members. Use harmless synthetic PDFs for previous-training documents. Do not assume permission to reuse third-party photos.
- **Payment status**: Seed illustrative payments with explicit `demo_fixture=true` where appropriate. Only mark real Stripe *test* payments confirmed when a verified test webhook is received. Never present seeded data as actual funds collected.

## Seed these linked records

- 3 active dojos; 1 inactive example if relevant; 3–5 class categories; at least 12 upcoming class sessions spread across two or more weeks; 2 instructors with distinct session assignments.
- 1 admin demo; 2 instructor demos; 1 unregistered guest workflow; 1 pending applicant; 1 applicant requiring changes; 1 approved-pending-payment applicant; 1 active cross-dojo student; 1 near-eligible student and 1 ineligible student.
- For active students, seed assigned principal dojo, verified current belt, valid rank-start date, upcoming enrolments, verified present and absent sessions at different centres, two different payment attempts/statuses and several notifications.
- 1 application with synthetic evidence to review, 1 approved with audit history, 1 grading session, 1 pending grading application and 1 assessment.
- Demo-only configurable grading threshold so **one new verified attendance** moves a fixture from not eligible → eligible; show an explanatory reason before qualifying. This threshold must not be described as a genuine ASK grading standard without verified source.
- Supply an idempotent seed with unique fixture keys, date handling that stays demoable in Nov 2026 or via an explicit `DEMO_REFERENCE_DATE`, and a read-only verification script.

## End-to-end presentation sequence (keep one student identity consistent)

1. **Guest:** Visit public homepage on a phone, browse About, Dojos, Classes, class details, published fees and belt descriptions. Select a specific class; click Book.
2. **Authentication:** Sign in or register. New account can draft application while selected class is remembered. Not an approved member yet.
3. **Application:** Fill personal information (minimum necessary), claimed experience/belt, selected principal dojo, optional synthetic evidence and consent. Submit; show pending status that survives refresh.
4. **Admin:** Sign in as admin, see new application, open evidence securely, approve or request changes. After approval, the applicant sees `approved_pending_payment` if charge due.
5. **Payment:** Student selects eligible Card or PayNow in Stripe *test* Checkout; pending remains pending until a valid webhook confirms payment; show accurate receipt/history. If test keys unavailable, show a safe pending/unavailable state and explain limitation; do not fake paid.
6. **Booking:** Student is active, returns to intended class, books an available suitable session, sees booking after refresh.
7. **Instructor attendance:** Assigned instructor sees booking on their roster; marks present. Student dashboard shows this verified record.
8. **Cross-dojo:** Same student books a suitable class at a different active dojo; its instructor verifies attendance; training total increases exactly once per qualifying session regardless of principal dojo.
9. **Smart grading:** Grading tracker reflects sessions and time in current belt, moves from not eligible to eligible under clearly labeled configured demo requirements; one notification appears.
10. **Application + assessment:** Student chooses upcoming grading session and applies once; instructor sees candidate and submits time-in-rank/feedback/result/digital acknowledgement. No automatic final promotion.
11. **Reporting:** Admin and instructor view appropriate centralised training and membership summaries; optionally highlight student with declining attendance, taking cross-dojo training into account.
12. **Negative examples:** Pending applicant cannot book; wrong instructor cannot mark attendance; student cannot inspect others' documents; duplicate attendance and grading application are refused; failed payment does not activate membership.

This is a single joined flow using actual persisted IDs and relationships, not unrelated screenshot cards or per-page fake arrays. Ensure fixtures let the demo be reproducible without manually editing the database between steps.
