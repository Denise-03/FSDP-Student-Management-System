
-- Remove any remaining legacy grading status constraints.
DECLARE @sql nvarchar(max) = N'';

SELECT @sql = @sql +
    N'ALTER TABLE fsdp_v5.GradingApplications DROP CONSTRAINT '
    + QUOTENAME(name) + N';'
FROM sys.check_constraints
WHERE parent_object_id = OBJECT_ID('fsdp_v5.GradingApplications')
  AND definition LIKE '%''submitted''%'
  AND definition LIKE '%''assessed''%';

IF @sql <> N''
    EXEC sp_executesql @sql;
GO

-- Find and remove the original default constraint on status.
DECLARE @defaultConstraint sysname;

SELECT @defaultConstraint = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c
    ON c.object_id = dc.parent_object_id
    AND c.column_id = dc.parent_column_id
WHERE dc.parent_object_id =
    OBJECT_ID('fsdp_v5.GradingApplications')
    AND c.name = 'status';

IF @defaultConstraint IS NOT NULL
BEGIN
    DECLARE @sql nvarchar(max);

    SET @sql =
        N'ALTER TABLE fsdp_v5.GradingApplications DROP CONSTRAINT '
        + QUOTENAME(@defaultConstraint);

    EXEC sp_executesql @sql;
END;
GO

-- Set the correct default status.
ALTER TABLE fsdp_v5.GradingApplications
ADD CONSTRAINT DF_GradingApplications_Status
DEFAULT ('pending') FOR status;
GO
