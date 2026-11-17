import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { query, transaction, closePool } from '../../backend/src/core/config/database.js';
export async function migrate() {
  await query(`IF SCHEMA_ID('fsdp_v5') IS NULL EXEC('CREATE SCHEMA fsdp_v5');`);
  await query(`IF OBJECT_ID('fsdp_v5.Migrations','U') IS NULL
    CREATE TABLE fsdp_v5.Migrations (
      name nvarchar(200) PRIMARY KEY, checksum varchar(64) NOT NULL,
      appliedAt datetime2 DEFAULT SYSUTCDATETIME()
    );`);
  const directory = new URL('../migrations/', import.meta.url);
  for (const name of (await readdir(directory)).filter((n) => n.endsWith('.sql')).sort()) {
    const source = await readFile(new URL(name, directory), 'utf8');
    const checksum = createHash('sha256').update(source).digest('hex');
    const existing = await query(
      'SELECT checksum FROM fsdp_v5.Migrations WHERE name=@name',
      { name },
    );
    if (existing.length) {
      if (existing[0].checksum !== checksum)
        throw new Error(`Applied migration changed: ${name}`);
      continue;
    }
    await transaction(async (tx) => {
      for (const batch of source.split(/^GO\s*$/im)) {
        if (batch.trim()) await query(batch, {}, tx);
      }
      await query(
        'INSERT fsdp_v5.Migrations(name,checksum) VALUES(@name,@checksum)',
        { name, checksum },
        tx,
      );
    });
    console.log(`Applied ${name}`);
  }
}
if (process.argv[1]?.endsWith('migrate.js')) {
  try {
    await migrate();
  } finally {
    await closePool();
  }
}
