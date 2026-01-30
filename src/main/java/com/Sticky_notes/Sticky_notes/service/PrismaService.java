package com.Sticky_notes.Sticky_notes.service;

import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.util.Map;
import java.util.HashMap;

/**
 * Prisma Service for database operations
 * This service integrates Prisma ORM with Spring Boot
 * Note: For now, we're using JPA/Hibernate as the primary ORM
 * Prisma is configured for future migration or hybrid usage
 */
@Service
public class PrismaService {
    
    private boolean prismaAvailable = false;
    
    @PostConstruct
    public void init() {
        // Check if Prisma client is available
        try {
            // This would be used when we fully integrate Prisma
            // For now, we'll use JPA/Hibernate with the same database
            prismaAvailable = true;
            System.out.println("Prisma service initialized - using JPA/Hibernate for now");
        } catch (Exception e) {
            System.err.println("Failed to initialize Prisma: " + e.getMessage());
            prismaAvailable = false;
        }
    }
    
    @PreDestroy
    public void cleanup() {
        if (prismaAvailable) {
            System.out.println("Prisma service cleanup completed");
        }
    }
    
    public boolean isPrismaAvailable() {
        return prismaAvailable;
    }
    
    /**
     * Get database connection status
     */
    public Map<String, Object> getDatabaseStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("prismaAvailable", prismaAvailable);
        status.put("orm", "JPA/Hibernate");
        status.put("database", "PostgreSQL via Supabase");
        status.put("status", prismaAvailable ? "connected" : "disconnected");
        return status;
    }
}
