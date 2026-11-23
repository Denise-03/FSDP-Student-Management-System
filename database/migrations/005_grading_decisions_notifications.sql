
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


-- Remove ALL existing CHECK constraints that reference status.
DECLARE @dropStatusConstraints NVARCHAR(MAX) = N'';

SELECT @dropStatusConstraints +=
    N'ALTER TABLE fsdp_v5.GradingApplications DROP CONSTRAINT '
    + QUOTENAME(cc.name) + N';'
FROM sys.check_constraints cc
WHERE cc.parent_object_id =
    OBJECT_ID('fsdp_v5.GradingApplications')
AND cc.definition LIKE '%status%';

IF @dropStatusConstraints <> N''
    EXEC sp_executesql @dropStatusConstraints;
GO
