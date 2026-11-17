import { randomUUID } from 'node:crypto';
import { query } from '../config/database.js';
export const id = () => randomUUID();
export async function audit(actorId, action, entityId, details, tx) {
  await query(
    `INSERT fsdp_v5.AuditLogs(id,actorId,action,entityId,details)
    VALUES(@id,@actorId,@action,@entityId,@details)`,
    { id: id(), actorId, action, entityId, details: JSON.stringify(details) },
    tx,
  );
}
export async function notify(userId, eventKey, message, tx) {
  const notificationId = id();
  await query(
    `IF NOT EXISTS (
      SELECT 1 FROM fsdp_v5.Notifications WHERE userId=@userId AND eventKey=@eventKey
    ) BEGIN
      INSERT fsdp_v5.Notifications(id,userId,eventKey,message)
        VALUES(@id,@userId,@eventKey,@message);
      INSERT fsdp_v5.NotificationOutbox(notificationId) VALUES(@id);
    END`,
    { id: notificationId, userId, eventKey, message },
    tx,
  );
}
export function ageOn(dateOfBirth, now = new Date()) {
  if (!dateOfBirth) return -1;
  const dob = new Date(dateOfBirth);
  let years = now.getUTCFullYear() - dob.getUTCFullYear();
  if (
    now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate())
  )
    years--;
  return years;
}
