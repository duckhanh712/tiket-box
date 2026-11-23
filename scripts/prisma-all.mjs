// Runs one Prisma CLI command against every service that owns a database.
// Usage (via package.json scripts): node scripts/prisma-all.mjs generate | migrate deploy
import { execFileSync } from 'node:child_process';

const SERVICES = ['user', 'event', 'booking', 'payment', 'ticket', 'checkin'];
const args = process.argv.slice(2);

for (const service of SERVICES) {
  console.log(`\n▶ ${service}-service: prisma ${args.join(' ')}`);
  execFileSync('prisma', [...args, '--config', `apps/${service}-service/prisma.config.ts`], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}
