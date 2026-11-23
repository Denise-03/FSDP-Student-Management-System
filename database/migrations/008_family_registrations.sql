-- Family Day: one "expression of interest" per student household.
-- userId is UNIQUE so the same student cannot register twice.
IF OBJECT_ID('fsdp_v5.family_registrations', 'U') IS NULL
CREATE TABLE fsdp_v5.family_registrations (
  registrationId nvarchar(20) NOT NULL PRIMARY KEY,
  userId nvarchar(50) NOT NULL UNIQUE REFERENCES fsdp_v5.Users(id),
  parentName nvarchar(120) NOT NULL,
  contactEmail nvarchar(254) NOT NULL,
  adultCount int NOT NULL,
  childCount int NOT NULL,
  dietaryNeeds nvarchar(500) NULL,
  whoMayBeJoining nvarchar(500) NULL,
  additionalInfo nvarchar(1000) NULL,
  updatesConsent bit NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'registered',
  createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updatedAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  withdrawnAt datetime2 NULL,
  CONSTRAINT CK_family_registrations_status
    CHECK (status IN ('registered', 'withdrawn')),
  CONSTRAINT CK_family_registrations_counts
    CHECK (
      adultCount BETWEEN 0 AND 20
      AND childCount BETWEEN 0 AND 20
      AND adultCount + childCount >= 1
    )
);
GO
