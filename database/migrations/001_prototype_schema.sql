IF SCHEMA_ID('fsdp_v5') IS NULL EXEC('CREATE SCHEMA fsdp_v5');
GO
IF OBJECT_ID('fsdp_v5.Users', 'U') IS NULL
CREATE TABLE fsdp_v5.Users (
  id nvarchar(50) PRIMARY KEY,
  email nvarchar(254) NOT NULL UNIQUE,
  name nvarchar(120) NOT NULL,
  passwordHash nvarchar(200) NOT NULL,
  role varchar(20) NOT NULL CHECK(role IN ('applicant','student','instructor','admin')),
  createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID('fsdp_v5.Sessions', 'U') IS NULL
CREATE TABLE fsdp_v5.Sessions (
  id nvarchar(64) PRIMARY KEY,
  userId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  csrf nvarchar(64) NOT NULL,
  expiresAt datetime2 NOT NULL
);
GO
IF OBJECT_ID('fsdp_v5.Dojos', 'U') IS NULL
CREATE TABLE fsdp_v5.Dojos (
  id nvarchar(50) PRIMARY KEY,
  name nvarchar(120) NOT NULL,
  address nvarchar(250) NOT NULL,
  region nvarchar(30) NOT NULL,
  active bit NOT NULL DEFAULT 1,
  sourceUrl nvarchar(400) NULL
);
GO
IF OBJECT_ID('fsdp_v5.ClassTypes', 'U') IS NULL
CREATE TABLE fsdp_v5.ClassTypes (
  id nvarchar(50) PRIMARY KEY,
  name nvarchar(120) NOT NULL,
  description nvarchar(1000) NOT NULL,
  minAge int NOT NULL,
  maxAge int NOT NULL,
  minBelt int NOT NULL DEFAULT 0,
  qualifying bit NOT NULL DEFAULT 1
);
GO
IF OBJECT_ID('fsdp_v5.BeltLevels', 'U') IS NULL
CREATE TABLE fsdp_v5.BeltLevels (
  id int PRIMARY KEY,
  name nvarchar(50) NOT NULL
);
GO
IF OBJECT_ID('fsdp_v5.StudentProfiles', 'U') IS NULL
CREATE TABLE fsdp_v5.StudentProfiles (
  userId nvarchar(50) PRIMARY KEY REFERENCES fsdp_v5.Users(id),
  phone nvarchar(30) NULL,
  dateOfBirth date NULL,
  dojoId nvarchar(50) NULL REFERENCES fsdp_v5.Dojos(id),
  beltId int NOT NULL DEFAULT 0 REFERENCES fsdp_v5.BeltLevels(id),
  rankStart date NULL,
  verified bit NOT NULL DEFAULT 0,
  preferences nvarchar(30) NOT NULL DEFAULT 'in-app'
);
GO
IF OBJECT_ID('fsdp_v5.InstructorAssignments', 'U') IS NULL
CREATE TABLE fsdp_v5.InstructorAssignments (
  instructorId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  dojoId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Dojos(id),
  PRIMARY KEY(instructorId,dojoId)
);
GO
IF OBJECT_ID('fsdp_v5.ClassSessions', 'U') IS NULL
CREATE TABLE fsdp_v5.ClassSessions (
  id nvarchar(50) PRIMARY KEY,
  classTypeId nvarchar(50) NOT NULL REFERENCES fsdp_v5.ClassTypes(id),
  dojoId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Dojos(id),
  instructorId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  startsAt datetime2 NOT NULL,
  endsAt datetime2 NOT NULL,
  capacity int NOT NULL CHECK(capacity>0),
  active bit NOT NULL DEFAULT 1,
  CHECK(endsAt>startsAt)
);
GO
IF OBJECT_ID('fsdp_v5.MembershipApplications', 'U') IS NULL
CREATE TABLE fsdp_v5.MembershipApplications (
  id nvarchar(50) PRIMARY KEY,
  userId nvarchar(50) NOT NULL UNIQUE REFERENCES fsdp_v5.Users(id),
  status varchar(40) NOT NULL CHECK(status IN ('draft','pending_review','changes_requested','approved_pending_payment','active','rejected')),
  data nvarchar(max) NOT NULL DEFAULT '{}',
  reason nvarchar(1000) NULL,
  reviewedBy nvarchar(50) NULL REFERENCES fsdp_v5.Users(id),
  submittedAt datetime2 NULL,
  updatedAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CHECK(ISJSON(data)=1)
);
GO
IF OBJECT_ID('fsdp_v5.ApplicationDocuments', 'U') IS NULL
CREATE TABLE fsdp_v5.ApplicationDocuments (
  id nvarchar(50) PRIMARY KEY,
  applicationId nvarchar(50) NOT NULL REFERENCES fsdp_v5.MembershipApplications(id),
  storageName nvarchar(100) NOT NULL UNIQUE,
  originalName nvarchar(120) NOT NULL,
  mimeType nvarchar(60) NOT NULL,
  size int NOT NULL CHECK(size>0),
  createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID('fsdp_v5.Memberships', 'U') IS NULL
CREATE TABLE fsdp_v5.Memberships (
  userId nvarchar(50) PRIMARY KEY REFERENCES fsdp_v5.Users(id),
  memberNumber nvarchar(70) NOT NULL UNIQUE,
  status varchar(30) NOT NULL CHECK(status IN ('pending_payment','active','inactive')),
  expiresAt datetime2 NOT NULL,
  waiverReason nvarchar(1000) NULL
);
GO
IF OBJECT_ID('fsdp_v5.WaiverConsents', 'U') IS NULL
CREATE TABLE fsdp_v5.WaiverConsents (
  userId nvarchar(50) PRIMARY KEY REFERENCES fsdp_v5.Users(id),
  guardianName nvarchar(120) NULL,
  version varchar(20) NOT NULL DEFAULT 'DEMO-1',
  acceptedAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID('fsdp_v5.ClassBookings', 'U') IS NULL
CREATE TABLE fsdp_v5.ClassBookings (
  id nvarchar(50) PRIMARY KEY,
  studentId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  sessionId nvarchar(50) NOT NULL REFERENCES fsdp_v5.ClassSessions(id),
  status varchar(20) NOT NULL CHECK(status IN ('confirmed','cancelled')),
  createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UNIQUE(studentId,sessionId)
);
GO
IF OBJECT_ID('fsdp_v5.AttendanceRecords', 'U') IS NULL
CREATE TABLE fsdp_v5.AttendanceRecords (
  id nvarchar(50) PRIMARY KEY,
  studentId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  sessionId nvarchar(50) NOT NULL REFERENCES fsdp_v5.ClassSessions(id),
  status varchar(10) NOT NULL CHECK(status IN ('present','absent')),
  verifiedBy nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  updatedAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UNIQUE(studentId,sessionId)
);
GO
IF OBJECT_ID('fsdp_v5.ExternalTrainingRecords', 'U') IS NULL
CREATE TABLE fsdp_v5.ExternalTrainingRecords (
  id nvarchar(50) PRIMARY KEY,
  studentId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  eventKey nvarchar(100) NOT NULL,
  centre nvarchar(120) NOT NULL,
  happenedAt datetime2 NOT NULL,
  qualifying bit NOT NULL,
  verifiedBy nvarchar(50) NULL REFERENCES fsdp_v5.Users(id),
  UNIQUE(studentId,eventKey)
);
GO
IF OBJECT_ID('fsdp_v5.GradingRules', 'U') IS NULL
CREATE TABLE fsdp_v5.GradingRules (
  id nvarchar(50) PRIMARY KEY,
  fromBelt int NOT NULL REFERENCES fsdp_v5.BeltLevels(id),
  toBelt int NOT NULL REFERENCES fsdp_v5.BeltLevels(id),
  minSessions int NOT NULL CHECK(minSessions>0),
  minDays int NOT NULL CHECK(minDays>=0),
  minAge int NOT NULL DEFAULT 0,
  maxAge int NOT NULL DEFAULT 120,
  label nvarchar(150) NOT NULL,
  UNIQUE(fromBelt,minAge,maxAge)
);
GO
IF OBJECT_ID('fsdp_v5.StudentBeltHistory', 'U') IS NULL
CREATE TABLE fsdp_v5.StudentBeltHistory (
  id nvarchar(50) PRIMARY KEY,
  studentId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  beltId int NOT NULL REFERENCES fsdp_v5.BeltLevels(id),
  verifiedBy nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  startsAt date NOT NULL
);
GO
IF OBJECT_ID('fsdp_v5.GradingSessions', 'U') IS NULL
CREATE TABLE fsdp_v5.GradingSessions (
  id nvarchar(50) PRIMARY KEY,
  name nvarchar(120) NOT NULL,
  instructorId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  opensAt datetime2 NOT NULL,
  closesAt datetime2 NOT NULL,
  startsAt datetime2 NOT NULL,
  active bit NOT NULL DEFAULT 1,
  CHECK(opensAt<closesAt AND closesAt<startsAt)
);
GO
IF OBJECT_ID('fsdp_v5.GradingApplications', 'U') IS NULL
CREATE TABLE fsdp_v5.GradingApplications (
  id nvarchar(50) PRIMARY KEY,
  studentId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  gradingSessionId nvarchar(50) NOT NULL REFERENCES fsdp_v5.GradingSessions(id),
  status varchar(30) NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','assessed')),
  createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UNIQUE(studentId,gradingSessionId)
);
GO
IF OBJECT_ID('fsdp_v5.InstructorAssessments', 'U') IS NULL
CREATE TABLE fsdp_v5.InstructorAssessments (
  id nvarchar(50) PRIMARY KEY,
  gradingApplicationId nvarchar(50) NOT NULL UNIQUE REFERENCES fsdp_v5.GradingApplications(id),
  instructorId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  result varchar(30) NOT NULL CHECK(result IN ('recommend_pass','further_training')),
  feedback nvarchar(2000) NOT NULL,
  timeInRankDays int NOT NULL CHECK(timeInRankDays>=0),
  acknowledgement nvarchar(120) NOT NULL,
  submittedAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID('fsdp_v5.Notifications', 'U') IS NULL
CREATE TABLE fsdp_v5.Notifications (
  id nvarchar(50) PRIMARY KEY,
  userId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  eventKey nvarchar(150) NOT NULL,
  message nvarchar(1000) NOT NULL,
  readAt datetime2 NULL,
  createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UNIQUE(userId,eventKey)
);
GO
IF OBJECT_ID('fsdp_v5.NotificationOutbox', 'U') IS NULL
CREATE TABLE fsdp_v5.NotificationOutbox (
  notificationId nvarchar(50) PRIMARY KEY REFERENCES fsdp_v5.Notifications(id),
  status varchar(20) NOT NULL DEFAULT 'dev_outbox',
  createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID('fsdp_v5.PaymentCharges', 'U') IS NULL
CREATE TABLE fsdp_v5.PaymentCharges (
  id nvarchar(50) PRIMARY KEY,
  studentId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  applicationId nvarchar(50) NULL REFERENCES fsdp_v5.MembershipApplications(id),
  description nvarchar(200) NOT NULL,
  amount int NOT NULL CHECK(amount>0),
  currency char(3) NOT NULL DEFAULT 'sgd',
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','succeeded','waived')),
  demoFixture bit NOT NULL DEFAULT 0,
  UNIQUE(applicationId)
);
GO
IF OBJECT_ID('fsdp_v5.PaymentAttempts', 'U') IS NULL
CREATE TABLE fsdp_v5.PaymentAttempts (
  id nvarchar(50) PRIMARY KEY,
  chargeId nvarchar(50) NOT NULL REFERENCES fsdp_v5.PaymentCharges(id),
  providerSessionId nvarchar(200) NULL,
  status varchar(20) NOT NULL CHECK(status IN ('creating','pending','succeeded','failed','expired')),
  createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  demoFixture bit NOT NULL DEFAULT 0
);
GO
IF OBJECT_ID('fsdp_v5.WebhookEvents', 'U') IS NULL
CREATE TABLE fsdp_v5.WebhookEvents (
  id nvarchar(200) PRIMARY KEY,
  processedAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID('fsdp_v5.AuditLogs', 'U') IS NULL
CREATE TABLE fsdp_v5.AuditLogs (
  id nvarchar(50) PRIMARY KEY,
  actorId nvarchar(50) NULL REFERENCES fsdp_v5.Users(id),
  action nvarchar(100) NOT NULL,
  entityId nvarchar(200) NOT NULL,
  details nvarchar(max) NOT NULL,
  createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID('fsdp_v5.Settings', 'U') IS NULL
CREATE TABLE fsdp_v5.Settings (
  id nvarchar(50) PRIMARY KEY,
  label nvarchar(150) NOT NULL,
  value nvarchar(1000) NOT NULL
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Attendance_Student' AND object_id=OBJECT_ID('fsdp_v5.AttendanceRecords'))
CREATE INDEX IX_Attendance_Student ON fsdp_v5.AttendanceRecords(studentId);
GO
