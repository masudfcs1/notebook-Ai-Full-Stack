# Enterprise Backend Boilerplate

A production-ready, scalable, maintainable, secure, and clean backend starter built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features

- **Enterprise-Grade Architecture**: Clean architecture with repository pattern, SOLID principles, and feature-based modules
- **Complete Authentication System**: JWT access/refresh tokens, HTTP-only cookies, email verification, OTP, password reset
- **Role-Based Access Control**: Super Admin, Admin, Manager, Employee, User roles with authorization middleware
- **User Management**: CRUD operations, search, pagination, sorting, filtering, soft delete
- **File Upload**: Multer-based file upload with type/size validation
- **Logging**: Pino logger with development pretty-print and production JSON logs
- **Validation**: Zod-based request validation for params, body, and query
- **Security**: Helmet, CORS, rate limiting, password hashing, input sanitization
- **Error Handling**: Centralized error handler with operational errors

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL (Supabase)
- Prisma ORM
- JWT Authentication
- Pino Logger
- Multer
- Zod
- Bcrypt

## Project Structure

```
src/
├── server.ts              # Application entry point
├── app.ts                 # Express app configuration
│
├── config/                # Configuration files
│   ├── env.ts
│   ├── jwt.ts
│   ├── cors.ts
│   ├── cookie.ts
│   ├── multer.ts
│   └── logger.ts
│
├── constants/             # Application constants
│   └── messages.ts
│
├── database/              # Database configuration
│   ├── prisma.ts
│   └── seed.ts
│
├── logger/                # Logger configuration
│   └── index.ts
│
├── interfaces/             # TypeScript interfaces
│   ├── response.interface.ts
│   └── request.interface.ts
│
├── types/                  # TypeScript type declarations
│   └── express.d.ts
│
├── utils/                  # Utility functions
│   ├── jwt.ts
│   ├── password.ts
│   ├── response.ts
│   ├── pagination.ts
│   ├── date.ts
│   ├── generators.ts
│   ├── async.ts
│   ├── cookie.ts
│   └── device.ts
│
├── helpers/                # Helper classes
│   ├── response.helper.ts
│   └── error.helper.ts
│
├── shared/                 # Shared schemas
│   └── paginated.ts
│
├── middlewares/            # Express middlewares
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   ├── upload.middleware.ts
│   ├── rate-limiter.middleware.ts
│   ├── request-logger.middleware.ts
│   └── sanitize.middleware.ts
│
└── modules/                # Feature modules
    ├── auth/
    │   ├── route.ts
    │   ├── controller.ts
    │   ├── service.ts
    │   ├── repository.ts
    │   ├── dto.ts
    │   ├── validation.ts
    │   └── types.ts
    ├── user/
    │   ├── route.ts
    │   ├── controller.ts
    │   ├── service.ts
    │   ├── repository.ts
    │   ├── dto.ts
    │   ├── validation.ts
    │   └── types.ts
    └── role/
        ├── route.ts
        ├── controller.ts
        ├── service.ts
        └── types.ts
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| POST | `/api/v1/auth/change-password` | Change password |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| POST | `/api/v1/auth/verify-email` | Verify email |
| POST | `/api/v1/auth/resend-verification` | Resend verification email |
| POST | `/api/v1/auth/send-otp` | Send OTP |
| POST | `/api/v1/auth/verify-otp` | Verify OTP |
| GET | `/api/v1/auth/me` | Get current user |
| PATCH | `/api/v1/auth/profile` | Update profile |
| PATCH | `/api/v1/auth/profile-image` | Upload profile image |
| DELETE | `/api/v1/auth/profile-image` | Delete profile image |
| DELETE | `/api/v1/auth/delete-account` | Delete account |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Get all users (paginated) |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create user |
| PATCH | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |
| PATCH | `/api/v1/users/status` | Update user status |
| PATCH | `/api/v1/users/role` | Update user role |

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/roles` | Get all roles |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection URL | Required |
| `JWT_ACCESS_SECRET` | JWT access token secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `JWT_ACCESS_EXPIRES` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh token expiry | `7d` |
| `COOKIE_SECRET` | Cookie secret | Required |
| `UPLOAD_PATH` | Upload directory | `uploads` |
| `SUPER_ADMIN_NAME` | Super admin name | `Super Admin` |
| `SUPER_ADMIN_EMAIL` | Super admin email | Required |
| `SUPER_ADMIN_PASSWORD` | Super admin password | Required |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

3. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

4. Seed super admin:
   ```bash
   npm run seed
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run seed` | Seed database |

## Architecture Flow

```
Request
   ↓
Route (maps endpoints)
   ↓
Controller (receives request, returns response)
   ↓
Service (business logic)
   ↓
Repository (Prisma queries)
   ↓
Database
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

# Backend-Advance-Setup
