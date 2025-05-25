package com.Sticky_notes.Sticky_notes.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordVerifier {
    public static void main(String[] args) {
        String storedHash = "$2a$10$SY4hCOMpxOdMSrzyjJOHduRhHnBkl.7aHLJP22yh9DpLJ8NRXQ..y";
        String passwordToTest = "testpass";
        
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        boolean isMatch = encoder.matches(passwordToTest, storedHash);
        
        System.out.println("Password matches: " + isMatch);
        
        // If you want to see what a new hash would look like for this password
        String newHash = encoder.encode(passwordToTest);
        System.out.println("New hash for reference: " + newHash);
        
        // Also try with a different password for comparison
        boolean wrongPasswordMatch = encoder.matches("wrongpassword", storedHash);
        System.out.println("Wrong password matches: " + wrongPasswordMatch);
    }
}
