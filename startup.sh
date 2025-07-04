#!/bin/bash
set -e

# Set default values
export PORT=${PORT:-8080}
export SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-cloud}

# Required environment variables
required_vars=(
    "BACKEND_URL"
    "ALLOWED_ORIGINS"
    "SPRING_DATASOURCE_URL"
    "SPRING_DATASOURCE_USERNAME"
    "SPRING_DATASOURCE_PASSWORD"
)

# Validate required environment variables
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set"
        exit 1
    fi
done

# Print environment variables for debugging (excluding sensitive ones)
echo "===== Application Configuration ====="
echo "PORT: ${PORT}"
echo "SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}"
echo "BACKEND_URL: ${BACKEND_URL}"
echo "ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}"

# Database configuration
echo "SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}"
echo "SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME}"
echo "===================================="

# Escape special characters in ALLOWED_ORIGINS for nginx
export ESCAPED_ORIGINS=$(echo "$ALLOWED_ORIGINS" | sed 's/\//\\\//g' | sed 's/\./\\./g' | sed 's/\*/.*/g' | sed 's/,/|/g')

# Replace environment variables in nginx config
envsubst '${ESCAPED_ORIGINS} ${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx in the background
echo "Starting nginx..."
nginx

# Set Java options
JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom"
JAVA_OPTS="${JAVA_OPTS} -Dserver.port=${PORT}"
JAVA_OPTS="${JAVA_OPTS} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE}"

# Print startup message
echo "Starting Spring Boot application on port ${PORT}..."
echo "Using Java options: ${JAVA_OPTS}"

# Start the application
exec java ${JAVA_OPTS} -jar /app/app.jar
