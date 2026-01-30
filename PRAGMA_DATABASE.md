# Prisma Database Setup & Documentation

## Overview

This document covers the complete Prisma database setup for the Sticky Notes application, including schema definitions, migrations, and usage examples.

## Database Connection

### Supabase Configuration
- **Provider**: PostgreSQL
- **Connection**: Session Pooler
- **Host**: `aws-1-eu-west-3.pooler.supabase.com`
- **Port**: `5432`
- **Database**: `postgres`
- **SSL**: Required

### Environment Variables
```env
DATABASE_URL="postgresql://postgres.ivdkwsiabmzjjpvbacay:Tz36Scw%40Mun2qkx8@aws-1-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require"
```

## Database Schema

### 1. Users Table
```prisma
model User {
  id            Int          @id @default(autoincrement())
  username      String        @unique @db.VarChar(255)
  email         String        @db.VarChar(255)
  password      String        @db.VarChar(255)
  role          String        @db.VarChar(50)
  boards        Board[]
  refreshTokens RefreshToken[]
  
  @@map("users")
}
```

**Purpose**: User authentication and account management
**Fields**:
- `id`: Primary key (auto-increment)
- `username`: Unique username for login
- `email`: User email address
- `password`: Hashed password
- `role`: User role (e.g., "ROLE_USER", "ROLE_ADMIN")

### 2. Boards Table
```prisma
model Board {
  id         Int    @id @default(autoincrement())
  code       String // Unique code for the board
  content    String // Board content
  title      String @db.VarChar(255)
  boardType  String // Type of the board
  userId     Int?   // Foreign key to User
  user       User?  @relation(fields: [userId], references: [id])
  notes      Note[]
  
  @@map("board")
}
```

**Purpose**: Sticky note boards for organizing notes
**Fields**:
- `id`: Primary key (auto-increment)
- `code`: Unique board identifier
- `content`: Board content/description
- `title`: Board title
- `boardType`: Type classification of board
- `userId`: Foreign key to User (owner)

### 3. Notes Table
```prisma
model Note {
  id        Int     @id @default(autoincrement())
  x         Int     // X position on board
  y         Int     // Y position on board
  text      String  // Note content
  done      Boolean @default(false)
  username  String  // Creator username
  isPrivate Boolean @default(false) @map("is_private")
  boardType String  @default("main")
  boardId   Int?    // Foreign key to Board
  board     Board?  @relation(fields: [boardId], references: [id])
  
  @@map("note")
}
```

**Purpose**: Individual sticky notes with positioning
**Fields**:
- `id`: Primary key (auto-increment)
- `x`, `y`: Position coordinates on board
- `text`: Note content
- `done`: Task completion status
- `username`: Creator's username
- `isPrivate`: Privacy flag
- `boardType`: Board classification ("main" or "profile")
- `boardId`: Foreign key to Board

### 4. Refresh Tokens Table
```prisma
model RefreshToken {
  id         Int      @id @default(autoincrement())
  token      String   @unique @db.VarChar(255)
  expiryDate DateTime @map("expiry_date")
  userId     Int      // Foreign key to User
  user       User     @relation(fields: [userId], references: [id])
  
  @@map("refresh_tokens")
}
```

**Purpose**: JWT refresh tokens for authentication
**Fields**:
- `id`: Primary key (auto-increment)
- `token`: Unique refresh token
- `expiryDate`: Token expiration timestamp
- `userId`: Foreign key to User

### 5. Roles Table
```prisma
model Role {
  id   Int    @id @default(autoincrement())
  name String // Role name
  
  @@map("role")
}
```

**Purpose**: User role definitions
**Fields**:
- `id`: Primary key (auto-increment)
- `name`: Role name (e.g., "ROLE_USER", "ROLE_ADMIN")

### 6. Subscription Tiers Table
```prisma
model SubscriptionTier {
  id           Int     @id @default(autoincrement())
  name         String  @unique @db.VarChar(255)
  stripePriceId String @map("stripe_price_id") @db.VarChar(255)
  price        Int
  currency     String  @db.VarChar(10)
  interval     String  @db.VarChar(50)
  features     String? @db.Text
  maxNotes     Int     @map("max_notes")
  isActive     Boolean @default(true) @map("is_active")
  sortOrder    Int     @map("sort_order")
  
  @@map("subscription_tiers")
}
```

