-- Migration: Add Bizino AI Chat configuration to SiteInfo
-- Run this on existing databases

ALTER TABLE `SiteInfo` 
ADD COLUMN IF NOT EXISTS `chatEnabled` TINYINT(1) NOT NULL DEFAULT 1 AFTER `showPosts`,
ADD COLUMN IF NOT EXISTS `chatAssistantId` VARCHAR(255) AFTER `chatEnabled`,
ADD COLUMN IF NOT EXISTS `chatApiUrl` VARCHAR(500) DEFAULT 'https://chat.bizino.ai/api' AFTER `chatAssistantId`,
ADD COLUMN IF NOT EXISTS `chatApiKey` VARCHAR(500) AFTER `chatApiUrl`;

-- Note: MySQL 8.0.0+ supports IF NOT EXISTS for ADD COLUMN
-- For older versions, you may need to run these separately and ignore errors for existing columns
