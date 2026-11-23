
-- Migration 007: Fix grading application status

-- Drop the existing status CHECK constraint.
DECLARE @checkName sysname;

SELECT TOP 1 @checkName = name
FROM sys.check_constraints
WHERE parent_object_id = OBJECT_ID('fsdp_v5.GradingApplications')
  AND definition LIKE '%status%';

IF @checkName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE fsdp_v5.GradingApplications DROP CONSTRAINT [' 
         + @checkName + ']');
END;

-- Convert legacy statuses.
UPDATE fsdp_v5.GradingApplications
SET status = 'pending'
WHERE status IN ('submitted', 'assessed');

-- Add the correct CHECK constraint if missing.
IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('fsdp_v5.GradingApplications')
      AND name = 'CK_GradingApplications_Status'
)
BEGIN
    ALTER TABLE fsdp_v5.GradingApplications
    ADD CONSTRAINT CK_GradingApplications_Status
    CHECK (status IN ('pending', 'approved', 'rejected'));
END;

-- Add the correct default if missing.
IF NOT EXISTS (
    SELECT 1
    FROM sys.default_constraints dc
    JOIN sys.columns c
      ON c.object_id = dc.parent_object_id
     AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID('fsdp_v5.GradingApplications')
      AND c.name = 'status'
)
BEGIN
    ALTER TABLE fsdp_v5.GradingApplications
    ADD CONSTRAINT DF_GradingApplications_Status
    DEFAULT ('pending') FOR status;
END;