**Purpose**: Subscription tiers for SaaS features
**Fields**:
- `id`: Primary key (auto-increment)
- `name`: Tier name
- `stripePriceId`: Stripe price identifier
- `price`: Cost in cents
- `currency`: Currency code
- `interval`: Billing interval
- `features`: Feature list (JSON/text)
- `maxNotes`: Maximum notes allowed
- `isActive`: Active status
- `sortOrder`: Display order

## Relationships

```
User (1) → (N) Board
User (1) → (N) RefreshToken
Board (1) → (N) Note
```

## Migration History

### Initial Migration (20260130215324_init)
- Created all 6 tables
- Established foreign key relationships
- Set up proper constraints and indexes

## Usage Examples

### Basic Prisma Client Setup
```javascript
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()
```

### User Operations
```javascript
// Create user
const user = await prisma.user.create({
  data: {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'hashed_password',
    role: 'ROLE_USER'
  }
})

// Find user by username
const user = await prisma.user.findUnique({
  where: { username: 'john_doe' },
  include: { boards: true }
})
```

### Board Operations
```javascript
// Create board for user
const board = await prisma.board.create({
  data: {
    title: 'My Board',
    code: 'unique-board-code',
    content: 'Board description',
    boardType: 'main',
    userId: 1
  }
})

// Get board with notes
const board = await prisma.board.findUnique({
  where: { id: 1 },
  include: { notes: true, user: true }
})
```

### Note Operations
```javascript
// Create note on board
const note = await prisma.note.create({
  data: {
    text: 'My sticky note',
    x: 100,
    y: 200,
    username: 'john_doe',
    boardId: 1
  }
})

// Get all notes for a board
const notes = await prisma.note.findMany({
  where: { boardId: 1 },
  include: { board: true }
})
```

### Authentication Operations
```javascript
// Create refresh token
const refreshToken = await prisma.refreshToken.create({
  data: {
    token: 'unique_token_string',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userId: 1
  }
})

// Clean expired tokens
await prisma.refreshToken.deleteMany({
  where: {
    expiryDate: {
      lt: new Date()
    }
  }
})
```

## Development Workflow

### 1. Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Review generated migration in `prisma/migrations/`

### 2. Client Generation
```bash
npx prisma generate
```

### 3. Database Reset (Development Only)
```bash
npx prisma migrate reset
```

### 4. Studio (Database GUI)
```bash
npx prisma studio
```

## Best Practices

### Security
- Always hash passwords before storing
- Use environment variables for database credentials
- Implement proper JWT token management
- Validate user inputs

### Performance
- Use `select` to limit returned fields
- Implement pagination for large datasets
- Add database indexes for frequently queried fields
- Use transactions for multi-table operations

### Error Handling
```javascript
try {
  const result = await prisma.user.create({ data: userData })
  return result
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    throw new Error('Username already exists')
  }
  throw error
}
```

## Troubleshooting

### Common Issues
1. **Connection Errors**: Check DATABASE_URL and network connectivity
2. **Migration Conflicts**: Use `npx prisma migrate resolve`
3. **Schema Validation**: Ensure all field types are valid Prisma types
4. **Foreign Key Issues**: Verify related records exist

### Debug Commands
```bash
# Check connection
npx prisma db pull

# Validate schema
npx prisma validate

# Reset database (dev only)
npx prisma migrate reset --force
```

## Production Considerations

### Environment Setup
- Use production database credentials
- Enable connection pooling
- Set up proper backup strategy
- Monitor database performance

### Migration Strategy
- Test migrations in staging first
- Use `npx prisma migrate deploy` for production
- Have rollback plans ready
- Document all schema changes

## Integration with Frontend

### React Example
```javascript
// hooks/usePrisma.js
import { PrismaClient } from '../generated/prisma'

let prisma

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient()
    }
    prisma = global.prisma
  }
}

export default prisma
```

## API Integration

The Prisma schema is designed to work seamlessly with the existing Spring Boot backend. The entity relationships match the Java models:

- `User.java` ↔ `User` model
- `Board.java` ↔ `Board` model  
- `Note.java` ↔ `Note` model
- `RefreshToken.java` ↔ `RefreshToken` model
- `Role.java` ↔ `Role` model
- `SubscriptionTier.java` ↔ `SubscriptionTier` model

This allows for smooth integration between the frontend (React/Electron) and backend (Spring Boot) applications.
