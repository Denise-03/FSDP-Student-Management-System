import { Router } from 'express';
import { roles } from '../../core/middleware/auth.js';
import { query } from '../../core/config/database.js';
export const notificationsRouter = Router();
notificationsRouter.use(roles('applicant', 'student', 'instructor', 'admin'));
notificationsRouter.get('/', async (req, res) =>
  res.json(
    await query(
      'SELECT * FROM fsdp_v5.Notifications WHERE userId=@userId ORDER BY createdAt DESC',
      { userId: req.user.id },
    ),
  ),
);
notificationsRouter.patch('/:id/read', async (req, res) => {
  await query(
    `UPDATE fsdp_v5.Notifications SET readAt=SYSUTCDATETIME()
    WHERE id=@id AND userId=@userId`,
    { id: req.params.id, userId: req.user.id },
  );
  res.json({ message: 'Notification marked as read.' });
});
