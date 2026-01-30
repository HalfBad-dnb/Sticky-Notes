# Setup Guide: Prisma + Supabase + API Architecture

## Overview
This guide walks you through setting up the Sticky Notes application with Prisma, Supabase, and a proper API architecture.

## Prerequisites
- Node.js 18+
- Java 17+
- Maven
- Supabase account
- Git

## Step 1: Backend Setup (Spring Boot + Prisma)

### 1.1 Configure Environment Variables
Create `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR_SUPABASE_PASSWORD]@db.your-project-id.supabase.co:5432/postgres?sslmode=require"

# Spring Configuration
SPRING_PROFILES_ACTIVE=local
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-256-bits-long

# Optional: Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 1.2 Setup Prisma
```bash
cd sticky-notes
npm install prisma @prisma/client
npx prisma generate
npx prisma migrate dev
```

### 1.3 Start Backend
```bash
cd .. # Go to root directory
./mvnw clean install
./run.sh
```

## Step 2: Frontend Setup (React + API)

### 2.1 Configure Frontend Environment
Create `.env` file in `sticky-notes/` directory:

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_APP_TITLE=Sticky Notes
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 2.2 Install Dependencies
```bash
cd sticky-notes
npm install
```

### 2.3 Start Frontend
```bash
npm run dev
```

## Step 3: Verify Setup

### 3.1 Check Backend Health
```bash
curl http://localhost:8081/health
```

### 3.2 Check API Endpoints
```bash
# Test boards endpoint
curl http://localhost:8081/api/boards

# Test notes endpoint
curl http://localhost:8081/api/notes
```

### 3.3 Test Frontend Integration
Open http://localhost:5173 and check the ExampleApiComponent

## Step 4: Database Operations

### 4.1 Using Prisma Studio
```bash
cd sticky-notes
npx prisma studio
```

### 4.2 Running Migrations
```bash
cd sticky-notes
npx prisma migrate dev --name migration_name
```

### 4.3 Reset Database (Development Only)
```bash
cd sticky-notes
npx prisma migrate reset --force
```

## Architecture Overview

### Data Flow
```
React Frontend → API Calls → Spring Boot → Prisma → Supabase PostgreSQL
```

### Key Components

#### Frontend
- **API Configuration** (`src/config/api.js`)
- **Data Service** (`src/services/dataService.js`)
- **React Hook** (`src/hooks/useDataService.js`)
- **Example Component** (`src/components/ExampleApiComponent.jsx`)

#### Backend
- **Prisma Service** (`src/main/java/.../service/PrismaService.java`)
- **Application Properties** (`src/main/resources/application.properties`)
- **JPA Entities** (existing Java models)

### Security
- Frontend never has direct database access
- All database operations go through Spring Boot APIs
- JWT authentication for API calls
- Environment variables for sensitive data

## Development Workflow

### Making Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update corresponding Java entities if needed
4. Test with API endpoints

### Adding New API Endpoints
1. Create controller method in Spring Boot
2. Add endpoint to `API_ENDPOINTS` in frontend
3. Add method to `dataService.js`
4. Update React hook if needed

### Testing
1. Backend: Use Spring Boot tests
2. Frontend: Use Jest + React Testing Library
3. Integration: Test API endpoints directly
4. E2E: Test full user flows

## Troubleshooting

### Common Issues

#### Database Connection
- Check DATABASE_URL format
- Verify Supabase credentials
- Ensure SSL is enabled
- Check network connectivity

#### API Errors
- Verify backend is running on port 8081
- Check CORS configuration
- Verify JWT tokens
- Check API endpoint URLs

#### Frontend Issues
- Clear browser cache
- Check environment variables
- Verify Vite configuration
- Check console for errors

### Debug Commands

#### Backend
```bash
# Check logs
tail -f logs.txt

# Test database connection
./mvnw spring-boot:run -Dspring-boot.run.arguments="--debug"
```

#### Frontend
```bash
# Check API health
npm run api:health

# Clear cache
rm -rf node_modules/.vite
```

#### Database
```bash
# Check Prisma status
npx prisma db pull

# Validate schema
npx prisma validate
```

## Production Deployment

### Backend
1. Set production environment variables
2. Build JAR file
3. Deploy to Cloud Run or similar
4. Configure database connection

### Frontend
1. Build static files
2. Deploy to static hosting
3. Configure API base URL
4. Set up SSL certificates

### Database
1. Use Supabase production settings
2. Enable connection pooling
3. Set up backups
4. Monitor performance

## Next Steps

1. **Authentication**: Implement full JWT flow
2. **Authorization**: Add role-based access control
3. **Real-time**: Add WebSocket support
4. **Caching**: Implement Redis caching
5. **Monitoring**: Add logging and metrics
6. **Testing**: Write comprehensive tests
7. **Documentation**: Update API docs

## Support

For issues:
1. Check the troubleshooting section
2. Review logs for error messages
3. Test API endpoints directly
4. Verify environment configuration
5. Check network connectivity

Remember: The frontend should NEVER have direct database access. Always go through the API layer!
