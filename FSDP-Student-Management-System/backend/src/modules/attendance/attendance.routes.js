import { Router } from 'express';
import { z } from 'zod';
import { query, transaction } from '../../core/config/database.js';
import { memberRoles, roles } from '../../core/middleware/auth.js';
import { ensure } from '../../core/errors/HttpError.js';
import { id, audit } from '../../core/utils/records.js';
import {
  readAndRefresh,
  refreshReadiness,
} from '../grading-readiness/gradingReadiness.service.js';
import { assignedSession, markAttendance, canTeachStudent } from './attendance.service.js';
export const attendanceRouter = Router();
attendanceRouter.get('/mine', memberRoles, async (req, res) =>
  res.json(await readAndRefresh(req.user.id)),
);
attendanceRouter.get('/sessions/:id', roles('instructor'), async (req, res) => {
  const session = await assignedSession(req.user.id, req.params.id);
  const roster = await query(
    `SELECT u.id,u.name,b.id bookingId,a.status,
    a.updatedAt FROM fsdp_v5.ClassBookings b JOIN fsdp_v5.Users u ON u.id=b.studentId
    LEFT JOIN fsdp_v5.AttendanceRecords a ON a.studentId=b.studentId AND a.sessionId=b.sessionId
    WHERE b.sessionId=@sessionId AND b.status='confirmed' ORDER BY u.name`,
    { sessionId: session.id },
  );
  res.json({ session, roster });
});
attendanceRouter.put('/sessions/:id', roles('instructor'), async (req, res) => {
  const data = z
    .object({ studentId: z.string().max(50), status: z.enum(['present', 'absent']) })
    .parse(req.body);
  res.json(await markAttendance(req.user.id, req.params.id, data.studentId, data.status));
});
attendanceRouter.post('/external', memberRoles, async (req, res) => {
  const data = z
    .object({
      eventKey: z.string().trim().min(4).max(100),
      centre: z.string().trim().min(3).max(120),
      happenedAt: z.iso.datetime(),
    })
    .parse(req.body);
  ensure(
    data.eventKey.startsWith('external:'),
    400,
    'Use an external: event reference to avoid duplicating an internal session.',
  );
  ensure(
    new Date(data.happenedAt) <= new Date(),
    400,
    'Training must have already happened.',
  );
  await transaction(async (tx) => {
    ensure(
      !(
        await query(
          'SELECT id FROM fsdp_v5.ExternalTrainingRecords WHERE studentId=@studentId AND eventKey=@eventKey',
          { ...data, studentId: req.user.id },
          tx,
        )
      ).length,
      409,
      'This external event was already submitted.',
    );
    await query(
      `INSERT fsdp_v5.ExternalTrainingRecords(id,studentId,eventKey,centre,happenedAt,qualifying)
      VALUES(@id,@studentId,@eventKey,@centre,@happenedAt,0)`,
      { ...data, id: id(), studentId: req.user.id },
      tx,
    );
  });
  res.status(201).json({ message: 'External training submitted for verification.' });
});
attendanceRouter.get('/external/review', roles('instructor'), async (req, res) =>
  res.json(
    await query(
      `
  SELECT e.*,u.name studentName FROM fsdp_v5.ExternalTrainingRecords e
  JOIN fsdp_v5.Users u ON u.id=e.studentId
  WHERE EXISTS(SELECT 1 FROM fsdp_v5.ClassBookings b
    JOIN fsdp_v5.ClassSessions s ON s.id=b.sessionId
    WHERE b.studentId=e.studentId AND s.instructorId=@instructorId AND b.status='confirmed')`,
      { instructorId: req.user.id },
    ),
  ),
);
attendanceRouter.patch('/external/:id/verify', roles('instructor'), async (req, res) => {
  const { qualifying } = z.object({ qualifying: z.boolean() }).parse(req.body);
  await transaction(async (tx) => {
    const [record] = await query(
      'SELECT * FROM fsdp_v5.ExternalTrainingRecords WHERE id=@id',
      { id: req.params.id },
      tx,
    );
    ensure(record, 404, 'Training record not found.');
    await canTeachStudent(req.user.id, record.studentId, tx);
    await query(
      'UPDATE fsdp_v5.ExternalTrainingRecords SET qualifying=@qualifying,verifiedBy=@instructorId WHERE id=@id',
      { qualifying, instructorId: req.user.id, id: record.id },
      tx,
    );
    await audit(req.user.id, 'external.verified', record.id, { qualifying }, tx);
    await refreshReadiness(record.studentId, tx);
  });
  res.json({ message: 'External training verification saved.' });
});
