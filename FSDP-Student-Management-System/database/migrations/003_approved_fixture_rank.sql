-- Approved Riley fixture has a verified beginner rank before payment activation.
-- These predicates are limited to the original fictional demonstration identity.
UPDATE p SET verified=1
FROM fsdp_v5.StudentProfiles p
JOIN fsdp_v5.MembershipApplications a ON a.userId=p.userId
WHERE p.userId='payment' AND a.id='application-payment'
  AND a.status IN ('approved_pending_payment','active');
IF NOT EXISTS (SELECT 1 FROM fsdp_v5.StudentBeltHistory WHERE id='rank-payment')
INSERT fsdp_v5.StudentBeltHistory(id,studentId,beltId,verifiedBy,startsAt)
SELECT 'rank-payment',p.userId,p.beltId,'admin',p.rankStart
FROM fsdp_v5.StudentProfiles p
WHERE p.userId='payment' AND p.verified=1;
