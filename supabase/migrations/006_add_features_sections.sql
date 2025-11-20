-- Add features and reasons sections to SiteInfo table

ALTER TABLE "SiteInfo" 
ADD COLUMN IF NOT EXISTS "featuresTitle" TEXT,
ADD COLUMN IF NOT EXISTS "featuresDescription" TEXT,
ADD COLUMN IF NOT EXISTS "reasonsTitle" TEXT,
ADD COLUMN IF NOT EXISTS "reasonsDescription" TEXT;

-- Create Features table
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

-- Create Reasons table  
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_features_order ON "Features"("order");
CREATE INDEX IF NOT EXISTS idx_features_active ON "Features"(active);
CREATE INDEX IF NOT EXISTS idx_reasons_order ON "Reasons"("order");
CREATE INDEX IF NOT EXISTS idx_reasons_active ON "Reasons"(active);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_features_updated_at ON "Features";
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON "Features"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reasons_updated_at ON "Reasons";
CREATE TRIGGER update_reasons_updated_at BEFORE UPDATE ON "Reasons"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "Features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reasons" ENABLE ROW LEVEL SECURITY;

-- Policies for Features
DROP POLICY IF EXISTS "Allow public read access" ON "Features";
DROP POLICY IF EXISTS "Allow authenticated users full access" ON "Features";

CREATE POLICY "Allow public read access" ON "Features"
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users full access" ON "Features"
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policies for Reasons
DROP POLICY IF EXISTS "Allow public read access" ON "Reasons";
DROP POLICY IF EXISTS "Allow authenticated users full access" ON "Reasons";

CREATE POLICY "Allow public read access" ON "Reasons"
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users full access" ON "Reasons"
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
