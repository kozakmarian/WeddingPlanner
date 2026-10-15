import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';

const apiRoot = resolve(import.meta.dirname, '..');
const schemaDirectory = resolve(apiRoot, 'prisma');
const testRoot = mkdtempSync('C:/tmp/wedding-planner-initialization-test-');

function databaseUrl(databasePath: string) {
  return `file:${databasePath.replaceAll('\\', '/')}`;
}

function run(command: string, url: string) {
  return spawnSync(command, {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: url },
    shell: true,
    encoding: 'utf8',
  });
}

function expectSuccess(result: ReturnType<typeof run>) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

async function verifySchema(databasePath: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl(databasePath) } } });
  try {
    const tables = await prisma.$queryRawUnsafe<{ name: string }[]>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    assert.deepEqual(
      tables.map((table) => table.name),
      ['BudgetItem', 'Guest', 'Task', 'User', 'Wedding', '_prisma_migrations'],
    );

    for (const table of ['Guest', 'BudgetItem', 'Task']) {
      const foreignKeys = await prisma.$queryRawUnsafe<{ table: string; on_delete: string }[]>(
        `PRAGMA foreign_key_list('${table}')`,
      );
      assert.deepEqual(
        foreignKeys.map(({ table: referencedTable, on_delete: onDelete }) => ({
          table: referencedTable,
          on_delete: onDelete,
        })),
        [{ table: 'Wedding', on_delete: 'CASCADE' }],
      );
    }

    const indexes = await prisma.$queryRawUnsafe<{ name: string }[]>("PRAGMA index_list('User')");
    assert.ok(indexes.some((index) => index.name === 'User_email_key'));
    assert.equal(await prisma.user.count({ where: { email: 'demo@weddingplanner.test' } }), 1);
  } finally {
    await prisma.$disconnect();
  }
}

test.after(() => rmSync(testRoot, { recursive: true, force: true }));

test('db:init creates and migrates fresh absolute and relative SQLite paths safely', async () => {
  const absolutePath = resolve(testRoot, 'absolute', 'first-run.db');
  const absoluteUrl = databaseUrl(absolutePath);
  assert.ok(absolutePath.startsWith('C:\\tmp\\'));
  assert.equal(existsSync(absolutePath), false);

  expectSuccess(run('node scripts/initialize-database.mjs', absoluteUrl));
  assert.equal(existsSync(absolutePath), true);

  const existingInitialization = run('node scripts/initialize-database.mjs', absoluteUrl);
  assert.notEqual(existingInitialization.status, 0);
  assert.match(existingInitialization.stderr, /Refusing to initialize an existing database/);

  const relativePath = resolve(testRoot, 'relative', 'first-run.db');
  const relativeUrl = `file:${relative(schemaDirectory, relativePath).replaceAll('\\', '/')}`;
  assert.ok(relativeUrl.startsWith('file:../'));
  expectSuccess(run('node scripts/initialize-database.mjs', relativeUrl));
  assert.equal(existsSync(relativePath), true);

  await verifySchema(absolutePath);
  await verifySchema(relativePath);

  let prisma = new PrismaClient({ datasources: { db: { url: absoluteUrl } } });
  try {
    await prisma.user.create({
      data: { email: 'persisted-after-init@example.test', passwordHash: 'test' },
    });
  } finally {
    await prisma.$disconnect();
  }

  expectSuccess(run('node scripts/upgrade-legacy-database.mjs', absoluteUrl));

  prisma = new PrismaClient({ datasources: { db: { url: absoluteUrl } } });
  try {
    assert.equal(
      await prisma.user.count({ where: { email: 'persisted-after-init@example.test' } }),
      1,
    );
  } finally {
    await prisma.$disconnect();
  }
});
