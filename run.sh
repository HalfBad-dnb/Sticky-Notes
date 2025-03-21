#!/bin/bash

# Run the application
#echo "Running clean install"
#mvn clean install
#echo "Running the application"
#mvn spring-boot:run
mvn clean install -DskipTests=true
mvn spring-boot:run -Dskiptests


