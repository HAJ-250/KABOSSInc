import { Sequelize } from 'sequelize';

const DB_NAME = process.env.DB_NAME || 'kaboss';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
});

export async function initDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL at:', `${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    await sequelize.sync({ alter: false });
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
