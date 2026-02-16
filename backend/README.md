# E-Commerce Backend API

NestJS backend for production-ready E-commerce platform.

## Features

- ✅ JWT Authentication (Access + Refresh Tokens)
- ✅ Role-based Authorization (Customer, Manager, Admin)
- ✅ Prisma ORM with PostgreSQL
- ✅ Input Validation
- ✅ Swagger API Documentation
- ✅ CORS Configuration

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# (Optional) Seed database
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run start:dev
```

Server runs on: `http://localhost:4000`

API Documentation: `http://localhost:4000/api/docs`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/auth/register` | Register new user | No |
| POST | `/v1/auth/login` | Login user | No |
| POST | `/v1/auth/refresh` | Refresh access token | No |
| POST | `/v1/auth/logout` | Logout user | Yes |
| GET | `/v1/auth/me` | Get current user | Yes |

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── decorators/        # Custom decorators
│   │   ├── dto/               # Data transfer objects
│   │   ├── guards/            # Auth guards
│   │   ├── strategies/        # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── prisma/                # Prisma module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## Available Scripts

```bash
# Development
npm run start:dev              # Start with hot reload
npm run start:debug            # Start in debug mode

# Build
npm run build                  # Build for production
npm run start:prod             # Run production build

# Database
npm run prisma:generate        # Generate Prisma Client
npm run prisma:push            # Push schema to DB
npm run prisma:migrate         # Create migration
npm run prisma:studio          # Open Prisma Studio

# Testing
npm run test                   # Run tests
npm run test:watch             # Run tests in watch mode
npm run test:cov               # Generate coverage report

# Code Quality
npm run lint                   # Lint code
npm run format                 # Format code
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret for access tokens | - |
| `JWT_EXPIRES_IN` | Access token expiry | 15m |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens | - |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry | 7d |
| `PORT` | Server port | 4000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## Authentication Flow

1. **Register**: `POST /v1/auth/register`
   - Creates new user with hashed password
   - Returns user data (no tokens)

2. **Login**: `POST /v1/auth/login`
   - Validates credentials
   - Returns access token + refresh token
   - Saves refresh token in database

3. **Access Protected Routes**:
   - Include `Authorization: Bearer <access_token>` header
   - Access token expires in 15 minutes

4. **Refresh Token**: `POST /v1/auth/refresh`
   - Send refresh token
   - Returns new access token + refresh token
   - Old refresh token is invalidated

5. **Logout**: `POST /v1/auth/logout`
   - Deletes all refresh tokens for user

## Testing with Postman

Import the Postman collection: `postman_collection.json`

Or test manually:

### Register
```bash
curl -X POST http://localhost:4000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+91 9876543210"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Profile (Protected)
```bash
curl -X GET http://localhost:4000/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Next Steps

- [ ] Implement Products module
- [ ] Implement Orders module
- [ ] Implement Cart module
- [ ] Implement Payment integration
- [ ] Add email notifications
- [ ] Add file upload (S3)
- [ ] Add rate limiting
- [ ] Add logging
- [ ] Add testing

## License

MIT
