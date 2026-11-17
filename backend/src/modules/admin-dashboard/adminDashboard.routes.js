import { Router } from 'express';
import { z } from 'zod';
import { query, transaction } from '../../core/config/database.js';
import { roles } from '../../core/middleware/auth.js';
import { ensure } from '../../core/errors/HttpError.js';
import { id, audit } from '../../core/utils/records.js';
import {
  decideApplication,
  activateMembership,
} from '../membership-enrolment/membershipEnrolment.service.js';
export const adminDashboardRouter = Router();
adminDashboardRouter.use(roles('admin'));

adminDashboardRouter.get('/', async (req, res) => {
  const [metrics] = await query(`SELECT
    (SELECT COUNT(*) FROM fsdp_v5.MembershipApplications WHERE status='pending_review') pending,
    (SELECT COUNT(*) FROM fsdp_v5.Memberships WHERE status='active') activeMembers,
    (SELECT COUNT(*) FROM fsdp_v5.Dojos WHERE active=1) activeCentres,
    (SELECT COUNT(*) FROM fsdp_v5.PaymentCharges WHERE status='pending') unpaidCharges`);
  res.json(metrics);
});

adminDashboardRouter.get('/applications', async (req, res) =>
  res.json(
    await query(`SELECT a.*,u.name,u.email
  FROM fsdp_v5.MembershipApplications a JOIN fsdp_v5.Users u ON u.id=a.userId
  ORDER BY a.updatedAt DESC`),
  ),
);

adminDashboardRouter.get('/applications/:id', async (req, res) => {
  const [application] = await query(
    `SELECT a.*,u.name,u.email FROM fsdp_v5.MembershipApplications a
    JOIN fsdp_v5.Users u ON u.id=a.userId WHERE a.id=@id`,
    { id: req.params.id },
  );
  ensure(application, 404, 'Application not found.');
  application.data = JSON.parse(application.data);
  const documents = await query(
    'SELECT id,originalName,size FROM fsdp_v5.ApplicationDocuments WHERE applicationId=@id',
    { id: application.id },
  );
  const audit = await query(
    'SELECT action,details,createdAt FROM fsdp_v5.AuditLogs WHERE entityId=@id ORDER BY createdAt',
    { id: application.id },
  );
  res.json({ application, documents, audit });
});

adminDashboardRouter.post('/applications/:id/decision', async (req, res) => {
  const data = z
    .object({
      decision: z.enum(['approve', 'changes_requested', 'rejected']),
      reason: z.string().max(1000).default(''),
      verifiedBelt: z.number().int().min(0).max(20).default(0),
      rankStart: z.iso.date().default(new Date().toISOString().slice(0, 10)),
    })
    .parse(req.body);
  res.json(await decideApplication(req.user.id, req.params.id, data));
});

adminDashboardRouter.get('/members', async (req, res) =>
  res.json(
    await query(`SELECT u.id,u.name,u.email,p.phone,
  b.name beltName,d.name dojoName,m.memberNumber,m.status,m.expiresAt FROM fsdp_v5.Users u
  JOIN fsdp_v5.StudentProfiles p ON p.userId=u.id LEFT JOIN fsdp_v5.Memberships m ON m.userId=u.id
  LEFT JOIN fsdp_v5.Dojos d ON d.id=p.dojoId JOIN fsdp_v5.BeltLevels b ON b.id=p.beltId ORDER BY u.name`),
  ),
);

adminDashboardRouter.get('/payments', async (req, res) =>
  res.json(
    await query(`SELECT c.*,u.name studentName,
  a.status attemptStatus,a.providerSessionId FROM fsdp_v5.PaymentCharges c JOIN fsdp_v5.Users u ON u.id=c.studentId
  LEFT JOIN fsdp_v5.PaymentAttempts a ON a.chargeId=c.id ORDER BY c.id`),
  ),
);

adminDashboardRouter.post('/charges/:id/waive', async (req, res) => {
  const { reason } = z
    .object({ reason: z.string().trim().min(10).max(1000) })
    .parse(req.body);
  await transaction(async (tx) => {
    const [charge] = await query(
      'SELECT * FROM fsdp_v5.PaymentCharges WHERE id=@id',
      { id: req.params.id },
      tx,
    );
    ensure(
      charge && charge.status === 'pending',
      409,
      'Only pending charges can be explicitly waived.',
    );
    const [attempt] = await query(
      "SELECT TOP 1 id FROM fsdp_v5.PaymentAttempts WHERE chargeId=@id AND status IN ('creating','pending')",
      { id: charge.id },
      tx,
    );
    ensure(
      !attempt,
      409,
      'An open Checkout attempt exists. Resolve it before waiving this charge.',
    );
    await query(
      `UPDATE fsdp_v5.PaymentCharges SET status='waived' WHERE id=@id;
      UPDATE fsdp_v5.Memberships SET waiverReason=@reason WHERE userId=@studentId`,
      { id: charge.id, reason, studentId: charge.studentId },
      tx,
    );
    await activateMembership(charge.studentId, tx);
    await audit(req.user.id, 'charge.waived', charge.id, { reason }, tx);
  });
  res.json({ message: 'Fee waiver recorded; membership activated. This is not a payment.' });
});

