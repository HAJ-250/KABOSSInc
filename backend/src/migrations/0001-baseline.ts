export const up = async (sequelize: any) => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Users\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`email\` VARCHAR(255) NULL DEFAULT NULL,
      \`username\` VARCHAR(255) NULL DEFAULT NULL,
      \`password\` VARCHAR(255) NOT NULL,
      \`displayName\` VARCHAR(255) NOT NULL,
      \`role\` ENUM('customer','admin') NOT NULL DEFAULT 'customer',
      \`phone\` VARCHAR(255) NULL DEFAULT NULL,
      \`profilePictureUrl\` VARCHAR(512) NULL DEFAULT NULL,
      \`emailVerified\` TINYINT(1) NOT NULL DEFAULT '0',
      \`isActive\` TINYINT(1) NOT NULL DEFAULT '1',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE INDEX \`email\` (\`email\`),
      UNIQUE INDEX \`username\` (\`username\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Services\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`title\` VARCHAR(255) NOT NULL,
      \`category\` VARCHAR(255) NULL DEFAULT NULL,
      \`description\` TEXT NULL DEFAULT NULL,
      \`isActive\` TINYINT(1) NOT NULL DEFAULT '1',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Bookings\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`userId\` INT UNSIGNED NOT NULL,
      \`serviceId\` INT UNSIGNED NOT NULL,
      \`serviceName\` VARCHAR(255) NOT NULL,
      \`details\` TEXT NOT NULL,
      \`date\` VARCHAR(255) NOT NULL,
      \`time\` VARCHAR(255) NULL DEFAULT NULL,
      \`location\` VARCHAR(255) NULL DEFAULT NULL,
      \`amount\` DECIMAL(12,0) NULL DEFAULT NULL,
      \`amountCurrency\` VARCHAR(8) NULL DEFAULT 'RWF',
      \`paymentStatus\` ENUM('PENDING','SUCCESS','FAILED','CANCELLED','NO_PAYMENT') NULL DEFAULT 'NO_PAYMENT',
      \`status\` ENUM('pending','pending-payment','confirmed','approved','in-progress','completed','cancelled') NOT NULL DEFAULT 'pending',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      INDEX \`userId\` (\`userId\`),
      INDEX \`serviceId\` (\`serviceId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Quotes\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`userId\` INT UNSIGNED NOT NULL,
      \`serviceId\` INT UNSIGNED NOT NULL,
      \`serviceName\` VARCHAR(255) NOT NULL,
      \`budget\` VARCHAR(255) NULL DEFAULT NULL,
      \`details\` TEXT NOT NULL,
      \`status\` ENUM('pending','reviewing','quoted','accepted','declined') NOT NULL DEFAULT 'pending',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      INDEX \`userId\` (\`userId\`),
      INDEX \`serviceId\` (\`serviceId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Contacts\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(255) NOT NULL,
      \`email\` VARCHAR(255) NOT NULL,
      \`phone\` VARCHAR(255) NULL DEFAULT NULL,
      \`subject\` VARCHAR(255) NOT NULL,
      \`message\` TEXT NOT NULL,
      \`isRead\` TINYINT(1) NOT NULL DEFAULT '0',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Conversations\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`subject\` VARCHAR(255) NULL DEFAULT NULL,
      \`participants\` TEXT NULL DEFAULT NULL,
      \`lastMessage\` TEXT NULL DEFAULT NULL,
      \`lastMessageAt\` DATETIME NULL DEFAULT NULL,
      \`status\` ENUM('active','archived','completed') NOT NULL DEFAULT 'active',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Messages\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`conversationId\` INT UNSIGNED NOT NULL,
      \`senderId\` INT UNSIGNED NOT NULL,
      \`senderName\` VARCHAR(255) NULL DEFAULT NULL,
      \`content\` TEXT NOT NULL,
      \`isRead\` TINYINT(1) NOT NULL DEFAULT '0',
      \`deliveredAt\` DATETIME NULL DEFAULT NULL,
      \`seenAt\` DATETIME NULL DEFAULT NULL,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      INDEX \`conversationId\` (\`conversationId\`),
      INDEX \`senderId\` (\`senderId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

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

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Notifications\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`userId\` INT UNSIGNED NOT NULL,
      \`type\` ENUM('booking','message','booking_file','status_update','payment','system') NOT NULL DEFAULT 'system',
      \`title\` VARCHAR(255) NOT NULL,
      \`body\` TEXT NOT NULL,
      \`isRead\` TINYINT(1) NOT NULL DEFAULT '0',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      INDEX \`userId\` (\`userId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

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

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`BookingFiles\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`bookingId\` INT UNSIGNED NOT NULL,
      \`userId\` INT UNSIGNED NOT NULL,
      \`fileType\` ENUM('pdf','image','zip','other') NOT NULL DEFAULT 'other',
      \`fileName\` VARCHAR(255) NOT NULL,
      \`mimeType\` VARCHAR(255) NOT NULL,
      \`storagePath\` TEXT NOT NULL,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      INDEX \`bookingId\` (\`bookingId\`),
      INDEX \`userId\` (\`userId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Announcements\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`title\` VARCHAR(255) NOT NULL,
      \`content\` TEXT NOT NULL,
      \`type\` VARCHAR(255) NULL DEFAULT NULL,
      \`isActive\` TINYINT(1) NOT NULL DEFAULT '1',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Partners\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(255) NOT NULL,
      \`description\` TEXT NULL DEFAULT NULL,
      \`logo\` VARCHAR(255) NULL DEFAULT NULL,
      \`isActive\` TINYINT(1) NOT NULL DEFAULT '1',
      \`sortOrder\` INT NOT NULL DEFAULT '0',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Testimonials\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(255) NOT NULL,
      \`role\` VARCHAR(255) NULL DEFAULT NULL,
      \`content\` TEXT NOT NULL,
      \`rating\` INT NOT NULL DEFAULT '5',
      \`isActive\` TINYINT(1) NOT NULL DEFAULT '1',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`FAQs\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`question\` TEXT NOT NULL,
      \`answer\` TEXT NOT NULL,
      \`category\` VARCHAR(255) NULL DEFAULT NULL,
      \`sortOrder\` INT NOT NULL DEFAULT '0',
      \`isActive\` TINYINT(1) NOT NULL DEFAULT '1',
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Settings\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`key\` VARCHAR(255) NOT NULL,
      \`value\` TEXT NOT NULL,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE INDEX \`key\` (\`key\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

export const down = async (sequelize: any) => {
  throw new Error(
    'Baseline migration 0001-baseline.ts cannot be rolled back. ' +
    'It represents the existing production schema. ' +
    'If you need to revert schema changes, create a new reverse migration instead.'
  );
};
