-- Repair initial Windows pipe encoding only for unchanged synthetic fixture labels.
UPDATE fsdp_v5.Dojos SET name=N'DEMO CENTRE ' + NCHAR(8212) + N' Central'
WHERE id='central' AND name='DEMO CENTRE ? Central';
UPDATE fsdp_v5.Dojos SET name=N'DEMO CENTRE ' + NCHAR(8212) + N' East'
WHERE id='east' AND name='DEMO CENTRE ? East';
UPDATE fsdp_v5.Dojos SET name=N'DEMO CENTRE ' + NCHAR(8212) + N' West'
WHERE id='west' AND name='DEMO CENTRE ? West';
UPDATE fsdp_v5.GradingRules SET label=N'DEMO RULE ' + NCHAR(8212) + N' NOT OFFICIAL'
WHERE label='DEMO RULE ? NOT OFFICIAL';
UPDATE fsdp_v5.Settings SET label=REPLACE(label,' ? ',N' '+NCHAR(8212)+N' ')
WHERE id IN ('registration_fee','training_fee') AND label LIKE 'DEMO PRICE ?%';
UPDATE fsdp_v5.PaymentCharges SET description=REPLACE(description,' ? ',N' '+NCHAR(8212)+N' ')
WHERE description='DEMO PRICE ? annual membership registration';