adminDashboardRouter.get('/reports', async (req, res) => {
  const centres = await query(`SELECT d.id,d.name,
    (SELECT COUNT(*) FROM fsdp_v5.StudentProfiles p JOIN fsdp_v5.Memberships m ON m.userId=p.userId
      WHERE p.dojoId=d.id AND m.status='active') members,
    (SELECT COUNT(*) FROM fsdp_v5.AttendanceRecords a JOIN fsdp_v5.ClassSessions s ON s.id=a.sessionId
      WHERE s.dojoId=d.id AND a.status='present') verifiedVisits FROM fsdp_v5.Dojos d`);
  const attendance =
    await query(`SELECT u.name studentName,d.name dojoName,COUNT(*) verifiedVisits
    FROM fsdp_v5.AttendanceRecords a JOIN fsdp_v5.Users u ON u.id=a.studentId
    JOIN fsdp_v5.ClassSessions s ON s.id=a.sessionId JOIN fsdp_v5.Dojos d ON d.id=s.dojoId
    WHERE a.status='present' GROUP BY u.name,d.name`);
  const monthly =
    await query(`SELECT CONVERT(char(7),COALESCE(submittedAt,updatedAt),126) month,COUNT(*) applications
    FROM fsdp_v5.MembershipApplications GROUP BY CONVERT(char(7),COALESCE(submittedAt,updatedAt),126) ORDER BY month`);
  res.json({ centres, attendance, monthly });
});

adminDashboardRouter.get('/manage', async (req, res) => {
  const [dojos, sessions, instructors, settings, rules, classTypes, requirements] =
    await Promise.all([
      query('SELECT * FROM fsdp_v5.Dojos'),
      query('SELECT * FROM fsdp_v5.ClassSessions ORDER BY startsAt DESC'),
      query("SELECT id,name FROM fsdp_v5.Users WHERE role='instructor'"),
      query('SELECT * FROM fsdp_v5.Settings'),
      query(`SELECT r.*, b1.name fromBeltName, b2.name toBeltName
        FROM fsdp_v5.GradingRules r
        JOIN fsdp_v5.BeltLevels b1 ON b1.id=r.fromBelt
        JOIN fsdp_v5.BeltLevels b2 ON b2.id=r.toBelt
        ORDER BY r.fromBelt`),
      query('SELECT * FROM fsdp_v5.ClassTypes'),
      query('SELECT * FROM fsdp_v5.GradingExtraRequirements ORDER BY type'),
    ]);
  res.json({ dojos, sessions, instructors, settings, rules, classTypes, requirements });
});

adminDashboardRouter.patch('/dojos/:id', async (req, res) => {
  const data = z
    .object({
      name: z.string().trim().min(3).max(120),
      address: z.string().trim().min(5).max(250),
      active: z.boolean(),
    })
    .parse(req.body);
  await transaction(async (tx) => {
    await query(
      'UPDATE fsdp_v5.Dojos SET name=@name,address=@address,active=@active WHERE id=@id',
      { ...data, id: req.params.id },
      tx,
    );
    await audit(req.user.id, 'dojo.updated', req.params.id, data, tx);
  });
  res.json({ message: 'Dojo saved.' });
});

adminDashboardRouter.post('/sessions', async (req, res) => {
  const data = z
    .object({
      classTypeId: z.string().max(50),
      dojoId: z.string().max(50),
      instructorId: z.string().max(50),
      startsAt: z.iso.datetime(),
      endsAt: z.iso.datetime(),
      capacity: z.number().int().min(1).max(100),
    })
    .parse(req.body);
  ensure(
    new Date(data.startsAt) > new Date() && new Date(data.endsAt) > new Date(data.startsAt),
    400,
    'Choose a future session with a later end time.',
  );
  await transaction(async (tx) => {
    ensure(
      (
        await query(
          'SELECT instructorId FROM fsdp_v5.InstructorAssignments WHERE instructorId=@instructorId AND dojoId=@dojoId',
          data,
          tx,
        )
      ).length,
      400,
      'This instructor must be assigned to the selected dojo.',
    );
    const overlaps = await query(
      `SELECT id FROM fsdp_v5.ClassSessions WHERE active=1
      AND (instructorId=@instructorId OR dojoId=@dojoId) AND startsAt<@endsAt AND endsAt>@startsAt`,
      { ...data, startsAt: new Date(data.startsAt), endsAt: new Date(data.endsAt) },
      tx,
    );
    ensure(!overlaps.length, 409, 'Instructor or dojo already has a session at that time.');
    const sessionId = id();
    await query(
      `INSERT fsdp_v5.ClassSessions(id,classTypeId,dojoId,instructorId,startsAt,endsAt,capacity)
      VALUES(@id,@classTypeId,@dojoId,@instructorId,@startsAt,@endsAt,@capacity)`,
      { ...data, id: sessionId },
      tx,
    );
    await audit(req.user.id, 'session.created', sessionId, data, tx);
  });
  res.status(201).json({ message: 'Class session created.' });
});

