import { Router } from 'express';
import { query, transaction } from '../../core/config/database.js';
import { memberRoles } from '../../core/middleware/auth.js';
import { ensure } from '../../core/errors/HttpError.js';
import { audit } from '../../core/utils/records.js';
import { bookClass } from './dojosClasses.service.js';
export const dojosClassesRouter = Router();
dojosClassesRouter.use(memberRoles);
dojosClassesRouter.get('/bookings', async (req, res) =>
  res.json(
    await query(
      `SELECT b.*,s.startsAt,s.endsAt,
  c.name className,d.name dojoName,u.name instructorName FROM fsdp_v5.ClassBookings b
  JOIN fsdp_v5.ClassSessions s ON s.id=b.sessionId JOIN fsdp_v5.ClassTypes c ON c.id=s.classTypeId
  JOIN fsdp_v5.Dojos d ON d.id=s.dojoId JOIN fsdp_v5.Users u ON u.id=s.instructorId
  WHERE b.studentId=@studentId ORDER BY s.startsAt DESC`,
      { studentId: req.user.id },
    ),
  ),
);
dojosClassesRouter.post('/bookings', async (req, res) => {
  ensure(
    typeof req.body.sessionId === 'string' && req.body.sessionId.length <= 50,
    400,
    'Choose a session.',
  );
  res.status(201).json(await bookClass(req.user.id, req.body.sessionId));
});
dojosClassesRouter.delete('/bookings/:id', async (req, res) => {
  await transaction(async (tx) => {
    const [booking] = await query(
      `SELECT b.*,s.startsAt FROM fsdp_v5.ClassBookings b
      JOIN fsdp_v5.ClassSessions s ON s.id=b.sessionId WHERE b.id=@id AND b.studentId=@studentId`,
      { id: req.params.id, studentId: req.user.id },
      tx,
    );
    ensure(
      booking && new Date(booking.startsAt) > new Date(),
      400,
      'Only your future bookings can be cancelled.',
    );
    await query(
      "UPDATE fsdp_v5.ClassBookings SET status='cancelled' WHERE id=@id",
      { id: booking.id },
      tx,
    );
    await audit(req.user.id, 'booking.cancelled', booking.id, {}, tx);
  });
  res.json({ message: 'Booking cancelled.' });
});
