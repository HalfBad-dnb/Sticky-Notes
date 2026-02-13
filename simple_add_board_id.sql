-- Simple SQL to add board_id column to note table
ALTER TABLE note ADD COLUMN IF NOT EXISTS board_id BIGINT;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_note_board'
        AND table_name = 'note'
    ) THEN
        ALTER TABLE note 
        ADD CONSTRAINT fk_note_board 
        FOREIGN KEY (board_id) REFERENCES board(id);
    END IF;
END $$;
