import { readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const databasePath = 'C:/tmp/wedding-planner-api-test.db';
rmSync(databasePath, { force: true });
const environment = { ...process.env, DATABASE_URL: `file:${databasePath}` };
const migrationFiles = readdirSync(resolve(apiRoot, 'prisma/migrations'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `prisma/migrations/${entry.name}/migration.sql`)
  .sort();
for (const command of [
  ...migrationFiles.map(
    (file) => `npx prisma db execute --schema prisma/schema.prisma --file ${file}`,
  ),
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
