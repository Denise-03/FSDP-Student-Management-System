import './env.js';
import { createRequire } from 'node:module';
import { config } from './env.js';
const require = createRequire(import.meta.url);
export const sql =
  process.env.DB_DRIVER === 'tcp' ? require('mssql') : require('mssql/msnodesqlv8');
let poolPromise;
export function getPool() {
  if (!poolPromise) {
    const options =
      process.env.DB_DRIVER === 'tcp'
        ? {
            server: config.server,
            database: config.database,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: {
              encrypt: process.env.DB_ENCRYPT !== 'false',
              trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
            },
          }
        : {
            connectionString:
              [
                `Driver={${process.env.DB_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server'}}`,
                `Server=${config.server}`,
                `Database=${config.database}`,
                'Trusted_Connection=Yes',
                'TrustServerCertificate=Yes',
              ].join(';') + ';',
          };
    poolPromise = new sql.ConnectionPool({
      ...options,
      pool: { max: 10, min: 0 },
    }).connect();
  }
  return poolPromise;
}
export async function query(text, parameters = {}, transaction) {
  const request = transaction ? new sql.Request(transaction) : (await getPool()).request();
  for (const [name, value] of Object.entries(parameters)) {
    if (typeof value === 'boolean') request.input(name, sql.Bit, value);
    else if (typeof value === 'number') request.input(name, sql.Int, value);
    else if (value instanceof Date) request.input(name, sql.DateTime2, value);
    else request.input(name, sql.NVarChar(sql.MAX), value ?? null);
  }
  return (await request.query(text)).recordset || [];
}
export async function transaction(work) {
  const tx = new sql.Transaction(await getPool());
  await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    // One database lock keeps small prototype mutations consistent across API processes.
    await query(
      `DECLARE @result int;
      EXEC @result = sys.sp_getapplock
        @Resource='fsdp_v5_mutation', @LockMode='Exclusive',
        @LockOwner='Transaction', @LockTimeout=15000;
      IF @result < 0 THROW 51000, 'Please retry the operation.', 1;`,
      {},
      tx,
    );
    const result = await work(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback().catch(() => {});
    throw error;
  }
}
export async function closePool() {
  if (poolPromise) await (await poolPromise).close();
  poolPromise = undefined;
}
