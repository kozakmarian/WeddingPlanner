import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';

const apiRoot = resolve(import.meta.dirname, '..');
const databasePath = 'C:/tmp/wedding-planner-legacy-upgrade-test.db';
const databaseUrl = `file:${databasePath}`;

function run(command: string) {
  const result = spawnSync(command, {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    shell: true,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test('upgrades a legacy db:init SQLite database without losing records', async () => {
  rmSync(databasePath, { force: true });
  run(
    'npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/20261013211500_init/migration.sql',
  );
  run('npx prisma db execute --schema prisma/schema.prisma --file tests/fixtures/legacy-data.sql');

  run('node scripts/upgrade-legacy-database.mjs');

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    const tables = (await prisma.$queryRawUnsafe(
      "SELECT name FROM sqlite_master WHERE type = 'table'",
    )) as {
      name: string;
    }[];
    const columns = (await prisma.$queryRawUnsafe("PRAGMA table_info('Wedding')")) as {
      name: string;
    }[];
    assert.ok(tables.some((table) => table.name === '_prisma_migrations'));
    assert.deepEqual(
      columns.slice(-2).map((column) => column.name),
      ['groomName', 'brideName'],
    );
    assert.equal(await prisma.user.count(), 1);
    assert.equal(await prisma.wedding.count(), 1);
    assert.equal(await prisma.guest.count(), 2);
    assert.equal(await prisma.budgetItem.count(), 2);
    assert.equal(await prisma.task.count(), 2);
    assert.ok(
      readdirSync(dirname(databasePath)).some((file) =>
        file.startsWith('wedding-planner-legacy-upgrade-test.db.before-prisma-baseline-'),
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
});
