package com.Sticky_notes.Sticky_notes;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.Sticky_notes.Sticky_notes.Config.JwtProperties;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import javax.annotation.PostConstruct;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class StickyNotesApplication {

	private static final Logger logger = LoggerFactory.getLogger(StickyNotesApplication.class);
	
	@Autowired
	private Environment environment;
	
	@PostConstruct
	public void logApplicationStartup() {
		String[] profiles = environment.getActiveProfiles();
		String activeProfiles = profiles.length > 0 ? String.join(", ", profiles) : "default";
		logger.info("\n----------------------------------------------------------\n" +
			"Application '{}' is running with active profile(s): {}\n" +
			"----------------------------------------------------------",
			environment.getProperty("spring.application.name"),
			activeProfiles);
		
		logger.info("Database URL: {}", environment.getProperty("spring.datasource.url"));
	}

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(StickyNotesApplication.class);
		Environment env = app.run(args).getEnvironment();
		logger.info("Started Sticky Notes application on port: {}", env.getProperty("server.port"));
	}

}
