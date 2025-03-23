package com.Sticky_notes.Sticky_notes.Config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.util.Properties;

@Configuration
public class CloudSqlConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(CloudSqlConfig.class);

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.hikari.maximum-pool-size:5}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:2}")
    private int minIdle;

    @Value("${spring.datasource.hikari.connection-timeout:20000}")
    private long connectionTimeout;
    
    @Value("${spring.datasource.hikari.idle-timeout:300000}")
    private long idleTimeout;
    
    @Value("${spring.datasource.hikari.max-lifetime:1200000}")
    private long maxLifetime;

    @Bean
    @Primary
    @Profile("cloud")
    @ConditionalOnProperty(name = "spring.profiles.active", havingValue = "cloud")
    public DataSource cloudSqlDataSource() {
        logger.info("Configuring Cloud SQL DataSource with connection URL: {}", jdbcUrl);
        
        try {
            Properties properties = new Properties();
            properties.setProperty("socketFactory", "com.google.cloud.sql.postgres.SocketFactory");
            properties.setProperty("ipTypes", "PUBLIC,PRIVATE");
            properties.setProperty("tcpKeepAlive", "true");
            properties.setProperty("connectTimeout", "10");
    
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(username);
            config.setPassword(password);
            config.setMaximumPoolSize(maxPoolSize);
            config.setMinimumIdle(minIdle);
            config.setConnectionTimeout(connectionTimeout);
            config.setIdleTimeout(idleTimeout);
            config.setMaxLifetime(maxLifetime);
            config.setDataSourceProperties(properties);
            config.setAutoCommit(true);
            config.setConnectionTestQuery("SELECT 1");
            
            logger.info("Cloud SQL DataSource configuration complete");
            return new HikariDataSource(config);
        } catch (Exception e) {
            logger.error("Error configuring Cloud SQL DataSource", e);
            throw e;
        }
    }
    
    @Bean
    @Profile("!cloud")
    public DataSource localDataSource() {
        logger.info("Configuring local DataSource with connection URL: {}", jdbcUrl);
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        
        logger.info("Local DataSource configuration complete");
        return new HikariDataSource(config);
    }
}
