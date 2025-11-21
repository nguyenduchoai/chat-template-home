-- Complete Database Migration
-- This file contains all table definitions with fixed triggers
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- User Table
-- ============================================
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "emailVerified" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- ============================================
-- Post Table
-- ============================================
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "publishedAt" TIMESTAMP,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Post_slug_idx" ON "Post"("slug");
CREATE INDEX IF NOT EXISTS "Post_published_idx" ON "Post"("published");

-- ============================================
-- SiteInfo Table
-- ============================================
CREATE TABLE IF NOT EXISTS "SiteInfo" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "siteUrl" TEXT NOT NULL DEFAULT 'http://localhost:3000',
    "title" TEXT NOT NULL DEFAULT 'AI Platform',
    "name" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "bannerTitle" TEXT,
    "bannerDescription" TEXT,
    "featuresTitle" TEXT,
    "featuresDescription" TEXT,
    "reasonsTitle" TEXT,
    "reasonsDescription" TEXT,
    "author" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "address" TEXT,
    "contact" TEXT,
    "ogImage" TEXT,
    "ogType" TEXT,
    "twitterCard" TEXT,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedBy" TEXT REFERENCES "User"("id")
);

-- Add columns if they don't exist (for existing databases)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SiteInfo' AND column_name = 'featuresTitle') THEN
        ALTER TABLE "SiteInfo" ADD COLUMN "featuresTitle" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SiteInfo' AND column_name = 'featuresDescription') THEN
        ALTER TABLE "SiteInfo" ADD COLUMN "featuresDescription" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SiteInfo' AND column_name = 'reasonsTitle') THEN
        ALTER TABLE "SiteInfo" ADD COLUMN "reasonsTitle" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'SiteInfo' AND column_name = 'reasonsDescription') THEN
        ALTER TABLE "SiteInfo" ADD COLUMN "reasonsDescription" TEXT;
    END IF;
END $$;

-- ============================================
-- Slides Table
-- ============================================
CREATE TABLE IF NOT EXISTS "Slides" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    image TEXT NOT NULL,
    link TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slides_order ON "Slides"("order");
CREATE INDEX IF NOT EXISTS idx_slides_active ON "Slides"(active);

-- ============================================
-- Features Table
-- ============================================
CREATE TABLE IF NOT EXISTS "Features" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_features_order ON "Features"("order");
CREATE INDEX IF NOT EXISTS idx_features_active ON "Features"(active);

-- ============================================
-- Reasons Table
-- ============================================
CREATE TABLE IF NOT EXISTS "Reasons" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reasons_order ON "Reasons"("order");
CREATE INDEX IF NOT EXISTS idx_reasons_active ON "Reasons"(active);

-- ============================================
-- ColorConfig Table
-- ============================================
CREATE TABLE IF NOT EXISTS "ColorConfig" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "rgbValue" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_color_config_key ON "ColorConfig"("key");

-- ============================================
-- Contact Table
-- ============================================
CREATE TABLE IF NOT EXISTS "Contact" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_email ON "Contact"("email");
CREATE INDEX IF NOT EXISTS idx_contact_read ON "Contact"("read");
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON "Contact"("createdAt");

-- ============================================
-- Trigger Function (Fixed for both camelCase and snake_case)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle camelCase for Post, User, SiteInfo, ColorConfig, Contact
    IF TG_TABLE_NAME = 'Post' OR TG_TABLE_NAME = 'User' OR TG_TABLE_NAME = 'SiteInfo' 
       OR TG_TABLE_NAME = 'ColorConfig' OR TG_TABLE_NAME = 'Contact' THEN
        NEW."updatedAt" = NOW();
    -- Handle snake_case for Slides, Features, Reasons
    ELSIF TG_TABLE_NAME = 'Slides' OR TG_TABLE_NAME = 'Features' OR TG_TABLE_NAME = 'Reasons' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- Triggers for all tables
-- ============================================
DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_updated_at ON "Post";
CREATE TRIGGER update_post_updated_at BEFORE UPDATE ON "Post"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_siteinfo_updated_at ON "SiteInfo";
CREATE TRIGGER update_siteinfo_updated_at BEFORE UPDATE ON "SiteInfo"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_slides_updated_at ON "Slides";
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON "Slides"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_features_updated_at ON "Features";
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON "Features"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reasons_updated_at ON "Reasons";
CREATE TRIGGER update_reasons_updated_at BEFORE UPDATE ON "Reasons"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_color_config_updated_at ON "ColorConfig";
CREATE TRIGGER update_color_config_updated_at BEFORE UPDATE ON "ColorConfig"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_updated_at ON "Contact";
CREATE TRIGGER update_contact_updated_at BEFORE UPDATE ON "Contact"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================

-- User Table RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on User" ON "User";
CREATE POLICY "Allow all on User" ON "User" FOR ALL USING (true);

-- Post Table RLS
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on Post" ON "Post";
CREATE POLICY "Allow all on Post" ON "Post" FOR ALL USING (true);

-- SiteInfo Table RLS
ALTER TABLE "SiteInfo" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on SiteInfo" ON "SiteInfo";
CREATE POLICY "Allow all on SiteInfo" ON "SiteInfo" FOR ALL USING (true);

-- Slides Table RLS
ALTER TABLE "Slides" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON "Slides";
DROP POLICY IF EXISTS "Allow authenticated users full access" ON "Slides";

CREATE POLICY "Allow public read access" ON "Slides"
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users full access" ON "Slides"
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Features Table RLS
ALTER TABLE "Features" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON "Features";
DROP POLICY IF EXISTS "Allow authenticated users full access" ON "Features";

CREATE POLICY "Allow public read access" ON "Features"
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users full access" ON "Features"
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Reasons Table RLS
ALTER TABLE "Reasons" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON "Reasons";
DROP POLICY IF EXISTS "Allow authenticated users full access" ON "Reasons";

CREATE POLICY "Allow public read access" ON "Reasons"
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users full access" ON "Reasons"
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ColorConfig Table RLS
ALTER TABLE "ColorConfig" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on ColorConfig" ON "ColorConfig";
DROP POLICY IF EXISTS "Allow authenticated users to manage ColorConfig" ON "ColorConfig";

CREATE POLICY "Allow public read on ColorConfig" ON "ColorConfig"
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage ColorConfig" ON "ColorConfig"
    FOR ALL USING (auth.role() = 'authenticated');

-- Contact Table RLS
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on Contact" ON "Contact";
DROP POLICY IF EXISTS "Allow authenticated users to read Contact" ON "Contact";
DROP POLICY IF EXISTS "Allow authenticated users to update Contact" ON "Contact";
DROP POLICY IF EXISTS "Allow authenticated users to delete Contact" ON "Contact";

CREATE POLICY "Allow public insert on Contact" ON "Contact"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read Contact" ON "Contact"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update Contact" ON "Contact"
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete Contact" ON "Contact"
    FOR DELETE USING (auth.role() = 'authenticated');
