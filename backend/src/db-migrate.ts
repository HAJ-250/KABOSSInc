import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
// @ts-ignore - runtime ESM resolution handled by tsx/Vite
import { sequelize } from './config/database.js';

const require = createRequire(import.meta.url);
const { Umzug, SequelizeStorage } = require('umzug');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadMigrations() {
  const migrationsDir = resolve(__dirname, '..', 'src', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.ts'))
    .sort();

  const migrations = [];
  for (const file of files) {
    const filePath = resolve(migrationsDir, file);
    const mod = await import(pathToFileURL(filePath).href);
    migrations.push({
      name: file,
      path: filePath,
      up: mod.up,
      down: mod.down,
    });
  }
  return migrations;
}

async function main() {
  const command = process.argv[2] || 'status';

  const migrations = await loadMigrations();
  const migrator = new Umzug({
    context: sequelize,
    storage: new SequelizeStorage({ sequelize }),
    migrations,
  });

  try {
    switch (command) {
      case 'up':
      case 'migrate': {
        const pending = await migrator.pending();
        if (pending.length === 0) {
          console.log('No pending migrations.');
        } else {
          console.log(`Running ${pending.length} migration(s)...`);
          await migrator.up();
          console.log('Migrations completed successfully.');
        }
        break;
      }
      case 'down':
      case 'undo': {
        const executed = await migrator.executed();
        if (executed.length === 0) {
          console.log('No migrations to undo.');
        } else {
          const last = executed[executed.length - 1];
          console.log(`Undoing migration: ${last.name}`);
          await migrator.down({ to: last.name });
          console.log('Migration undone successfully.');
        }
        break;
      }
      case 'status': {
        const pending = await migrator.pending();
        const executed = await migrator.executed();
        console.log('Executed migrations:');
        executed.forEach((m: { name: string }) => console.log(`  - ${m.name}`));
        console.log('Pending migrations:');
        pending.forEach((m: { name: string }) => console.log(`  - ${m.name}`));
        break;
      }
      default:
        console.log('Usage: tsx db-migrate.ts <up|down|status>');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
