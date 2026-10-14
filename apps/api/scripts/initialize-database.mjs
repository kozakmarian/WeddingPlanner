import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const apiRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repositoryRoot = resolve(apiRoot, '../..');
dotenv.config({ path: resolve(repositoryRoot, '.env') });

const configuredUrl = process.env.DATABASE_URL;
if (!configuredUrl?.startsWith('file:')) {
  console.error('db:init currently supports a SQLite DATABASE_URL beginning with file:.');
  process.exit(1);
}

const configuredPath = configuredUrl.slice('file:'.length);
const databasePath = isAbsolute(configuredPath) ? configuredPath : resolve(apiRoot, configuredPath);
if (existsSync(databasePath)) {
  console.error('Refusing to initialize an existing database: ' + databasePath);
  console.error('Use a new DATABASE_URL for initialization; this command never deletes data.');
  process.exit(1);
}

const databaseUrl = 'file:' + databasePath.replaceAll('\\', '/');

function run(args) {
  const result = spawnSync(['npx', 'prisma', ...args].join(' '), {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    shell: true,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const migrationFiles = readdirSync(resolve(apiRoot, 'prisma/migrations'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => resolve(apiRoot, 'prisma/migrations', entry.name, 'migration.sql'))
  .filter(existsSync)
  .sort();

run(['generate']);
for (const migrationFile of migrationFiles) {
  run(['db', 'execute', '--schema', 'prisma/schema.prisma', '--file', migrationFile]);
}
run(['db', 'seed']);
