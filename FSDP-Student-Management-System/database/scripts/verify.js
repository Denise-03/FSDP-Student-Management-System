import assert from 'node:assert/strict';
import { query, closePool } from '../../backend/src/core/config/database.js';
try {
  const [counts] = await query(`SELECT
    (SELECT COUNT(*) FROM fsdp_v5.Users) users,
    (SELECT COUNT(*) FROM fsdp_v5.Dojos WHERE active=1) centres,
    (SELECT COUNT(*) FROM fsdp_v5.ClassSessions WHERE startsAt>SYSUTCDATETIME()) upcoming,
    (SELECT COUNT(*) FROM fsdp_v5.GradingRules) rules,
    (SELECT COUNT(*) FROM fsdp_v5.AttendanceRecords) attendance`);
  assert.ok(counts.users >= 12);
  assert.ok(counts.centres >= 3);
  assert.ok(counts.upcoming >= 12);
  assert.ok(counts.rules >= 7);
  assert.ok(counts.attendance >= 10);
  const [approved] = await query(`SELECT p.verified FROM fsdp_v5.StudentProfiles p
    JOIN fsdp_v5.MembershipApplications a ON a.userId=p.userId
    WHERE p.userId='payment' AND a.status IN ('approved_pending_payment','active')`);
  if (approved)
    assert.equal(
      Boolean(approved.verified),
      true,
      'Approved fixture must have a verified rank before activation.',
    );
  console.log('SQL Server verification passed:', counts);
} finally {
  await closePool();
}
