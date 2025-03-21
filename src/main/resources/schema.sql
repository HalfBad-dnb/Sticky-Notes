-- Create user table if not exists
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Create board table if not exists
CREATE TABLE IF NOT EXISTS board (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create note table if not exists
CREATE TABLE IF NOT EXISTS note (
    id SERIAL PRIMARY KEY,
    content TEXT,
    color VARCHAR(50),
    position_x INT,
    position_y INT,
    board_id BIGINT,
    FOREIGN KEY (board_id) REFERENCES board(id)
);