#!/bin/bash

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
mvn clean install -DskipTests=true

if [ $? -ne 0 ]; then
    echo "Build failed. Please check the errors above."
    exit 1
fi

echo "Starting the application..."
mvn spring-boot:run -DskipTests=true

