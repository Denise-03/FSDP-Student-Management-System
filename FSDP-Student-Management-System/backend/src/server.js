import { createApp } from './app.js';
import { config } from './core/config/env.js';
import { getPool, closePool } from './core/config/database.js';
await getPool();
const server = createApp().listen(config.port, '127.0.0.1', () => {
  console.log(`FSDP API http://127.0.0.1:${config.port}`);
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  });
