import { Router } from 'express';
import { memberRoles } from '../../core/middleware/auth.js';
import { readAndRefresh } from './gradingReadiness.service.js';
export const gradingReadinessRouter = Router();
gradingReadinessRouter.get('/', memberRoles, async (req, res) =>
  res.json(await readAndRefresh(req.user.id)),
);
