import { query, transaction } from '../../core/config/database.js';
import { ensure } from '../../core/errors/HttpError.js';
import { id, notify, audit, ageOn } from '../../core/utils/records.js';
export async function applicationFor(userId, tx) {
  const [application] = await query(
    'SELECT * FROM fsdp_v5.MembershipApplications WHERE userId=@userId',
    { userId },
    tx,
  );
  return application ? { ...application, data: JSON.parse(application.data) } : null;
}
export async function saveDraft(userId, data) {
  return transaction(async (tx) => {
    const existing = await applicationFor(userId, tx);
    ensure(
      !existing || ['draft', 'changes_requested'].includes(existing.status),
      409,
      'This application cannot be edited in its current state.',
    );
    if (existing)
      await query(
        `UPDATE fsdp_v5.MembershipApplications
      SET data=@data,updatedAt=SYSUTCDATETIME() WHERE id=@id`,
        { data: JSON.stringify(data), id: existing.id },
        tx,
      );
    else
      await query(
        `INSERT fsdp_v5.MembershipApplications(id,userId,status,data)
      VALUES(@id,@userId,'draft',@data)`,
        { id: id(), userId, data: JSON.stringify(data) },
        tx,
      );
    return applicationFor(userId, tx);
  });
}
export async function submitApplication(userId) {
  return transaction(async (tx) => {
    const application = await applicationFor(userId, tx);
    ensure(
      application && ['draft', 'changes_requested'].includes(application.status),
      409,
      'Save an editable draft first.',
    );
    const data = application.data;
    const dob = new Date(data.dateOfBirth);
    const age = ageOn(data.dateOfBirth);
    ensure(
      !Number.isNaN(dob.valueOf()) && age >= 4 && age <= 120,
      400,
      'Enter a valid date of birth (age 4?120).',
    );
    ensure(
      data.phone.trim().length >= 8 && data.waiver,
      400,
      'Provide a contact number and accept the demo waiver.',
    );
    ensure(
      age >= 18 || data.guardianName.trim().length >= 2,
      400,
      'A guardian acknowledgement is required for minors.',
    );
    ensure(
      (
        await query(
          'SELECT id FROM fsdp_v5.Dojos WHERE id=@id AND active=1',
          { id: data.dojoId },
          tx,
        )
      ).length,
      400,
      'Choose an active principal dojo.',
    );
    await query(
      `UPDATE fsdp_v5.MembershipApplications SET status='pending_review',
      submittedAt=SYSUTCDATETIME(),updatedAt=SYSUTCDATETIME() WHERE id=@id;
      UPDATE fsdp_v5.StudentProfiles SET phone=@phone,dateOfBirth=@dateOfBirth,dojoId=@dojoId
      WHERE userId=@userId;
      IF EXISTS(SELECT 1 FROM fsdp_v5.WaiverConsents WHERE userId=@userId)
        UPDATE fsdp_v5.WaiverConsents SET guardianName=@guardianName,
        acceptedAt=SYSUTCDATETIME() WHERE userId=@userId;
      ELSE INSERT fsdp_v5.WaiverConsents(userId,guardianName) VALUES(@userId,@guardianName);`,
      { ...data, id: application.id, userId },
      tx,
    );
    await audit(userId, 'application.submitted', application.id, {}, tx);
    await notify(
      userId,
      `submitted:${application.id}:${application.updatedAt.toISOString()}`,
      'Your membership application is awaiting review.',
      tx,
    );
    return applicationFor(userId, tx);
  });
}
export async function decideApplication(actorId, applicationId, data) {
  return transaction(async (tx) => {
    const [application] = await query(
      'SELECT * FROM fsdp_v5.MembershipApplications WHERE id=@id',
      { id: applicationId },
      tx,
    );
    ensure(application, 404, 'Application not found.');
    if (
      data.decision === 'approve' &&
      ['approved_pending_payment', 'active'].includes(application.status)
    ) {
      return { message: 'This approval was already recorded.' };
    }
    ensure(
      application.status === 'pending_review',
      409,
      'Only pending applications can be reviewed.',
    );
    const status = data.decision === 'approve' ? 'approved_pending_payment' : data.decision;
    ensure(
      data.decision === 'approve' || data.reason.trim().length >= 5,
      400,
      'Explain the requested changes or rejection.',
    );
    const values = JSON.parse(application.data);
    if (data.decision === 'approve') {
      ensure(
        (
          await query(
            'SELECT id FROM fsdp_v5.BeltLevels WHERE id=@id',
            { id: data.verifiedBelt },
            tx,
          )
        ).length,
        400,
        'Choose a valid verified belt.',
      );
      ensure(
        new Date(data.rankStart) <= new Date() &&
          !Number.isNaN(new Date(data.rankStart).valueOf()),
        400,
        'Enter a valid rank start date in the past.',
      );
      const [{ value }] = await query(
        "SELECT value FROM fsdp_v5.Settings WHERE id='registration_fee'",
        {},
        tx,
      );
      const amount = Number(value);
      ensure(
        Number.isInteger(amount) && amount > 0,
        500,
        'Registration fee is not configured.',
      );
      await query(
        `UPDATE fsdp_v5.StudentProfiles SET beltId=@beltId,verified=1,
        rankStart=@rankStart,dojoId=@dojoId WHERE userId=@userId;
        INSERT fsdp_v5.StudentBeltHistory(id,studentId,beltId,verifiedBy,startsAt)
          VALUES(@historyId,@userId,@beltId,@actorId,@rankStart);
        INSERT fsdp_v5.Memberships(userId,memberNumber,status,expiresAt)
          VALUES(@userId,@memberNumber,'pending_payment',DATEADD(year,1,SYSUTCDATETIME()));
        INSERT fsdp_v5.PaymentCharges(id,studentId,applicationId,description,amount)
          VALUES(@chargeId,@userId,@id,'DEMO PRICE — annual membership registration',@amount);`,
        {
          beltId: data.verifiedBelt,
          rankStart: data.rankStart,
          dojoId: values.dojoId,
          userId: application.userId,
          historyId: id(),
          actorId,
          memberNumber: `DEMO-${application.userId}`,
          chargeId: id(),
          id: applicationId,
          amount,
        },
        tx,
      );
    }
    await query(
      `UPDATE fsdp_v5.MembershipApplications SET status=@status,
      reason=@reason,reviewedBy=@actorId,updatedAt=SYSUTCDATETIME() WHERE id=@id`,
      { status, reason: data.reason, actorId, id: applicationId },
      tx,
    );
    await audit(
      actorId,
      `application.${data.decision}`,
      applicationId,
      { reason: data.reason },
      tx,
    );
    await notify(
      application.userId,
      `decision:${id()}`,
      data.decision === 'approve'
        ? 'Application approved. Payment is required before activation.'
        : `Application ${status.replaceAll('_', ' ')}: ${data.reason}`,
      tx,
    );
    return { message: 'Decision saved.', status };
  });
}
export async function activateMembership(studentId, tx) {
  await query(
    `UPDATE fsdp_v5.Memberships SET status='active' WHERE userId=@studentId;
    UPDATE fsdp_v5.MembershipApplications SET status='active',updatedAt=SYSUTCDATETIME()
      WHERE userId=@studentId;
    UPDATE fsdp_v5.Users SET role='student' WHERE id=@studentId`,
    { studentId },
    tx,
  );
  await notify(
    studentId,
    'membership.activated',
    'Your membership is active. You can now book suitable classes.',
    tx,
  );
}
