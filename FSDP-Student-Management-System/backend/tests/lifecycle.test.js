import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import Stripe from 'stripe';
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { query, transaction, closePool } from '../src/core/config/database.js';
import { migrate } from '../../database/scripts/migrate.js';
import { seed, demoPassword } from '../../database/seeds/seed-data.js';
import { readiness } from '../src/modules/grading-readiness/gradingReadiness.service.js';
import { createCheckout } from '../src/modules/payments/payments.service.js';
import { uploadDirectory } from '../src/modules/membership-enrolment/membershipEnrolment.routes.js';
const app = createApp();
const suffix = Date.now().toString(36);
const fixtureId = (name) => `test-${suffix}-${name}`;
const users = [];
const ownedFiles = [];
let student, second, admin, instructor, east, applicationId, chargeId;
const draft = {
  phone: '0000 0000',
  dateOfBirth: '2000-02-10',
  dojoId: 'central',
  experience: 'Synthetic previous training.',
  claimedBelt: '6th Kyu',
  guardianName: '',
  waiver: true,
  selectedSessionId: 'upcoming-1',
};
function client() {
  const agent = request.agent(app);
  return {
    agent,
    user: null,
    async call(method, url, body) {
      let req = agent[method](`/api${url}`);
      if (this.user?.csrf) req = req.set('x-csrf-token', this.user.csrf);
      if (body !== undefined) req = req.send(body);
      return req;
    },
    async login(email) {
      const res = await this.call('post', '/auth/login', { email, password: demoPassword });
      assert.equal(res.status, 200, JSON.stringify(res.body));
      this.user = res.body;
      return this;
    },
  };
}
async function register(name) {
  const actor = client();
  const res = await actor.call('post', '/auth/register', {
    name: `Integration ${name}`,
    email: `test-${suffix}-${name}@fsdp.demo`,
    password: demoPassword,
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  actor.user = res.body;
  users.push(res.body.id);
  return actor;
}
async function expect(actor, method, url, body, status = 200) {
  const res = await actor.call(method, url, body);
  assert.equal(res.status, status, JSON.stringify(res.body));
  return res.body;
}
async function eventFor(type, paymentStatus, amount = 6000, eventName = type) {
  const [attempt] = await query(
    'SELECT TOP 1 * FROM fsdp_v5.PaymentAttempts WHERE chargeId=@id',
    { id: chargeId },
  );
  return {
    id: fixtureId(eventName),
    type,
    livemode: false,
    data: {
      object: {
        id: attempt.providerSessionId,
        livemode: false,
        mode: 'payment',
        currency: 'sgd',
        amount_total: amount,
        payment_status: paymentStatus,
        metadata: { attemptId: attempt.id, chargeId, studentId: student.user.id },
      },
    },
  };
}
async function postWebhook(event, signature = true) {
  const payload = JSON.stringify(event);
  const header = signature
    ? Stripe.webhooks.generateTestHeaderString({
        payload,
        secret: process.env.STRIPE_WEBHOOK_SECRET,
      })
    : 'invalid';
  return request(app)
    .post('/api/payments/webhook')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', header)
    .send(payload);
}
async function session(
  name,
  {
    capacity = 8,
    offset = 3,
    instructorId = 'instructor-central',
    dojoId = 'central',
    classTypeId = 'adult',
  } = {},
) {
  const id = fixtureId(name);
  const startsAt = new Date(Date.now() + offset * 86400000);
  await query(
    `INSERT fsdp_v5.ClassSessions(id,classTypeId,dojoId,instructorId,startsAt,endsAt,capacity)
    VALUES(@id,@classTypeId,@dojoId,@instructorId,@startsAt,@endsAt,@capacity)`,
    {
      id,
      classTypeId,
      dojoId,
      instructorId,
      startsAt,
      endsAt: new Date(startsAt.valueOf() + 3600000),
      capacity,
    },
  );
  return id;
}
async function startSession(id) {
  await query(
    `UPDATE fsdp_v5.ClassSessions
  SET startsAt=DATEADD(minute,-15,SYSUTCDATETIME()),endsAt=DATEADD(minute,45,SYSUTCDATETIME())
  WHERE id=@id AND id LIKE 'test-%'`,
    { id },
  );
}
describe(
  'SQL Server-backed connected lifecycle and access controls',
  { concurrency: false },
  () => {
    before(async () => {
      await migrate();
      await seed();
      process.env.STRIPE_WEBHOOK_SECRET = `whsec_synthetic_${suffix}`;
      admin = await client().login('admin@fsdp.demo');
      instructor = await client().login('instructor-central@fsdp.demo');
      east = await client().login('instructor-east@fsdp.demo');
    });
    after(async () => {
      try {
        await transaction(async (tx) => {
          const rows = await query(
            `SELECT d.storageName FROM fsdp_v5.ApplicationDocuments d
        JOIN fsdp_v5.MembershipApplications a ON a.id=d.applicationId
        JOIN fsdp_v5.Users u ON u.id=a.userId WHERE u.email LIKE @pattern`,
            { pattern: `test-${suffix}-%` },
            tx,
          );
          ownedFiles.push(...rows.map((r) => r.storageName));
          await query(
            'DELETE fsdp_v5.WebhookEvents WHERE id LIKE @pattern',
            { pattern: `test-${suffix}-%` },
            tx,
          );
          for (const userId of users) {
            const statements = [
              'DELETE a FROM fsdp_v5.InstructorAssessments a JOIN fsdp_v5.GradingApplications g ON g.id=a.gradingApplicationId WHERE g.studentId=@userId',
              'DELETE fsdp_v5.GradingApplications WHERE studentId=@userId',
              'DELETE o FROM fsdp_v5.NotificationOutbox o JOIN fsdp_v5.Notifications n ON n.id=o.notificationId WHERE n.userId=@userId',
              'DELETE fsdp_v5.Notifications WHERE userId=@userId',
              'DELETE p FROM fsdp_v5.PaymentAttempts p JOIN fsdp_v5.PaymentCharges c ON c.id=p.chargeId WHERE c.studentId=@userId',
              'DELETE fsdp_v5.PaymentCharges WHERE studentId=@userId',
              'DELETE d FROM fsdp_v5.ApplicationDocuments d JOIN fsdp_v5.MembershipApplications a ON a.id=d.applicationId WHERE a.userId=@userId',
              'DELETE fsdp_v5.MembershipApplications WHERE userId=@userId',
              'DELETE fsdp_v5.AttendanceRecords WHERE studentId=@userId',
              'DELETE fsdp_v5.ExternalTrainingRecords WHERE studentId=@userId',
              'DELETE fsdp_v5.ClassBookings WHERE studentId=@userId',
              'DELETE fsdp_v5.StudentBeltHistory WHERE studentId=@userId',
              'DELETE fsdp_v5.WaiverConsents WHERE userId=@userId',
              'DELETE fsdp_v5.Memberships WHERE userId=@userId',
              'DELETE fsdp_v5.StudentProfiles WHERE userId=@userId',
              'DELETE fsdp_v5.Sessions WHERE userId=@userId',
              'DELETE fsdp_v5.AuditLogs WHERE actorId=@userId',
              'DELETE fsdp_v5.Users WHERE id=@userId',
            ];
            for (const statement of statements) await query(statement, { userId }, tx);
          }
          await query(
            'DELETE fsdp_v5.ClassSessions WHERE id LIKE @pattern; DELETE fsdp_v5.GradingSessions WHERE id LIKE @pattern; DELETE fsdp_v5.AuditLogs WHERE entityId LIKE @pattern',
            { pattern: `test-${suffix}-%` },
            tx,
          );
        });
      } finally {
        for (const file of ownedFiles)
          await unlink(path.join(uploadDirectory, file)).catch(() => {});
        await closePool();
      }
    });
    it('migrations and seeding are idempotent', async () => {
      const before = await query('SELECT COUNT(*) total FROM fsdp_v5.Users');
      await migrate();
      await seed();
      assert.deepEqual(await query('SELECT COUNT(*) total FROM fsdp_v5.Users'), before);
    });
    it('guest browses actual public catalogue without exposing credentials', async () => {
      const res = await request(app).get('/api/public/catalogue');
      assert.equal(res.status, 200);
      assert.equal(res.body.dojos.length, 3);
      assert.ok(res.body.sessions.length >= 12);
      assert.ok(!JSON.stringify(res.body).includes('passwordHash'));
      assert.equal((await request(app).get('/api/admin')).status, 401);
    });
    it('registration creates only an applicant and blocks duplicate emails', async () => {
      student = await register('journey');
      assert.equal(student.user.role, 'applicant');
      await expect(
        client(),
        'post',
        '/auth/register',
        { name: 'Duplicate', email: student.user.email, password: demoPassword },
        409,
      );
      await expect(student, 'post', '/classes/bookings', { sessionId: 'upcoming-1' }, 403);
      await expect(student, 'get', '/admin', undefined, 403);
    });
    it('session requires CSRF and logout invalidates server state', async () => {
      const temporary = await client().login('jamie@fsdp.demo');
      assert.equal(
        (await temporary.agent.patch('/api/profile').send({ name: 'Tampered' })).status,
        403,
      );
      await expect(temporary, 'post', '/auth/logout', {});
      await expect(temporary, 'get', '/profile', undefined, 401);
    });
    it('draft, synthetic private PDF and review submission persist', async () => {
      const saved = await expect(student, 'put', '/enrolment/draft', draft);
      applicationId = saved.id;
      const pdf = await readFile(path.join(uploadDirectory, 'synthetic-training.pdf'));
      let upload = await student.agent
        .post('/api/enrolment/documents')
        .set('x-csrf-token', student.user.csrf)
        .attach('document', Buffer.from('not a pdf'), {
          filename: 'bad.pdf',
          contentType: 'application/pdf',
        });
      assert.equal(upload.status, 400);
      upload = await student.agent
        .post('/api/enrolment/documents')
        .set('x-csrf-token', student.user.csrf)
        .attach('document', pdf, {
          filename: 'synthetic.pdf',
          contentType: 'application/pdf',
        });
      assert.equal(upload.status, 201, JSON.stringify(upload.body));
      await expect(student, 'post', '/enrolment/submit', {});
      const record = await expect(student, 'get', '/enrolment');
      assert.equal(record.application.status, 'pending_review');
      const documentId = record.documents[0].id;
      await expect(student, 'get', `/enrolment/documents/${documentId}`, undefined, 403);
      await expect(instructor, 'get', `/enrolment/documents/${documentId}`, undefined, 403);
      const download = await admin.call('get', `/enrolment/documents/${documentId}`);
      assert.equal(download.status, 200);
    });
    it('requested changes require reasons and can be resubmitted', async () => {
      await expect(
        admin,
        'post',
        `/admin/applications/${applicationId}/decision`,
        { decision: 'changes_requested', reason: '' },
        400,
      );
      await expect(admin, 'post', `/admin/applications/${applicationId}/decision`, {
        decision: 'changes_requested',
        reason: 'Please clarify synthetic experience.',
      });
      const record = await expect(student, 'get', '/enrolment');
      assert.equal(record.application.status, 'changes_requested');
      await expect(student, 'put', '/enrolment/draft', {
        ...draft,
        experience: 'Clarified synthetic training experience.',
      });
      await expect(student, 'post', '/enrolment/submit', {});
    });
    it('approval is atomic/idempotent and never activates an unpaid applicant', async () => {
      const decision = {
        decision: 'approve',
        reason: 'Synthetic verified experience.',
        verifiedBelt: 1,
        rankStart: new Date(Date.now() - 120 * 86400000).toISOString().slice(0, 10),
      };
      await expect(
        admin,
        'post',
        `/admin/applications/${applicationId}/decision`,
        decision,
      );
      await expect(
        admin,
        'post',
        `/admin/applications/${applicationId}/decision`,
        decision,
      );
      const charges = await query(
        'SELECT * FROM fsdp_v5.PaymentCharges WHERE applicationId=@id',
        { id: applicationId },
      );
      assert.equal(charges.length, 1);
      chargeId = charges[0].id;
      await expect(student, 'post', '/classes/bookings', { sessionId: 'upcoming-1' }, 403);
      await expect(student, 'put', '/enrolment/draft', draft, 409);
    });
    it('Checkout uses persisted amount and a retry-stable provider idempotency key', async () => {
      let captured;
      const provider = {
        checkout: {
          sessions: {
            create: async (params, options) => {
              captured = { params, options };
              return {
                id: fixtureId('checkout'),
                url: 'https://checkout.stripe.com/synthetic-test',
                livemode: false,
              };
            },
            retrieve: async () => ({
              id: fixtureId('checkout'),
              url: 'https://checkout.stripe.com/synthetic-test',
              livemode: false,
            }),
          },
        },
      };
      const result = await createCheckout(student.user.id, chargeId, provider);
      assert.ok(result.url);
      assert.equal(captured.params.line_items[0].price_data.unit_amount, 6000);
      assert.equal(captured.params.line_items[0].price_data.currency, 'sgd');
      assert.ok(captured.options.idempotencyKey.includes(result.attemptId));
      assert.equal(captured.params.payment_method_types, undefined);
      await createCheckout(student.user.id, chargeId, provider);
      assert.equal(
        (
          await query('SELECT * FROM fsdp_v5.PaymentAttempts WHERE chargeId=@id', {
            id: chargeId,
          })
        ).length,
        1,
      );
    });
    it('bad signatures, wrong amounts, live events and redirect query cannot activate membership', async () => {
      assert.equal(
        (await postWebhook(await eventFor('checkout.session.completed', 'paid'), false))
          .status,
        400,
      );
      assert.equal(
        (
          await postWebhook(
            await eventFor('checkout.session.completed', 'paid', 1, 'bad-total'),
          )
        ).status,
        400,
      );
      const event = await eventFor('checkout.session.completed', 'paid', 6000, 'live');
      event.livemode = true;
      assert.equal((await postWebhook(event)).status, 400);
      await expect(student, 'get', '/payments?success=true');
      assert.equal(
        (await expect(student, 'get', '/profile')).membershipStatus,
        'pending_payment',
      );
    });
    it('asynchronous webhook transitions from pending to paid once and ignores replay/regression', async () => {
      assert.equal(
        (await postWebhook(await eventFor('checkout.session.completed', 'unpaid'))).status,
        200,
      );
      assert.equal(
        (await expect(student, 'get', '/profile')).membershipStatus,
        'pending_payment',
      );
      const event = await eventFor('checkout.session.async_payment_succeeded', 'paid');
      assert.equal((await postWebhook(event)).status, 200);
      const replay = await postWebhook(event);
      assert.equal(replay.status, 200);
      assert.equal(replay.body.replayed, true);
      assert.equal(
        (await postWebhook(await eventFor('checkout.session.expired', 'unpaid'))).status,
        200,
      );
      assert.equal((await expect(student, 'get', '/profile')).membershipStatus, 'active');
      student.user = await expect(student, 'get', '/auth/me');
      assert.equal(student.user.role, 'student');
      assert.equal(
        (
          await query(
            "SELECT COUNT(*) total FROM fsdp_v5.Notifications WHERE userId=@id AND eventKey='membership.activated'",
            { id: student.user.id },
          )
        )[0].total,
        1,
      );
    });
    it('booking persists, rejects duplicates, wrong age/belt, overlap and inactive schedules', async () => {
      const first = await session('first');
      const overlap = await session('overlap');
      await expect(student, 'post', '/classes/bookings', { sessionId: first }, 201);
      await expect(student, 'post', '/classes/bookings', { sessionId: first }, 409);
      await expect(student, 'post', '/classes/bookings', { sessionId: overlap }, 409);
      const child = await session('child', { offset: 4, classTypeId: 'children' });
      await expect(student, 'post', '/classes/bookings', { sessionId: child }, 403);
      const advanced = await session('advanced', { offset: 5, classTypeId: 'advanced' });
      await expect(student, 'post', '/classes/bookings', { sessionId: advanced }, 403);
      const inactive = await session('inactive', { offset: 6 });
      await query('UPDATE fsdp_v5.ClassSessions SET active=0 WHERE id=@id', {
        id: inactive,
      });
      await expect(student, 'post', '/classes/bookings', { sessionId: inactive }, 400);
      const resumed = await client().login(student.user.email);
      assert.ok(
        (await expect(resumed, 'get', '/classes/bookings')).some(
          (b) => b.sessionId === first,
        ),
      );
      const [booking] = await query(
        'SELECT * FROM fsdp_v5.ClassBookings WHERE studentId=@id AND sessionId=@sessionId',
        { id: student.user.id, sessionId: first },
      );
      await expect(student, 'delete', `/classes/bookings/${booking.id}`, {});
    });
    it('capacity is enforced for concurrent bookings and documented waivers activate honestly', async () => {
      second = await register('capacity');
      await expect(second, 'put', '/enrolment/draft', draft);
      await expect(second, 'post', '/enrolment/submit', {});
      const app = (await expect(second, 'get', '/enrolment')).application;
      await expect(admin, 'post', `/admin/applications/${app.id}/decision`, {
        decision: 'approve',
      });
      const [charge] = await query(
        'SELECT * FROM fsdp_v5.PaymentCharges WHERE studentId=@id',
        { id: second.user.id },
      );
      await expect(admin, 'post', `/admin/charges/${charge.id}/waive`, {
        reason: 'Development integration fixture fee waiver.',
      });
      assert.equal(
        (
          await query('SELECT status FROM fsdp_v5.PaymentCharges WHERE id=@id', {
            id: charge.id,
          })
        )[0].status,
        'waived',
      );
      const capacity = await session('capacity', { capacity: 1, offset: 7 });
      const responses = await Promise.all([
        student.call('post', '/classes/bookings', { sessionId: capacity }),
        second.call('post', '/classes/bookings', { sessionId: capacity }),
      ]);
      assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
    });
    it('assigned instructor attendance consolidates two dojos, deduplicates and audits corrections', async () => {
      for (const [name, offset, teacher, dojoId] of [
        ['training-central', 9, instructor, 'central'],
        ['training-east', 10, east, 'east'],
      ]) {
        const sid = await session(name, {
          offset,
          dojoId,
          instructorId: dojoId === 'east' ? 'instructor-east' : 'instructor-central',
        });
        await expect(student, 'post', '/classes/bookings', { sessionId: sid }, 201);
        await expect(
          teacher,
          'put',
          `/attendance/sessions/${sid}`,
          { studentId: student.user.id, status: 'present' },
          400,
        );
        await startSession(sid);
        const wrong = dojoId === 'east' ? instructor : east;
        await expect(
          wrong,
          'put',
          `/attendance/sessions/${sid}`,
          { studentId: student.user.id, status: 'present' },
          403,
        );
        await expect(
          teacher,
          'put',
          `/attendance/sessions/${sid}`,
          { studentId: second.user.id, status: 'present' },
          403,
        );
        await expect(teacher, 'put', `/attendance/sessions/${sid}`, {
          studentId: student.user.id,
          status: 'present',
        });
        await expect(teacher, 'put', `/attendance/sessions/${sid}`, {
          studentId: student.user.id,
          status: 'present',
        });
      }
      const state = await expect(student, 'get', '/readiness');
      assert.equal(state.total, 2);
      assert.equal(state.centres.length, 2);
      const sid = fixtureId('training-central');
      await expect(instructor, 'put', `/attendance/sessions/${sid}`, {
        studentId: student.user.id,
        status: 'absent',
      });
      assert.equal((await expect(student, 'get', '/readiness')).total, 1);
      await expect(instructor, 'put', `/attendance/sessions/${sid}`, {
        studentId: student.user.id,
        status: 'present',
      });
      const logs = await query(
        "SELECT * FROM fsdp_v5.AuditLogs WHERE actorId='instructor-central' AND entityId=@id",
        { id: `${sid}:${student.user.id}` },
      );
      assert.ok(logs.length >= 3);
    });
    it('external records count only after authorised verification and duplicate events are blocked', async () => {
      const event = {
        eventKey: `external:${fixtureId('seminar')}`,
        centre: 'Integration external dojo',
        happenedAt: new Date(Date.now() - 86400000).toISOString(),
      };
      await expect(student, 'post', '/attendance/external', event, 201);
      await expect(student, 'post', '/attendance/external', event, 409);
      assert.equal((await expect(student, 'get', '/readiness')).total, 2);
      const [record] = await query(
        'SELECT * FROM fsdp_v5.ExternalTrainingRecords WHERE studentId=@id',
        { id: student.user.id },
      );
      await expect(
        student,
        'patch',
        `/attendance/external/${record.id}/verify`,
        { qualifying: true },
        403,
      );
      await expect(instructor, 'patch', `/attendance/external/${record.id}/verify`, {
        qualifying: true,
      });
      assert.equal((await expect(student, 'get', '/readiness')).total, 3);
    });
    it('readiness transition produces one notification and uses changed persisted rules', async () => {
      const before = await expect(student, 'get', '/readiness');
      assert.equal(before.eligible, false);
      await expect(student, 'post', '/grading', { gradingSessionId: 'grading-open' }, 403);
      const sid = await session('final-training', { offset: 11 });
      await expect(student, 'post', '/classes/bookings', { sessionId: sid }, 201);
      await startSession(sid);
      await expect(instructor, 'put', `/attendance/sessions/${sid}`, {
        studentId: student.user.id,
        status: 'present',
      });
      assert.equal((await expect(student, 'get', '/readiness')).eligible, true);
      await expect(student, 'get', '/readiness');
      await expect(student, 'get', '/readiness');
      const notices = await query(
        "SELECT * FROM fsdp_v5.Notifications WHERE userId=@id AND eventKey LIKE 'eligible:%'",
        { id: student.user.id },
      );
      assert.equal(notices.length, 1);
      await expect(admin, 'patch', '/admin/rules/rule-1', { minSessions: 5, minDays: 30 });
      try {
        assert.equal((await expect(student, 'get', '/readiness')).eligible, false);
      } finally {
        await expect(admin, 'patch', '/admin/rules/rule-1', {
          minSessions: 4,
          minDays: 30,
        });
      }
    });
    it('grading application is unique, window checked, signed assessment keeps verified belt unchanged', async () => {
      const applied = await expect(
        student,
        'post',
        '/grading',
        { gradingSessionId: 'grading-open' },
        201,
      );
      await expect(student, 'post', '/grading', { gradingSessionId: 'grading-open' }, 409);
      await expect(student, 'post', '/grading', { gradingSessionId: 'grading-today' }, 400);
      await expect(
        east,
        'post',
        `/assessments/${applied.id}`,
        {
          result: 'recommend_pass',
          feedback: 'Controlled synthetic technique.',
          acknowledgement: 'Daniel Wong',
        },
        403,
      );
      await expect(
        instructor,
        'post',
        `/assessments/${applied.id}`,
        {
          result: 'recommend_pass',
          feedback: 'Controlled synthetic technique.',
          acknowledgement: 'Mei Chen',
        },
        400,
      );
      const gradingId = fixtureId('assessment-event');
      await query(
        `INSERT fsdp_v5.GradingSessions(id,name,instructorId,opensAt,closesAt,startsAt)
      VALUES(@id,'Integration completed grading','instructor-central',DATEADD(day,-2,SYSUTCDATETIME()),DATEADD(hour,-2,SYSUTCDATETIME()),DATEADD(hour,-1,SYSUTCDATETIME()));
      UPDATE fsdp_v5.GradingApplications SET gradingSessionId=@id WHERE id=@applicationId`,
        { id: gradingId, applicationId: applied.id },
      );
      await expect(
        instructor,
        'post',
        `/assessments/${applied.id}`,
        {
          result: 'recommend_pass',
          feedback: 'Controlled synthetic technique.',
          acknowledgement: 'Incorrect Name',
        },
        400,
      );
      const assessment = {
        result: 'recommend_pass',
        feedback: 'Controlled synthetic technique.',
        acknowledgement: 'Mei Chen',
      };
      await expect(instructor, 'post', `/assessments/${applied.id}`, assessment, 201);
      await expect(instructor, 'post', `/assessments/${applied.id}`, assessment, 409);
      assert.equal((await expect(student, 'get', '/profile')).beltId, 1);
    });
    it('notifications, profile limits, instructor scopes and admin reports are enforced', async () => {
      const mine = await expect(student, 'get', '/notifications');
      const other = await expect(second, 'get', '/notifications');
      await expect(second, 'patch', `/notifications/${mine[0].id}/read`, {});
      assert.equal(
        (
          await query('SELECT readAt FROM fsdp_v5.Notifications WHERE id=@id', {
            id: mine[0].id,
          })
        )[0].readAt,
        null,
      );
      await expect(student, 'patch', '/profile', {
        name: 'Integration Journey Updated',
        phone: '0000 0000',
        preferences: 'in-app',
        beltId: 7,
        role: 'admin',
      });
      assert.equal((await expect(student, 'get', '/profile')).beltId, 1);
      assert.ok(
        !(await expect(east, 'get', '/instructor')).sessions.some(
          (s) => s.instructorId === 'instructor-central',
        ),
      );
      await expect(student, 'get', '/admin/reports', undefined, 403);
      assert.ok((await expect(admin, 'get', '/admin/reports')).centres.length >= 3);
      await expect(
        student,
        'post',
        `/instructor/students/${student.user.id}/follow-up`,
        {},
        403,
      );
    });
  },
);
