-- ============================================================
-- KABOSS Inc - Full MySQL Database Setup
-- ============================================================
CREATE DATABASE IF NOT EXISTS kaboss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kaboss;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `username` VARCHAR(255) NULL DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `displayName` VARCHAR(255) NOT NULL,
`role` ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  `phone` VARCHAR(255) NULL DEFAULT NULL,
  `profilePictureUrl` VARCHAR(512) NULL DEFAULT NULL,
  `emailVerified` TINYINT(1) NOT NULL DEFAULT '0',
  `isActive` TINYINT(1) NOT NULL DEFAULT '1',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email`),
  UNIQUE INDEX `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Services` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(255) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT '1',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Bookings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `serviceId` INT UNSIGNED NOT NULL,
  `serviceName` VARCHAR(255) NOT NULL,
  `details` TEXT NOT NULL,
  `date` VARCHAR(255) NOT NULL,
  `time` VARCHAR(255) NULL DEFAULT NULL,
  `location` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('pending','approved','in-progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `userId` (`userId`),
  INDEX `serviceId` (`serviceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Contacts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NULL DEFAULT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `isRead` TINYINT(1) NOT NULL DEFAULT '0',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Conversations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `subject` VARCHAR(255) NULL DEFAULT NULL,
  `participants` TEXT NULL DEFAULT NULL,
  `lastMessage` TEXT NULL DEFAULT NULL,
  `lastMessageAt` DATETIME NULL DEFAULT NULL,
  `status` ENUM('active','archived','completed') NOT NULL DEFAULT 'active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversationId` INT UNSIGNED NOT NULL,
  `senderId` INT UNSIGNED NOT NULL,
  `senderName` VARCHAR(255) NULL DEFAULT NULL,
  `content` TEXT NOT NULL,
  `isRead` TINYINT(1) NOT NULL DEFAULT '0',
  `deliveredAt` DATETIME NULL DEFAULT NULL,
  `seenAt` DATETIME NULL DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `conversationId` (`conversationId`),
  INDEX `senderId` (`senderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Attachments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `messageId` INT UNSIGNED NOT NULL,
  `conversationId` INT UNSIGNED NOT NULL,
  `senderId` INT UNSIGNED NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `fileType` ENUM('image','pdf','zip','document','other') NOT NULL DEFAULT 'other',
  `mimeType` VARCHAR(255) NOT NULL,
  `storagePath` TEXT NOT NULL,
  `size` BIGINT UNSIGNED NOT NULL DEFAULT '0',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `messageId` (`messageId`),
  INDEX `conversationId` (`conversationId`),
  INDEX `senderId` (`senderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `FAQs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `category` VARCHAR(255) NULL DEFAULT NULL,
  `sortOrder` INT NOT NULL DEFAULT '0',
  `isActive` TINYINT(1) NOT NULL DEFAULT '1',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Partners` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `logo` VARCHAR(255) NULL DEFAULT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT '1',
  `sortOrder` INT NOT NULL DEFAULT '0',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Testimonials` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255) NULL DEFAULT NULL,
  `content` TEXT NOT NULL,
  `rating` INT NOT NULL DEFAULT '5',
  `isActive` TINYINT(1) NOT NULL DEFAULT '1',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Announcements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `type` VARCHAR(255) NULL DEFAULT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT '1',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: kaboss123!)
-- NOTE: If you already created kabossInc before, DO NOT run the INSERT again; update the password instead.
INSERT INTO `Users` (`email`, `username`, `password`, `displayName`, `role`, `emailVerified`, `isActive`, `createdAt`, `updatedAt`)
VALUES ('admin@kabossinc.com', 'kabossInc', '$2a$10$8KzQMG.Oz7QGx7Gx7Gx7GO', 'Super Admin', 'admin', 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `email` = VALUES(`email`),
  `password` = VALUES(`password`),
  `displayName` = VALUES(`displayName`),
  `role` = VALUES(`role`),
  `emailVerified` = VALUES(`emailVerified`),
  `isActive` = VALUES(`isActive`),
  `updatedAt` = NOW();

-- Services
INSERT INTO `Services` (`title`, `category`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
('Wedding Invitations', 'printing', 'Beautiful custom wedding invitation printing', 1, NOW(), NOW()),
('Business Cards', 'printing', 'Professional business card printing', 1, NOW(), NOW()),
('Logo Design', 'graphic-design', 'Custom logo design for your brand', 1, NOW(), NOW()),
('Passport Photos', 'photography', 'Professional passport photo service', 1, NOW(), NOW()),
('Sound System Rental', 'sound-system', 'Complete sound system for events', 1, NOW(), NOW());

-- Partners
INSERT INTO `Partners` (`name`, `description`, `logo`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
('Bank of Kigali', 'Leading commercial bank in Rwanda', 'BK', 1, 1, NOW(), NOW()),
('Equity Bank Rwanda', 'Pan-African banking group', 'EB', 2, 1, NOW(), NOW()),
('Rwanda Revenue Authority', 'Tax administration in Rwanda', 'RRA', 3, 1, NOW(), NOW()),
('MTN Rwanda', 'Leading telecommunications company', 'MTN', 4, 1, NOW(), NOW());

-- Testimonials
INSERT INTO `Testimonials` (`name`, `role`, `content`, `rating`, `isActive`, `createdAt`, `updatedAt`) VALUES
('Jean Pierre', 'Business Owner', 'KABOSS Inc delivered exceptional printing services. Highly recommended!', 5, 1, NOW(), NOW()),
('Alice Uwimana', 'Event Planner', 'Their sound system service made our wedding perfect!', 5, 1, NOW(), NOW()),
('David Mugisha', 'Graduate', 'Best graphic design services in Nyamasheke!', 5, 1, NOW(), NOW());

-- FAQs
INSERT INTO `FAQs` (`question`, `answer`, `category`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
('What services do you offer?', 'We offer printing, graphic design, photography, sound system, digital services, and Irembo assistance.', 'general', 1, 1, NOW(), NOW()),
('Where are you located?', 'Nyamasheke District, Ruharambuga Sector, Ntendezi Cell, Kakiru Village, Rwanda.', 'general', 2, 1, NOW(), NOW()),
('What are your business hours?', 'Monday to Saturday: 8:00 AM - 6:00 PM, Sunday: 9:00 AM - 2:00 PM.', 'general', 3, 1, NOW(), NOW());

-- Announcements
INSERT INTO `Announcements` (`title`, `content`, `type`, `isActive`, `createdAt`, `updatedAt`) VALUES
('Welcome to KABOSS Inc', 'We are excited to serve you with our premium multi-services.', 'update', 1, NOW(), NOW()),
('Holiday Promotion', '20% off on all printing services this holiday season!', 'promotion', 1, NOW(), NOW());

-- Site Settings
INSERT INTO `Settings` (`key`, `value`, `createdAt`, `updatedAt`) VALUES
('general', '{"heroTitle":"Your Trusted Multi-Service Business Center","heroSubtitle":"From printing to photography, we bring your ideas to life.","mission":"To provide accessible, high-quality business services that empower our community.","vision":"To be the leading multi-service business center in Rwanda.","coreValues":["Integrity","Excellence","Innovation","Customer Focus"],"businessHours":{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 6:00 PM","saturday":"8:00 AM - 6:00 PM","sunday":"9:00 AM - 2:00 PM"},"contact":{"phone":"+250 788 882 296","email":"kabbossimage@gmail.com","whatsapp":"+250 788 882 296","address":"Nyamasheke District, Ruharambuga Sector, Ntendezi Cell, Kakiru Village, Rwanda"},"socialMedia":{"facebook":"https://www.facebook.com/search/top?q=Kaboss%20Image","instagram":"#","whatsapp":"https://wa.me/250788882296"},"seo":{"title":"KABOSS Inc - Multi-Service Business Center","description":"Premium printing, design, photography & digital services in Nyamasheke, Rwanda.","keywords":"KABOSS, printing, graphic design, photography, sound system, Rwanda, Nyamasheke"}}', NOW(), NOW());
