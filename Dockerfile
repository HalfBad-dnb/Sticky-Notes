# Stage 1: Build the backend app
FROM maven:3.9.6-eclipse-temurin-21-jammy as build

WORKDIR /app

# Copy the pom.xml and install dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and compile
COPY src ./src
RUN mvn package -DskipTests -Dfrontend.skip=true

# Stage 2: Build the frontend (if needed)
# Uncomment and customize if you have a frontend build step
# FROM node:18 as frontend
# WORKDIR /app/frontend
# COPY frontend/package*.json ./
# RUN npm install
# COPY frontend/ .
# RUN npm run build

# Stage 3: Final image
FROM nginx:1.25-alpine as production

# Install OpenJDK JRE
RUN apk add --no-cache openjdk21-jre

# Set working directory for the app
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/sticky-notes-*.jar /app/app.jar

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy frontend files (if built in stage 2)
# COPY --from=frontend /app/frontend/dist /usr/share/nginx/html
# Or copy pre-built frontend files if they exist in the project
COPY sticky-notes/ /usr/share/nginx/html/

# Copy the startup script
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Environment variables with defaults
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=dev \
    BACKEND_URL=http://host.docker.internal:8081 \
    ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8080" \
    # Database configuration will be provided at runtime from .env
    SPRING_DATASOURCE_URL="" \
    SPRING_DATASOURCE_USERNAME="" \
    SPRING_DATASOURCE_PASSWORD=""

# Expose the port the app runs on
EXPOSE 8080

# Health check (simple version)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health 2>/dev/null || exit 1

# Start the application
CMD ["/app/startup.sh"]
