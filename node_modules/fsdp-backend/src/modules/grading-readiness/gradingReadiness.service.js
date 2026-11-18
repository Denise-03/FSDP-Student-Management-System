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
    return {
      eligible: false,
      reasons: ['Complete your student profile.'],
      total: 0,
      checks: [],
      performanceReviews: [],
    };
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
      d.name centre,
      CASE WHEN s.active=1 THEN c.qualifying ELSE 0 END qualifying,
      a.status,a.verifiedBy
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
  const counted = new Map();
  for (const record of records) {
    if (
      record.status === 'present' &&
      record.verifiedBy &&
      record.qualifying &&
      profile.rankStart &&
      new Date(record.happenedAt) >= new Date(profile.rankStart) &&
      new Date(record.happenedAt) <= new Date()
    )
      counted.set(record.eventKey, record);
  }
  const total = counted.size;
  const days = profile.rankStart
    ? Math.max(0, Math.floor((Date.now() - new Date(profile.rankStart)) / 86400000))
    : 0;
  const centres = [...new Set([...counted.values()].map((record) => record.centre))];
  const membershipGood =
    profile.membershipStatus === 'active' &&
    profile.expiresAt &&
    new Date(profile.expiresAt) > new Date();
  const membershipDays = profile.expiresAt
    ? Math.max(0, Math.floor((new Date(profile.expiresAt) - Date.now()) / 86400000))
    : 0;
  const checks = [];
  const reasons = [];
  const performanceReviews = await query(
    `SELECT
      e.beltId,
      e.rankStart,
      e.passed,
      e.feedback,
      e.updatedAt,
      b.name AS beltName,
      u.name AS instructorName
    FROM fsdp_v5.StudentPerformanceEndorsements e
    JOIN fsdp_v5.BeltLevels b ON b.id = e.beltId
    JOIN fsdp_v5.Users u ON u.id = e.instructorId
    WHERE e.studentId = @studentId
      AND LTRIM(RTRIM(e.feedback)) <> ''
    ORDER BY e.updatedAt DESC`,
    { studentId },
    tx,
  );
  function addCheck(code, label, met, detail) {
    checks.push({ code, label, met: Boolean(met), detail });
    if (!met) reasons.push(detail);
  }

  if (!rule) {
    reasons.push('No applicable grading transition is configured.');
  } else {
    addCheck(
      'sessions',
      `Qualifying sessions (${total} / ${rule.minSessions})`,
      total >= rule.minSessions,
      `${Math.max(0, rule.minSessions - total)} more qualifying session(s) required.`,
    );
    addCheck(
      'days',
      `Time at current rank (${days} / ${rule.minDays} days)`,
      days >= rule.minDays,
      `${Math.max(0, rule.minDays - days)} more day(s) in rank required.`,
    );
    const extras = await query(
      `SELECT type,requiredValue FROM fsdp_v5.GradingExtraRequirements
       WHERE ruleId=@ruleId ORDER BY type`,
      { ruleId: rule.id },
      tx,
    );
    addCheck(
      'verified_rank',
      'Current rank verified',
      profile.verified,
      'Your current rank must be verified.',
    );
    addCheck(
      'membership',
      'Membership in good standing',
      membershipGood,
      'An active, unexpired membership is required.',
    );
    for (const extra of extras) {
      if (extra.type === 'membership_days') {
        addCheck(
          'membership_days',
          `Membership valid for ${extra.requiredValue} more day(s) (${membershipDays} remaining)`,
          membershipGood && membershipDays >= extra.requiredValue,
          `Renew your membership to have at least ${extra.requiredValue} days remaining.`,
        );
      } else if (extra.type === 'training_centres') {
        addCheck(
          'training_centres',
          `Training centres attended (${centres.length} / ${extra.requiredValue})`,
          centres.length >= extra.requiredValue,
          `Complete qualifying training at ${extra.requiredValue - centres.length} more centre(s).`,
        );
      } else if (extra.type === 'performance') {
        const [endorsement] = await query(
          `SELECT passed FROM fsdp_v5.StudentPerformanceEndorsements
           WHERE studentId=@studentId AND beltId=@beltId AND rankStart=@rankStart`,
          {
            studentId,
            beltId: profile.beltId,
            rankStart: profile.rankStart,
          },
          tx,
        );
        addCheck(
          'performance',
          'Good performance confirmed by instructor',
          endorsement?.passed,
          'Ask your instructor for a performance review.',
        );
      }
    }
  }
  return {
    eligible: Boolean(rule) && reasons.length === 0,
    total,
    days,
    rule,
    profile,
    reasons,
    checks,
    records,
    centres,
    performanceReviews,
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
