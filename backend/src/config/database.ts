import { Sequelize } from 'sequelize';
import fs from 'node:fs';

// If this module is imported before dotenv.config() runs, DATABASE_URL/DB_* might be undefined.
// Ensure env is loaded here as well (safe no-op if already loaded).
import dotenv from 'dotenv';
dotenv.config();

const DB_NAME = process.env.DB_NAME || 'kaboss';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);

const DATABASE_URL = process.env.DATABASE_URL;


function getDbHostFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    // postgresql://user:pass@host:port/db?...
    const withoutProto = url.replace(/^\w+:\/\//, '');
    const at = withoutProto.indexOf('@');
    const hostPortAndPath = at >= 0 ? withoutProto.slice(at + 1) : withoutProto;
    const hostPort = hostPortAndPath.split('/')[0];
    return hostPort.split(':')[0] || hostPort;
  } catch {
    return null;
  }
}

const resolvedDbHost = getDbHostFromUrl(DATABASE_URL);

console.log('[db] initDatabase:');
console.log('[db] DATABASE_URL present:', Boolean(DATABASE_URL));

if (DATABASE_URL) {
  // Extract db name from postgresql/mysql URL: scheme://user:pass@host:port/dbname
  const dbNameMatch = DATABASE_URL.match(/\/[a-zA-Z0-9_\-]+(?=\?|$)/);
  const dbNameFromUrl = dbNameMatch ? dbNameMatch[0].replace(/^\//, '') : null;
  console.log('[db] DATABASE_URL host:', resolvedDbHost);
  console.log('[db] DATABASE_URL dbName:', dbNameFromUrl);
}

console.log('[db] DB_* (when no DATABASE_URL):', {
  DB_NAME,
  DB_USER,
  DB_HOST,
  DB_PORT,
});
console.log('[db] Using dialect:', 'mysql');



function extractDbNameFromDatabaseUrl(databaseUrl: string | undefined): string | null {
  if (!databaseUrl) return null;
  try {
    // mysql://user:pass@host:port/dbname?...
    const withoutProto = databaseUrl.replace(/^\w+:\/\//, '');
    const slash = withoutProto.indexOf('/');
    if (slash === -1) return null;
    const afterSlash = withoutProto.slice(slash + 1);
    const dbPart = afterSlash.split('?')[0].trim();
    return dbPart || null;
  } catch {
    return null;
  }
}

const DATABASE_URL_DB_NAME = extractDbNameFromDatabaseUrl(DATABASE_URL);

const TIDB_CLOUD_CA_CONTENT = process.env.TIDB_CLOUD_CA_CONTENT || process.env.TIDB_CLOUD_CA;
const TIDB_CLOUD_CA_PATH = process.env.TIDB_CLOUD_CA_PATH;
const IS_TIDB_CLOUD =
  (resolvedDbHost && resolvedDbHost.includes('tidbcloud.com')) ||
  Boolean(process.env.IS_TIDB_CLOUD) ||
  Boolean(TIDB_CLOUD_CA_CONTENT) ||
  Boolean(TIDB_CLOUD_CA_PATH);

let tidbCaPem: string | undefined;
if (TIDB_CLOUD_CA_CONTENT) {
  tidbCaPem = Buffer.from(TIDB_CLOUD_CA_CONTENT, 'base64').toString();
} else if (TIDB_CLOUD_CA_PATH && fs.existsSync(TIDB_CLOUD_CA_PATH)) {
  tidbCaPem = fs.readFileSync(TIDB_CLOUD_CA_PATH, 'utf-8');
}

const tidbSslOptions = tidbCaPem
  ? {
      ca: tidbCaPem,
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    }
  : IS_TIDB_CLOUD
    ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false,
      }
    : undefined;

const dialectOptions = IS_TIDB_CLOUD && tidbSslOptions ? { ssl: tidbSslOptions } : {};

export const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        underscored: false,
      },
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: {
          require: false,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        underscored: false,
      },
    });





// Maximum number of connection attempts before giving up.
const MAX_DB_RETRIES = 15;
// Delay (ms) between retry attempts. Kept modest so the app can start quickly
// once the database becomes available, while avoiding a tight crash loop.
const DB_RETRY_DELAY_MS = 2000;

// Error codes that indicate a transient/startup connection problem which can be
// safely retried (e.g. the DB server is still booting). Anything else (bad auth,
// unknown host, missing database) is not retried so we fail fast with a clear error.
const RETRYABLE_ERROR_MARKERS = [
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNRESET',
  'PROTOCOL_CONNECTION_LOST',
  'ConnectionRefusedError',
  'connect ETIMEDOUT',
  'SequelizeConnectionError',
];

function isRetryableError(err: any): boolean {
  const msg = String(err?.code || err?.message || err || '');
  return RETRYABLE_ERROR_MARKERS.some((marker) => msg.includes(marker));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function initDatabase(): Promise<void> {
  console.log('[db] initDatabase details:');
  console.log('[db]   dialect: mysql');
  console.log('[db]   using DATABASE_URL:', Boolean(DATABASE_URL));
  console.log('[db]   DB_NAME:', DB_NAME);
  console.log('[db]   DB_HOST:', DB_HOST);
  console.log('[db]   DB_PORT:', DB_PORT);
  console.log('[db]   DATABASE_URL_DB_NAME(parsed):', DATABASE_URL_DB_NAME);

// Retry loop: tolerate a database that is still starting up (e.g. MySQL/MariaDB
  // booting after a reboot) instead of crashing the whole backend immediately.
  for (let attempt = 1; attempt <= MAX_DB_RETRIES; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('Connected to MySQL');
      break;
    } catch (error: any) {
      if (!isRetryableError(error) || attempt === MAX_DB_RETRIES) {
        throw error;
      }
      console.warn(
        `[db] Connection attempt ${attempt}/${MAX_DB_RETRIES} failed (${error?.code || error?.message}). ` +
          `Retrying in ${DB_RETRY_DELAY_MS / 1000}s...`
      );
      await sleep(DB_RETRY_DELAY_MS);
    }
  }

  try {
    try {
      await sequelize.sync({ alter: false });
    } catch (err: any) {
      // When the model includes enums, Sequelize may attempt to recreate the enum type.
      // If it already exists, we can safely continue.
      const msg = String(err?.message || err);
      if (msg.includes('enum_Users_role') || msg.includes('duplicate key value violates unique constraint')) {
        console.warn('[db] sequelize.sync skipped due to existing enum/type:', msg);
      } else {
        throw err;
      }
    }
    console.log('Database tables synchronized');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}


export async function stopDatabase(): Promise<void> {
  await sequelize.close();
  console.log('Database connection closed');
}

export default sequelize;

