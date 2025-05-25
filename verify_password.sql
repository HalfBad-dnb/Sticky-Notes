-- Verify if the password matches the stored hash
SELECT 
    username,
    password = crypt('testpass', password) AS password_matches
FROM 
    users 
WHERE 
    username = 'testuser';
