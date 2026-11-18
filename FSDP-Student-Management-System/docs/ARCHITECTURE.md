# Architecture

React/Vite routes use a shared fetch client, cookie session context, resource-loading
hook and accessible primitives. Feature pages own their forms and view state. Public
reference data is loaded from /api/public/catalogue; editable prices/rules are not JSX
constants. Mutations call APIs and reload authoritative resources.

Express mounts all fourteen feature routers in backend/src/app.js. Thin routes combine
validation with simple queries; domain services hold membership, booking, readiness,
attendance and payment transitions. Repositories are split where useful, rather than
empty controller/repository wrappers. Shared authentication, errors, pool, audit,
notifications and age/date helpers live under core.

SQL Server is the only durable store. fsdp_v5 is a separate schema in the requested
FSDPDevelopment database. Users.role supplies the role mapping; ClassTypes supplies
class age/rank/qualifying requirements; InstructorAssignments supplies instructor
profiles/centre assignments. Application JSON contains bounded draft details, while
profiles, consents, bookings, attendance, payments and grading use relational keys.

All business mutations use SERIALIZABLE transactions and a transaction-owned
sp_getapplock. This intentionally serialises short prototype mutations across server
processes, preventing capacity races and inconsistent activation. It is suitable for
a small assignment demonstration, not a high-throughput production design. Production
should use narrower resource locks and an external delivery worker.

Opaque cookie tokens are hashed in SQL. Cookies are HttpOnly/SameSite Lax, and Secure
in production. Authenticated mutations need session CSRF tokens; origin checks and
an explicit CORS origin protect browser requests. Bcrypt hashes never leave the API.
Object ownership and instructor assignment are checked on the backend.

Private uploads sit outside frontend/public, with server UUID names, bounded size,
PDF header/type checks and authorised attachment download. A real production system
needs malware scanning, encryption/storage retention and partner-approved consent.
Those are documented deployment concerns, not claims made by this local prototype.

Payment creation is an external boundary: persist a creating attempt, call Stripe with
a stable idempotency key, then bind its session. Signed webhooks validate test mode,
metadata, currency, amount and provider session before transactional activation.
A provider/network error leaves membership unpaid and retryable.

In-app notifications and development outbox entries are atomic with their business
events. Eligibility notices use a unique student/rank/start key so repeated recalculation
cannot spam notifications. No real email transport or final belt-promotion logic exists.

Migration 003 repairs the original approved-but-unpaid Riley fixture so its beginner
rank is verified before activation. New seeds create that state correctly.
