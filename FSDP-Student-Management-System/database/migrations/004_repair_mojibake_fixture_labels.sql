-- Repair only the original fictional labels affected by UTF-8 mojibake.
-- Do not overwrite later custom labels or other demo data.
DECLARE @brokenDash nvarchar(3) = NCHAR(226) + NCHAR(8364) + NCHAR(8221);
DECLARE @correctDash nchar(1) = NCHAR(8212);

UPDATE fsdp_v5.Dojos
SET name = REPLACE(name, @brokenDash, @correctDash)
WHERE id IN ('central', 'east', 'west')
  AND name LIKE N'DEMO CENTRE %'
  AND CHARINDEX(@brokenDash, name) > 0;

UPDATE fsdp_v5.GradingRules
SET label = REPLACE(label, @brokenDash, @correctDash)
WHERE id LIKE 'rule-%'
  AND label = N'DEMO RULE ' + @brokenDash + N' NOT OFFICIAL';

UPDATE fsdp_v5.Settings
SET label = REPLACE(label, @brokenDash, @correctDash)
WHERE id IN ('registration_fee', 'training_fee')
  AND label LIKE N'DEMO PRICE %'
  AND CHARINDEX(@brokenDash, label) > 0;

UPDATE fsdp_v5.PaymentCharges
SET description = REPLACE(description, @brokenDash, @correctDash)
WHERE id LIKE 'charge-%'
  AND description = N'DEMO PRICE ' + @brokenDash + N' annual membership registration';
