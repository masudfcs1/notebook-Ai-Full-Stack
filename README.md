# NoteMeet-Ai (NoteFlow AI - Full-Stack Enterprise Platform)

A high-performance, enterprise-grade meeting intelligence and note-taking platform powered by **Google Gemini AI**, **Next.js 16 (React 19)**, **Express.js (TypeScript)**, **Socket.io**, and **PostgreSQL (Prisma ORM)**.

---

## 📑 Table of Contents
- [Core Features](#-core-features)
- [Tech Stack Overview](#-tech-stack-overview)
- [System Architecture Overview](#-system-architecture-overview)
- [Backend Clean Architecture & Layered Design](#-backend-clean-architecture--layered-design)
- [Authentication, Security & RBAC Architecture](#-authentication-security--rbac-architecture)
- [Real-Time WebSocket Engine (Socket.io)](#-real-time-websocket-engine-socketio)
- [AI Intelligence & Processing Pipeline (Gemini 3.6 Flash)](#-ai-intelligence--processing-pipeline-gemini-36-flash)
- [Database Architecture & Entity Relationship Diagram (ERD)](#-database-architecture--entity-relationship-diagram-erd)
- [Frontend Architecture & State Management](#-frontend-architecture--state-management)
- [End-to-End Data Flow](#-end-to-end-data-flow)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started (Local Development)](#-getting-started-local-development)
- [Docker Installation & Deployment](#-docker-installation--deployment)
- [REST API Specifications](#-rest-api-specifications)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [NPM Scripts Reference](#-npm-scripts-reference)

---

## 🚀 Core Features

- **Enterprise-Grade Authentication & Security**: Dual-token JWT lifecycle (15m Access Token + 7d HttpOnly Refresh Token), Argon2/Bcrypt password hashing, email verification, OTP flow, and token rotation.
- **Role-Based Access Control (RBAC)**: 5-tiered permission system: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `EMPLOYEE`, and `USER`.
- **Multi-Tenant Workspaces & Teams**: Workspaces with slug-based routing, team division (e.g., Engineering, Design, Product), and granular role membership.
- **AI-Powered Meeting Summarization**: Integrated **Google Gemini 3.6 Flash** engine delivering executive summaries, key decisions, participants extraction, and sentiment analysis.
- **Automated Kanban Action Item Extraction**: Intelligent extraction of action items with automated priority assignment (`urgent`, `high`, `medium`, `low`) and due date parsing.
- **Live Stream Note Capturing**: Real-time meeting transcription and instant AI takeaways during live sessions.
- **Real-Time Notifications & Auditing**: WebSocket-powered instant event broadcasts to targeted user rooms (`user-{id}`) and administrative channels (`admin-room`).
- **Interactive Single Page Application (SPA)**: View-driven state orchestration via Redux Toolkit within Next.js 16, eliminating page reloads and preserving state.
- **Rich Design System**: Modern UI built with Tailwind CSS, Shadcn UI / Radix primitives, glassmorphism, dark mode tokens, and fluid Framer Motion micro-interactions.

---

## 💻 Tech Stack Overview

### Frontend Architecture
| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (React 19, Turbopack, App Router) |
| **Language** | TypeScript (Strict Mode) |
| **State Management** | Redux Toolkit (appSlice, dataSlice, authSlice) + RTK Query |
| **Styling & UI** | Tailwind CSS, Shadcn UI, Radix UI Primitives, Lucide Icons |
| **Animations** | Framer Motion |
| **Rich Text & Markdown** | `@mdxeditor/editor`, `react-markdown`, `remark-gfm` |
| **Real-time Client** | `socket.io-client` |
| **AI SDK** | `@google/genai` (Gemini 3.6 Flash) |
| **Validation & Forms** | Zod, React Hook Form |

### Backend Architecture
| Layer | Technologies |
| :--- | :--- |
| **Runtime & Framework** | Node.js (v20+), Express.js |
| **Language** | TypeScript |
| **Database & ORM** | PostgreSQL (Neon / Supabase), Prisma ORM (v6+) |
| **Real-Time Engine** | Socket.io Server (WebSocket & HTTP Long-Polling) |
| **Security & Middleware** | Helmet, CORS, Express Rate Limiter, Cookie-Parser, Compression |
| **Validation & Sanitization** | Zod, Custom Input Sanitizer |
| **Logging & Monitoring** | Pino Logger, Pino-Pretty |
| **File Management** | Multer (with disk storage & file-type filters) |

---

## 🏛️ System Architecture Overview

The system is designed as a decoupled, multi-tier full-stack architecture that balances high-concurrency client state, robust REST API services, real-time WebSocket communication, and resilient AI stream processing.

```mermaid
graph TD
    subgraph Client ["Frontend Layer (Next.js 16 / React 19 - Port 3015)"]
        UI["Tailwind CSS + Shadcn UI + Framer Motion"]
        SPA["View-Driven SPA Orchestrator"]
        Redux["Redux Toolkit (appSlice, dataSlice, authSlice)"]
        RTK["RTK Query (adminApi, authApi, workspaceApi)"]
        SocketClient["Socket.io Client (Real-time Events)"]
        GeminiClient["Gemini SDK (@google/genai)"]
    end

    subgraph Gateway ["API Gateway & Security Layer"]
        Helmet["Helmet (Security Headers)"]
        Cors["CORS Policy (Origin Verification)"]
        RateLimit["Express Rate Limiter"]
        Sanitize["Input Sanitizer & Zod Validation"]
        AuthMid["JWT Auth & RBAC Authorization Middleware"]
    end

    subgraph Backend ["Backend Layer (Express.js / TypeScript - Port 5015)"]
        Router["Express Modular Routers (/api/v1/*)"]
        Controller["Controllers (HTTP & DTO Handlers)"]
        Service["Services (Business Logic & Orchestration)"]
        Repo["Repositories (Prisma ORM Access Layer)"]
        SocketEngine["Socket.io Real-Time Engine"]
    end

    subgraph Persistence ["Persistence & External Cloud Services"]
        NeonDB[("PostgreSQL Database (Neon / Supabase)")]
        GeminiAPI["Google Gemini 3.6 Flash AI Cloud"]
    end

    UI --> SPA
    SPA --> Redux
    Redux --> RTK
    RTK -->|REST Requests (JSON)| Gateway
    Gateway --> AuthMid
    AuthMid --> Router
    Router --> Controller
    Controller --> Service
    Service --> Repo
    Service --> SocketEngine
    Repo -->|Prisma Client Queries| NeonDB
    SocketEngine -.->|WebSocket Notifications| SocketClient
    GeminiClient -->|Summaries, Action Items & Chat| GeminiAPI
    Service -.->|AI Background Processing| GeminiAPI
```

---

## ⚙️ Backend Clean Architecture & Layered Design

The backend adheres strictly to **Clean Architecture** and **SOLID principles**, structured into isolated, feature-driven modules. Each module maintains strict layer isolation:

```
Request ──> [ Route ] ──> [ Middleware ] ──> [ Controller ] ──> [ Service ] ──> [ Repository ] ──> [ Prisma / DB ]
                                                                     │
                                                                     └──> [ Socket.io / Events ]
```

### Module Structure Pattern
Every domain entity (e.g., `auth`, `user`, `workspace`, `team`, `notification`) follows a uniform folder layout:

```text
src/modules/<module-name>/
├── route.ts          # Defines endpoints, attaches validation and auth middlewares
├── controller.ts     # Handles HTTP requests/responses, delegates to service
├── service.ts        # Encapsulates business logic, transactions, and event triggers
├── repository.ts     # Direct Prisma ORM data queries and persistence logic
├── dto.ts            # Data Transfer Object definitions and transformations
├── validation.ts     # Zod schemas for query, params, and body validation
└── types.ts          # TypeScript type definitions and interfaces
```

### Layer Responsibilities
| Layer | Primary Role | Rules & Constraints |
| :--- | :--- | :--- |
| **Routes** | Route path binding and middleware chain configuration | No business logic; purely binds endpoints to controller methods |
| **Middlewares** | Authentication, RBAC checks, schema validation, rate-limiting | Halts invalid requests early with standardized error envelopes |
| **Controllers** | Request parameter extraction, response formatting via `ResponseHelper` | Never executes database queries or third-party integrations directly |
| **Services** | Core business rules, data transformation, multi-table transactions | Decoupled from Express `req`/`res` objects |
| **Repositories** | Database access via Prisma Client | Houses all CRUD, cursor/offset pagination, and relational joins |

---

## 🔒 Authentication, Security & RBAC Architecture

### 1. Dual-Token JWT Strategy
- **Access Token**: Short-lived (15 minutes), signed with `JWT_ACCESS_SECRET`, transmitted via HTTP `Authorization: Bearer <token>` header.
- **Refresh Token**: Long-lived (7 days), signed with `JWT_REFRESH_SECRET`, stored securely in database table (`RefreshToken`) and sent via `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
- **Token Invalidation & Rotation**: Logging out or rotating refresh tokens automatically revokes database token records.

### 2. Role-Based Access Control (RBAC) Matrix
The application implements strict hierarchical permissions enforced through `authorizeRole` middleware:

```
SUPER_ADMIN (Level 5) ──> Full system control, role assignment, system notifications
    └── ADMIN (Level 4) ──> User management, workspace administration, audit logs
         └── MANAGER (Level 3) ──> Team management, meeting note approvals, task assignments
              └── EMPLOYEE (Level 2) ──> Workspace collaboration, note creation, task updates
                   └── USER (Level 1) ──> Personal note-taking, AI summaries, profile management
```

### 3. Security Hardening Layers
- **HTTP Security Headers**: `helmet()` configured to prevent MIME-sniffing, clickjacking, and XSS attacks.
- **Strict CORS Protection**: Whitelists only configured frontend domains (`FRONTEND_URL`) with credential support.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attempts and API abuse.
- **Input Sanitization**: Custom middleware recursively strips HTML tags and potentially dangerous script vectors from all incoming request payloads.
- **Type-Safe Validation**: Every endpoint validates `req.body`, `req.query`, and `req.params` against strict **Zod** schemas.

---

## ⚡ Real-Time WebSocket Engine (Socket.io)

The backend exposes a WebSocket server over the existing HTTP server instance, handling instant updates across connected clients:

```mermaid
graph LR
    subgraph Sockets ["Socket.io Channel Topology"]
        ClientAdmin["Admin Client"]
        ClientUser["User Client (ID: 42)"]
        
        AdminRoom["admin-room (Broadcast Channel)"]
        UserRoom["user-42 (Private Channel)"]
    end

    subgraph BackendEvents ["Backend Trigger Events"]
        EvtUser["User Registration / Role Change"]
        EvtNote["Note Summarized / Task Assigned"]
        EvtWS["Workspace / Team Created"]
    end

    EvtUser -->|emitNotification| AdminRoom
    EvtWS -->|emitNotification| AdminRoom
    EvtNote -->|emitNotification| UserRoom
    
    AdminRoom -.->|Real-Time Push| ClientAdmin
    UserRoom -.->|Real-Time Push| ClientUser
```

### Real-Time Event Workflow
1. **Connection & Room Joining**:
   - Clients connect via WebSocket (with polling fallback) using `socketService.ts`.
   - Admin users automatically join `admin-room` via `join-admin` event.
   - Authenticated users join their dedicated channel `user-{userId}` via `join-user`.
2. **Notification Emission**:
   - When a backend service executes a critical action (e.g., workspace creation, role update, task assignment), `emitNotification()` publishes the payload.
   - The notification is persisted in PostgreSQL (`Notification` table) and dispatched simultaneously to the respective room.

---

## 🤖 AI Intelligence & Processing Pipeline (Gemini 3.6 Flash)

The AI engine is built on **Google Gemini 3.6 Flash**, engineered for sub-second latency and high-precision structured JSON outputs.

```mermaid
graph TD
    Input["Raw Meeting Notes / Live Stream / Uploaded Doc"] --> Prompt["Structured JSON Prompt Engineering"]
    Prompt --> SDKCall{"Tier 1: GenAI SDK Interactions API"}
    
    SDKCall -->|Success| Parser["Clean & Parse JSON Output"]
    SDKCall -->|Fail / 404| SDKGenerate{"Tier 2: GenAI SDK generateContent"}
    
    SDKGenerate -->|Success| Parser
    SDKGenerate -->|Fail| RESTFallback{"Tier 3: Direct Gemini REST Endpoint"}
    
    RESTFallback -->|Success| Parser
    RESTFallback -->|Fail| Heuristic["Resilient Heuristic Fallback"]
    
    Parser --> Result["Structured Output: Summary, KeyPoints, Decisions, Sentiment, Tasks"]
    Heuristic --> Result
```

### Core AI Capabilities
1. **Executive Meeting Summarizer (`summarizeMeetingNotes`)**: Synthesizes lengthy meetings into concise executive briefs, bulleted decisions, participants list, and sentiment analysis (`positive`, `neutral`, `negative`).
2. **Action Item Extractor (`extractActionItems`)**: Extracts actionable deliverables, assigning automated priority tiers (`urgent`, `high`, `medium`, `low`) and timeline targets.
3. **Live Real-time Note Stream Analyzer (`analyzeLiveNotes`)**: Continuously parses ongoing discussions to generate live bullet takeaways and suggested next steps.
4. **Document & Transcript Analyzer (`analyzeUploadedDocument`)**: Parses uploaded meeting transcripts (`.txt`, `.md`, etc.) and formats them into structured meeting records.
5. **Interactive Copilot Chat (`askAiAssistant`)**: Context-aware AI assistant utilizing conversational history buffers for productivity guidance.

---

## 🗄️ Database Architecture & Entity Relationship Diagram (ERD)

The database schema is managed via **Prisma ORM** targeting **PostgreSQL**. It supports multi-tenancy, workspaces, teams, meeting notes, AI summaries, action items, and notification logs.

```mermaid
erDiagram
    User ||--o{ RefreshToken : "has"
    User ||--o{ LoginHistory : "logs"
    User ||--o{ Workspace : "owns"
    User ||--o{ TeamMember : "participates_as"
    User ||--o{ MeetingNote : "authors"
    User ||--o{ Notification : "receives"

    Workspace ||--o{ Team : "contains"
    Workspace ||--o{ MeetingNote : "scopes"

    Team ||--o{ TeamMember : "has_members"
    Team ||--o{ ActionItem : "tracks"
    Team ||--o{ MeetingNote : "contains"

    MeetingNote ||--o| Summary : "generates"
    MeetingNote ||--o{ ActionItem : "extracts"

    User {
        int id PK
        string uuid UK
        string email UK
        string username UK
        string password
        string role "SUPER_ADMIN | ADMIN | MANAGER | EMPLOYEE | USER"
        string status "ACTIVE | INACTIVE | SUSPENDED | PENDING | DELETED"
        string provider "LOCAL | GOOGLE | GITHUB"
        boolean isVerified
        datetime createdAt
    }

    RefreshToken {
        int id PK
        string token UK
        int userId FK
        datetime expiresAt
        boolean revoked
    }

    Workspace {
        string id PK
        string name
        string slug UK
        string description
        int userId FK
        datetime createdAt
    }

    Team {
        string id PK
        string workspaceId FK
        string name
        string key "e.g. ENG, PRD, DES"
        datetime createdAt
    }

    TeamMember {
        string id PK
        string teamId FK
        int userId FK
        string name
        string email
        string role "OWNER | LEAD | MEMBER"
    }

    MeetingNote {
        string id PK
        int userId FK
        string workspaceId FK
        string teamId FK
        string title
        string content
        string source "manual | upload | ongoing"
        string status "draft | summarized"
        datetime createdAt
    }

    Summary {
        string id PK
        string noteId FK "1-to-1 unique"
        string content
        string keyPoints "JSON Array"
        string decisions "JSON Array"
        string participants "JSON Array"
        string sentiment "positive | neutral | negative"
        int wordCount
    }

    ActionItem {
        string id PK
        string noteId FK
        string teamId FK
        string title
        string description
        string assignee
        string dueDate
        string priority "urgent | high | medium | low"
        string status "backlog | todo | in_progress | done"
    }

    Notification {
        string id PK
        int userId FK
        string type "USER_CREATED | WORKSPACE_CREATED | TEAM_CREATED | ROLE_UPDATED | SYSTEM"
        string title
        string message
        boolean read
        json data
        datetime createdAt
    }
```

---

## 🎨 Frontend Architecture & State Management

The frontend is built on **Next.js 16 (App Router)** and architected as an **Interactive View-Driven SPA**:

```
src/
├── app/                    # Next.js App Router (Layout & Global Providers)
├── components/
│   ├── views/              # View screens (Dashboard, Upload, Ongoing, ActionItems, Summary, etc.)
│   ├── layout/             # Header, Sidebar, AI Assistant Drawer, Notification Center
│   ├── ui/                 # Reusable Radix / Shadcn components (Dialog, Sheet, Carousel, Command)
│   └── modals/             # Global modal overlays
├── features/               # Feature-specific modules (Admin, Auth, Navigation)
├── lib/redux/              # Redux Toolkit store, slices, and RTK Query APIs
│   ├── appSlice.ts         # Active view, sidebar state, global search, notifications
│   ├── dataSlice.ts        # Meeting notes, summaries, Kanban tasks, live transcript buffer
│   ├── authSlice.ts        # User credentials, JWT tokens, active session state
│   └── api/                # RTK Query service endpoints (adminApi, authApi, workspaceApi)
└── services/               # Gemini AI service, Socket.io client, Axios/Fetch API client
```

### State Management Strategy
- **`appSlice`**: Manages view routing transitions (`dashboard`, `ongoing`, `upload`, `summary`, `action-items`, `history`, `team`, `settings`), UI overlays, notifications, and AI drawer states.
- **`dataSlice`**: Manages optimistic CRUD operations for notes and Kanban boards with local fallback synchronization.
- **`authSlice`**: Maintains active authenticated user profile, permissions, and session tokens.
- **RTK Query Slices**: Handles asynchronous data fetching, automatic cache invalidation, and backend synchronization.

---

## 🔄 End-to-End Data Flow

The following sequence diagram traces the end-to-end flow of uploading/creating meeting notes, executing Gemini AI analysis, persisting entities atomically in PostgreSQL, and broadcasting real-time socket events:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser Client
    participant Frontend as Next.js (Redux / UI)
    participant Gemini as Google Gemini AI Engine
    participant Gateway as Express Gateway (Middlewares)
    participant Controller as Backend Controller
    participant Service as Backend Service
    participant Repo as Prisma Repository
    participant DB as PostgreSQL Database
    participant Socket as Socket.io Server

    User->>Frontend: Input / Upload Meeting Notes
    Frontend->>Gemini: Request AI Analysis (gemini-3.6-flash)
    Gemini-->>Frontend: Return Structured JSON (Summary, Action Items, Sentiment)
    Frontend->>Gateway: POST /api/v1/notes (Payload + Bearer Token)
    Gateway->>Gateway: Verify JWT, Check RBAC, Sanitize & Validate Zod Schema
    Gateway->>Controller: Route to NoteController.create()
    Controller->>Service: Execute NoteService.saveNoteAndSummary()
    Service->>Repo: Create MeetingNote + Summary + ActionItems
    Repo->>DB: Atomic Transaction ($transaction)
    DB-->>Repo: Persisted Entities
    Repo-->>Service: Return Note & Summary Records
    Service->>Socket: emitNotification("New Note & Action Items Created")
    Socket-->>Frontend: Real-Time Event to 'user-{id}' & 'admin-room'
    Service-->>Controller: Return Result Envelope
    Controller-->>Frontend: HTTP 201 Created (ApiResponse<Note>)
    Frontend->>Frontend: Update Redux Store (dataSlice & appSlice)
    Frontend-->>User: Update Kanban Board & Render Summary View
```

---

## 📂 Project Directory Structure

```text
NoteMeet-Ai/
├── Backend/                            # Express.js REST API & WebSocket Server
│   ├── prisma/                         # Prisma schema, migrations, and seeds
│   │   ├── schema.prisma               # Complete PostgreSQL relational schema
│   │   └── migrations/                 # Migration history
│   ├── src/
│   │   ├── config/                     # Environment, JWT, CORS, Multer configs
│   │   ├── constants/                  # System constants and response messages
│   │   ├── database/                   # Prisma client singleton and seeders
│   │   ├── helpers/                    # Standardized API response and error helpers
│   │   ├── interfaces/                 # Request/Response TypeScript interfaces
│   │   ├── logger/                     # Pino logger setup
│   │   ├── middlewares/                # Auth, RBAC, Zod validation, Rate limiter, Sanitizer
│   │   ├── modules/                    # Feature modules (auth, user, role, workspace, team, notification)
│   │   │   ├── auth/                   # Registration, login, OTP, token refresh
│   │   │   ├── user/                   # User CRUD, role updates, soft delete
│   │   │   ├── workspace/              # Workspace management & slugs
│   │   │   ├── team/                   # Team & membership management
│   │   │   └── notification/           # Notification history & read status
│   │   ├── routes/                     # Main API router aggregator (/api/v1)
│   │   ├── socket/                     # Socket.io initialization and room handlers
│   │   ├── types/                      # Express declaration merging
│   │   ├── utils/                      # Password hashing, JWT utils, pagination helpers
│   │   ├── app.ts                      # Express app setup and middleware pipeline
│   │   └── server.ts                   # HTTP & Socket.io server entry point
│   ├── Dockerfile                      # Backend multi-stage production Dockerfile
│   └── package.json                    # Backend dependencies and scripts
│
├── Frontend/                           # Next.js 16 Web Application
│   ├── public/                         # Static assets and icons
│   ├── src/
│   │   ├── app/                        # Next.js App Router (layout, page, providers)
│   │   ├── components/                 # UI components, layout, modals, and views
│   │   │   ├── views/                  # SPA views (dashboard, upload, summary, action-items, etc.)
│   │   │   ├── layout/                 # Header, Sidebar, AI Assistant Drawer
│   │   │   └── ui/                     # Shadcn & Radix headless components
│   │   ├── features/                   # Admin, Auth, Navigation features
│   │   ├── lib/redux/                  # Redux store, appSlice, dataSlice, authSlice, RTK APIs
│   │   ├── services/                   # Gemini AI service, Socket.io client, API client
│   │   ├── styles/                     # Tailwind globals and theme variables
│   │   └── types/                      # Frontend TypeScript definitions
│   ├── Dockerfile                      # Frontend Next.js standalone Dockerfile
│   └── package.json                    # Frontend dependencies and scripts
│
├── docker-compose.yml                  # Root multi-container orchestration
├── .env.docker                         # Pre-configured Docker environment template
└── package.json                        # Root workspace manager
```

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- **Node.js** (v20.x or later recommended)
- **npm** or **bun**
- **PostgreSQL** instance (Local or Neon / Supabase cloud database)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd NoteMeet-Ai
```

### Step 2: Install All Dependencies
```bash
npm run postinstall
```
*(Automatically installs dependencies for both `Frontend` and `Backend` workspaces)*

### Step 3: Configure Environment Files
1. Copy and configure Backend environment variables:
   ```bash
   cp Backend/.env.example Backend/.env
   ```
2. Configure Frontend environment variables (`Frontend/.env` or `.env.local`):
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5015/api/v1
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5015
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Step 4: Run Database Migrations & Seeds
```bash
cd Backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
cd ..
```

### Step 5: Start Both Servers Concurrently
From the project root:
```bash
npm run dev
```

- 🌐 **Frontend Web App**: `http://localhost:3015`
- 🔌 **Backend REST API**: `http://localhost:5015/api/v1`
- 💓 **Health Check**: `http://localhost:5015/health`

---

## 🐳 Docker Installation & Deployment

Run the entire full-stack application inside isolated multi-stage containers without needing local Node.js or database installations.

### Quick Start with Docker Compose
```bash
# Build and run containers in background
docker compose up --build -d

# Execute database migrations
docker compose exec backend npx prisma migrate deploy

# Seed initial super-admin account
docker compose exec backend npm run seed
```

### Common Docker Operations
| Action | Command |
| :--- | :--- |
| **View Live Logs** | `docker compose logs -f` |
| **View Backend Logs** | `docker compose logs -f backend` |
| **View Frontend Logs** | `docker compose logs -f frontend` |
| **Stop All Containers** | `docker compose down` |
| **Rebuild Containers** | `docker compose up --build -d` |

---

## 📡 REST API Specifications

### Authentication Endpoints (`/api/v1/auth`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Register new user account | No |
| `POST` | `/login` | Authenticate user & issue JWT tokens | No |
| `POST` | `/logout` | Invalidate session & revoke refresh token | Yes |
| `POST` | `/refresh-token` | Generate new access token via refresh token | No (Cookie) |
| `GET` | `/me` | Retrieve authenticated user profile | Yes |
| `PATCH` | `/profile` | Update user profile data | Yes |
| `POST` | `/change-password` | Update account password | Yes |
| `POST` | `/forgot-password` | Initiate password reset request | No |
| `POST` | `/reset-password` | Complete password reset via token | No |

### User Management (`/api/v1/users`)
| Method | Route | Description | Access Tier |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Retrieve paginated users list | `ADMIN`, `SUPER_ADMIN` |
| `GET` | `/:id` | Get user details by ID | `ADMIN`, `SUPER_ADMIN` |
| `POST` | `/` | Create user directly | `SUPER_ADMIN` |
| `PATCH` | `/:id` | Update user information | `ADMIN`, `SUPER_ADMIN` |
| `DELETE` | `/:id` | Soft delete user | `SUPER_ADMIN` |
| `PATCH` | `/role` | Update user access role | `SUPER_ADMIN` |
| `PATCH` | `/status` | Update user status (Active/Suspended) | `ADMIN`, `SUPER_ADMIN` |

### Workspace & Team Endpoints
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/workspaces` | Get all accessible workspaces |
| `POST` | `/api/v1/workspaces` | Create new workspace with slug |
| `GET` | `/api/v1/teams` | Get teams inside active workspace |
| `POST` | `/api/v1/teams` | Create new team with key identifier |

### Notification Endpoints (`/api/v1/notifications`)
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Fetch paginated notifications with filters |
| `PATCH` | `/:id/read` | Mark single notification as read |
| `PATCH` | `/read-all` | Mark all notifications as read |
| `GET` | `/unread-count` | Get total count of unread notifications |
| `DELETE` | `/:id` | Delete notification record (Admin) |

---

## 📜 Environment Variables Configuration

### Backend Configuration (`Backend/.env`)
```env
PORT=5015
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/notemeet_db?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your_jwt_access_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

# Cookie & Security
COOKIE_SECRET="your_cookie_signing_secret"
FRONTEND_URL="http://localhost:3015"
UPLOAD_PATH="uploads"

# Super Admin Seed
SUPER_ADMIN_NAME="Super Admin"
SUPER_ADMIN_EMAIL="superadmin@notemeet.ai"
SUPER_ADMIN_PASSWORD="SuperSecretPassword123!"
```

### Frontend Configuration (`Frontend/.env`)
```env
PORT=3015
NEXT_PUBLIC_BACKEND_URL="http://localhost:5015/api/v1"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5015"
NEXT_PUBLIC_GEMINI_API_KEY="your_google_gemini_api_key"
```

---

## 🧪 NPM Scripts Reference

### Root Directory
| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs Frontend (port 3015) and Backend (port 5015) concurrently |
| `npm run postinstall` | Installs dependencies in both Frontend and Backend directories |

### Backend (`/Backend`)
| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Backend with `tsx watch` hot-reload |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm run start` | Runs compiled production server from `dist/` |
| `npm run prisma:generate` | Generates Prisma client types |
| `npm run prisma:migrate` | Runs database migrations |
| `npm run seed` | Seeds default Super Admin account |
| `npm run prisma:studio` | Opens interactive Prisma Studio GUI |

### Frontend (`/Frontend`)
| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server on port 3015 |
| `npm run build` | Builds optimized Next.js production bundle |
| `npm run start` | Runs Next.js production server |
| `npm run lint` | Runs ESLint checks |

---

## 📄 License
This project is licensed under the MIT License.
