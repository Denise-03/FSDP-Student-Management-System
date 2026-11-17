import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { query, transaction } from '../../core/config/database.js';
import { ensure } from '../../core/errors/HttpError.js';
import { tokenHash } from '../../core/middleware/auth.js';
import { id, notify } from '../../core/utils/records.js';
export const authenticationRouter = Router();
const credentials = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(10).max(100),
});
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
async function createSession(user, res) {
  const token = randomBytes(32).toString('hex');
  const csrf = randomBytes(24).toString('hex');
  await query(
    `INSERT fsdp_v5.Sessions(id,userId,csrf,expiresAt)
    VALUES(@id,@userId,@csrf,DATEADD(hour,12,SYSUTCDATETIME()))`,
    { id: tokenHash(token), userId: user.id, csrf },
  );
  res.cookie('fsdp_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000,
    path: '/',
  });
  return { id: user.id, name: user.name, email: user.email, role: user.role, csrf };
}
authenticationRouter.post('/register', limiter, async (req, res) => {
  const data = credentials
    .extend({ name: z.string().trim().min(2).max(120) })
    .parse(req.body);
  const user = { ...data, id: id(), role: 'applicant' };
  const passwordHash = await bcrypt.hash(data.password, 12);
  await transaction(async (tx) => {
    ensure(
      !(await query('SELECT id FROM fsdp_v5.Users WHERE email=@email', data, tx)).length,
      409,
      'This email is already registered. Please sign in.',
    );
    await query(
      `INSERT fsdp_v5.Users(id,email,name,passwordHash,role)
      VALUES(@id,@email,@name,@passwordHash,'applicant');
      INSERT fsdp_v5.StudentProfiles(userId) VALUES(@id);`,
      { ...user, passwordHash },
      tx,
    );
    await notify(
      user.id,
      'welcome',
      'Welcome. Complete your application to join training.',
      tx,
    );
  });
  res.status(201).json(await createSession(user, res));
});
authenticationRouter.post('/login', limiter, async (req, res) => {
  const data = credentials.parse(req.body);
  const [user] = await query('SELECT * FROM fsdp_v5.Users WHERE email=@email', data);
  ensure(
    user && (await bcrypt.compare(data.password, user.passwordHash)),
    401,
    'Email or password is incorrect.',
  );
  res.json(await createSession(user, res));
});
authenticationRouter.get('/me', (req, res) => res.json(req.user || null));
authenticationRouter.post('/logout', async (req, res) => {
  if (req.cookies.fsdp_session)
    await query('DELETE fsdp_v5.Sessions WHERE id=@id', {
      id: tokenHash(req.cookies.fsdp_session),
    });
  res.clearCookie('fsdp_session', { path: '/' });
  res.json({ message: 'Signed out.' });
});
