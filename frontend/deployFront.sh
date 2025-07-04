#!/bin/bash

# Set your Google Cloud project ID
PROJECT_ID="rasyk-ka-nori"
PROJECT_NUMBER="1077104673800"
REGION="us-central1"  # Choose a region for Cloud Run

# Set your Docker image name (can be customized)
IMAGE_NAME="my-app"

# Authenticate with Google Cloud
echo "Authenticating with Google Cloud..."
gcloud auth login

# Set the active project in Google Cloud SDK
echo "Setting the active project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com

# Build the Docker image and push it to Google Container Registry
echo "Building Docker image and pushing to Google Container Registry..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME .

# Deploy to Google Cloud Run
echo "Deploying Docker image to Google Cloud Run..."
gcloud run deploy $IMAGE_NAME \
    --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

# Provide the URL of the deployed service
echo "Deployment successful! Your service is live at:"
gcloud run services describe $IMAGE_NAME --platform managed --region $REGION --format 'value(status.url)'
