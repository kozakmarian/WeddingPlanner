import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const databasePath = 'C:/tmp/wedding-planner-api-test.db';
rmSync(databasePath, { force: true });
const environment = { ...process.env, DATABASE_URL: `file:${databasePath}` };
for (const command of [
  'npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/20261013211500_init/migration.sql',
  'npx tsx prisma/seed.ts',
]) {
  const result = spawnSync(command, {
  cwd: apiRoot,
  env: environment,
  shell: true,
  stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
