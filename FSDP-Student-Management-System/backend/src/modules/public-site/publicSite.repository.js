import { query } from '../../core/config/database.js';
export async function publicCatalogue() {
  const [dojos, classTypes, sessions, belts, rules, settings] = await Promise.all([
    query('SELECT * FROM fsdp_v5.Dojos WHERE active=1 ORDER BY name'),
    query('SELECT * FROM fsdp_v5.ClassTypes ORDER BY name'),
    query(`SELECT s.*,d.name dojoName,c.name className,c.description,c.minAge,c.maxAge,
      c.minBelt,u.name instructorName,
      (SELECT COUNT(*) FROM fsdp_v5.ClassBookings b
        WHERE b.sessionId=s.id AND b.status='confirmed') booked
      FROM fsdp_v5.ClassSessions s JOIN fsdp_v5.Dojos d ON d.id=s.dojoId
      JOIN fsdp_v5.ClassTypes c ON c.id=s.classTypeId
      JOIN fsdp_v5.Users u ON u.id=s.instructorId
      WHERE s.active=1 AND d.active=1 AND s.startsAt>SYSUTCDATETIME()
      ORDER BY s.startsAt`),
    query('SELECT * FROM fsdp_v5.BeltLevels ORDER BY id'),
    query('SELECT * FROM fsdp_v5.GradingRules'),
    query('SELECT * FROM fsdp_v5.Settings'),
  ]);
  return { dojos, classTypes, sessions, belts, rules, settings };
}
