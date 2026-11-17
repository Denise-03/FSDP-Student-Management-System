# API contracts

Base URL: http://127.0.0.1:4000/api. JSON over HTTP; cookie credentials included.
Authentication returns {id,name,email,role,csrf}; send x-csrf-token on authenticated
mutations. Errors return {message} with 400 validation/window, 401 unauthenticated,
403 role/ownership, 404 missing, 409 state/conflict, 503 unconfigured provider.
Multer PDF upload uses multipart form field document. Document download is an
admin-only PDF attachment. Never expose uploads under a static route.

| Prefix                                                                                      | Role boundary                                                                 |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| /public                                                                                     | Guest read                                                                    |
| /auth                                                                                       | Guest register/login; current session/logout                                  |
| /profile, /enrolment, /classes, /attendance/mine, /readiness, /grading, /student, /payments | Own applicant/student data; booking and grading require active eligible state |
| /attendance/sessions, /attendance/external/review and verify, /instructor, /assessments     | Assigned instructor only                                                      |
| /admin                                                                                      | Admin only                                                                    |
| /notifications                                                                              | Any authenticated role, own records only                                      |
| /enrolment/documents/:id GET                                                                | Admin only, even when applicant uploaded the document                         |
| /payments/webhook                                                                           | Raw signed test event, no browser session required                            |

## Mounted endpoints

### public-site

- `GET /api/public/catalogue`

### authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### student-profiles

- `GET /api/profile/`
- `PATCH /api/profile/`

### membership-enrolment

- `GET /api/enrolment/`
- `PUT /api/enrolment/draft`
- `POST /api/enrolment/submit`
- `POST /api/enrolment/documents`
- `GET /api/enrolment/documents/:id`

### dojos-classes

- `GET /api/classes/bookings`
- `POST /api/classes/bookings`
- `DELETE /api/classes/bookings/:id`

### attendance

- `GET /api/attendance/mine`
- `GET /api/attendance/sessions/:id`
- `PUT /api/attendance/sessions/:id`
- `POST /api/attendance/external`
- `GET /api/attendance/external/review`
- `PATCH /api/attendance/external/:id/verify`

### grading-readiness

- `GET /api/readiness/`

### grading-applications

- `GET /api/grading/`
- `POST /api/grading/`

### notifications

- `GET /api/notifications/`
- `PATCH /api/notifications/:id/read`

### student-dashboard

- `GET /api/student/`

### instructor-dashboard

- `GET /api/instructor/`
- `POST /api/instructor/students/:id/follow-up`

### instructor-assessment

- `GET /api/assessments/`
- `POST /api/assessments/:id`

### payments

- `GET /api/payments/`
- `POST /api/payments/checkout`

### admin-dashboard

- `GET /api/admin/`
- `GET /api/admin/applications`
- `GET /api/admin/applications/:id`
- `POST /api/admin/applications/:id/decision`
- `GET /api/admin/members`
- `GET /api/admin/payments`
- `POST /api/admin/charges/:id/waive`
- `GET /api/admin/reports`
- `GET /api/admin/manage`
- `PATCH /api/admin/dojos/:id`
- `POST /api/admin/sessions`
- `PATCH /api/admin/sessions/:id`
- `PATCH /api/admin/settings/registration-fee`
- `PATCH /api/admin/rules/:id`

Webhook: POST /api/payments/webhook, raw application/json with stripe-signature.

## Key payloads

- POST /auth/register: name, email, password (10-100 characters); creates applicant.
- PUT /enrolment/draft: phone, dateOfBirth (YYYY-MM-DD), dojoId, experience,
  claimedBelt, guardianName, waiver (boolean), selectedSessionId. Unknown fields ignored.
- POST /enrolment/submit: empty object; validates and commits stored draft and consent.
- POST /admin/applications/:id/decision: decision approve/changes_requested/rejected,
  reason, verifiedBelt integer and rankStart YYYY-MM-DD. Reasons mandatory for changes
  and rejection. Repeated approval is a no-op, not a second charge.
- POST /classes/bookings: sessionId; price/role/member flags are never accepted.
- PUT /attendance/sessions/:id: studentId, status present/absent. Requires actual booking
  and authenticated assignment. Future attendance blocked.
- POST /attendance/external: eventKey beginning external:, centre, happenedAt ISO UTC.
- PATCH /attendance/external/:id/verify: qualifying boolean; assigned instructor only.
- GET /readiness: eligible,total,days,rule,profile,reasons,records,centres. Reasons explain
  deficiencies; notifications deduplicated by verified current rank/start.
- POST /grading: gradingSessionId; checks current eligibility and open event window.
- POST /assessments/:applicationId: result recommend_pass/further_training, feedback
  (10-2000 chars), acknowledgement matching authenticated instructor name. Server
  computes days in rank; only one signed submission, no belt write.
- POST /payments/checkout: chargeId only; returns Stripe-hosted url and attemptId.
  Requires a local test key and webhook secret. No payment status accepted from client.
- POST /admin/charges/:id/waive: reason of at least 10 characters; blocks open provider
  attempts; records fee waiver and activation atomically, never fabricates paid.
- POST /admin/sessions: classTypeId,dojoId,instructorId,startsAt,endsAt,capacity. Future
  schedule and centre/instructor conflicts checked against stored assignments.
- PATCH /admin/sessions/:id: active and capacity; cannot shrink below confirmed seats.
- PATCH /admin/rules/:id: minSessions,minDays; next readiness calculation uses new rule.
- PATCH /admin/settings/registration-fee: amount (integer cents); approved charges keep
  their original amounts. Discounts are not configured; the persisted fee is the total.

Read the feature validators/routes for complete bounds. No arbitrary SQL, admin role
assignment, client-owned amounts or promotion endpoints are exposed.
