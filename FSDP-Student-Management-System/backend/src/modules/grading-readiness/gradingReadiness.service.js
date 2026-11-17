import { query, transaction } from '../../core/config/database.js';
import { ageOn, notify } from '../../core/utils/records.js';
export async function readiness(studentId, tx) {
  const [profile] = await query(
    `SELECT p.*,m.status membershipStatus,m.expiresAt,
    b.name beltName FROM fsdp_v5.StudentProfiles p
    LEFT JOIN fsdp_v5.Memberships m ON m.userId=p.userId
    JOIN fsdp_v5.BeltLevels b ON b.id=p.beltId WHERE p.userId=@studentId`,
    { studentId },
    tx,
  );
  if (!profile)
    return { eligible: false, reasons: ['Complete your student profile.'], total: 0 };
  const age = ageOn(profile.dateOfBirth);
  const [rule] = await query(
    `SELECT r.*,b.name targetBelt FROM fsdp_v5.GradingRules r
    JOIN fsdp_v5.BeltLevels b ON b.id=r.toBelt
    WHERE r.fromBelt=@beltId AND @age BETWEEN r.minAge AND r.maxAge`,
    { beltId: profile.beltId, age },
    tx,
  );
  const records = await query(
    `SELECT a.id,s.id eventKey,s.startsAt happenedAt,
      d.name centre,c.qualifying,a.status,a.verifiedBy
    FROM fsdp_v5.AttendanceRecords a
    JOIN fsdp_v5.ClassSessions s ON s.id=a.sessionId
    JOIN fsdp_v5.Dojos d ON d.id=s.dojoId
    JOIN fsdp_v5.ClassTypes c ON c.id=s.classTypeId
    WHERE a.studentId=@studentId
    UNION ALL
    SELECT e.id,e.eventKey,e.happenedAt,e.centre,e.qualifying,'present',e.verifiedBy
    FROM fsdp_v5.ExternalTrainingRecords e WHERE e.studentId=@studentId`,
    { studentId },
    tx,
  );
  // A training event contributes once, after rank start and authorised verification.
  const counted = new Map();
  for (const record of records) {
    if (
      record.status === 'present' &&
      record.verifiedBy &&
      record.qualifying &&
      new Date(record.happenedAt) >= new Date(profile.rankStart) &&
      new Date(record.happenedAt) <= new Date()
    )
      counted.set(record.eventKey, record);
  }
  const total = counted.size;
  const days = profile.rankStart
    ? Math.max(0, Math.floor((Date.now() - new Date(profile.rankStart)) / 86400000))
    : 0;
  const reasons = [];
  if (profile.membershipStatus !== 'active' || new Date(profile.expiresAt) < new Date())
    reasons.push('An active membership is required.');
  if (!profile.verified) reasons.push('Your current rank must be verified.');
  if (!rule) reasons.push('No applicable grading transition is configured.');
  else {
    if (total < rule.minSessions)
      reasons.push(`${rule.minSessions - total} more qualifying session(s) required.`);
    if (days < rule.minDays)
      reasons.push(`${rule.minDays - days} more day(s) in rank required.`);
  }
  return {
    eligible: reasons.length === 0,
    total,
    days,
    rule,
    profile,
    reasons,
    records,
    centres: [...new Set([...counted.values()].map((r) => r.centre))],
  };
}
export async function refreshReadiness(studentId, tx) {
  const result = await readiness(studentId, tx);
  if (result.eligible)
    await notify(
      studentId,
      `eligible:${result.profile.beltId}:${new Date(result.profile.rankStart).toISOString().slice(0, 10)}`,
      `You meet ${result.rule.label}. You may apply for ${result.rule.targetBelt}; this is not promotion.`,
      tx,
    );
  return result;
}
export const readAndRefresh = (studentId) =>
  transaction((tx) => refreshReadiness(studentId, tx));
