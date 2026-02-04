#!/bin/bash

# Set JAVA_HOME automatically if not set
if [ -z "$JAVA_HOME" ]; then
    export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
    if [ -z "$JAVA_HOME" ]; then
        echo "Error: JAVA_HOME is not set and could not be determined automatically"
        exit 1
    fi
    echo "Using Java from: $JAVA_HOME"
fi

# Load environment variables from .env file
if [ -f .env ]; then
    set -o allexport
    source .env
    set +o allexport
else
    echo "Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not set in .env file"
    exit 1
fi

echo "Loaded DATABASE_URL: ${DATABASE_URL}"
if [ -n "$DATABASE_USERNAME" ]; then
    prefix=$(printf '%s' "$DATABASE_USERNAME" | cut -c1-4)
    echo "Loaded DATABASE_USERNAME: ${prefix}****"
else
    echo "Loaded DATABASE_USERNAME: (empty)"
fi

# Also set Spring Boot standard datasource environment variables to avoid any
# placeholder resolution / override issues.
export SPRING_DATASOURCE_URL="$DATABASE_URL"
export SPRING_DATASOURCE_USERNAME="$DATABASE_USERNAME"
export SPRING_DATASOURCE_PASSWORD="$DATABASE_PASSWORD"

echo "Loaded SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}"
if [ -n "$SPRING_DATASOURCE_USERNAME" ]; then
    spring_prefix=$(printf '%s' "$SPRING_DATASOURCE_USERNAME" | cut -c1-4)
    echo "Loaded SPRING_DATASOURCE_USERNAME: ${spring_prefix}****"
else
    echo "Loaded SPRING_DATASOURCE_USERNAME: (empty)"
fi

echo "Building the application..."
JAVA_HOME=$(/usr/libexec/java_home) ./mvnw clean install -DskipTests=true

if [ $? -ne 0 ]; then
    echo "Build failed. Please check the errors above."
    exit 1
fi

echo "Starting the application..."
JAVA_HOME=$(/usr/libexec/java_home) ./mvnw spring-boot:run -DskipTests=true

