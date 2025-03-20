#!/bin/bash

# Set variables
PROJECT_ID="rasyk-ka-nori"
FRONTEND_IMAGE_NAME="sticky-notes"
BACKEND_IMAGE_NAME="sticky_notes"
REGION="europe-west1"
FRONTEND_SERVICE_NAME="sticky-notes"
BACKEND_SERVICE_NAME="sticky_notes"
FRONTEND_DIR="sticky-notes"
BACKEND_DIR="sticky_notes"

# Ensure the directories and Dockerfiles exist
if [ ! -f "${FRONTEND_DIR}/Dockerfile" ]; then
  echo "Frontend Dockerfile not found in ${FRONTEND_DIR}!"
  exit 1
fi

if [ ! -f "${BACKEND_DIR}/Dockerfile" ]; then
  echo "Backend Dockerfile not found in ${BACKEND_DIR}!"
  exit 1
fi

# Build Docker image for the frontend
echo "Building frontend Docker image..."
docker build --platform linux/amd64 -t ${FRONTEND_IMAGE_NAME}-image ${FRONTEND_DIR}
if [ $? -ne 0 ]; then
  echo "Failed to build frontend Docker image!"
  exit 1
fi

# Build Docker image for the backend
echo "Building backend Docker image..."
docker build --platform linux/amd64 -t ${BACKEND_IMAGE_NAME}-image ${BACKEND_DIR}
if [ $? -ne 0 ]; then
  echo "Failed to build backend Docker image!"
  exit 1
fi

# Tag the images for Google Artifact Registry
echo "Tagging frontend Docker image..."
docker tag ${FRONTEND_IMAGE_NAME}-image gcr.io/${PROJECT_ID}/${FRONTEND_IMAGE_NAME}-image:latest
if [ $? -ne 0 ]; then
  echo "Failed to tag frontend Docker image!"
  exit 1
fi

echo "Tagging backend Docker image..."
docker tag ${BACKEND_IMAGE_NAME}-image gcr.io/${PROJECT_ID}/${BACKEND_IMAGE_NAME}-image:latest
if [ $? -ne 0 ]; then
  echo "Failed to tag backend Docker image!"
  exit 1
fi

# Push the images to Google Cloud
echo "Pushing frontend Docker image to Google Cloud..."
docker push gcr.io/${PROJECT_ID}/${FRONTEND_IMAGE_NAME}-image:latest
if [ $? -ne 0 ]; then
  echo "Failed to push frontend Docker image!"
  exit 1
fi

echo "Pushing backend Docker image to Google Cloud..."
docker push gcr.io/${PROJECT_ID}/${BACKEND_IMAGE_NAME}-image:latest
if [ $? -ne 0 ]; then
  echo "Failed to push backend Docker image!"
  exit 1
fi

# Deploy frontend to Google Cloud Run with port 80 (for frontend)
echo "Deploying frontend to Google Cloud Run..."
gcloud run deploy ${FRONTEND_SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${FRONTEND_IMAGE_NAME}-image:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 80
if [ $? -ne 0 ]; then
  echo "Failed to deploy frontend to Google Cloud Run!"
  exit 1
fi

# Deploy backend to Google Cloud Run with port 8080 (for backend)
echo "Deploying backend to Google Cloud Run..."
gcloud run deploy ${BACKEND_SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${BACKEND_IMAGE_NAME}-image:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080
if [ $? -ne 0 ]; then
  echo "Failed to deploy backend to Google Cloud Run!"
  exit 1
fi

# List deployed services
echo "Listing deployed services..."
gcloud run services list --platform managed --region ${REGION}
