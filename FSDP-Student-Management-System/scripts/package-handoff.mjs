import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const script = fileURLToPath(new URL('./package-handoff.py', import.meta.url));
const result = spawnSync(process.env.PYTHON || 'python', [script], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status || 0;
