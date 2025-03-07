# Use Node.js base image
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all frontend files and build the Vite app
COPY . .
RUN npm run build

# Use Nginx to serve frontend files
FROM nginx:alpine

# Copy built frontend files from previous step
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the frontend
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
