import {
  query,
  transaction,
  closePool,
} from "../../backend/src/core/config/database.js";
import { seed } from "../seeds/seed-data.js";
if (
  process.env.NODE_ENV === "production" ||
  process.env.CONFIRM_DEMO_RESET !== "FSDPDevelopment/fsdp_v5"
) {
  throw new Error(
    "Development only. Set CONFIRM_DEMO_RESET=FSDPDevelopment/fsdp_v5 explicitly. This erases prototype demo records.",
  );
}
const tables = [
  "WebhookEvents",
  "PaymentAttempts",
  "PaymentCharges",
  "NotificationOutbox",
  "Notifications",
  "InstructorAssessments",
  "GradingApplications",
  "GradingSessions",
  "ExternalTrainingRecords",
  "AttendanceRecords",
  "ClassBookings",
  "ApplicationDocuments",
  "AuditLogs",
  "Memberships",
  "WaiverConsents",
  "MembershipApplications",
  "StudentBeltHistory",
  "StudentPerformanceEndorsements",
  "StudentProfiles",
  "GradingExtraRequirements",
  "GradingRules",
  "ClassSessions",
  "InstructorAssignments",
  "ClassTypes",
  "BeltLevels",
  "Dojos",
  "family_registrations",
  "Sessions",
  "Users",
  "Settings",
];
try {
  await transaction(async (tx) => {
    for (const table of tables) await query(`DELETE fsdp_v5.${table}`, {}, tx);
  });
  await seed();
} finally {
  await closePool();
}
