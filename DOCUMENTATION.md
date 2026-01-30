# Sticky Notes Application - Full Structure and Functionality Documentation

## Overview

The Sticky Notes application is a full-stack web application that allows users to create, manage, and organize digital sticky notes on a virtual board. It features real-time updates, user authentication, multiple themes, and both public and private note management capabilities.

## Technology Stack

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.4.9
- **Language**: Java 21
- **Database**: PostgreSQL with Supabase integration
- **ORM**: Prisma for database management
- **Authentication**: JWT (JSON Web Tokens) with Spring Security
- **Build Tool**: Maven
- **Real-time Updates**: Server-Sent Events (SSE)

### Frontend (React)
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.2.2
- **Routing**: React Router DOM 7.3.0
- **UI Components**: Material-UI 7.3.1
- **Styling**: Styled Components 6.1.18, TailwindCSS 4.0.14
- **Drag & Drop**: react-beautiful-dnd, react-dnd, react-draggable
- **Animations**: Framer Motion 12.12.2
- **HTTP Client**: Axios 1.7.9

### Deployment & Infrastructure
- **Containerization**: Docker
- **Cloud Platform**: Google Cloud Run
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Reverse Proxy**: Nginx

## Data Flow Architecture & Application Structure

### Overall Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           STICKY NOTES APPLICATION                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   CLIENT    │◄──►│   NGINX     │◄──►│ SPRING BOOT │◄──►│ POSTGRESQL  │      │
│  │  (BROWSER)  │    │  REVERSE    │    │   BACKEND   │    │  DATABASE   │      │
│  │             │    │   PROXY     │    │             │    │             │      │
│  │ React App   │    │   (Port 80) │    │  (Port 8081)│    │ Cloud SQL   │      │
│  │ JWT Tokens  │    │ Static Files│    │ JWT Auth    │    │             │      │
│  │ SSE Client  │    │ SSL/TLS     │    │ REST API    │    │             │      │
│  └─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Data Flow Visualization

#### 1. User Authentication Flow

