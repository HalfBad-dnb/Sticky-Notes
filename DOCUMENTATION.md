# Sticky Notes Application - Full Structure and Functionality Documentation

## Overview

The Sticky Notes application is a full-stack web application that allows users to create, manage, and organize digital sticky notes on a virtual board. It features real-time updates via SSE and WebSocket, user authentication, multiple themes, AI-powered note creation, real-time messaging, subscription/payment management, user presence tracking, note comments, and custom board management.

## Technology Stack

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.4.9
- **Language**: Java 21
- **Database**: PostgreSQL (Supabase / Google Cloud SQL)
- **ORM**: JPA / Hibernate with Spring Data (Prisma schema used for frontend/migrations)
- **Authentication**: JWT (JSON Web Tokens) with Spring Security
- **Build Tool**: Maven
- **Real-time Updates**: Server-Sent Events (SSE) + WebSocket (STOMP over SockJS)
- **Payments**: Stripe Java SDK 28.0.0
- **AI Integration**: Google Gemini API (gemini-2.0-flash)
- **Boilerplate Reduction**: Lombok

### Frontend (React / TypeScript)
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 6.2.2
- **Routing**: React Router DOM 7.3.0
- **UI Components**: Material-UI 7.3.1
- **Styling**: Styled Components 6.1.18, TailwindCSS 4.0.14
- **Animations**: Framer Motion 12.12.2
- **HTTP Client**: Axios 1.7.9
- **WebSocket Client**: @stomp/stompjs 7.2.1 + sockjs-client 1.6.1
- **Payments**: @stripe/react-stripe-js 5.6.0, @stripe/stripe-js 8.7.0
- **Security**: DOMPurify 3.2.6 (XSS sanitization)
- **Desktop**: Electron 40.1.0 (cross-platform desktop app)
- **Schema/Migrations**: Prisma 6.19.3

### Deployment & Infrastructure
- **Containerization**: Docker
- **Cloud Platform**: Google Cloud Run
- **Database**: Supabase (PostgreSQL)
- **Reverse Proxy**: Nginx

## Data Flow Architecture & Application Structure

