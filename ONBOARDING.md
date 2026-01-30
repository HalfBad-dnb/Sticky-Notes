# Sticky Notes - Developer Onboarding

## Prerequisites

- Java 21+
- Maven 3.6+
- PostgreSQL 16+
- Node.js 18+ (for frontend)

## Platform-Specific Setup

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update && sudo apt install postgresql postgresql-client

# Start PostgreSQL service
sudo systemctl start postgresql && sudo systemctl enable postgresql
```

### macOS

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database
createdb sticky_notes

# Set password for postgres user (you'll be prompted)
psql postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Windows

```bash
# Install PostgreSQL using Chocolatey
choco install postgresql16

# Or download installer from: https://www.postgresql.org/download/windows/

# Start PostgreSQL service (runs automatically after installation)
# Create database using SQL Shell (psql) that comes with PostgreSQL
CREATE DATABASE sticky_notes;
ALTER USER postgres PASSWORD 'postgres';
```

## Quick Start

### 1. Database Setup

#### Linux
```bash
# Create database
sudo -u postgres createdb sticky_notes

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

#### macOS
```bash
# Create database
createdb sticky_notes

# Set password
psql postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

#### Windows
```bash
# Open SQL Shell (psql) and run:
CREATE DATABASE sticky_notes;
ALTER USER postgres PASSWORD 'postgres';
```

### 2. Environment Configuration

Copy the environment template and configure your credentials:

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

Required environment variables:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/sticky_notes
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-256-bits-long
SPRING_PROFILES_ACTIVE=local
PORT=8081
```

### 3. Run the Application

#### Option 1: Using the Run Script (Recommended)

**Linux:**
```bash
# Make script executable and run
chmod +x run.sh
./run.sh
```

**macOS:**
```bash
# Make script executable and run
chmod +x run.sh
./run.sh
```

**Windows:**
```bash
# Run using Git Bash or WSL
./run.sh

# Or run with Windows Command Prompt:
bash run.sh
```

The `run.sh` script will:
- Automatically detect and set JAVA_HOME
- Load environment variables from `.env` file
- Build the application
- Start the Spring Boot server

#### Option 2: Manual Build and Run

**All Platforms:**
```bash
# Build the application
./mvnw clean install -DskipTests=true

# Run the application
./mvnw spring-boot:run
```

**Windows Alternative (using Maven directly):**
```bash
# Build
mvn clean install -DskipTests=true

# Run
mvn spring-boot:run
```

### 4. Access the Application

- **Backend API**: http://localhost:8081
- **Health Check**: http://localhost:8081/actuator/health
- **API Documentation**: http://localhost:8081/swagger-ui.html (if configured)

## Development Workflow

### Manual Build and Run

If you prefer to run commands manually:

```bash
# Build the application
./mvnw clean install -DskipTests=true

# Run the application
./mvnw spring-boot:run
```

### Frontend Development

Navigate to the frontend directory:

```bash
cd sticky-notes
npm install
npm start
```

The frontend will run on http://localhost:3000

## Project Structure

```
Sticky-Notes/
├── src/main/java/                 # Java source code
│   └── com/Sticky_notes/Sticky_notes/
│       ├── Config/                # Configuration classes
│       ├── controllers/           # REST controllers
│       ├── models/               # Entity models
│       ├── repository/           # Data repositories
│       ├── security/             # Security configuration
│       └── services/             # Business logic
├── src/main/resources/
│   └── application.properties    # Spring Boot configuration
├── sticky-notes/                 # React frontend
├── .env.example                  # Environment template
├── .env                          # Environment variables (gitignored)
└── run.sh                        # Application startup script
```

## Configuration

### Database Configuration

The application uses PostgreSQL with Hibernate/JPA. Database settings are configured via environment variables:

- `SPRING_DATASOURCE_URL`: JDBC connection string
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password

### JWT Configuration

- `JWT_SECRET`: Secret key for JWT token signing
- `app.jwtExpirationMs`: Access token expiration (15 minutes)
- `app.jwtRefreshExpirationMs`: Refresh token expiration (7 days)

### Profiles

- `local`: Local development (default)
- `cloud`: Cloud deployment with Cloud SQL

## Common Issues

### Database Connection Issues

**Linux:**
```bash
# Reset postgres password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

**macOS:**
```bash
# Reset postgres password
psql postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

**Windows:**
```bash
# Open SQL Shell (psql) and run:
ALTER USER postgres PASSWORD 'postgres';
```

### Port Conflicts

If port 8081 is in use, change the `PORT` variable in `.env`:

```bash
PORT=8082
```

### JAVA_HOME Issues

**Linux:**
The run script automatically detects JAVA_HOME. If it fails, set it manually:

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
```

**macOS:**
The run script uses `/usr/libexec/java_home`. If it fails, set it manually:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

**Windows:**
Set JAVA_HOME in Environment Variables or use:

```bash
# Command Prompt
set JAVA_HOME=C:\Program Files\Java\jdk-21

# PowerShell
$env:JAVA_HOME="C:\Program Files\Java\jdk-21"
```

### Script Permission Issues

**Linux/macOS:**
```bash
chmod +x run.sh
```

**Windows:**
Use Git Bash or WSL to run the script, or use the manual Maven commands.

### PostgreSQL Service Issues

**Linux:**
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

**macOS:**
```bash
brew services restart postgresql@16
```

**Windows:**
```bash
# Using Services panel or command:
net start postgresql-x64-16
```

## Testing

Run tests with Maven:

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=YourTestClass

# Skip tests during build
./mvnw clean install -DskipTests=true
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure nothing breaks
4. Submit a pull request

## Support

For issues or questions:
- Check the logs in the console output
- Review the application.properties configuration
- Verify your .env file has correct values
- Ensure PostgreSQL is running and accessible
