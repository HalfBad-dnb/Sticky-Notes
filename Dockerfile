# Stage 1: Build the backend app
FROM maven:3.8.4-openjdk-17-slim as build

WORKDIR /app

# Copy the pom.xml and install dependencies
COPY pom.xml .
RUN mvn clean install -DskipTests

# Copy the source code and compile
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Run the backend app
FROM openjdk:17-jdk-slim

# Copy the JAR file from the build stage
COPY --from=build /app/target/sticky-notes-*.jar /app/sticky-notes.jar

# Expose port 8080 for the backend
EXPOSE 8080

# Run the backend app
CMD ["java", "-jar", "/app/sticky-notes.jar"]