```
┌─────────────┐    1. Login Request    ┌──────────────┐    2. Validate     ┌─────────────┐
│   CLIENT    │──────────────────────►│   NGINX      │──────────────────►│ SPRING BOOT │
│  (Browser)  │                       │  Reverse     │                  │   Backend   │
│             │                       │   Proxy      │                  │             │
│ React App   │◄──────────────────────┤              │◄─────────────────┤             │
│ Login Form  │    7. JWT Response    │              │  6. JWT Token    │ Auth Filter  │
│             │                       │              │                  │ Controller  │
└─────────────┘                       └──────────────┘                  └─────────────┘
       │                                                                      │
       │                                                                      │
       │ 3. Forward Request                                                    │
       │                                                                      │
       ▼                                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION PROCESS                               │
│                                                                                 │
│  ┌─────────────┐    4. Check Credentials    ┌─────────────┐    5. Query     ┌─────────────┐
│  │ JWT Filter  │──────────────────────────►│ User Service │────────────────►│ User Repo    │
│  │             │                           │             │                │             │
│  │ Validate    │◄──────────────────────────┤ Validate     │◄───────────────┤ Find User   │
│  │ Token       │    4b. User Found         │ Password     │   5b. User     │ in DB       │
│  │ Generate    │                           │ Hash         │   Data         │             │
│  │ Response    │                           │ JWT Token    │                │             │
│  └─────────────┘                           └─────────────┘                └─────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 2. Note Management Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            NOTE OPERATIONS FLOW                                │
│                                                                                 │
│  ┌─────────────┐    1. Note Action     ┌──────────────┐    2. Route        ┌─────────────┐
│  │   CLIENT    │──────────────────────►│   NGINX      │──────────────────►│ SPRING BOOT │
│  │  (Browser)  │                       │  Reverse     │                  │   Backend   │
│  │             │                       │   Proxy      │                  │             │
│  │ React App   │◄──────────────────────┤              │◄─────────────────┤             │
│  │ Drag & Drop │    8. SSE Update      │              │  7. Response     │ Controller  │
│  │ CRUD Ops    │                       │              │                  │ Service     │
│  └─────────────┘                       └──────────────┘                  └─────────────┘
       │                                                                      │
       │                                                                      │
       │ 3. Process Request                                                     │
       │                                                                      │
       ▼                                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           NOTE PROCESSING LAYER                               │
│                                                                                 │
│  ┌─────────────┐    4. Business Logic   ┌─────────────┐    5. Database     ┌─────────────┐
│  │ Note Ctrl   │──────────────────────►│ Note Service │──────────────────►│ Note Repo    │
│  │             │                       │             │                │             │
│  │ Validate    │◄──────────────────────┤ Process      │◄───────────────┤ JPA CRUD    │
│  │ Request     │    4b. Processed      │ Note Data   │   5b. Note      │ Operations  │
│  │ Broadcast   │    Note Data          │ Validate     │   Data          │             │
│  │ SSE Event   │                       │ Rules        │                │             │
│  └─────────────┘                       └─────────────┘                └─────────────┘
       │                                                                      │
       │                                                                      │
       │ 6. Broadcast to All Clients                                           │
       │                                                                      │
       ▼                                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REAL-TIME UPDATES                                   │
│                                                                                 │
│  ┌─────────────┐    9. SSE Event       ┌─────────────┐    10. Update UI   ┌─────────────┐
│  │ SSE Manager │──────────────────────►│ All Clients │──────────────────►│ React State │
│  │             │                       │             │                │             │
│  │ Track       │                       │ EventSource │                │ Re-render   │
│  │ Clients     │                       │ Listeners   │                │ Components  │
│  │ Broadcast   │                       │             │                │             │
│  └─────────────┘                       └─────────────┘                └─────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 3. Frontend Component Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND DATA ARCHITECTURE                            │
│                                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   APP.JSX   │    │   CONTEXTS   │    │ COMPONENTS  │    │   STATE     │      │
│  │             │    │              │    │             │    │ MANAGEMENT  │      │
│  │ Router      │◄──►│ ThemeContext │◄──►│ StickyBoard │◄──►│ useState    │      │
│  │ Routes      │    │ NoteStyleCtx │    │ StickyNote  │    │ useEffect   │      │
│  │ Auth Guard  │    │ ZoomContext  │    │ Profile     │    │ useCallback  │      │
│  └─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘      │
│         │                   │                   │                   │          │
│         │                   │                   │                   │          │
│         ▼                   ▼                   ▼                   ▼          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                        DATA LAYER                                          │  │
│  │                                                                             │  │
│  │  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐ │  │
│  │  │   AXIOS     │    │   SSE        │    │   LOCAL     │    │   CONTEXT   │ │  │
│  │  │ HTTP Client │    │ EventSource  │    │   STORAGE   │    │   PROVIDERS │ │  │
│  │  │             │    │             │    │             │    │             │ │  │
│  │  │ API Calls   │    │ Real-time   │    │ JWT Token   │    │ Global State│ │  │
│  │  │ Interceptors│    │ Updates     │    │ User Prefs  │    │ Theme Data  │ │  │
│  │  └─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 4. Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE RELATIONSHIPS                              │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   USERS     │    │    ROLES    │    │    NOTES    │    │ REFRESH_TKN │      │
│  │             │    │             │    │             │    │             │      │
│  │ id (PK)     │◄──►│ id (PK)     │    │ id (PK)     │    │ id (PK)     │      │
│  │ username    │    │ name        │    │ x, y        │    │ token       │      │
│  │ email       │    │             │    │ text        │    │ expiry_date │      │
│  │ password    │    │             │    │ done        │    │ user_id (FK) │      │
│  │ roles (M:M) │    │ users (M:M) │    │ username(FK)│    │             │      │
│  │             │    │             │    │ is_private  │    │             │      │
│  │             │    │             │    │ board_type  │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                   │                   │                   │          │
│         └───────────────────┼───────────────────┼───────────────────┘          │
│                             │                   │                              │
│                    ┌─────────────────────────────────────────────┐           │
│                    │            USER_ROLES (JOIN)              │           │
│                    │                                             │           │
│                    │ user_id (FK) ──── USERS.id                 │           │
│                    │ role_id (FK) ──── ROLES.id                 │           │
│                    └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 5. Request/Response Flow Sequence

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          COMPLETE REQUEST CYCLE                                │
│                                                                                 │
│  STEP 1: CLIENT REQUEST                                                        │
│  ┌─────────────┐    HTTP REQUEST    ┌──────────────┐    FORWARD     ┌─────────────┐
│  │ React App   │──────────────────►│   Nginx      │──────────────►│ Spring Boot │
│  │ Component   │                   │              │               │ Controller  │
│  │ User Action │                   │ SSL Termination│             │             │
│  └─────────────┘                   │ Static Files │               └─────────────┘
│                                     └──────────────┘                         │
│                                             │                                 │
│  STEP 2: AUTHENTICATION & AUTHORIZATION                                   │
│                                             ▼                                 │
│  ┌─────────────┐    Validate Token   ┌─────────────┐    Load User    ┌─────────────┐
│  │ JWT Filter  │──────────────────►│ User Details │◄─────────────┤ User Repo    │
│  │             │                   │ Service      │               │             │
│  │ Check JWT   │                   │             │               │ Find User   │
│  │ Permissions │                   │ Load User    │               │ by Username │
│  └─────────────┘                   │ Authorities  │               └─────────────┘
│                                     └─────────────┘                         │
│                                             │                                 │
│  STEP 3: BUSINESS LOGIC PROCESSING                                    │
│                                             ▼                                 │
│  ┌─────────────┐    Process Data     ┌─────────────┐    Database     ┌─────────────┐
│  │ Service     │──────────────────►│ Repository   │◄──────────────►│ PostgreSQL  │
│  │ Layer       │                   │ Layer        │               │             │
│  │ Validate    │                   │ JPA CRUD     │               │ Transactions │
│  │ Business    │                   │ Operations   │               │ Constraints  │
│  │ Rules       │                   │             │               │             │
│  └─────────────┘                   └─────────────┘               └─────────────┘
│                                     │                                 │
│  STEP 4: RESPONSE & REAL-TIME UPDATES                                   │
│                                     ▼                                 │
│  ┌─────────────┐    HTTP Response    ┌──────────────┐    Update UI    ┌─────────────┐
│  │ Controller  │──────────────────►│   Nginx      │◄─────────────┤ React App   │
│  │ Return      │                   │              │               │             │
│  │ JSON Data   │                   │ Route        │               │ Re-render   │
│  │ Status Code │                   │ Response     │               │ Components  │
│  └─────────────┘                   └──────────────┘               └─────────────┘
│         │                                   │                                 │
│         └───────────────────────────────────┼─────────────────────────────────┘
│                                             │                                 │
│  STEP 5: SSE BROADCAST (FOR REAL-TIME UPDATES)                              │
│                                             ▼                                 │
│  ┌─────────────┐    Broadcast Event   ┌─────────────┐    SSE Event    ┌─────────────┐
│  │ SSE Manager │──────────────────►│ All Clients  │◄─────────────┤ EventSource │
│  │             │                   │ Connected    │               │ Listeners   │
│  │ Track Users │                   │ Users        │               │ Update State│
│  │ Send Updates│                   │ Receive Data │               │             │
│  └─────────────┘                   └─────────────┘               └─────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Data Flow Patterns

#### 1. **Authentication Pattern**
- Client sends login credentials → JWT validation → Token generation → Secure storage
- Every subsequent request includes JWT token → Filter validation → User context loading

#### 2. **CRUD Operations Pattern**
- Client action → HTTP request → Controller validation → Service processing → Database operation
- Response → Client state update → UI re-render → SSE broadcast to other clients

#### 3. **Real-time Synchronization Pattern**
- Data change → Database update → SSE event generation → Broadcast to all connected clients
- Client receives SSE event → State update → Optimistic UI updates

#### 4. **State Management Pattern**
- Local component state → Context providers → Global state synchronization
- Server state → Client cache → UI rendering → User interactions

#### 5. **Error Handling Pattern**
- Request failure → Error response → Client error handling → User notification
- Validation errors → 400 responses → Form validation display
- Authentication errors → 401/403 responses → Redirect to login

### Technology Integration Points

#### Frontend-Backend Communication
- **REST API**: Standard HTTP methods for CRUD operations
- **SSE**: Real-time updates using EventSource API
- **JWT**: Stateless authentication with bearer tokens
- **Axios**: HTTP client with interceptors for auth and error handling

#### Backend-Database Integration
- **JPA/Hibernate**: ORM for database operations
- **Spring Data**: Repository pattern for data access
- **Connection Pooling**: HikariCP for performance
- **Transactions**: ACID compliance for data integrity

#### Deployment Architecture
- **Docker**: Containerization for consistent environments
- **Nginx**: Load balancing and SSL termination
- **Google Cloud Run**: Serverless scaling
- **Cloud SQL**: Managed database service

## Project Structure

```
Sticky-Notes/
├── src/
│   └── main/
│       ├── java/com/Sticky_notes/Sticky_notes/
│       │   ├── Config/                    # Configuration classes
│       │   │   ├── CloudSqlConfig.java
│       │   │   ├── CorsConfig.java
│       │   │   ├── JwtProperties.java
│       │   │   ├── SecurityConfig.java
│       │   │   ├── SimpleCorsFilter.java
│       │   │   └── WebConfig.java
│       │   ├── controllers/               # REST API controllers
│       │   │   ├── AuthController.java
│       │   │   ├── BoardController.java
│       │   │   ├── HealthCheckController.java
│       │   │   ├── NoteController.java
│       │   │   ├── NoteManagmentController.java
│       │   │   ├── ProfileController.java
│       │   │   ├── RegistrationController.java
│       │   │   └── TestController.java
│       │   ├── models/                    # JPA entities
│       │   │   ├── Board.java
│       │   │   ├── Note.java
│       │   │   ├── NoteManagment.java
│       │   │   ├── Profile.java
│       │   │   ├── RefreshToken.java
│       │   │   ├── Register.java
│       │   │   ├── Role.java
│       │   │   └── User.java
│       │   ├── payload/                   # Request/Response DTOs
│       │   │   ├── request/
│       │   │   │   └── LoginRequest.java
│       │   │   └── response/
│       │   │       └── JwtResponse.java
│       │   ├── repository/                # JPA repositories
│       │   │   ├── BoardRepository.java
│       │   │   ├── NoteManagmentRepository.java
│       │   │   ├── NoteRepository.java
│       │   │   ├── RoleRepository.java
│       │   │   └── UserRepository.java
│       │   ├── security/                  # Security components
│       │   │   ├── CustomUserDetailsService.java
│       │   │   ├── JwtAuthenticationEntryPoint.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   └── JwtTokenProvider.java
│       │   ├── services/                  # Business logic
│       │   │   ├── AuthService.java
│       │   │   ├── AuthServiceImpl.java
│       │   │   ├── NoteManagmentService.java
│       │   │   └── NoteService.java
│       │   └── StickyNotesApplication.java # Main application class
│       └── resources/
│           └── application.properties     # Application configuration
├── sticky-notes/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── backgroundstyles/
│   │   │   │   ├── menustyles/
│   │   │   │   ├── notestyles/
│   │   │   │   └── theme/
│   │   │   ├── common/
│   │   │   ├── ImportantSection.jsx
│   │   │   ├── News.jsx
│   │   │   ├── NoteStyleDropdown.jsx
│   │   │   ├── StickyBoard.jsx
│   │   │   ├── StickyNote.jsx
│   │   │   └── ThemeDropdown.jsx
│   │   ├── context/                      # React contexts
│   │   │   ├── NoteStyleContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   ├── ZoomContext.jsx
│   │   │   └── ZoomProvider.jsx
│   │   ├── profile/                      # User profile components
│   │   │   ├── NotesManagementModal.jsx
│   │   │   ├── ProfileBoard.jsx
│   │   │   ├── login.jsx
│   │   │   ├── profile.jsx
│   │   │   └── register.jsx
│   │   ├── __tests__/                    # Test files
│   │   ├── App.jsx                      # Main React component
│   │   ├── NavBar.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── Dockerfile
├── pom.xml
├── nginx.conf
├── startup.sh
└── run.sh
```

## Core Functionality

### 1. User Authentication & Authorization

#### JWT-Based Authentication
- **Login**: Users authenticate with username/password
- **Registration**: New user account creation
- **Token Management**: JWT access tokens (15 min) and refresh tokens (7 days)
- **Security**: Password hashing, role-based access control

#### Security Components
- `JwtTokenProvider`: Token generation and validation
- `JwtAuthenticationFilter`: Request interception and token validation
- `CustomUserDetailsService`: User details loading from database
- `SecurityConfig`: Security configuration and endpoint protection

### 2. Note Management System

#### Note Entity
```java
@Entity
public class Note {
    private Long id;           // Primary key
    private Integer x, y;      // Position coordinates
    private String text;       // Note content
    private boolean done;      // Completion status
    private String username;   // Creator username
    private Boolean isPrivate; // Privacy flag
    private String boardType;  // Board type ("main" or "profile")
}
```

#### Note Operations
- **Create**: Add new notes with position and content
- **Read**: Fetch notes by board type and user
- **Update**: Modify position and completion status
- **Delete**: Remove notes with confirmation
- **Real-time**: SSE-based live updates for all connected clients

#### Board Types
- **Main Board**: Public notes visible to all users
- **Profile Board**: User-specific notes (public/private)
- **Privacy Control**: Notes can be marked as private or public

### 3. Real-Time Features

#### Server-Sent Events (SSE)
- **Live Updates**: Real-time note creation, updates, and deletion
- **Client Management**: Automatic client connection/disconnection handling
- **Broadcasting**: Updates sent to all connected clients simultaneously

#### Optimistic Updates
- **UI Responsiveness**: Immediate UI updates before server confirmation
- **Error Handling**: Automatic rollback on server errors
- **User Experience**: Smooth, responsive interface

### 4. Frontend Architecture

#### React Component Structure
```
App.jsx
├── Background (Theme-based)
├── NavBar
├── Routes
│   ├── / (StickyBoard)
│   ├── /board (StickyBoard)
│   ├── /login (Login)
│   ├── /register (Register)
│   └── /profile (Profile)
└── ConfirmationDialog
```

#### Context Providers
- **ThemeProvider**: Theme management (Bubbles, Hearts, Triangles)
- **NoteStyleProvider**: Note appearance customization
- **ZoomProvider**: Zoom level control for accessibility

#### Key Components
- **StickyBoard**: Main board container with drag-and-drop
- **StickyNote**: Individual note component with editing capabilities
- **ProfileBoard**: User-specific note management
- **NotesManagementModal**: Advanced note organization

### 5. Theming System

#### Background Themes
- **Bubbles**: Animated bubble background
- **Hearts**: Animated heart shapes
- **Triangles**: Geometric triangle patterns

#### Note Styles
- **Default**: Classic sticky note appearance
- **Bubbles**: Rounded bubble-style notes
- **Puzzle**: Puzzle-piece shaped notes

#### Customization Options
- **Dynamic Switching**: Runtime theme changes
- **Responsive Design**: Mobile-friendly layouts
- **Accessibility**: High contrast and zoom support

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

### Notes Management
- `GET /api/notes` - Get all public notes
- `GET /api/notes/sse` - SSE stream for real-time updates
- `POST /api/notes` - Create new note
- `PUT /api/notes/{id}` - Update note position
- `PUT /api/notes/{id}/done` - Mark note as complete
- `DELETE /api/notes/{id}` - Delete note

### User-Specific Notes
- `GET /api/notes/profile/{username}` - Get user's profile notes
- `GET /api/notes/user/{username}` - Get user's notes
- `GET /api/notes/user/{username}/private` - Get private notes
- `GET /api/notes/user/{username}/public` - Get public notes

### Profile Management
- `GET /api/profile/{username}` - Get user profile
- `PUT /api/profile/{username}` - Update user profile

### Health & Monitoring
- `GET /api/health` - Application health check
- `GET /actuator/health` - Spring Boot health endpoint

## Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `roles` (User roles)

### Notes Table
- `id` (Primary Key)
- `x`, `y` (Position coordinates)
- `text` (Note content)
- `done` (Boolean completion status)
- `username` (Foreign key to Users)
- `is_private` (Privacy flag)
- `board_type` ("main" or "profile")
- `created_at`, `updated_at` (Timestamps)

### Roles Table
- `id` (Primary Key)
- `name` (Role name: USER, ADMIN)

## Configuration

### Application Properties
```properties
# Server Configuration
server.port=${PORT:8081}
spring.profiles.active=${SPRING_PROFILES_ACTIVE:local}

