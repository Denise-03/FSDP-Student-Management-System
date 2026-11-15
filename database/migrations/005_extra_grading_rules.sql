-- Preserve the original migration history. The existing API uses minDays,
-- while migration 001 originally created minMonths.
IF COL_LENGTH('fsdp_v5.GradingRules', 'minDays') IS NULL
BEGIN
  ALTER TABLE fsdp_v5.GradingRules
    ADD minDays int NOT NULL CONSTRAINT DF_GradingRules_minDays DEFAULT(0);
  EXEC(N'UPDATE fsdp_v5.GradingRules SET minDays = minMonths * 30');
END;
GO

IF OBJECT_ID('fsdp_v5.GradingExtraRequirements', 'U') IS NULL
CREATE TABLE fsdp_v5.GradingExtraRequirements (
  id nvarchar(50) PRIMARY KEY,
  ruleId nvarchar(50) NOT NULL REFERENCES fsdp_v5.GradingRules(id),
  type varchar(30) NOT NULL
    CHECK(type IN ('performance','membership_days','training_centres')),
  requiredValue int NOT NULL,
  CONSTRAINT UQ_GradingExtraRequirements UNIQUE(ruleId,type),
  CONSTRAINT CK_GradingExtraRequirements_Value CHECK(
    (type='performance' AND requiredValue=1) OR
    (type='membership_days' AND requiredValue BETWEEN 0 AND 365) OR
    (type='training_centres' AND requiredValue BETWEEN 1 AND 10)
  )
);
GO

IF OBJECT_ID('fsdp_v5.StudentPerformanceEndorsements', 'U') IS NULL
CREATE TABLE fsdp_v5.StudentPerformanceEndorsements (
  studentId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  beltId int NOT NULL REFERENCES fsdp_v5.BeltLevels(id),
  rankStart date NOT NULL,
  passed bit NOT NULL,
  instructorId nvarchar(50) NOT NULL REFERENCES fsdp_v5.Users(id),
  feedback nvarchar(500) NOT NULL DEFAULT '',
  updatedAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY(studentId,beltId,rankStart)
);
GO