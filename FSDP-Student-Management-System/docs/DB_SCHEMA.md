# SQL Server schema

Database: FSDPDevelopment. Schema: fsdp_v5. SQL Server is the only application store.
All primary and foreign keys, status checks, unique constraints and defaults are in
migrations/001_prototype_schema.sql. Migrations records checksums and apply dates.

| Tables                                          | Relationships and responsibilities                                                                                                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Users, Sessions                                 | Users.role is checked against applicant/student/instructor/admin. Hashed opaque session IDs reference Users and expire after 12 hours.                                                   |
| StudentProfiles, BeltLevels, StudentBeltHistory | One provisional profile per student/applicant. Verified belt and rank start change only at approval; history records verifier.                                                           |
| InstructorAssignments                           | Composite key instructor + dojo. References Users and Dojos; session creation checks assignments.                                                                                        |
| Dojos, ClassTypes, ClassSessions                | Sessions reference class category, centre and instructor. ClassTypes embeds age, minimum rank and qualifying requirements. Capacity positive; end later than start.                      |
| MembershipApplications, ApplicationDocuments    | One application per user; bounded JSON draft details; statuses, review actor/reason and timestamps. Private document metadata references application and unique storage filename.        |
| Memberships, WaiverConsents                     | One membership and one versioned consent per user. Unique member number; status/expiry; explicit fee-waiver reason where applied.                                                        |
| ClassBookings, AttendanceRecords                | Unique student/session in each table. Cancelled booking can be reactivated after full validation. Attendance records reference verifier and are updated rather than duplicated.          |
| ExternalTrainingRecords                         | Unique student/eventKey; external prefix, date, centre, qualifying and verifier. Unverified events cannot count.                                                                         |
| GradingRules                                    | Foreign keys for source/target belt; minimum sessions/days and age range; descriptive demo label.                                                                                        |
| GradingSessions, GradingApplications            | Event instructor and valid application window; unique student/event application, submitted/assessed status.                                                                              |
| InstructorAssessments                           | Unique grading application, authenticated instructor, recommendation, feedback, computed time in rank and named acknowledgement. No promotion write.                                     |
| Notifications, NotificationOutbox               | Unique user/event key; read timestamp. Outbox references notification and stays dev_outbox when no email transport is configured.                                                        |
| PaymentCharges, PaymentAttempts                 | Charge owns student, approved amount/currency and optional unique application. Attempts reference charges with provider session/status; fixture flag distinguishes illustrative records. |
| WebhookEvents                                   | Unique provider event ID guarantees replay idempotency in the same transaction as fulfillment.                                                                                           |
| AuditLogs, Settings                             | Audited actors/actions/entities/details; editable demonstration fees/public context settings.                                                                                            |

Mappings from requested conceptual entities: Users.role replaces separate Roles tables;
InstructorAssignments replaces a redundant instructor profile; ClassTypes includes
ClassRequirements; PaymentAttempts supplies payment transactions. All are relational
and share one coherent set of IDs. Instructor name comes from Users.

SQL uses parameter binding through mssql Request.input. Interpolated table identifiers
occur only in fixed allowlists for migration/seed/reset, never user input. Mutations
use SERIALIZABLE plus a prototype-global transaction lock. Unique indexes remain the
last defence against duplicate rows. Datetimes are stored in UTC and shown in Singapore.

Application payload JSON is not an untyped user/account object: the draft validator
allowlists phone, DOB, principal centre, experience, claimed belt, guardian, waiver and
selected session. Role, current verified belt, charge amount and membership activation
cannot be set by a student request.
