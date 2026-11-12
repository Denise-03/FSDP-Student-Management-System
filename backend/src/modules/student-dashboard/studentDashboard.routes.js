import { Router } from 'express';
import { query } from '../../core/config/database.js';
import { memberRoles } from '../../core/middleware/auth.js';
import { readAndRefresh } from '../grading-readiness/gradingReadiness.service.js';
export const studentDashboardRouter = Router();
studentDashboardRouter.get('/', memberRoles, async (req, res) => {
  const state = await readAndRefresh(req.user.id);
  const bookings = await query(
    `SELECT b.id,s.startsAt,c.name className,d.name dojoName
    FROM fsdp_v5.ClassBookings b JOIN fsdp_v5.ClassSessions s ON s.id=b.sessionId
    JOIN fsdp_v5.ClassTypes c ON c.id=s.classTypeId JOIN fsdp_v5.Dojos d ON d.id=s.dojoId
    WHERE b.studentId=@id AND b.status='confirmed' AND s.startsAt>SYSUTCDATETIME()
    ORDER BY s.startsAt`,
    { id: req.user.id },
  );
  const notifications = await query(
    'SELECT TOP 4 * FROM fsdp_v5.Notifications WHERE userId=@id ORDER BY createdAt DESC',
    { id: req.user.id },
  );
  res.json({ readiness: state, bookings, notifications });
});
