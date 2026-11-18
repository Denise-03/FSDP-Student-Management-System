import { Router } from 'express';
import { query, transaction } from '../../core/config/database.js';
import { roles } from '../../core/middleware/auth.js';
import { readiness } from '../grading-readiness/gradingReadiness.service.js';
export const instructorDashboardRouter = Router();
instructorDashboardRouter.use(roles('instructor'));
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
