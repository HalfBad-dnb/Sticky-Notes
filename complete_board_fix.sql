-- Complete board table fix
-- This handles both old boardType and new board_type columns

-- First, if the old boardType column exists, rename it
DO $$
BEGIN
    -- Check if old boardType column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'board' 
        AND column_name = 'boardType'
    ) THEN
        -- Rename old column to new name
        ALTER TABLE board RENAME COLUMN boardType TO board_type;
        
        -- Update any NULL values
        UPDATE board SET board_type = 'GENERAL' WHERE board_type IS NULL;
        
        RAISE NOTICE 'Renamed boardType to board_type';
    END IF;
END $$;

-- Add any missing columns
ALTER TABLE board 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS code VARCHAR(255),
ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Ensure board_type column exists and is properly configured
DO $$
BEGIN
    -- Check if board_type column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'board' 
        AND column_name = 'board_type'
    ) THEN
        -- Add the column
        ALTER TABLE board ADD COLUMN board_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL';
        RAISE NOTICE 'Added board_type column';
    ELSE
        -- Update NULL values and ensure NOT NULL
        UPDATE board SET board_type = 'GENERAL' WHERE board_type IS NULL;
        
        -- Check if column allows NULL and fix it
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'board' 
            AND column_name = 'board_type' 
            AND is_nullable = 'YES'
        ) THEN
            ALTER TABLE board ALTER COLUMN board_type SET NOT NULL;
            RAISE NOTICE 'Set board_type to NOT NULL';
        END IF;
    END IF;
END $$;

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'board' 
ORDER BY ordinal_position;
