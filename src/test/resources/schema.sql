-- Drop tables if they exist
DROP TABLE IF EXISTS board;
DROP TABLE IF EXISTS note;
DROP TABLE IF EXISTS users;

-- Create user table (named 'users' to match JPA entity mapping)
CREATE TABLE users (
    id IDENTITY PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Create board table
CREATE TABLE board (
    id IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create note table
CREATE TABLE note (
    id IDENTITY PRIMARY KEY,
    content TEXT,
    color VARCHAR(50),
    position_x INT,
    position_y INT,
    board_id BIGINT,
    FOREIGN KEY (board_id) REFERENCES board(id)
);
