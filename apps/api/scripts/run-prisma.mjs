import { spawnSync } from 'node:child_process';
import { resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const apiRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repositoryRoot = resolve(apiRoot, '../..');
dotenv.config({ path: resolve(repositoryRoot, '.env') });

function resolveDatabaseUrl(url) {
  if (!url?.startsWith('file:')) return url;
  const sqlitePath = url.slice('file:'.length);
  if (!sqlitePath.startsWith('.') || isAbsolute(sqlitePath)) return url;
  return 'file:' + resolve(apiRoot, sqlitePath).replaceAll('\\', '/');
}

const databaseUrl = resolveDatabaseUrl(process.env.DATABASE_URL);
if (!databaseUrl) {
  console.error('DATABASE_URL is required. Copy .env.example to .env and try again.');
  process.exit(1);
}

const command = ['npx', 'prisma', ...process.argv.slice(2)].join(' ');
const result = spawnSync(command, {
  cwd: apiRoot,
  env: { ...process.env, DATABASE_URL: databaseUrl },
  shell: true,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
