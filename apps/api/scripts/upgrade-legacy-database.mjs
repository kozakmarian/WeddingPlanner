import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const apiRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repositoryRoot = resolve(apiRoot, '../..');
dotenv.config({ path: resolve(repositoryRoot, '.env') });

function databasePathFromUrl(url) {
  if (!url?.startsWith('file:')) return undefined;
  const configuredPath = url.slice('file:'.length);
  return isAbsolute(configuredPath) ? configuredPath : resolve(apiRoot, 'prisma', configuredPath);
}

const databasePath = databasePathFromUrl(process.env.DATABASE_URL);
if (!databasePath) {
  console.error('db:migrate currently supports a SQLite DATABASE_URL beginning with file:.');
  process.exit(1);
}

const databaseUrl = `file:${databasePath.replaceAll('\\', '/')}`;
const initialMigration = '20261013211500_init';
const legacyTables = ['BudgetItem', 'Guest', 'Task', 'User', 'Wedding'];
const legacyWeddingColumns = [
  'id',
  'userId',
  'name',
  'date',
  'location',
  'budget',
  'createdAt',
  'updatedAt',
];

function runPrisma(args) {
  const result = spawnSync(['npx', 'prisma', ...args].join(' '), {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    shell: true,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(databasePath)) {
  runPrisma(['migrate', 'deploy', '--schema', 'prisma/schema.prisma']);
  process.exit(0);
}

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
try {
  const migrationTable = await prisma.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = '_prisma_migrations'",
  );
  if (migrationTable.length > 0) {
    await prisma.$disconnect();
    runPrisma(['migrate', 'deploy', '--schema', 'prisma/schema.prisma']);
    process.exit(0);
  }

  const tables = await prisma.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
  );
  const columns = await prisma.$queryRawUnsafe("PRAGMA table_info('Wedding')");
  const indexes = await prisma.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  const tableNames = tables.map((table) => table.name);
  const columnNames = columns.map((column) => column.name);
  const indexNames = indexes.map((index) => index.name);
  const matchesLegacySchema =
    JSON.stringify(tableNames) === JSON.stringify(legacyTables) &&
    JSON.stringify(columnNames) === JSON.stringify(legacyWeddingColumns) &&
    JSON.stringify(indexNames) === JSON.stringify(['User_email_key', 'Wedding_userId_key']);
  if (!matchesLegacySchema) {
    console.error(
      'The existing SQLite schema does not match the known legacy initialization schema. No migration was applied.',
    );
    console.error(JSON.stringify({ tableNames, columnNames, indexNames }, null, 2));
    throw new Error('Refusing to baseline an unrecognized SQLite schema.');
  }

  const backupPath = `${databasePath}.before-prisma-baseline-${new Date().toISOString().replaceAll(/[:.]/g, '-')}.bak`;
  await prisma.$executeRawUnsafe(`VACUUM INTO '${backupPath.replaceAll("'", "''")}'`);
  console.log(`Legacy database backup created: ${backupPath}`);
  await prisma.$disconnect();
  runPrisma([
    'migrate',
    'resolve',
    '--applied',
    initialMigration,
    '--schema',
    'prisma/schema.prisma',
  ]);
  runPrisma(['migrate', 'deploy', '--schema', 'prisma/schema.prisma']);
} finally {
  await prisma.$disconnect();
}
