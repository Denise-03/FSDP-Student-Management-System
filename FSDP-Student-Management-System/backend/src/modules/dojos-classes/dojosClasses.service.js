import { query, transaction } from '../../core/config/database.js';
import { ensure } from '../../core/errors/HttpError.js';
import { id, ageOn, notify, audit } from '../../core/utils/records.js';
export async function requireActiveMember(studentId, tx) {
  const [member] = await query(
    `SELECT p.*,m.status,m.expiresAt,w.acceptedAt FROM fsdp_v5.StudentProfiles p
    JOIN fsdp_v5.Memberships m ON m.userId=p.userId
    LEFT JOIN fsdp_v5.WaiverConsents w ON w.userId=p.userId WHERE p.userId=@studentId`,
    { studentId },
    tx,
  );
  ensure(
    member && member.status === 'active' && new Date(member.expiresAt) > new Date(),
    403,
    'An approved, paid or explicitly waived active membership is required.',
  );
  ensure(member.acceptedAt, 403, 'A waiver acknowledgement is required.');
  return member;
}
export async function bookClass(studentId, sessionId) {
  return transaction(async (tx) => {
    const member = await requireActiveMember(studentId, tx);
    const [session] = await query(
      `SELECT s.*,c.minBelt,c.minAge,c.maxAge,d.active dojoActive
      FROM fsdp_v5.ClassSessions s JOIN fsdp_v5.ClassTypes c ON c.id=s.classTypeId
      JOIN fsdp_v5.Dojos d ON d.id=s.dojoId WHERE s.id=@sessionId`,
      { sessionId },
      tx,
    );
    ensure(
      session &&
        session.active &&
        session.dojoActive &&
        new Date(session.startsAt) > new Date(),
      400,
      'This session is no longer bookable.',
    );
    const age = ageOn(member.dateOfBirth, new Date(session.startsAt));
    ensure(
      member.verified &&
        member.beltId >= session.minBelt &&
        age >= session.minAge &&
        age <= session.maxAge,
      403,
      'This class does not match your verified belt or age group.',
    );
    const [existing] = await query(
      'SELECT * FROM fsdp_v5.ClassBookings WHERE studentId=@studentId AND sessionId=@sessionId',
      { studentId, sessionId },
      tx,
    );
    ensure(
      !existing || existing.status === 'cancelled',
      409,
      'You already booked this session.',
    );
    const [{ total }] = await query(
      "SELECT COUNT(*) total FROM fsdp_v5.ClassBookings WHERE sessionId=@sessionId AND status='confirmed'",
      { sessionId },
      tx,
    );
    ensure(
      total < session.capacity,
      409,
      'This class is full. Please choose another session.',
    );
    const overlaps = await query(
      `SELECT b.id FROM fsdp_v5.ClassBookings b
      JOIN fsdp_v5.ClassSessions s ON s.id=b.sessionId
      WHERE b.studentId=@studentId AND b.status='confirmed' AND s.active=1
      AND s.startsAt<@endsAt AND s.endsAt>@startsAt`,
      { studentId, endsAt: session.endsAt, startsAt: session.startsAt },
      tx,
    );
    ensure(!overlaps.length, 409, 'This session overlaps another confirmed booking.');
    const bookingId = existing?.id || id();
    if (existing)
      await query(
        "UPDATE fsdp_v5.ClassBookings SET status='confirmed' WHERE id=@id",
        { id: bookingId },
        tx,
      );
    else
      await query(
        `INSERT fsdp_v5.ClassBookings(id,studentId,sessionId,status)
      VALUES(@id,@studentId,@sessionId,'confirmed')`,
        { id: bookingId, studentId, sessionId },
        tx,
      );
    await notify(
      studentId,
      `booking:${bookingId}:${id()}`,
      'Your class booking is confirmed.',
      tx,
    );
    await audit(studentId, 'booking.confirmed', bookingId, { sessionId }, tx);
    return { id: bookingId, message: 'Class booked.' };
  });
}
