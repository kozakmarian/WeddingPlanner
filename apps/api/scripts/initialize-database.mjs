import { closeSync, mkdirSync, openSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, isAbsolute } from 'node:path';
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
const databasePath = isAbsolute(configuredPath)
  ? configuredPath
  : resolve(apiRoot, 'prisma', configuredPath);

function createEmptyDatabaseFile() {
  try {
    mkdirSync(dirname(databasePath), { recursive: true });
  } catch (error) {
    console.error('Unable to create the SQLite database directory: ' + dirname(databasePath));
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  try {
    closeSync(openSync(databasePath, 'wx'));
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'EEXIST') {
      console.error('Refusing to initialize an existing database: ' + databasePath);
      console.error('Use a new DATABASE_URL for initialization; this command never deletes data.');
    } else {
      console.error('Unable to create an empty SQLite database file: ' + databasePath);
      console.error(error instanceof Error ? error.message : error);
    }
    process.exit(1);
  }
}

const databaseUrl = 'file:' + databasePath.replaceAll('\\', '/');

function run(args) {
  return spawnSync(['npx', 'prisma', ...args].join(' '), {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    shell: true,
    stdio: 'inherit',
  });
}

createEmptyDatabaseFile();
for (const args of [
  ['generate'],
  ['migrate', 'deploy', '--schema', 'prisma/schema.prisma'],
  ['db', 'seed'],
]) {
  const result = run(args);
  if (result.status !== 0) {
    console.error(`Initialization did not complete. The new database was kept at ${databasePath}.`);
    console.error(
      'After resolving the error, remove only this unused database file before retrying db:init.',
    );
    process.exit(result.status ?? 1);
  }
}
