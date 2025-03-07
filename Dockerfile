# Use OpenJDK base image
FROM eclipse-temurin:23-jdk

# Set working directory
WORKDIR /app

# Copy everything to ensure necessary files are present
COPY . .

# Install dependencies
RUN ./mvnw dependency:go-offline

# Build the project
RUN ./mvnw package -DskipTests

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080

# Run the application with server.port set to the PORT environment variable
# Using shell form to ensure environment variable expansion
CMD java -jar target/sticky-notes-0.0.1-SNAPSHOT.jar --server.port=$PORT
