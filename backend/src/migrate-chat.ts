import { sequelize } from './config/database.js';
import { QueryTypes } from 'sequelize';

async function run() {
  await sequelize.authenticate();
  console.log('Connected. Running chat migration...');

  // 1. Ensure Messages has deliveredAt and seenAt
  const msgCols = await sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Messages'`,
    { type: QueryTypes.SELECT }
  );
  const msgColNames = msgCols.map((c: any) => c.COLUMN_NAME);
  if (!msgColNames.includes('deliveredAt')) {
    await sequelize.query(`ALTER TABLE \`Messages\` ADD COLUMN \`deliveredAt\` DATETIME NULL DEFAULT NULL`);
    console.log('  Added Messages.deliveredAt');
  }
  if (!msgColNames.includes('seenAt')) {
    await sequelize.query(`ALTER TABLE \`Messages\` ADD COLUMN \`seenAt\` DATETIME NULL DEFAULT NULL`);
    console.log('  Added Messages.seenAt');
  }

  // 2. Ensure Attachments table exists
  const tables = await sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Attachments'`,
    { type: QueryTypes.SELECT }
  );
  if (tables.length === 0) {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`Attachments\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`messageId\` INT UNSIGNED NOT NULL,
        \`conversationId\` INT UNSIGNED NOT NULL,
        \`senderId\` INT UNSIGNED NOT NULL,
        \`fileName\` VARCHAR(255) NOT NULL,
        \`fileType\` ENUM('image','pdf','zip','document','other') NOT NULL DEFAULT 'other',
        \`mimeType\` VARCHAR(255) NOT NULL,
        \`storagePath\` TEXT NOT NULL,
        \`size\` BIGINT UNSIGNED NOT NULL DEFAULT '0',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`messageId\` (\`messageId\`),
        INDEX \`conversationId\` (\`conversationId\`),
        INDEX \`senderId\` (\`senderId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  Created Attachments table');
  }

  console.log('Migration complete.');
  await sequelize.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
