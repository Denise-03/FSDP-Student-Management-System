import { Router } from 'express';
import { query, transaction } from '../../core/config/database.js';
import { roles } from '../../core/middleware/auth.js';
import { readiness } from '../grading-readiness/gradingReadiness.service.js';
<<<<<<< HEAD
import { z } from 'zod';
import { ensure } from '../../core/errors/HttpError.js';
import { audit } from '../../core/utils/records.js';
import { canTeachStudent } from '../attendance/attendance.service.js';
import { refreshReadiness } from '../grading-readiness/gradingReadiness.service.js';
export const instructorDashboardRouter = Router();
instructorDashboardRouter.use(roles('instructor'));

=======
export const instructorDashboardRouter = Router();
instructorDashboardRouter.use(roles('instructor'));
>>>>>>> 9ae1f96d3ab84d0cac50e53b0bfbe3ea036f12f2
instructorDashboardRouter.get('/', async (req, res) => {
  const sessions = await query(
    `SELECT s.*,c.name className,d.name dojoName,
    (SELECT COUNT(*) FROM fsdp_v5.ClassBookings b WHERE b.sessionId=s.id AND b.status='confirmed') booked
    FROM fsdp_v5.ClassSessions s JOIN fsdp_v5.ClassTypes c ON c.id=s.classTypeId
    JOIN fsdp_v5.Dojos d ON d.id=s.dojoId WHERE s.instructorId=@id
    ORDER BY s.startsAt DESC`,
    { id: req.user.id },
  );
  const assigned = await query(
    `SELECT DISTINCT u.id,u.name FROM fsdp_v5.Users u
    JOIN fsdp_v5.ClassBookings b ON b.studentId=u.id JOIN fsdp_v5.ClassSessions s ON s.id=b.sessionId
    WHERE s.instructorId=@id AND b.status='confirmed'`,
    { id: req.user.id },
  );
  const students = [];
  for (const student of assigned) {
    const state = await readiness(student.id);
    state.profile = state.profile
      ? {
          beltName: state.profile.beltName,
          beltId: state.profile.beltId,
          rankStart: state.profile.rankStart,
          membershipStatus: state.profile.membershipStatus,
        }
      : null;
    const recent = state.records.filter(
      (r) =>
        r.status === 'present' &&
        r.verifiedBy &&
        new Date(r.happenedAt) >= new Date(Date.now() - 30 * 86400000),
    ).length;
    students.push({ ...student, readiness: state, recent, lowAttendance: recent < 2 });
  }
  res.json({ sessions, students });
});

instructorDashboardRouter.post('/students/:id/follow-up', async (req, res) => {
  const { canTeachStudent } = await import('../attendance/attendance.service.js');
  const { notify, audit } = await import('../../core/utils/records.js');
  await transaction(async (tx) => {
    await canTeachStudent(req.user.id, req.params.id, tx);
    await notify(
      req.params.id,
      `followup:${new Date().toISOString().slice(0, 7)}`,
      'Your instructor is here to help you return to practice. Contact your centre if you need support.',
      tx,
    );
    await audit(req.user.id, 'student.followup', req.params.id, {}, tx);
  });
  res.json({ message: 'A supportive in-app reminder is saved (one per month).' });
});
<<<<<<< HEAD

instructorDashboardRouter.put('/students/:id/performance', async (req, res) => {
  const data = z.object({
    passed: z.boolean(),
    feedback: z.string().trim().max(500).default(''),
  }).parse(req.body);
  const readinessState = await transaction(async (tx) => {
    await canTeachStudent(req.user.id, req.params.id, tx);
    const [student] = await query(
      `SELECT beltId,rankStart FROM fsdp_v5.StudentProfiles
       WHERE userId=@studentId AND verified=1`,
      { studentId: req.params.id },
      tx,
    );
    ensure(
      student?.rankStart,
      400,
      'Student must have a verified current rank.',
    );
    await query(
      `IF EXISTS (
        SELECT 1 FROM fsdp_v5.StudentPerformanceEndorsements
        WHERE studentId=@studentId AND beltId=@beltId AND rankStart=@rankStart
      )
        UPDATE fsdp_v5.StudentPerformanceEndorsements
        SET passed=@passed,
            instructorId=@instructorId,
            feedback=@feedback,
            updatedAt=SYSUTCDATETIME()
        WHERE studentId=@studentId AND beltId=@beltId AND rankStart=@rankStart;
       ELSE
        INSERT fsdp_v5.StudentPerformanceEndorsements
          (studentId,beltId,rankStart,passed,instructorId,feedback)
        VALUES(@studentId,@beltId,@rankStart,@passed,@instructorId,@feedback);`,
      {
        ...data,
        studentId: req.params.id,
        beltId: student.beltId,
        rankStart: student.rankStart,
        instructorId: req.user.id,
      },
      tx,
    );
    await audit(
      req.user.id,
      'student.performance.reviewed',
      req.params.id,
      data,
      tx,
    );
    return refreshReadiness(req.params.id, tx);
  });
  res.json({ message: 'Performance review saved.', readiness: readinessState });
});
=======
>>>>>>> 9ae1f96d3ab84d0cac50e53b0bfbe3ea036f12f2