adminDashboardRouter.patch('/sessions/:id', async (req, res) => {
  const data = z
    .object({ active: z.boolean(), capacity: z.number().int().min(1).max(100) })
    .parse(req.body);
  await transaction(async (tx) => {
    const [{ total }] = await query(
      "SELECT COUNT(*) total FROM fsdp_v5.ClassBookings WHERE sessionId=@id AND status='confirmed'",
      { id: req.params.id },
      tx,
    );
    ensure(
      data.capacity >= total,
      400,
      'Capacity cannot be lower than confirmed bookings.',
    );
    await query(
      'UPDATE fsdp_v5.ClassSessions SET active=@active,capacity=@capacity WHERE id=@id',
      { ...data, id: req.params.id },
      tx,
    );
    await audit(req.user.id, 'session.updated', req.params.id, data, tx);
  });
  res.json({ message: 'Session saved.' });
});

adminDashboardRouter.patch('/settings/registration-fee', async (req, res) => {
  const { amount } = z
    .object({ amount: z.number().int().min(100).max(100000) })
    .parse(req.body);
  await transaction(async (tx) => {
    await query(
      "UPDATE fsdp_v5.Settings SET value=@value WHERE id='registration_fee'",
      { value: String(amount) },
      tx,
    );
    await audit(req.user.id, 'fee.updated', 'registration_fee', { amount }, tx);
  });
  res.json({ message: 'Future registration fee saved. Existing charges keep their approved price.' });
});

adminDashboardRouter.patch('/rules/:id', async (req, res) => {
  const data = z
    .object({
      minSessions: z.number().int().min(1).max(500),
      minDays: z.number().int().min(0).max(3650),
    })
    .parse(req.body);
  await transaction(async (tx) => {
    await query(
      'UPDATE fsdp_v5.GradingRules SET minSessions=@minSessions,minDays=@minDays,minMonths=FLOOR(@minDays / 30) WHERE id=@id',
      { ...data, id: req.params.id },
      tx,
    );
    await audit(req.user.id, 'grading.rule.updated', req.params.id, data, tx);
  });
  res.json({ message: 'Rule saved. Readiness refreshes from the stored rule.' });
});

const extraRuleSchema = z.object({
  type: z.enum(['performance', 'membership_days', 'training_centres']),
  requiredValue: z.number().int(),
});
function validateExtraRule({ type, requiredValue }) {
  ensure(
    (type === 'performance' && requiredValue === 1) ||
    (type === 'membership_days' && requiredValue >= 0 && requiredValue <= 365) ||
    (type === 'training_centres' && requiredValue >= 1 && requiredValue <= 10),
    400,
    'Invalid requirement: performance must be 1; membership days 0–365; centres 1–10.',
  );
}

adminDashboardRouter.put('/rules/:id/additional', async (req, res) => {
  const data = extraRuleSchema.parse(req.body);
  validateExtraRule(data);
  await transaction(async (tx) => {
    const [rule] = await query(
      'SELECT id FROM fsdp_v5.GradingRules WHERE id=@id',
      { id: req.params.id },
      tx,
    );
    ensure(rule, 404, 'Grading transition not found.');
    await query(
      `IF EXISTS (
         SELECT 1 FROM fsdp_v5.GradingExtraRequirements
         WHERE ruleId=@ruleId AND type=@type
       )
         UPDATE fsdp_v5.GradingExtraRequirements
         SET requiredValue=@requiredValue
         WHERE ruleId=@ruleId AND type=@type;
       ELSE
         INSERT fsdp_v5.GradingExtraRequirements(id,ruleId,type,requiredValue)
         VALUES(@id,@ruleId,@type,@requiredValue);`,
      {
        ...data,
        id: id(),
        ruleId: req.params.id,
      },
      tx,
    );
    await audit(req.user.id, 'grading.extra.saved', req.params.id, data, tx);
  });
  res.json({ message: 'Additional requirement saved for this belt transition.' });
});

adminDashboardRouter.delete('/rules/:id/additional/:type', async (req, res) => {
  const type = z
    .enum(['performance', 'membership_days', 'training_centres'])
    .parse(req.params.type);
  await transaction(async (tx) => {
    const [existing] = await query(
      `SELECT id FROM fsdp_v5.GradingExtraRequirements
       WHERE ruleId=@ruleId AND type=@type`,
      { ruleId: req.params.id, type },
      tx,
    );
    ensure(existing, 404, 'Additional requirement not found.');
    await query(
      'DELETE fsdp_v5.GradingExtraRequirements WHERE id=@id',
      { id: existing.id },
      tx,
    );
    await audit(
      req.user.id,
      'grading.extra.removed',
      req.params.id,
      { type },
      tx,
    );
  });
  res.json({ message: 'Additional requirement removed.' });
});
