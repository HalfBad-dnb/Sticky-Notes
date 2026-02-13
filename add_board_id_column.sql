-- Add board_id column to note table if it doesn't exist
DO $$
BEGIN
    -- Check if board_id column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'note' 
        AND column_name = 'board_id'
    ) THEN
        -- Add the board_id column
        ALTER TABLE note ADD COLUMN board_id BIGINT;
        
        -- Add foreign key constraint if boards table exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'board'
        ) THEN
            ALTER TABLE note ADD CONSTRAINT fk_note_board 
            FOREIGN KEY (board_id) REFERENCES board(id);
        END IF;
        
        RAISE NOTICE 'Added board_id column to note table';
    ELSE
        RAISE NOTICE 'board_id column already exists in note table';
    END IF;
END $$;

-- Show the current note table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'note' 
ORDER BY ordinal_position;
