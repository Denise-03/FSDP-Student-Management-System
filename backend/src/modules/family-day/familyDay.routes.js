import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { roles } from '../../core/middleware/auth.js';
import { query, sql } from '../../core/config/database.js';
import { HttpError, ensure } from '../../core/errors/HttpError.js';
import { audit } from '../../core/utils/records.js';
import { validateRegistration } from './familyDay.validation.js';

export const familyDayRouter = Router();
familyDayRouter.use(roles('student'));

// Same columns for every response, with friendly names for the frontend.
const SELECT_REGISTRATION = `
  SELECT registrationId, parentName, contactEmail,
    adultCount AS adults, childCount AS children,
    adultCount + childCount AS totalPeople,
    dietaryNeeds, whoMayBeJoining, additionalInfo,
    updatesConsent, status, createdAt, updatedAt, withdrawnAt
  FROM fsdp_v5.family_registrations`;

// Example: FD-9A3F1C2B. The table's primary key keeps it unique.
const newRegistrationId = () => `FD-${randomBytes(4).toString('hex').toUpperCase()}`;

const CONNECTION_CODES = ['ESOCKET', 'ETIMEOUT', 'ELOGIN', 'ECONNCLOSED', 'ENOTOPEN'];
function isDatabaseDown(error) {
  const connectionError = sql.ConnectionError;
  return (
    (connectionError && error instanceof connectionError) ||
    CONNECTION_CODES.includes(error?.code)
  );
}

// Turns low-level database problems into clear API answers.
async function withDatabase(work) {
  try {
    return await work();
  } catch (error) {
    if (error.status) throw error;
    if (isDatabaseDown(error)) {
      throw new HttpError(
        503,
        'Registration is temporarily unavailable. Please try again shortly.',
      );
    }
    // 2627 / 2601 = unique key already used (the student is already registered).
    if (error.number === 2627 || error.number === 2601) {
      throw new HttpError(
        409,
        'Your household has already registered interest. Use Manage interest to change it.',
      );
    }
    throw error;
  }
}

async function findRegistration(userId) {
  const [registration] = await query(`${SELECT_REGISTRATION} WHERE userId=@userId`, {
    userId,
  });
  return registration || null;
}

function readValidBody(req, res) {
  const { errors, value } = validateRegistration(req.body);
  if (Object.keys(errors).length) {
    // "message" lists the problems in plain words; "errors" is per field.
    const message = [...new Set(Object.values(errors))].join(' ');
    res.status(400).json({ message, errors });
    return null;
  }
  return value;
}

// GET: the signed-in student's registration, or null when there is none.
familyDayRouter.get('/registration', async (req, res) => {
  const registration = await withDatabase(() => findRegistration(req.user.id));
  res.json({ registration });
});

// POST: register interest (or register again after withdrawing).
familyDayRouter.post('/registration', async (req, res) => {
  const value = readValidBody(req, res);
  if (!value) return;
  const saved = await withDatabase(async () => {
    const existing = await findRegistration(req.user.id);
    ensure(
      existing?.status !== 'registered',
      409,
      'Your household has already registered interest. Use Manage interest to change it.',
    );
    const parameters = { userId: req.user.id, ...value };
    if (existing) {
      await query(
        `UPDATE fsdp_v5.family_registrations SET
          parentName=@parentName, contactEmail=@contactEmail,
          adultCount=@adults, childCount=@children,
          dietaryNeeds=@dietaryNeeds, whoMayBeJoining=@whoMayBeJoining,
          additionalInfo=@additionalInfo, updatesConsent=@updatesConsent,
          status='registered', withdrawnAt=NULL, updatedAt=SYSUTCDATETIME()
        WHERE userId=@userId`,
        parameters,
      );
    } else {
      await query(
        `INSERT fsdp_v5.family_registrations(
          registrationId, userId, parentName, contactEmail, adultCount, childCount,
          dietaryNeeds, whoMayBeJoining, additionalInfo, updatesConsent
        ) VALUES (
          @registrationId, @userId, @parentName, @contactEmail, @adults, @children,
          @dietaryNeeds, @whoMayBeJoining, @additionalInfo, @updatesConsent
        )`,
        { registrationId: newRegistrationId(), ...parameters },
      );
    }
    const registration = await findRegistration(req.user.id);
    await audit(req.user.id, 'family_day.registered', registration.registrationId, {
      adults: value.adults,
      children: value.children,
    });
    return registration;
  });
  res.status(201).json({
    message: 'Thank you! Your household interest has been recorded.',
    registration: saved,
  });
});

// PUT: change the details of an active registration.
familyDayRouter.put('/registration', async (req, res) => {
  const value = readValidBody(req, res);
  if (!value) return;
  const saved = await withDatabase(async () => {
    const existing = await findRegistration(req.user.id);
    ensure(
      existing?.status === 'registered',
      404,
      'You have no active registration. Please register your interest first.',
    );
    await query(
      `UPDATE fsdp_v5.family_registrations SET
        parentName=@parentName, contactEmail=@contactEmail,
        adultCount=@adults, childCount=@children,
        dietaryNeeds=@dietaryNeeds, whoMayBeJoining=@whoMayBeJoining,
        additionalInfo=@additionalInfo, updatesConsent=@updatesConsent,
        updatedAt=SYSUTCDATETIME()
      WHERE userId=@userId`,
      { userId: req.user.id, ...value },
    );
    await audit(req.user.id, 'family_day.updated', existing.registrationId, {
      adults: value.adults,
      children: value.children,
    });
    return findRegistration(req.user.id);
  });
  res.json({ message: 'Your changes have been saved.', registration: saved });
});

// DELETE: withdraw interest. The row is kept (status = withdrawn) for records.
familyDayRouter.delete('/registration', async (req, res) => {
  const saved = await withDatabase(async () => {
    const existing = await findRegistration(req.user.id);
    ensure(
      existing?.status === 'registered',
      404,
      'You have no active registration to withdraw.',
    );
    await query(
      `UPDATE fsdp_v5.family_registrations SET
        status='withdrawn', updatesConsent=0,
        withdrawnAt=SYSUTCDATETIME(), updatedAt=SYSUTCDATETIME()
      WHERE userId=@userId`,
      { userId: req.user.id },
    );
    await audit(req.user.id, 'family_day.withdrawn', existing.registrationId, {});
    return findRegistration(req.user.id);
  });
  res.json({ message: 'Your household interest has been withdrawn.', registration: saved });
});
