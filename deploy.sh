#!/bin/bash

# Exit on error
set -e

# Project and Cloud Run service names
PROJECT_ID="rasyk-ka-nori"
REGION="us-central1"
BACKEND_SERVICE="backend"
FRONTEND_SERVICE="frontend"

# Build and deploy backend
echo "📦 Building Backend..."
mvn clean package -DskipTests

if [ ! -f "target/myapp.jar" ]; then
    echo "❌ Error: target/myapp.jar not found. Build failed."
    exit 1
fi

echo "🚀 Building and pushing Backend Docker image..."
docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE -f backend/Dockerfile .
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE

echo "🚀 Deploying Backend to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

# Build and deploy frontend
echo "📦 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🚀 Building and pushing Frontend Docker image..."
docker build -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE -f frontend/Dockerfile .
docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE

echo "🚀 Deploying Frontend to Cloud Run..."
gcloud run deploy $FRONTEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

echo "✅ Deployment successful!"
