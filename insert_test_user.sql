-- Insert a test user with username 'testuser' and password 'testpass'
-- The password is hashed using BCrypt with strength 10
INSERT INTO users (username, email, password, role) 
VALUES ('testuser', 'test@example.com', 
        '$2a$10$SY4hCOMpxOdMSrzyjJOHduRhHnBkl.7aHLJP22yh9DpLJ8NRXQ..y', 
        'USER');

-- Verify the user was inserted
SELECT * FROM users;
