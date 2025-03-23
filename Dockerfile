# Stage 1: Build the backend app
FROM maven:3.9.6-eclipse-temurin-21-jammy as build

WORKDIR /app

# Copy the pom.xml and install dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and compile
COPY src ./src
RUN mvn package -DskipTests -Dfrontend.skip=true

# Stage 2: Run the backend app
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/sticky-notes-*.jar /app/app.jar

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Copy the startup script
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Run the application using the startup script
CMD ["/app/startup.sh"]
