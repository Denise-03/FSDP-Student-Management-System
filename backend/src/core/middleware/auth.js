import { createHash } from 'node:crypto';
import { query } from '../config/database.js';
import { ensure } from '../errors/HttpError.js';
export const tokenHash = (token) => createHash('sha256').update(token).digest('hex');
export async function loadSession(req, res, next) {
  try {
    const token = req.cookies?.fsdp_session;
    if (token) {
      const [session] = await query(
        `SELECT u.id,u.name,u.email,u.role,s.csrf
        FROM fsdp_v5.Sessions s JOIN fsdp_v5.Users u ON u.id=s.userId
        WHERE s.id=@id AND s.expiresAt>SYSUTCDATETIME()`,
        { id: tokenHash(token) },
      );
      req.user = session;
    }
    next();
  } catch (error) {
    next(error);
  }
}
export const roles =
  (...allowed) =>
  (req, res, next) => {
    try {
      ensure(req.user, 401, 'Please sign in.');
      ensure(
        allowed.includes(req.user.role),
        403,
        'Your account cannot access this action.',
      );
      next();
    } catch (error) {
      next(error);
    }
  };
export function csrf(req, res, next) {
  try {
    if (req.user && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      ensure(
        req.get('x-csrf-token') === req.user.csrf,
        403,
        'Refresh this page and try again.',
      );
    }
    next();
  } catch (error) {
    next(error);
  }
}
export const memberRoles = roles('applicant', 'student');
