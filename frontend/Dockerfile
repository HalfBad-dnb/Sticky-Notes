# Stage 1: Build the frontend with Vite
FROM node:18-alpine as build

WORKDIR /app

# Define build argument for API URL
ARG VITE_API_URL=https://sticky-notes-backend-oyj73tnptq-ew.a.run.app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Create a .env file with the API URL from build arg
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Build the production version of the frontend
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy the build files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run expects this port)
EXPOSE 8080

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
