-- Fix board table schema to add missing columns
-- Run this SQL to update your database schema

ALTER TABLE board 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS code VARCHAR(255),
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS board_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL';

-- Update any existing rows to have default values
UPDATE board SET board_type = 'GENERAL' WHERE board_type IS NULL;

-- If the column already exists but allows NULL, alter it to NOT NULL
DO $$
BEGIN
    -- Check if board_type column exists and allows NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'board' 
        AND column_name = 'board_type' 
        AND is_nullable = 'YES'
    ) THEN
        -- Update all NULL values to default
        UPDATE board SET board_type = 'GENERAL' WHERE board_type IS NULL;
        
        -- Alter column to NOT NULL
        ALTER TABLE board ALTER COLUMN board_type SET NOT NULL;
    END IF;
END $$;

-- Show the updated table structure
\d board
