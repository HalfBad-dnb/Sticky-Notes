#!/bin/bash
set -e

# Print environment variables for debugging (excluding sensitive ones)
echo "Starting application with the following configuration:"
echo "PORT: ${PORT:-8080}"
echo "SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE:-cloud}"
echo "SPRING_CLOUD_GCP_SQL_ENABLED: ${SPRING_CLOUD_GCP_SQL_ENABLED:-true}"
echo "SPRING_CLOUD_GCP_SQL_DATABASE_NAME: ${SPRING_CLOUD_GCP_SQL_DATABASE_NAME}"

# Set default PORT if not provided
export PORT=${PORT:-8080}

# Set Java options
JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom"
JAVA_OPTS="${JAVA_OPTS} -Dserver.port=${PORT}"
JAVA_OPTS="${JAVA_OPTS} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-cloud}"

# Print startup message
echo "Starting Spring Boot application on port ${PORT}..."
echo "Using Java options: ${JAVA_OPTS}"

# Start the application
exec java ${JAVA_OPTS} -jar /app/app.jar
