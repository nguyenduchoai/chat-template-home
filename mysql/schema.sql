-- ============================================
-- MySQL Schema for Chat Template Home
-- ============================================
-- Run this to create all tables

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- User Table
-- ============================================
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `name` VARCHAR(255),
    `password` VARCHAR(255),
    `image` TEXT,
    `role` VARCHAR(50) NOT NULL DEFAULT 'user',
    `emailVerified` DATETIME,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_email` (`email`),
    INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Post Table
-- ============================================
CREATE TABLE IF NOT EXISTS `Post` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `title` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(500) NOT NULL UNIQUE,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT,
    `coverImage` TEXT,
    `published` TINYINT(1) NOT NULL DEFAULT 0,
    `authorId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `publishedAt` DATETIME,
    INDEX `idx_post_slug` (`slug`),
    INDEX `idx_post_published` (`published`),
    INDEX `idx_post_author` (`authorId`),
    INDEX `idx_post_published_at` (`publishedAt`),
    FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SiteInfo Table (Single row for site settings)
-- ============================================
CREATE TABLE IF NOT EXISTS `SiteInfo` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `siteUrl` VARCHAR(500) NOT NULL DEFAULT 'http://localhost:3000',
    `title` VARCHAR(255) NOT NULL DEFAULT 'AI Platform',
    `name` VARCHAR(255),
    `logo` TEXT,
    `description` TEXT,
    `keywords` TEXT,
    `bannerTitle` VARCHAR(500),
    `bannerDescription` TEXT,
    `featuresTitle` VARCHAR(500),
    `featuresDescription` TEXT,
    `reasonsTitle` VARCHAR(500),
    `reasonsDescription` TEXT,
    `author` VARCHAR(255),
    `email` VARCHAR(255),
    `phone` VARCHAR(50),
    `facebook` VARCHAR(500),
    `instagram` VARCHAR(500),
    `twitter` VARCHAR(500),
    `linkedin` VARCHAR(500),
    `youtube` VARCHAR(500),
    `tiktok` VARCHAR(500),
    `address` TEXT,
    `contact` TEXT,
    `ogImage` TEXT,
    `ogType` VARCHAR(100),
    `twitterCard` VARCHAR(100),
    -- Section visibility toggles (default true)
    `showSlides` TINYINT(1) NOT NULL DEFAULT 1,
    `showBanner` TINYINT(1) NOT NULL DEFAULT 1,
    `showFeatures` TINYINT(1) NOT NULL DEFAULT 1,
    `showReasons` TINYINT(1) NOT NULL DEFAULT 1,
    `showPosts` TINYINT(1) NOT NULL DEFAULT 1,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updatedBy` VARCHAR(36),
    FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Slides Table
-- ============================================
CREATE TABLE IF NOT EXISTS `Slides` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `title` VARCHAR(255) NOT NULL,
    `image` TEXT NOT NULL,
    `link` TEXT,
    `order` INT NOT NULL DEFAULT 0,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_slides_order` (`order`),
    INDEX `idx_slides_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Features Table
-- ============================================
CREATE TABLE IF NOT EXISTS `Features` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `icon` TEXT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `order` INT NOT NULL DEFAULT 0,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_features_order` (`order`),
    INDEX `idx_features_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Reasons Table
-- ============================================
CREATE TABLE IF NOT EXISTS `Reasons` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `icon` TEXT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `order` INT NOT NULL DEFAULT 0,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_reasons_order` (`order`),
    INDEX `idx_reasons_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ColorConfig Table
-- ============================================
CREATE TABLE IF NOT EXISTS `ColorConfig` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `key` VARCHAR(255) NOT NULL UNIQUE,
    `value` VARCHAR(255) NOT NULL,
    `rgbValue` VARCHAR(50),
    `description` TEXT,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_color_config_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Contact Table
-- ============================================
CREATE TABLE IF NOT EXISTS `Contact` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50),
    `subject` VARCHAR(500) NOT NULL,
    `message` TEXT NOT NULL,
    `read` TINYINT(1) NOT NULL DEFAULT 0,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_contact_email` (`email`),
    INDEX `idx_contact_read` (`read`),
    INDEX `idx_contact_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Seed default admin user (password: admin123)
-- Hash: $2a$10$... (bcrypt)
-- ============================================
-- INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`) 
-- VALUES (UUID(), 'admin@example.com', 'Admin', '$2a$10$rqKzVZ8dIBK9nHKJYJzWI.H5XKz9cHzJK8yK8zKzKzKzKzKzKzKzK', 'superadmin');
