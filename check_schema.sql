-- Check if board_id column exists in note table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'note' AND column_name = 'board_id';
