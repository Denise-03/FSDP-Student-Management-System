import { Router } from 'express';
import { z } from 'zod';
import { query, transaction } from '../../core/config/database.js';
import { roles } from '../../core/middleware/auth.js';
import { ensure } from '../../core/errors/HttpError.js';
import { id, audit, notify } from '../../core/utils/records.js';

export const instructorAssessmentRouter = Router();

instructorAssessmentRouter.use(roles('instructor'));

// GET: Retrieve grading applications assigned to the instructor
instructorAssessmentRouter.get('/', async (req, res) =>
  res.json(
    await query(
      `SELECT
        g.*,
        u.name studentName,
        s.name sessionName,
        s.startsAt,
        p.rankStart,
        a.result,
        a.feedback,
        a.acknowledgement,
        a.timeInRankDays

      FROM fsdp_v5.GradingApplications g

      JOIN fsdp_v5.GradingSessions s
        ON s.id = g.gradingSessionId

      JOIN fsdp_v5.Users u
        ON u.id = g.studentId

      JOIN fsdp_v5.StudentProfiles p
        ON p.userId = u.id

      LEFT JOIN fsdp_v5.InstructorAssessments a
        ON a.gradingApplicationId = g.id

      WHERE s.instructorId = @id
        AND g.status = 'pending'`,
      { id: req.user.id },
    ),
  ),
);

// POST: Submit instructor assessment
instructorAssessmentRouter.post('/:id', async (req, res) => {
  const data = z
    .object({
      result: z.enum(['recommend_pass', 'further_training']),
      feedback: z.string().trim().min(10).max(2000),
      acknowledgement: z.string().trim().min(2).max(120),
    })
    .parse(req.body);
  ensure(
    data.acknowledgement === req.user.name,
    400,
    'Sign using your authenticated instructor name.',
  );

  await transaction(async (tx) => {
    const [candidate] = await query(
      `SELECT
        g.*,
        p.rankStart,
        s.startsAt

      FROM fsdp_v5.GradingApplications g

      JOIN fsdp_v5.GradingSessions s
        ON s.id = g.gradingSessionId

      JOIN fsdp_v5.StudentProfiles p
        ON p.userId = g.studentId

      WHERE g.id = @id
        AND s.instructorId = @instructorId`,
      {
        id: req.params.id,
        instructorId: req.user.id,
      },
      tx,
    );

    ensure(
      candidate,
      404,
      'Grading application not found.',
    );

    ensure(
      candidate.status === 'pending',
      409,
      'This application is no longer awaiting assessment.',
    );

    ensure(
      new Date(candidate.startsAt) <= new Date(),
      400,
      'Assessment submission opens when the grading session starts.',
    );

    // Check whether an instructor assessment already exists
    const [existingAssessment] = await query(
      `SELECT id
       FROM fsdp_v5.InstructorAssessments
       WHERE gradingApplicationId = @id`,
      { id: candidate.id },
      tx,
    );

    ensure(
      !existingAssessment,
      409,
      'This signed assessment was already submitted.',
    );

    const timeInRankDays = Math.max(
      0,
      Math.floor(
        (new Date(candidate.startsAt) -
          new Date(candidate.rankStart)) /
          86400000,
      ),
    );

    // Save instructor assessment
    await query(
      `INSERT fsdp_v5.InstructorAssessments(
        id,
        gradingApplicationId,
        instructorId,
        result,
        feedback,
        timeInRankDays,
        acknowledgement
      )

      VALUES(
        @id,
        @applicationId,
        @instructorId,
        @result,
        @feedback,
        @timeInRankDays,
        @acknowledgement
      )`,
      {
        ...data,
        id: id(),
        applicationId: candidate.id,
        instructorId: req.user.id,
        timeInRankDays,
      },
      tx,
    );

    // Application remains pending until admin makes the final decision.
    await audit(
      req.user.id,
      'assessment.submitted',
      candidate.id,
      data,
      tx,
    );

    await notify(
      candidate.studentId,
      `assessment:${candidate.id}`,
      'Your signed assessment was submitted for further processing. Your belt has not changed.',
      tx,
    );
  });

  res.status(201).json({
    message: 'Assessment submitted for further processing.',
  });
});