### Overall Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          STICKY NOTES APPLICATION                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌───────────────┐       ┌───────────────┐       ┌───────────────┐             │
│   │    CLIENT     │       │     NGINX     │       │  SPRING BOOT  │             │
│   │   (Browser)   │◄─────►│  Reverse Proxy│◄─────►│   Backend     │             │
│   │               │       │               │       │               │             │
│   │  React / TS   │       │   Port 80     │       │   Port 8081   │             │
│   │  JWT Tokens   │       │  Static Files │       │   JWT Auth    │             │
│   │  SSE + WS     │       │   SSL/TLS     │       │   REST API    │             │
│   └───────────────┘       └───────────────┘       └───────┬───────┘             │
│                                                           │                     │
│                                                   ┌───────▼───────┐             │
│                                                   │  POSTGRESQL   │             │
│                                                   │   Database    │             │
│                                                   │  (Supabase)   │             │
│                                                   └───────────────┘             │
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
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   USERS     │  │    ROLES    │  │    NOTES    │  │ REFRESH_TKN │           │
│  │ id (PK)     │  │ id (PK)     │  │ id (PK)     │  │ id (PK)     │           │
│  │ username    │  │ name        │  │ x, y        │  │ token       │           │
│  │ email       │  │             │  │ text        │  │ expiry_date │           │
│  │ password    │  │             │  │ done        │  │ user_id(FK) │           │
│  │ roles (M:M) │  │ users (M:M) │  │ username(FK)│  │             │           │
│  └──────┬──────┘  └──────┬──────┘  │ is_private  │  └─────────────┘           │
│         │                │         │ board_type  │                             │
│         └────────────────┘         │ board_id(FK)│                             │
│              USER_ROLES            └──────┬──────┘                             │
│                                           │                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────┴──────┐  ┌─────────────┐           │
│  │   BOARDS    │  │ BOARD_USERS │  │ NOTE_COMMENT│  │  MESSAGES   │           │
│  │ id (PK)     │  │ id (PK)     │  │ id (PK)     │  │ id (PK)     │           │
│  │ name        │  │ board_id(FK)│  │ note_id(FK) │  │ sender_id   │           │
│  │ description │  │ user_id(FK) │  │ username    │  │ receiver_id │           │
│  │ is_public   │  │ role        │  │ text        │  │ content     │           │
│  │ created_by  │  └─────────────┘  │ created_at  │  │ read        │           │
│  └─────────────┘                   └─────────────┘  └─────────────┘           │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────────────────────────────────────┐              │
│  │USER_PRESENCE│  │         SUBSCRIPTION_TIER                   │              │
│  │ id (PK)     │  │ id (PK)   name   price   features           │              │
│  │ user_id(FK) │  └─────────────────────────────────────────────┘              │
│  │ online      │                                                                │
│  │ last_seen   │                                                                │
│  └─────────────┘                                                                │
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
│       │   │   ├── CorsConfig.java
│       │   │   ├── JwtProperties.java
│       │   │   ├── SecurityConfig.java
│       │   │   ├── SimpleCorsFilter.java
│       │   │   ├── StripeConfig.java      # Stripe payment config
│       │   │   ├── WebConfig.java
│       │   │   └── WebSocketConfig.java   # STOMP WebSocket config
│       │   ├── controller/                # REST API controllers
│       │   │   ├── AiAgentController.java       # /api/ai
│       │   │   ├── AuthController.java
│       │   │   ├── BoardController.java         # /api/boards
│       │   │   ├── BoardUserController.java     # Board user assignment
│       │   │   ├── HealthCheckController.java
│       │   │   ├── MessageController.java       # /api/messages (WebSocket)
│       │   │   ├── NoteCommentController.java   # /api/notes/{id}/comments
│       │   │   ├── NoteController.java          # /api/notes
│       │   │   ├── NoteManagmentController.java
│       │   │   ├── PaymentController.java       # /api/payments (Stripe)
│       │   │   ├── ProfileController.java
│       │   │   ├── RegistrationController.java
│       │   │   ├── UserController.java
│       │   │   └── UserPresenceController.java  # /api/presence (WebSocket)
│       │   ├── dto/                       # Data Transfer Objects
│       │   │   ├── BoardDTO.java
│       │   │   ├── BoardMapper.java
│       │   │   ├── NoteDTO.java
│       │   │   └── NoteMapper.java
│       │   ├── models/                    # JPA entities
│       │   │   ├── Board.java
│       │   │   ├── BoardUser.java         # Board-user assignment
│       │   │   ├── Message.java           # Chat messages
│       │   │   ├── Note.java
│       │   │   ├── NoteComment.java       # Note comments
│       │   │   ├── NoteManagment.java
│       │   │   ├── Profile.java
│       │   │   ├── RefreshToken.java
│       │   │   ├── Register.java
│       │   │   ├── Role.java
│       │   │   ├── SubscriptionTier.java  # Subscription tiers
│       │   │   ├── User.java
│       │   │   └── UserPresence.java      # Online presence tracking
│       │   ├── payload/                   # Request/Response DTOs
│       │   │   ├── request/
│       │   │   │   └── LoginRequest.java
│       │   │   └── response/
│       │   │       └── JwtResponse.java
│       │   ├── repository/                # JPA repositories
│       │   │   ├── BoardRepository.java
│       │   │   ├── BoardUserRepository.java
│       │   │   ├── MessageRepository.java
│       │   │   ├── NoteCommentRepository.java
│       │   │   ├── NoteManagmentRepository.java
│       │   │   ├── NoteRepository.java
│       │   │   ├── RefreshTokenRepository.java
│       │   │   ├── RoleRepository.java
│       │   │   ├── SubscriptionTierRepository.java
│       │   │   ├── UserPresenceRepository.java
│       │   │   └── UserRepository.java
│       │   ├── security/                  # Security components
│       │   │   ├── CustomUserDetailsService.java
│       │   │   ├── JwtAuthenticationEntryPoint.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   └── JwtTokenProvider.java
│       │   ├── services/                  # Business logic
│       │   │   ├── AiAgentService.java
│       │   │   ├── AuthService.java
│       │   │   ├── AuthServiceImpl.java
│       │   │   ├── BoardService.java
│       │   │   ├── GeminiService.java     # Google Gemini AI client
│       │   │   ├── NoteManagmentService.java
│       │   │   ├── NoteService.java
│       │   │   ├── PaymentService.java
│       │   │   ├── PaymentServiceImpl.java
│       │   │   ├── PrismaService.java
│       │   │   └── UserDetailsServiceImpl.java
│       │   └── StickyNotesApplication.java # Main application class
│       └── resources/
│           └── application.properties     # Application configuration
├── sticky-notes/                          # React/TypeScript frontend
│   ├── prisma/
│   │   └── schema.prisma                  # DB schema for Prisma migrations
│   ├── public/
│   │   └── electron.cjs                   # Electron main process
│   └── src/
│       ├── components/
│       │   ├── backgroundstyles/
│       │   │   ├── notestyles/            # NoteDefault.tsx, NoteBubles.tsx, NotePuzzle.tsx
│       │   │   └── theme/                 # BubbleBackgroundTheme, HeartBackgroundTheme, TriangleBackgroundTheme
│       │   ├── common/
│       │   │   ├── BoardIndicator.jsx
│       │   │   ├── BoardNavigation.tsx
│       │   │   ├── ConfirmationDialog.tsx
│       │   │   ├── Disclaimers.tsx
│       │   │   ├── Icon.tsx
│       │   │   └── MediaPlayer.tsx
│       │   ├── navigation/
│       │   │   ├── BoardPanel.jsx
│       │   │   ├── DropdownMenu.tsx
│       │   │   ├── MediaDropdown.tsx
│       │   │   ├── MessagesPanel.jsx      # Real-time chat panel
│       │   │   ├── NavBar.tsx
│       │   │   ├── NavigationButton.tsx
│       │   │   ├── SettingsPanel.jsx
│       │   │   ├── SubscriptionPanel.jsx
│       │   │   ├── UserBoardPanel.jsx
│       │   │   └── UserProfile.jsx
│       │   ├── payment/                   # Stripe payment components
│       │   ├── UserBoardControl/          # Board assignment and control
│       │   │   ├── BoardControlPanel.jsx
│       │   │   ├── BoardCreation.jsx
│       │   │   ├── UserAssignment.jsx
│       │   │   └── UserControlPanel.jsx
│       │   ├── BoardPage.tsx              # Dynamic board by ID (/board/:boardId)
│       │   ├── CheckoutForm.jsx           # Stripe checkout
│       │   ├── EnhancedMessageAgent.jsx   # AI message agent UI
│       │   ├── InlineMessageAgent.jsx
│       │   ├── MessageAgent.jsx
│       │   ├── NoteStyleDropdown.jsx
│       │   ├── StickyBoard.tsx            # Main board container
│       │   ├── StickyNote.tsx             # Individual note component
│       │   ├── StripePayment.jsx
│       │   ├── Subscription.jsx
│       │   ├── SubscriptionManager.jsx
│       │   └── ThemeDropdown.jsx
│       ├── config/
│       │   └── api.ts                     # Centralized API base URL config
│       ├── constants/
│       │   ├── noteStyles.ts
│       │   └── themes.ts
│       ├── context/                       # React contexts
│       │   ├── NoteStyleContext.tsx
│       │   ├── ThemeContext.tsx
│       │   ├── ZoomContext.ts
│       │   ├── ZoomProvider.tsx
│       │   ├── noteContext.ts
│       │   ├── noteStyleUtils.jsx
│       │   ├── themeUtils.ts
│       │   └── useZoom.ts
│       ├── hooks/                         # Custom React hooks
│       │   ├── useAIAgentTools.js
│       │   ├── useDataService.ts
│       │   ├── useGeminiAgent.js
│       │   ├── useNotes.ts
│       │   ├── usePresence.ts
│       │   └── useWebSocket.ts
│       ├── models/                        # TypeScript model types
│       ├── pages/
│       │   └── SubscriptionPage.tsx
│       ├── profile/                       # User profile components
│       │   ├── NotesManagementModal.jsx
│       │   ├── ProfileBoard.jsx
│       │   ├── ProfileOptimisation.js
│       │   ├── login.tsx
│       │   ├── profile.tsx
│       │   └── register.tsx
│       ├── services/
│       │   ├── dataService.ts             # REST API data service
│       │   └── websocketService.ts        # STOMP WebSocket service
│       ├── types/                         # TypeScript type definitions
│       │   ├── global.d.ts
│       │   ├── index.ts
│       │   └── modules.d.ts
│       ├── utils/
│       │   ├── api.ts
│       │   ├── axiosConfig.ts             # Centralized Axios with interceptors
│       │   ├── fetchWithToken.js
│       │   └── logger.js
│       ├── App.tsx                        # Main React component
│       └── main.tsx
│   ├── package.json
│   └── vite.config.ts
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
App.tsx
├── ThemeProvider
├── NoteStyleProvider
├── ZoomProvider
│   └── AppContent
│       ├── Background (Theme-based)
│       ├── NavBar (navigation/)
│       ├── ConfirmationDialog
│       └── Routes
│           ├── /              → StickyBoard
│           ├── /board         → StickyBoard
│           ├── /board/:boardId → BoardPage (dynamic board)
│           ├── /login         → Login
│           ├── /register      → Register
│           ├── /profile       → Profile
│           ├── /subscription  → SubscriptionPage
│           └── /user-board-control → UserControlPanel
```

#### Context Providers

- **ThemeProvider**: Theme management (Bubbles, Hearts, Triangles)
- **NoteStyleProvider**: Note appearance customization
- **ZoomProvider**: Zoom level control for accessibility

#### Custom Hooks

- **useNotes**: Note state management (drag, done, delete)
- **usePresence**: WebSocket-based user online presence
- **useWebSocket**: STOMP WebSocket connection lifecycle
- **useDataService**: Centralized REST data fetching
- **useAIAgentTools / useGeminiAgent**: AI agent integration hooks

#### Key Components

- **StickyBoard**: Main board container with note CRUD
- **StickyNote**: Individual note component with editing capabilities
- **BoardPage**: Dynamic board rendering by `boardId` URL param
- **ProfileBoard**: User-specific note management
- **NotesManagementModal**: Advanced note organization
- **MessagesPanel**: Real-time WebSocket chat panel
- **EnhancedMessageAgent / MessageAgent**: AI-powered note assistant
- **UserBoardControl**: Board creation, user assignment, board management panel
- **SubscriptionManager**: Subscription plan display and management

### 5. Payment & Subscription System

#### Stripe Integration

- **Checkout**: `POST /api/payments/create-checkout-session` creates a hosted Stripe checkout page
- **Customer Portal**: `POST /api/payments/create-customer-portal` opens the Stripe billing portal
- **Frontend**: `CheckoutForm.jsx`, `StripePayment.jsx`, `SubscriptionManager.jsx`, `SubscriptionPanel.jsx`
- **Tiers**: `SubscriptionTier` entity stores available plans; `SubscriptionPage.tsx` renders them
- **Config**: `StripeConfig.java` initializes the Stripe SDK from `STRIPE_SECRET_KEY`

### 6. AI Integration (Google Gemini)

#### AI Agent

- **Backend**: `GeminiService.java` calls the Gemini REST API; `AiAgentService.java` orchestrates note creation with AI
- **Controller**: `AiAgentController.java` exposes `/api/ai/*` endpoints
- **Frontend**: `MessageAgent.jsx`, `EnhancedMessageAgent.jsx`, `InlineMessageAgent.jsx` provide chat-style UI
- **Hooks**: `useAIAgentTools.js` and `useGeminiAgent.js` manage agent state and tool calls
- **Model**: `gemini-2.0-flash` (configurable via `GEMINI_MODEL` env var)

### 7. Real-Time Messaging (WebSocket)

#### STOMP over SockJS

- **Backend**: `WebSocketConfig.java` enables STOMP broker on `/ws` endpoint with SockJS fallback
- **Destinations**: `/topic/*` (broadcast), `/queue/*` (user-specific), `/app/*` (client→server)
- **Controller**: `MessageController.java` handles `@MessageMapping("/chat.send")` and `/chat.read`
- **Service**: `websocketService.ts` manages the STOMP client lifecycle on the frontend
- **UI**: `MessagesPanel.jsx` in the navigation panel renders conversation threads

### 8. User Presence Tracking

- **Backend**: `UserPresenceController.java` handles `/presence.online` and `/presence.offline` STOMP messages; persists to `UserPresence` entity
- **Frontend**: `usePresence.ts` hook publishes presence on mount/unmount; `useWebSocket.ts` subscribes to `/topic/presence`
- **REST**: `GET /api/presence/online` returns currently online users

### 9. Note Comments

- **Backend**: `NoteCommentController.java` handles `GET/POST /api/notes/{noteId}/comments` and `DELETE /api/notes/{noteId}/comments/{commentId}`
- **Security**: Only the comment author can delete their own comments (returns 403 otherwise)
- **Entity**: `NoteComment` — stores `note_id`, `username`, `text`, `created_at`

### 10. Board Management

- **Custom Boards**: Users can create named boards (public or private) via `BoardController.java`
- **Board Notes**: Notes support a `board_id` FK; null = main board, non-null = custom board
- **Route**: `/board/:boardId` renders `BoardPage.tsx` which loads notes for that board
- **User Assignment**: `BoardUserController.java` + `UserBoardControl/` components allow assigning users to boards with roles
- **DTOs**: `BoardDTO` / `NoteDTO` with `BoardMapper` / `NoteMapper` for clean API responses

### 11. Electron Desktop App

- **Entry**: `public/electron.cjs` is the Electron main process
- **Scripts**: `npm run electron-dev` (dev), `npm run electron-build` (package)
- **Distribution**: macOS (.dmg), Windows (NSIS installer), Linux (AppImage) via `electron-builder`
- **Auto-update**: `electron-updater` publishes releases to GitHub (`HalfBad-dnb/Sticky-Notes`)

### 12. Theming System

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

- `GET /api/notes` - Get all public notes (supports `?username=` filter)
- `GET /api/notes/sse` - SSE stream for real-time updates
- `POST /api/notes` - Create new note
- `PUT /api/notes/{id}` - Update note position
- `PUT /api/notes/{id}/done` - Mark note as complete
- `DELETE /api/notes/{id}` - Delete note

### User-Specific Notes

- `GET /api/notes/profile/{username}` - Get user's profile notes (supports `?isPrivate=` filter)
- `GET /api/notes/user/{username}` - Get user's notes
- `GET /api/notes/user/{username}/private` - Get private notes
- `GET /api/notes/user/{username}/public` - Get public notes

### Note Comments

- `GET /api/notes/{noteId}/comments` - List comments for a note
- `POST /api/notes/{noteId}/comments` - Add a comment to a note
- `DELETE /api/notes/{noteId}/comments/{commentId}` - Delete a comment

### Board Management

- `GET /api/boards` - Get all boards for authenticated user
- `GET /api/boards/public` - Get all public boards
- `POST /api/boards` - Create a new board
- `GET /api/boards/{boardId}` - Get board by ID
- `PUT /api/boards/{boardId}` - Update board
- `DELETE /api/boards/{boardId}` - Delete board
- `GET /api/boards/{boardId}/notes` - Get notes for a specific board

### Board User Assignment

- `GET /api/board-users` - Get board-user assignments
- `POST /api/board-users` - Assign user to board
- `DELETE /api/board-users/{id}` - Remove user from board

### Profile Management

- `GET /api/profile/{username}` - Get user profile
- `PUT /api/profile/{username}` - Update user profile

### Messages (WebSocket + REST)

- `GET /api/messages/conversation/{userId}` - Get conversation with user
- `GET /api/messages/recent` - Get recent conversations
- `DELETE /api/messages/{messageId}` - Delete a message
- WebSocket: `@MessageMapping("/chat.send")` - Send message via STOMP
- WebSocket: `@MessageMapping("/chat.read")` - Mark messages as read

### User Presence (WebSocket + REST)

- `GET /api/presence/online` - Get all online users
- `GET /api/presence/{userId}` - Get user presence status
- WebSocket: `@MessageMapping("/presence.online")` - Set user online
- WebSocket: `@MessageMapping("/presence.offline")` - Set user offline

### AI Agent Endpoints

- `POST /api/ai/notes` - Create a note with AI assistance
- `POST /api/ai/analyze` - Analyze notes with AI
- `POST /api/ai/suggest` - Get AI suggestions
- `POST /api/ai/chat` - Chat with AI agent (streaming)

### Payments (Stripe)

- `POST /api/payments/create-checkout-session` - Create Stripe checkout session
- `POST /api/payments/create-customer-portal` - Create Stripe customer portal session

### Health & Monitoring

- `GET /api/health` - Application health check
- `GET /actuator/health` - Spring Boot health endpoint

## Database Schema

### Users Table

- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `roles` (Many-to-Many with Roles)

### Notes Table

- `id` (Primary Key)
- `x`, `y` (Position coordinates)
- `text` (Note content)
- `done` (Boolean completion status)
- `username` (Foreign key to Users)
- `is_private` (Privacy flag)
- `board_type` ("main" or "profile")
- `board_id` (Foreign key to Boards, nullable — null = main board)
- `created_at`, `updated_at` (Timestamps)

### Roles Table

- `id` (Primary Key)
- `name` (Role name: USER, ADMIN)

### Boards Table

- `id` (Primary Key)
- `name` (Board name)
- `description`
- `is_public` (Boolean)
- `created_by` (Username)
- `created_at`

### Board Users Table (Join)

- `id` (Primary Key)
- `board_id` (FK → Boards)
- `user_id` (FK → Users)
- `role` (User role on the board)

### Messages Table

- `id` (Primary Key)
- `sender_id` / `receiver_id` (FK → Users)
- `content`
- `read` (Boolean)
- `created_at`

### Note Comments Table

- `id` (Primary Key)
- `note_id` (FK → Notes)
- `username`
- `text`
- `created_at`

### User Presence Table

- `id` (Primary Key)
- `user_id` (FK → Users)
- `online` (Boolean)
- `last_seen`

### Subscription Tier Table

- `id` (Primary Key)
- `name`
- `price`
- `features`

### Refresh Tokens Table

- `id` (Primary Key)
- `token`
- `expiry_date`
- `user_id` (FK → Users)

## Configuration

### Application Properties

```properties
# Server Configuration
server.port=${PORT:8081}
spring.profiles.active=${SPRING_PROFILES_ACTIVE:local}

# Database Configuration
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JWT Configuration
app.jwtSecret=${JWT_SECRET}
app.jwtExpirationMs=900000
app.jwtRefreshExpirationMs=604800000

# Stripe Configuration
stripe.secret.key=${STRIPE_SECRET_KEY}
stripe.publishable.key=${STRIPE_PUBLISHABLE_KEY}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}

# Gemini AI Configuration
gemini.api.key=${GEMINI_API_KEY}
gemini.model=${GEMINI_MODEL:gemini-2.0-flash}
```

### Environment Variables

- `PORT` - Server port (default: 8081)
- `DATABASE_URL` - PostgreSQL JDBC connection URL
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `SPRING_PROFILES_ACTIVE` - Active Spring profile (default: local)
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `GEMINI_API_KEY` - Google Gemini AI API key
- `GEMINI_MODEL` - Gemini model name (default: gemini-2.0-flash)

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

- **Note Categories**: Tag-based note organization
- **Search Functionality**: Full-text note search
- **File Attachments**: Support for note attachments
- **Offline Support**: PWA capabilities
- **Advanced Analytics**: Usage patterns and insights

### Technical Improvements

- **Microservices Architecture**: Service decomposition
- **Event Sourcing**: Audit trail and event replay
- **GraphQL API**: More efficient data fetching
- **Push Notifications**: Browser push for new messages/notes

> **Note**: The following items from the original roadmap have been implemented: Collaborative Boards (BoardController + UserBoardControl), WebSocket real-time communication (STOMP/SockJS), Mobile App support (Electron desktop), AI Agent (Gemini integration), and Subscription/Payment (Stripe).

## Conclusion

The Sticky Notes application represents a comprehensive full-stack solution with modern web development practices. It combines robust backend architecture with an intuitive, feature-rich frontend to deliver a seamless user experience. The application demonstrates expertise in Spring Boot, React/TypeScript, real-time communication (SSE + WebSocket), AI integration (Gemini), payment processing (Stripe), security, and cloud deployment strategies. A desktop variant is also available via Electron.
