#!/bin/bash

# Set JAVA_HOME automatically if not set
if [ -z "$JAVA_HOME" ]; then
    export JAVA_HOME=$(/usr/libexec/java_home 2>/dev/null)
    if [ -z "$JAVA_HOME" ]; then
        echo "Error: JAVA_HOME is not set and could not be determined automatically"
        exit 1
    fi
    echo "Using Java from: $JAVA_HOME"
fi

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$SPRING_DATASOURCE_URL" ] || [ -z "$SPRING_DATASOURCE_USERNAME" ] || [ -z "$SPRING_DATASOURCE_PASSWORD" ]; then
    echo "Error: Database credentials not set in .env file"
    exit 1
fi

echo "Building the application..."
JAVA_HOME=$(/usr/libexec/java_home) ./mvnw clean install -DskipTests=true

if [ $? -ne 0 ]; then
    echo "Build failed. Please check the errors above."
    exit 1
fi

echo "Starting the application..."
JAVA_HOME=$(/usr/libexec/java_home) ./mvnw spring-boot:run -DskipTests=true

