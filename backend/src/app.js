import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ZodError } from 'zod';
import { config } from './core/config/env.js';
import { loadSession, csrf } from './core/middleware/auth.js';
import { query } from './core/config/database.js';
import { authenticationRouter } from './modules/authentication/authentication.routes.js';
import { publicSiteRouter } from './modules/public-site/publicSite.routes.js';
import { membershipEnrolmentRouter } from './modules/membership-enrolment/membershipEnrolment.routes.js';
import { studentProfilesRouter } from './modules/student-profiles/studentProfiles.routes.js';
import { dojosClassesRouter } from './modules/dojos-classes/dojosClasses.routes.js';
import { attendanceRouter } from './modules/attendance/attendance.routes.js';
import { gradingReadinessRouter } from './modules/grading-readiness/gradingReadiness.routes.js';
import { gradingApplicationsRouter } from './modules/grading-applications/gradingApplications.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { studentDashboardRouter } from './modules/student-dashboard/studentDashboard.routes.js';
import { instructorDashboardRouter } from './modules/instructor-dashboard/instructorDashboard.routes.js';
import { instructorAssessmentRouter } from './modules/instructor-assessment/instructorAssessment.routes.js';
import { paymentsRouter, paymentWebhook } from './modules/payments/payments.routes.js';
import { adminDashboardRouter } from './modules/admin-dashboard/adminDashboard.routes.js';
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.origin, credentials: true }));
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.post(
    '/api/payments/webhook',
    express.raw({ type: 'application/json', limit: '1mb' }),
    paymentWebhook,
  );
  app.use(express.json({ limit: '100kb' }), cookieParser(), loadSession, csrf);
  app.use('/api', (req, res, next) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.get('origin') &&
      req.get('origin') !== config.origin
    )
      return res.status(403).json({ message: 'Request origin is not allowed.' });
    next();
  });
  app.get('/api/health', async (req, res) => {
    await query('SELECT TOP 1 name FROM fsdp_v5.Migrations');
    res.json({ status: 'ok', database: config.database, schema: 'fsdp_v5' });
  });
  const routes = {
    auth: authenticationRouter,
    public: publicSiteRouter,
    enrolment: membershipEnrolmentRouter,
    profile: studentProfilesRouter,
    classes: dojosClassesRouter,
    attendance: attendanceRouter,
    readiness: gradingReadinessRouter,
    grading: gradingApplicationsRouter,
    notifications: notificationsRouter,
    student: studentDashboardRouter,
    instructor: instructorDashboardRouter,
    assessments: instructorAssessmentRouter,
    payments: paymentsRouter,
    admin: adminDashboardRouter,
  };
  for (const [name, router] of Object.entries(routes)) app.use(`/api/${name}`, router);
  app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
  app.use((error, req, res, next) => {
    if (error instanceof ZodError)
      return res.status(400).json({
        message: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      });
    if (error.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ message: 'PDF must be 2 MB or smaller.' });
    const status =
      error.status || (error.number === 2627 || error.number === 2601 ? 409 : 500);
    if (status === 500) console.error('API error:', error.message);
    res.status(status).json({
      message:
        status === 500
          ? 'The request could not be completed. Check the local server log.'
          : error.message,
    });
  });
  return app;
}
