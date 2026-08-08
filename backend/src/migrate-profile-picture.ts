import { sequelize } from './config/database.js';
import { QueryTypes } from 'sequelize';

async function run() {
  await sequelize.authenticate();
  console.log('Connected. Running profile picture migration...');

  // Ensure Users has profilePictureUrl column
  const cols = await sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users'`,
    { type: QueryTypes.SELECT }
  );
  const colNames = cols.map((c: any) => c.COLUMN_NAME);
  if (!colNames.includes('profilePictureUrl')) {
    await sequelize.query(
      `ALTER TABLE \`Users\` ADD COLUMN \`profilePictureUrl\` VARCHAR(512) NULL DEFAULT NULL`
    );
    console.log('  Added Users.profilePictureUrl');
  } else {
    console.log('  Users.profilePictureUrl already exists');
  }

  console.log('Migration complete.');
  await sequelize.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

