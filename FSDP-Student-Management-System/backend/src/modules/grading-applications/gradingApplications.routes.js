import { Router } from 'express';
import { z } from 'zod';
import { query, transaction } from '../../core/config/database.js';
import { memberRoles } from '../../core/middleware/auth.js';
import { ensure } from '../../core/errors/HttpError.js';
import { id, notify, audit } from '../../core/utils/records.js';
import { refreshReadiness } from '../grading-readiness/gradingReadiness.service.js';
export const gradingApplicationsRouter = Router();
gradingApplicationsRouter.use(memberRoles);
gradingApplicationsRouter.get('/', async (req, res) => {
  const sessions = await query(
    'SELECT * FROM fsdp_v5.GradingSessions WHERE active=1 ORDER BY startsAt',
  );
  const applications = await query(
    `SELECT g.*,s.name sessionName,s.startsAt,a.result,a.feedback,a.acknowledgement
    FROM fsdp_v5.GradingApplications g JOIN fsdp_v5.GradingSessions s ON s.id=g.gradingSessionId
    LEFT JOIN fsdp_v5.InstructorAssessments a ON a.gradingApplicationId=g.id
    WHERE g.studentId=@studentId`,
    { studentId: req.user.id },
  );
  res.json({ sessions, applications });
});
gradingApplicationsRouter.post('/', async (req, res) => {
  const { gradingSessionId } = z
    .object({ gradingSessionId: z.string().max(50) })
    .parse(req.body);
  const applicationId = id();
  await transaction(async (tx) => {
    const state = await refreshReadiness(req.user.id, tx);
    ensure(state.eligible, 403, state.reasons.join(' '));
    const [session] = await query(
      `SELECT * FROM fsdp_v5.GradingSessions WHERE id=@id
      AND active=1 AND opensAt<=SYSUTCDATETIME() AND closesAt>SYSUTCDATETIME()`,
      { id: gradingSessionId },
      tx,
    );
    ensure(session, 400, 'This grading application window is closed.');
    ensure(
      !(
        await query(
          'SELECT id FROM fsdp_v5.GradingApplications WHERE studentId=@studentId AND gradingSessionId=@gradingSessionId',
          { studentId: req.user.id, gradingSessionId },
          tx,
        )
      ).length,
      409,
      'You already applied for this grading session.',
    );
    await query(
      `INSERT fsdp_v5.GradingApplications(id,studentId,gradingSessionId)
      VALUES(@id,@studentId,@gradingSessionId)`,
      { id: applicationId, studentId: req.user.id, gradingSessionId },
      tx,
    );
    await notify(
      req.user.id,
      `grading:${applicationId}`,
      'Your grading application has been submitted.',
      tx,
    );
    await audit(req.user.id, 'grading.applied', applicationId, {}, tx);
  });
  res.status(201).json({ id: applicationId, message: 'Grading application submitted.' });
});
