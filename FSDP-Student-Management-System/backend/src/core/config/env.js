import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
export const projectRoot = fileURLToPath(new URL('../../../../..', import.meta.url));
dotenv.config({
  path: fileURLToPath(new URL('../../../.env', import.meta.url)),
  quiet: true,
});
export const config = {
  port: Number(process.env.PORT || 4000),
  origin: process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5173',
  database: process.env.DB_DATABASE || 'FSDPDevelopment',
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
};