# Database Configuration
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

# JWT Configuration
app.jwtSecret=${JWT_SECRET}
app.jwtExpirationMs=900000
app.jwtRefreshExpirationMs=604800000

# Cloud SQL Configuration
spring.cloud.gcp.sql.enabled=${SPRING_CLOUD_GCP_SQL_ENABLED:false}
spring.cloud.gcp.sql.database-name=${SPRING_CLOUD_GCP_SQL_DATABASE_NAME:sticky_notes}
```

### Environment Variables
- `PORT` - Server port
- `SPRING_DATASOURCE_URL` - Database connection URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `SPRING_PROFILES_ACTIVE` - Active Spring profile

## Deployment

### Docker Configuration
Multi-stage Docker build:
1. **Build Stage**: Maven compilation and packaging
2. **Runtime Stage**: Java 21 JRE with application JAR

### Google Cloud Run
- **Platform**: Serverless container hosting
- **Scaling**: Automatic scaling based on traffic
- **Networking**: HTTPS with custom domain support
- **Database**: Google Cloud SQL PostgreSQL

### Nginx Configuration
- **Reverse Proxy**: Routes requests to Spring Boot application
- **Static Files**: Serves React build artifacts
- **SSL Termination**: HTTPS handling

## Testing

### Backend Tests
- **Unit Tests**: Service layer testing with JUnit 5
- **Integration Tests**: Repository and controller testing
- **Security Tests**: Authentication and authorization testing
- **Database Tests**: H2 in-memory database for testing

### Frontend Tests
- **Component Tests**: React component testing with Jest
- **User Interaction Tests**: User event simulation
- **Integration Tests**: Component interaction testing
- **E2E Tests**: End-to-end application flow testing

## Security Features

### Authentication Security
- **Password Hashing**: BCrypt encryption
- **JWT Security**: Signed tokens with expiration
- **CSRF Protection**: Cross-site request forgery prevention
- **CORS Configuration**: Cross-origin resource sharing control

### Data Security
- **Input Validation**: Request payload validation
- **SQL Injection Prevention**: JPA parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **Privacy Controls**: User data access restrictions

## Performance Optimizations

### Backend Optimizations
- **Connection Pooling**: HikariCP for database connections
- **Caching**: Application-level caching for frequently accessed data
- **Lazy Loading**: JPA lazy loading for entity relationships
- **Async Processing**: Non-blocking SSE implementation

### Frontend Optimizations
- **Code Splitting**: React lazy loading for components
- **Memoization**: React.memo and useCallback for performance
- **Virtual Scrolling**: Efficient rendering of large note lists
- **Bundle Optimization**: Vite build optimizations

## Monitoring & Logging

### Application Logging
- **Structured Logging**: SLF4J with Logback
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Request Logging**: HTTP request/response logging
- **Security Logging**: Authentication and authorization events

### Health Monitoring
- **Spring Boot Actuator**: Application health endpoints
- **Database Health**: Connection pool monitoring
- **Memory Monitoring**: JVM memory usage tracking
- **Performance Metrics**: Response time and throughput monitoring

## Future Enhancements

### Planned Features
- **Collaborative Boards**: Multi-user note collaboration
- **Note Categories**: Tag-based note organization
- **Search Functionality**: Full-text note search
- **File Attachments**: Support for note attachments
- **Mobile App**: Native mobile application
- **Offline Support**: PWA capabilities

### Technical Improvements
- **Microservices Architecture**: Service decomposition
- **Event Sourcing**: Audit trail and event replay
- **GraphQL API**: More efficient data fetching
- **WebSocket Integration**: Bidirectional real-time communication
- **Advanced Analytics**: Usage patterns and insights

## Conclusion

The Sticky Notes application represents a comprehensive full-stack solution with modern web development practices. It combines robust backend architecture with an intuitive, feature-rich frontend to deliver a seamless user experience. The application demonstrates expertise in Spring Boot, React, real-time communication, security, and cloud deployment strategies.
