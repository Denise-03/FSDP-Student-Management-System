import { Router } from 'express';
import { z } from 'zod';
import { memberRoles } from '../../core/middleware/auth.js';
import { query } from '../../core/config/database.js';
import { ageOn } from '../../core/utils/records.js';
// Stakeholder rule: at 13 a child moves to the adult class.
const ADULT_CLASS_AGE = 13;
export const studentProfilesRouter = Router();
studentProfilesRouter.use(memberRoles);
studentProfilesRouter.get('/', async (req, res) => {
  const [profile] = await query(
    `SELECT p.*,u.name,u.email,b.name beltName,
    d.name dojoName,m.status membershipStatus,m.memberNumber,m.expiresAt
    FROM fsdp_v5.StudentProfiles p JOIN fsdp_v5.Users u ON u.id=p.userId
    JOIN fsdp_v5.BeltLevels b ON b.id=p.beltId
    LEFT JOIN fsdp_v5.Dojos d ON d.id=p.dojoId
    LEFT JOIN fsdp_v5.Memberships m ON m.userId=p.userId WHERE p.userId=@userId`,
    { userId: req.user.id },
  );
  // Worked out from date of birth, so the move to adult is automatic.
  const age = ageOn(profile?.dateOfBirth);
  const classType = age >= ADULT_CLASS_AGE ? 'Adult' : age >= 0 ? 'Child' : null;
  res.json({ ...profile, classType });
});
studentProfilesRouter.patch('/', async (req, res) => {
  const data = z
    .object({
      name: z.string().trim().min(2).max(120),
      phone: z.string().max(30),
      preferences: z.enum(['in-app', 'email-and-in-app']),
    })
    .parse(req.body);
  await query(
    `UPDATE fsdp_v5.Users SET name=@name WHERE id=@userId;
    UPDATE fsdp_v5.StudentProfiles SET phone=@phone,preferences=@preferences
    WHERE userId=@userId`,
    { ...data, userId: req.user.id },
  );
  res.json({ message: 'Profile saved.' });
});
