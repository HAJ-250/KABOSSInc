import { sequelize } from './config/database.js';
import { QueryTypes } from 'sequelize';

async function columnNames(table: string): Promise<string[]> {
  const cols: any[] = await sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table`,
    { type: QueryTypes.SELECT, replacements: { table } }
  );
  return cols.map((c) => c.COLUMN_NAME);
}

async function tableExists(table: string): Promise<boolean> {
  const tables: any[] = await sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table`,
    { type: QueryTypes.SELECT, replacements: { table } }
  );
  return tables.length > 0;
}

async function run() {
  await sequelize.authenticate();
  console.log('Connected. Running payments migration...');

  // 1. Extend Bookings with payment columns
  if (!(await tableExists('Bookings'))) {
    console.log('  Bookings table does not exist; skipping column changes (server sync will create it).');
  } else {
    const bookingCols = await columnNames('Bookings');

    if (!bookingCols.includes('amount')) {
      await sequelize.query('ALTER TABLE `Bookings` ADD COLUMN `amount` DECIMAL(12,0) NULL DEFAULT NULL');
      console.log('  Added Bookings.amount');
    }
    if (!bookingCols.includes('amountCurrency')) {
      await sequelize.query('ALTER TABLE `Bookings` ADD COLUMN `amountCurrency` VARCHAR(8) NULL DEFAULT \'RWF\'');
      console.log('  Added Bookings.amountCurrency');
    }
    if (!bookingCols.includes('paymentStatus')) {
      await sequelize.query(
        `ALTER TABLE \`Bookings\` ADD COLUMN \`paymentStatus\` ENUM('PENDING','SUCCESS','FAILED','CANCELLED','NO_PAYMENT') NULL DEFAULT 'NO_PAYMENT'`
      );
      console.log('  Added Bookings.paymentStatus');
    }

    // 2. Extend Bookings.status ENUM to include new values (pending-payment, confirmed)
    //    Only modify if the enum does not already contain them.
    try {
      const statusCol: any[] = await sequelize.query(
        `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'status'`,
        { type: QueryTypes.SELECT }
      );
      const type = (statusCol[0]?.COLUMN_TYPE as string) || '';
      if (!type.includes('pending-payment') || !type.includes('confirmed')) {
        await sequelize.query(
          `ALTER TABLE \`Bookings\` MODIFY COLUMN \`status\` ENUM(
            'pending','pending-payment','confirmed','approved','in-progress','completed','cancelled'
          ) NOT NULL DEFAULT 'pending'`
        );
        console.log('  Extended Bookings.status ENUM');
      } else {
        console.log('  Bookings.status ENUM already up to date');
      }
    } catch (err: any) {
      console.warn('  Could not inspect/update Bookings.status enum:', err?.message);
    }
  }

  // 3. Create Payments table if it doesn't exist
  if (!(await tableExists('Payments'))) {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`Payments\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`bookingId\` INT UNSIGNED NOT NULL,
        \`userId\` INT UNSIGNED NOT NULL,
        \`transactionId\` VARCHAR(255) NOT NULL,
        \`externalReference\` VARCHAR(255) NOT NULL,
        \`amount\` DECIMAL(12,0) NOT NULL,
        \`currency\` VARCHAR(8) NOT NULL DEFAULT 'RWF',
        \`phoneNumber\` VARCHAR(32) NOT NULL,
        \`paymentMethod\` ENUM('MTN_MOMO','AIRTEL_MONEY','BANK','CASH') NOT NULL DEFAULT 'MTN_MOMO',
        \`paymentStatus\` ENUM('PENDING','SUCCESS','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
        \`momoReferenceId\` VARCHAR(255) NULL DEFAULT NULL,
        \`financialTransactionId\` VARCHAR(255) NULL DEFAULT NULL,
        \`failureReason\` VARCHAR(512) NULL DEFAULT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`transactionId\` (\`transactionId\`),
        INDEX \`bookingId\` (\`bookingId\`),
        INDEX \`userId\` (\`userId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  Created Payments table');
  } else {
    console.log('  Payments table already exists');
  }

  console.log('Payments migration complete.');
  await sequelize.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Payments migration failed:', err);
  process.exit(1);
});

