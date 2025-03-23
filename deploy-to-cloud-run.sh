#!/bin/bash
set -e

# Configuration
PROJECT_ID="rasyk-ka-nori"
REGION="europe-west1"  # Change to your preferred region
BACKEND_SERVICE_NAME="sticky-notes-backend"
FRONTEND_SERVICE_NAME="sticky-notes-frontend"
DB_INSTANCE_NAME="sticky-notes-db-eu"
DB_NAME="sticky_notes"
DB_USER="sticky_notes_user"
DB_PASSWORD="sticky_notes_password"

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Google Cloud Run for project: ${PROJECT_ID}${NC}"

# Authenticate with Google Cloud (if not already authenticated)
echo -e "${YELLOW}Authenticating with Google Cloud...${NC}"
gcloud auth login --quiet

# Set the project
echo -e "${YELLOW}Setting project to: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required services if not already enabled
echo -e "${YELLOW}Enabling required Google Cloud services...${NC}"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  vpcaccess.googleapis.com

# Check if Cloud SQL instance exists, create if not
echo -e "${YELLOW}Checking if Cloud SQL instance exists...${NC}"
if ! gcloud sql instances describe ${DB_INSTANCE_NAME} &>/dev/null; then
  echo -e "${YELLOW}Creating Cloud SQL PostgreSQL instance in ${REGION}...${NC}"
  # Try to create the instance with public IP
  if ! gcloud sql instances create ${DB_INSTANCE_NAME} \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=${REGION} \
    --root-password=admin123 \
    --storage-size=10GB \
    --availability-type=zonal; then
    
    echo -e "${YELLOW}Failed to create instance with default settings. Trying alternative configuration...${NC}"
    # Try with explicit public IP configuration
    gcloud sql instances create ${DB_INSTANCE_NAME} \
      --database-version=POSTGRES_15 \
      --tier=db-f1-micro \
      --region=${REGION} \
      --root-password=admin123 \
      --storage-size=10GB \
      --availability-type=zonal \
      --assign-ip
  fi
  
  # Create database
  echo -e "${YELLOW}Creating database...${NC}"
  gcloud sql databases create ${DB_NAME} --instance=${DB_INSTANCE_NAME}
  
  # Create user for the application
  echo -e "${YELLOW}Creating database user...${NC}"
  gcloud sql users create ${DB_USER} \
    --instance=${DB_INSTANCE_NAME} \
    --password=${DB_PASSWORD}
else
  echo -e "${GREEN}Cloud SQL instance already exists.${NC}"
fi

# Get the Cloud SQL connection name
DB_CONNECTION_NAME=$(gcloud sql instances describe ${DB_INSTANCE_NAME} --format='value(connectionName)')
echo -e "${GREEN}Database connection name: ${DB_CONNECTION_NAME}${NC}"

# Build and deploy backend
echo -e "${YELLOW}Building and deploying backend service...${NC}"
cd "$(dirname "$0")"

# Build the backend container
echo -e "${YELLOW}Building backend container...${NC}"
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${BACKEND_SERVICE_NAME} .

# Deploy the backend to Cloud Run
echo -e "${YELLOW}Deploying backend to Cloud Run...${NC}"
gcloud run deploy ${BACKEND_SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${BACKEND_SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --add-cloudsql-instances=${DB_CONNECTION_NAME} \
  --set-env-vars="SPRING_PROFILES_ACTIVE=cloud" \
  --set-env-vars="SPRING_CLOUD_GCP_SQL_ENABLED=true" \
  --set-env-vars="SPRING_CLOUD_GCP_SQL_INSTANCE_CONNECTION_NAME=${DB_CONNECTION_NAME}" \
  --set-env-vars="SPRING_CLOUD_GCP_SQL_DATABASE_NAME=${DB_NAME}" \
  --set-env-vars="SPRING_DATASOURCE_URL=jdbc:postgresql:///${DB_NAME}?cloudSqlInstance=${DB_CONNECTION_NAME}&socketFactory=com.google.cloud.sql.postgres.SocketFactory" \
  --set-env-vars="SPRING_DATASOURCE_USERNAME=${DB_USER}" \
  --set-env-vars="SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}" \
  --set-env-vars="SPRING_JPA_HIBERNATE_DDL_AUTO=update" \
  --set-env-vars="SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect" \
  --min-instances=1 \
  --max-instances=1 \
  --cpu=1 \
  --memory=512Mi \
  --timeout=600s

# For production, use a more secure approach like Secret Manager
# --set-env-vars="SPRING_DATASOURCE_PASSWORD=$(cat .db_password.txt)" \

# Get the backend URL
BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE_NAME} --platform managed --region ${REGION} --format='value(status.url)')

# Ensure the URL uses HTTPS
if [[ $BACKEND_URL == http://* ]]; then
  BACKEND_URL=${BACKEND_URL/http:/https:}
fi

echo -e "${GREEN}Backend deployed at: ${BACKEND_URL}${NC}"

# Build and deploy frontend
echo -e "${YELLOW}Building and deploying frontend service...${NC}"
cd sticky-notes

# Build the frontend container
echo -e "${YELLOW}Building frontend container...${NC}"
# Create a .env file with the API URL
echo -e "${YELLOW}Setting API URL to: ${BACKEND_URL}${NC}"
echo "VITE_API_URL=${BACKEND_URL}" > .env

# Make sure the environment variable is available during build
export VITE_API_URL=${BACKEND_URL}

# Make sure the API URL is correctly set in the build
echo -e "${YELLOW}Verifying .env file contents:${NC}"
cat .env

# Create a temporary cloudbuild.yaml file to pass build args
cat > cloudbuild.yaml << EOF
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE_NAME}', '--build-arg', 'VITE_API_URL=${BACKEND_URL}', '.']
images:
- 'gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE_NAME}'
EOF

# Submit the build with the cloudbuild.yaml file
gcloud builds submit --config cloudbuild.yaml .

# Deploy the frontend to Cloud Run
echo -e "${YELLOW}Deploying frontend to Cloud Run...${NC}"
gcloud run deploy ${FRONTEND_SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated

# Get the frontend URL
FRONTEND_URL=$(gcloud run services describe ${FRONTEND_SERVICE_NAME} --platform managed --region ${REGION} --format='value(status.url)')

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Frontend URL: ${FRONTEND_URL}${NC}"
echo -e "${GREEN}Backend URL: ${BACKEND_URL}${NC}"
