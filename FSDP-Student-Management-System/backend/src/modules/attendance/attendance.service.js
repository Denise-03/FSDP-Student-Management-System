import { query, transaction } from '../../core/config/database.js';
import { ensure } from '../../core/errors/HttpError.js';
import { id, audit, notify } from '../../core/utils/records.js';
import { refreshReadiness } from '../grading-readiness/gradingReadiness.service.js';
export async function assignedSession(instructorId, sessionId, tx) {
  const [session] = await query(
    `SELECT s.*,c.name className,d.name dojoName
    FROM fsdp_v5.ClassSessions s JOIN fsdp_v5.ClassTypes c ON c.id=s.classTypeId
    JOIN fsdp_v5.Dojos d ON d.id=s.dojoId
    WHERE s.id=@sessionId AND s.instructorId=@instructorId`,
    { instructorId, sessionId },
    tx,
  );
  ensure(session, 403, 'You are not assigned to this class session.');
  return session;
}
export async function markAttendance(instructorId, sessionId, studentId, status) {
  return transaction(async (tx) => {
    const session = await assignedSession(instructorId, sessionId, tx);
    ensure(
      new Date(session.startsAt) <= new Date(),
      400,
      'Attendance opens when the session starts.',
    );
    ensure(session.active, 400, 'Attendance cannot be recorded for a cancelled session.');
    ensure(
      (
        await query(
          `SELECT id FROM fsdp_v5.ClassBookings WHERE sessionId=@sessionId
      AND studentId=@studentId AND status='confirmed'`,
          { sessionId, studentId },
          tx,
        )
      ).length,
      403,
      'Only confirmed students on this roster can be marked.',
    );
    const [before] = await query(
      'SELECT * FROM fsdp_v5.AttendanceRecords WHERE studentId=@studentId AND sessionId=@sessionId',
      { studentId, sessionId },
      tx,
    );
    if (before)
      await query(
        `UPDATE fsdp_v5.AttendanceRecords SET status=@status,
      verifiedBy=@instructorId,updatedAt=SYSUTCDATETIME() WHERE id=@id`,
        { id: before.id, status, instructorId },
        tx,
      );
    else
      await query(
        `INSERT fsdp_v5.AttendanceRecords(id,studentId,sessionId,status,verifiedBy)
      VALUES(@id,@studentId,@sessionId,@status,@instructorId)`,
        { id: id(), studentId, sessionId, status, instructorId },
        tx,
      );
    await audit(
      instructorId,
      'attendance.corrected',
      `${sessionId}:${studentId}`,
      { before: before?.status || null, after: status },
      tx,
    );
    await notify(
      studentId,
      `attendance:${sessionId}:${status}`,
      `Attendance at ${session.dojoName} recorded as ${status}.`,
      tx,
    );
    return {
      message: 'Verified attendance saved.',
      readiness: await refreshReadiness(studentId, tx),
    };
  });
}
export async function canTeachStudent(instructorId, studentId, tx) {
  const permitted = await query(
    `SELECT TOP 1 b.id FROM fsdp_v5.ClassBookings b
    JOIN fsdp_v5.ClassSessions s ON s.id=b.sessionId
    WHERE s.instructorId=@instructorId AND b.studentId=@studentId AND b.status='confirmed'`,
    { instructorId, studentId },
    tx,
  );
  ensure(permitted.length, 403, 'This student is not assigned to your classes.');
}
