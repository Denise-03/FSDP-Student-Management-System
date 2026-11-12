import { seed } from '../seeds/seed-data.js';
import { closePool } from '../../backend/src/core/config/database.js';
try {
  await seed();
} finally {
  await closePool();
}
