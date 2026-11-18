
-- Add grading decision fields
IF COL_LENGTH('fsdp_v5.GradingApplications', 'decisionReason') IS NULL
    ALTER TABLE fsdp_v5.GradingApplications
    ADD decisionReason nvarchar(1000) NULL;
GO

IF COL_LENGTH('fsdp_v5.GradingApplications', 'reviewedBy') IS NULL
    ALTER TABLE fsdp_v5.GradingApplications
    ADD reviewedBy nvarchar(50) NULL;
GO

IF COL_LENGTH('fsdp_v5.GradingApplications', 'reviewedAt') IS NULL
    ALTER TABLE fsdp_v5.GradingApplications
    ADD reviewedAt datetime2 NULL;
GO

IF COL_LENGTH('fsdp_v5.GradingSessions', 'venue') IS NULL
    ALTER TABLE fsdp_v5.GradingSessions
    ADD venue nvarchar(250) NULL;
GO

-- Remove the old status constraint before changing existing values
IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('fsdp_v5.GradingApplications')
      AND name = 'CK__GradingAp__statu__43D61337'
)
    ALTER TABLE fsdp_v5.GradingApplications
    DROP CONSTRAINT [CK__GradingAp__statu__43D61337];
GO

-- Convert existing application statuses
UPDATE fsdp_v5.GradingApplications
SET status = 'pending'
WHERE status IN ('submitted', 'assessed');
GO

-- Add the new status constraint if it does not already exist
IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('fsdp_v5.GradingApplications')
      AND name = 'CK_GradingApplications_Status'
)
    ALTER TABLE fsdp_v5.GradingApplications
    ADD CONSTRAINT CK_GradingApplications_Status
    CHECK (status IN ('pending', 'approved', 'rejected'));
GO

-- Add notification relationship fields
IF COL_LENGTH('fsdp_v5.Notifications', 'relatedType') IS NULL
    ALTER TABLE fsdp_v5.Notifications
    ADD relatedType nvarchar(50) NULL;
GO

IF COL_LENGTH('fsdp_v5.Notifications', 'relatedId') IS NULL
    ALTER TABLE fsdp_v5.Notifications
    ADD relatedId nvarchar(50) NULL;
GO

-- Prevent duplicate active applications while allowing reapplication after rejection
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('fsdp_v5.GradingApplications')
      AND name = 'UX_GradingApplications_Active'
)
    CREATE UNIQUE INDEX UX_GradingApplications_Active
    ON fsdp_v5.GradingApplications(studentId, gradingSessionId)
    WHERE status <> 'rejected';
GO
