# NoteMeet-Ai — Enterprise System Architecture & Design Document

> **Version:** 2.0.0  
> **Target System:** Full-Stack Enterprise AI-Powered Meeting Intelligence & Collaborative Workspace  
> **Tech Stack:** Next.js 16 (React 19), Node.js, Express.js, TypeScript, PostgreSQL (Prisma ORM), Google GenAI (Gemini 3.6 Flash), Socket.io, Tailwind CSS, Redux Toolkit, Docker

---

## 1. Executive Summary & Vision

**NoteMeet-Ai** (also known as *Notebook-Ai-Full-Stack*) is an enterprise-ready, collaborative workspace designed to transform unstructured audio recordings, live meeting discussions, and manual notes into actionable intelligence. 

The system leverages state-of-the-art Generative AI (Google Gemini 3.6 Flash) with a resilient multi-tier fallback architecture, robust Role-Based Access Control (RBAC), multi-tenant workspaces, real-time bidirectional WebSocket synchronization, and a high-performance reactive user interface.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             NOTEMEET-AI                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │ Collaborative UI │  │ Enterprise Auth  │  │ Multi-tier AI Engine  │  │
│  │ (Next.js/Redux)  │  │ (RBAC / JWT Dual)│  │ (Gemini 3.6 Flash)    │  │
│  └─────────┬────────┘  └────────┬─────────┘  └───────────┬───────────┘  │
│            │                    │                        │              │
│            ▼                    ▼                        ▼              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │       Modular Clean Backend Architecture (Node.js/Express)        │  │
│  └──────────────────────────────┬────────────────────────────────────┘  │
│                                 ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │      PostgreSQL (Prisma ORM) + Real-Time Engine (Socket.IO)       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architectural Principles & Patterns

The platform is designed around strict software engineering best practices:

1. **Modular Monolith with Clean Layered Architecture**:
   - Backend modules (`auth`, `user`, `role`, `workspace`, `team`, `notification`, `notes`, `summary`) are strictly isolated with dedicated **Controllers**, **Services**, **Repositories**, **DTOs**, and **Routes**.
2. **Separation of Concerns (SoC) & SOLID**:
   - Business rules reside exclusively in the Service layer; data operations reside in Repositories; presentation/HTTP concerns reside in Controllers.
3. **Resilient AI Pipeline with Multi-Tier Fallback**:
   - Google GenAI SDK Interactions API $\rightarrow$ GenAI Models API $\rightarrow$ Direct Gemini REST API Fallback.
4. **Dual-Token Cryptographic Authentication**:
   - Ephemeral short-lived Access JWTs coupled with secure, database-tracked, revocable Refresh Tokens stored in HTTP-Only cookies.
5. **Hierarchical RBAC (Role-Based Access Control)**:
   - Granular permission matrix across `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `EMPLOYEE`, and `USER`.
6. **Reactive State & Hydration Strategy**:
   - Hybrid state management combining **Redux Toolkit** (global app state & UI navigation), **Zustand** (lightweight ephemeral state), and **TanStack React Query** (server-cache invalidation).
7. **Real-time Event-Driven Collaboration**:
   - WebSocket rooms partitioned by `admin-room`, `workspace-{id}`, `team-{id}`, and `user-{id}`.

---

## 3. High-Level System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client_Layer ["Client Layer (Frontend)"]
        SPA["Next.js 16 (App Router + SPA View Router)"]
        Redux["Redux Store (appSlice, dataSlice, adminSlice)"]
        ReactQuery["TanStack React Query (Server State Cache)"]
        WSClient["Socket.IO Client (Real-time Listeners)"]
        Editor["MDX Editor / Markdown Engine"]
        SPA --> Redux
        SPA --> ReactQuery
        SPA --> WSClient
        SPA --> Editor
    end

    subgraph Ingress_Layer ["Ingress & Security Layer"]
        Caddy["Caddy / Reverse Proxy (Port 80/443)"]
        RateLimit["Express Rate Limiter (IP Bucket)"]
        Helmet["Helmet (CSP & Security Headers)"]
        CORS["CORS Policy Enforcement"]
        Sanitizer["XSS & Input Sanitizer"]
    end

    subgraph Backend_Core ["Backend Core Layer (Express + TypeScript)"]
        Router["Express Unified Route Registry (/api/v1)"]
        AuthMid["Auth & RBAC Middleware"]
        
        subgraph Modules ["Modular Feature Domains"]
            AuthMod["Auth Module"]
            UserMod["User & Profile Module"]
            RoleMod["Role & Permission Module"]
            WorkMod["Workspace Module"]
            TeamMod["Team & Membership Module"]
            NoteMod["Meeting Note Module"]
            SummMod["AI Summary & Task Module"]
            NotifMod["Notification Module"]
        end

        subgraph Service_Layers ["Service & Business Logic Layer"]
            AuthSvc["AuthService"]
            UserSvc["UserService"]
            WorkSvc["WorkspaceService"]
            TeamSvc["TeamService"]
            NoteSvc["MeetingNoteService"]
            AISvc["Gemini AIService"]
            NotifSvc["NotificationService"]
        end

        subgraph Repo_Layers ["Data Access Layer (Prisma Client)"]
            Prisma["Prisma ORM Client (Parameterized Queries)"]
        end
    end

    subgraph Realtime_Engine ["Real-Time WebSocket Engine"]
        SocketServer["Socket.IO Server (HTTP Upgrades)"]
        AdminRoom["admin-room"]
        UserRooms["user-{userId} Rooms"]
        TeamRooms["team-{teamId} Rooms"]
        SocketServer --> AdminRoom
        SocketServer --> UserRooms
        SocketServer --> TeamRooms
    end

    subgraph External_Services ["External & AI Services"]
        GoogleGenAI["Google Gemini 3.6 Flash (GenAI SDK)"]
        GeminiREST["Gemini v1beta REST API Fallback"]
        OAuthProviders["OAuth 2.0 (Google, GitHub)"]
    end

    subgraph Data_Persistence ["Persistence Layer"]
        Postgres[(Neon / Cloud PostgreSQL 16+)]
        DiskStorage[("Local / Cloud Uploads (/uploads)")]
    end

    Client_Layer -->|"HTTPS / REST API"| Caddy
    Client_Layer <-->|"WSS / Bidirectional Events"| SocketServer
    Caddy --> Helmet --> CORS --> RateLimit --> Sanitizer --> Router
    Router --> AuthMid
    AuthMid --> Modules
    Modules --> Service_Layers
    Service_Layers --> Repo_Layers
    Repo_Layers --> Postgres
    NoteMod --> DiskStorage
    Service_Layers -->|"Emit Events"| SocketServer
    AISvc -->|"Primary SDK"| GoogleGenAI
    AISvc -->|"Fallback HTTP"| GeminiREST
```

---

## 4. Frontend Architecture & Design System

### 4.1 Hybrid SPA-in-Next.js Architecture

The frontend leverages Next.js 16's App Router (`src/app`) for optimal server initialization, SEO routing, and asset bundlers, while the core interactive dashboard operates as an ultra-fast SPA via dynamic Redux view dispatching:

```
src/
├── app/
│   ├── layout.tsx         # Global Providers (Redux, Theme, Toast, Auth)
│   ├── page.tsx           # Dynamic View Switcher
│   └── api/               # Next.js BFF (Backend for Frontend) Endpoints
├── components/
│   ├── layout/            # AppSidebar, Header, TopNav, MobileNav, Breadcrumbs
│   ├── views/             # Full Screen Views (Dashboard, Upload, Summary, Teams, History, Settings)
│   │   └── admin/         # Admin Views (Users, Roles, Activity, Notifications, System Settings)
│   └── ui/                # Headless Shadcn / Radix primitives
├── features/              # Feature-scoped logic (auth, admin, navigation)
├── lib/
│   └── redux/             # Redux Store (appSlice, dataSlice, adminSlice)
└── services/
    ├── apiService.ts      # Central Axios/Fetch REST Client with Interceptors
    ├── geminiService.ts   # Client/Edge Gemini AI Integration
    └── socketService.ts   # WebSocket Client Manager
```

### 4.2 State Management Architecture

```mermaid
flowchart LR
    subgraph UI_Dispatch ["User Interaction"]
        Action["User Triggers Action (e.g. Upload Note / Switch View)"]
    end

    subgraph Redux_Store ["Redux Toolkit Store"]
        AppSlice["appSlice\n- currentView\n- sidebarOpen\n- globalSearch\n- activeModal"]
        DataSlice["dataSlice\n- notes: MeetingNote[]\n- summaries: Summary[]\n- actionItems: ActionItem[]\n- isGeneratingAI: boolean"]
        AdminSlice["adminSlice\n- users: User[]\n- auditLogs: LoginHistory[]\n- roles: Role[]\n- systemMetrics"]
    end

    subgraph Server_Sync ["Server Sync Layer"]
        TanStackQuery["TanStack React Query\n(Stale-While-Revalidate Caching)"]
        SocketSync["Socket.IO Client\n(Push Updates to Redux)"]
    end

    Action --> AppSlice
    Action --> DataSlice
    Action --> TanStackQuery
    SocketSync -->|Live Invalidation| DataSlice
    SocketSync -->|New Alert| AppSlice
```

### 4.3 UI Design System & Aesthetics Specification

- **Color Palette & Glassmorphism**: Deep slate and dark mode backgrounds (`hsl(224, 71%, 4%)`) with high-contrast foregrounds, subtle violet-indigo accents (`hsl(262, 83%, 58%)`), and semi-transparent frosted cards (`backdrop-blur-md bg-white/5 border border-white/10`).
- **Typography**: Inter / Outfit via `next/font` for high legibility across data-dense tables, kanban boards, and markdown note views.
- **Motion & Micro-interactions**: Framer Motion provides staggered entrance transitions, spring-physics drag-and-drop (`@dnd-kit`), tab switching animations, and skeleton loaders for AI generating states.

---

## 5. Backend Architecture & Domain Model

### 5.1 Clean Modular Monolith Structure

```
Backend/src/
├── app.ts                 # Express Application setup & global middleware pipeline
├── server.ts              # HTTP Server, Database bootstrap & Socket.io init
├── config/                # Environment variables, CORS, JWT, Cookie, Multer, Pino
├── constants/             # Enums, HTTP Status Codes, Error Codes, Permission Keys
├── database/              # Prisma Client instance & database seeders
├── helpers/               # String helpers, Date formatters, Crypto utils
├── interfaces/            # Global TypeScript Contracts & IResponse wrappers
├── logger/                # Pino structured JSON logger
├── middlewares/           # Auth, RBAC, Validation, Error Handler, Rate Limiting
├── modules/               # Domain-Driven Modules
│   ├── auth/              # Registration, Login, Refresh, Password Reset, OTP
│   ├── user/              # Profile, User Management, Activity Logs
│   ├── role/              # RBAC matrix, Dynamic role definitions
│   ├── workspace/         # Multi-tenant workspace partitioning
│   ├── team/              # Team creation, Member invitations & roles
│   ├── notification/      # Real-time event notifications & read tracking
│   └── (note & summary)/  # Note capture, Audio ingestion, AI summarizer
├── routes/                # Aggregated API Route index (/api/v1)
├── socket/                # Socket.io event emitter, room handlers & types
└── utils/                 # AppError, AsyncHandler, ResponseFormatter
```

### 5.2 Request-Response Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend Client
    participant GW as Ingress (Helmet/CORS/RateLimit)
    participant Auth as Auth & RBAC Middleware
    participant Val as Zod Validation Middleware
    participant Ctrl as Domain Controller
    participant Svc as Business Service Layer
    participant AI as Gemini 3.6 AI Engine
    participant Repo as Prisma Repository
    participant DB as PostgreSQL Database
    participant Sock as Socket.IO Hub

    Client->>GW: POST /api/v1/notes (with Bearer JWT + Payload)
    GW->>Auth: Verify JWT & Validate Role Permissions
    Auth->>Val: Validate Request Body against Zod Schema
    Val->>Ctrl: Forward Clean DTO
    Ctrl->>Svc: Invoke NoteService.createNoteAndSummarize(dto)
    Svc->>Repo: Persist Draft MeetingNote
    Repo->>DB: INSERT INTO meeting_notes
    DB-->>Repo: Saved Note Record
    
    rect rgb(240, 248, 255)
        Note over Svc,AI: Asynchronous AI Extraction Pipeline
        Svc->>AI: generateSummaryAndActionItems(noteContent)
        AI-->>Svc: Structured JSON (Summary, Decisions, KeyPoints, ActionItems)
        Svc->>Repo: Persist Summary & ActionItems Transaction
        Repo->>DB: INSERT INTO summaries, action_items
    end

    Svc->>Sock: emitNotification('SUMMARY_READY', noteId)
    Sock-->>Client: WebSocket event ('notification')
    Svc-->>Ctrl: Return Complete Result DTO
    Ctrl-->>Client: 201 Created { success: true, data: {...} }
```

---

## 6. Database Architecture & Entity Relationship Diagram (ERD)

### 6.1 Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ RefreshToken : "owns"
    User ||--o{ LoginHistory : "logs"
    User ||--o{ Workspace : "creates"
    User ||--o{ TeamMember : "participates_as"
    User ||--o{ MeetingNote : "authors"
    User ||--o{ Notification : "receives"

    Workspace ||--o{ Team : "contains"
    Workspace ||--o{ MeetingNote : "scopes"

    Team ||--o{ TeamMember : "has"
    Team ||--o{ MeetingNote : "associates"
    Team ||--o{ ActionItem : "owns"

    MeetingNote ||--o| Summary : "generates"
    MeetingNote ||--o{ ActionItem : "extracts"

    User {
        int id PK
        string uuid UK
        string email UK
        string name
        string username UK
        string password
        string avatar
        enum role "SUPER_ADMIN | ADMIN | MANAGER | EMPLOYEE | USER"
        enum status "ACTIVE | INACTIVE | SUSPENDED | PENDING | DELETED"
        enum provider "LOCAL | GOOGLE | FACEBOOK | APPLE | GITHUB"
        boolean isVerified
        datetime lastLogin
        int loginCount
        datetime createdAt
        datetime updatedAt
    }

    RefreshToken {
        int id PK
        string token UK
        int userId FK
        datetime expiresAt
        boolean revoked
        string userAgent
        string ipAddress
        datetime createdAt
    }

    LoginHistory {
        int id PK
        int userId FK
        string ipAddress
        string userAgent
        string device
        string browser
        string os
        boolean successful
        string message
        datetime createdAt
    }

    Workspace {
        string id PK
        string name
        string slug UK
        string icon
        string description
        int userId FK
        datetime createdAt
        datetime updatedAt
    }

    Team {
        string id PK
        string workspaceId FK
        string name
        string key
        string icon
        datetime createdAt
        datetime updatedAt
    }

    TeamMember {
        string id PK
        string teamId FK
        int userId FK
        string name
        string email
        string avatar
        string role "OWNER | LEAD | MEMBER"
        datetime createdAt
    }

    MeetingNote {
        string id PK
        int userId FK
        string workspaceId FK
        string teamId FK
        string title
        string content
        string source "manual | upload | ongoing"
        string fileName
        int fileSize
        string status "draft | summarized"
        datetime createdAt
        datetime updatedAt
    }

    Summary {
        string id PK
        string noteId FK "UNIQUE"
        string content
        string keyPoints "JSON string[]"
        string decisions "JSON string[]"
        string participants "JSON string[]"
        string sentiment "positive | neutral | negative"
        int wordCount
        datetime createdAt
        datetime updatedAt
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
        datetime createdAt
        datetime updatedAt
    }

    Notification {
        string id PK
        int userId FK
        enum type "USER_CREATED | WORKSPACE_CREATED | TEAM_CREATED | ROLE_UPDATED | SYSTEM"
        string title
        string message
        boolean read
        json data
        datetime createdAt
        datetime updatedAt
    }
```

---

## 7. AI Pipeline & Intelligence Engine Architecture

The platform's AI core is engineered for zero-downtime intelligence, supporting multi-tier fallbacks, dynamic token throttling, and strict JSON schema validation.

```mermaid
flowchart TD
    subgraph Ingestion ["1. Multimodal Input Ingestion"]
        Input1["Live Speech Audio / WebRTC Stream"]
        Input2["Uploaded Audio (.mp3, .wav, .m4a)"]
        Input3["Uploaded Document (.pdf, .docx, .txt, .md)"]
        Input4["Manual Rich-Text Editor Notes"]
    end

    subgraph Processing ["2. Preprocessing & Normalization"]
        AudioTrans["Whisper / Audio Transcription API"]
        Chunker["Context-Aware Text Chunker (Max 32k Tokens)"]
        PromptBuilder["Structured System Prompt Injector"]
        Input1 --> AudioTrans
        Input2 --> AudioTrans
        AudioTrans --> Chunker
        Input3 --> Chunker
        Input4 --> Chunker
        Chunker --> PromptBuilder
    end

    subgraph Execution ["3. Multi-Tiered AI Execution Engine"]
        SDKInteractions["Tier 1: Google GenAI SDK (Interactions API)"]
        SDKGenerate["Tier 2: Google GenAI SDK (generateContent API)"]
        DirectREST["Tier 3: Direct Gemini v1beta REST Endpoint"]
        
        PromptBuilder --> SDKInteractions
        SDKInteractions -->|Success| JSONValidator
        SDKInteractions -->|Failure / 404| SDKGenerate
        SDKGenerate -->|Success| JSONValidator
        SDKGenerate -->|Failure / Rate Limit| DirectREST
        DirectREST --> JSONValidator
    end

    subgraph Output ["4. Structured JSON Output & Ingestion"]
        JSONValidator{"Zod JSON Schema Validation"}
        SummaryEntity["Summary Record\n- Executive Summary\n- Key Discussion Points\n- Key Decisions Made\n- Sentiment & Metrics"]
        ActionItems["Action Item Matrix\n- Priority: urgent/high/med/low\n- Assignee Recognition\n- Due Date Extraction\n- Kanban Status"]
        
        JSONValidator -->|Valid| SummaryEntity
        JSONValidator -->|Valid| ActionItems
        JSONValidator -->|Malformed| PromptRepair["Auto-Repair JSON Pass"]
        PromptRepair --> JSONValidator
    end

    subgraph Dispatch ["5. Persistence & Live Broadcast"]
        SummaryEntity --> DBWrite["Prisma Batch Transaction"]
        ActionItems --> DBWrite
        DBWrite --> SocketEmit["Socket.IO Live Broadcast to Workspace"]
    end
```

### 7.1 Structured AI Schema Contract

```json
{
  "summary": "Executive summary detailing the core objectives and outcomes of the session.",
  "keyPoints": [
    "Identified Q3 architecture milestones",
    "Agreed on database migration window"
  ],
  "decisions": [
    "Adopt Prisma ORM with PostgreSQL for persistent storage",
    "Deploy multi-stage Docker containers on staging cluster"
  ],
  "participants": [
    "Alex Chen",
    "Sarah Connor",
    "David Miller"
  ],
  "sentiment": "positive",
  "wordCount": 850,
  "actionItems": [
    {
      "title": "Provision PostgreSQL replica database",
      "assignee": "Alex Chen",
      "dueDate": "2026-09-01",
      "priority": "high",
      "status": "todo"
    }
  ]
}
```

---

## 8. Real-Time Collaboration & WebSocket Topology

The real-time collaboration engine utilizes **Socket.IO** with custom room multiplexing:

```
                          ┌──────────────────────────┐
                          │   Socket.IO Server Hub   │
                          └─────────────┬────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌───────────────┐               ┌───────────────┐               ┌───────────────┐
│  admin-room   │               │ user-{userId} │               │  team-{id}    │
│  - User regs  │               │ - Personal    │               │ - Live task   │
│  - System ops │               │   alerts      │               │   board moves │
│  - Error logs │               │ - AI complete │               │ - Team notes  │
└───────────────┘               └───────────────┘               └───────────────┘
```

### Event Specification Matrix

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-admin` | Client $\rightarrow$ Server | `void` | Subscribes privileged users to system administration events. |
| `join-user` | Client $\rightarrow$ Server | `{ userId: number }` | Subscribes client to targeted notifications and private AI outputs. |
| `notification` | Server $\rightarrow$ Client | `NotificationPayload` | Dispatches real-time toast alert & increments unread badge count. |
| `note:update` | Bi-directional | `{ noteId, content, delta }` | Synchronizes active meeting note editor between teammates. |
| `task:status_change` | Bi-directional | `{ taskId, status, teamId }` | Triggers reactive Kanban board card movement across clients. |

---

## 9. Security, Authentication & Governance Architecture

### 9.1 Dual-Token Authentication Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User Agent (Browser)
    participant AuthAPI as /api/v1/auth
    participant JWT as JWT Engine
    participant DB as PostgreSQL (refresh_tokens)

    User->>AuthAPI: POST /login { email, password }
    AuthAPI->>DB: Verify credentials (Bcrypt verify hash)
    DB-->>AuthAPI: User Validated
    AuthAPI->>JWT: Generate Access Token (15m expiry)
    AuthAPI->>JWT: Generate Refresh Token (7d expiry)
    AuthAPI->>DB: INSERT INTO refresh_tokens (token, userId, expiresAt, ip, ua)
    AuthAPI-->>User: 200 OK + Body { accessToken, user } + Set-Cookie: refreshToken (HttpOnly, Secure, SameSite)
    
    Note over User,AuthAPI: Subsequent API Request
    User->>AuthAPI: GET /api/v1/workspaces (Authorization: Bearer <accessToken>)
    AuthAPI-->>User: 200 OK (Protected Data)

    Note over User,AuthAPI: Access Token Expires
    User->>AuthAPI: POST /api/v1/auth/refresh-token (Cookie: refreshToken)
    AuthAPI->>DB: Check if refreshToken exists & revoked == false
    DB-->>AuthAPI: Valid Token Record
    AuthAPI->>DB: Revoke old refreshToken (Token Rotation)
    AuthAPI->>DB: INSERT new refreshToken
    AuthAPI->>JWT: Issue new Access Token
    AuthAPI-->>User: 200 OK + New Access Token + New HttpOnly Cookie
```

### 9.2 Role-Based Access Control (RBAC) Matrix

| Resource / Action | SUPER_ADMIN | ADMIN | MANAGER | EMPLOYEE | USER |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **System Settings & Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User Role Management & Bans** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Workspace Creation & Deletion** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Team Management & Invitations** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Create/Edit Meeting Notes** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Run AI Summarization & Extract Tasks** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Update Assigned Action Items** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 10. DevOps, Containerization & Deployment Architecture

### 10.1 Multi-Stage Docker Topology

```mermaid
flowchart TD
    subgraph Build_Stage ["Build Stage (Node.js 20 Alpine)"]
        SrcCode["Source Code & Dependencies"]
        PrismaGen["Prisma Client Generation (prisma generate)"]
        NextBuild["Next.js Production Build (next build -> Standalone)"]
        TSCompile["TypeScript Compilation (tsc -> dist/)"]
        SrcCode --> PrismaGen
        PrismaGen --> NextBuild
        PrismaGen --> TSCompile
    end

    subgraph Production_Containers ["Production Runtime Containers"]
        FrontContainer["Frontend Container (Port 3015)\n- Node.js Alpine Standalone\n- Static Assets Cached\n- Non-root User (nextjs:nodejs)"]
        BackContainer["Backend Container (Port 5015)\n- Node.js Express Runtime\n- Prisma Runtime Client\n- Non-root User (node:node)"]
    end

    subgraph Cloud_Infrastructure ["Target Infrastructure"]
        CaddyProxy["Caddy / Cloudflare Ingress (HTTPS)"]
        DBCloud["Neon Cloud PostgreSQL (SSL Enabled)"]
    end

    NextBuild --> FrontContainer
    TSCompile --> BackContainer
    CaddyProxy -->|Proxy 3015| FrontContainer
    CaddyProxy -->|Proxy 5015| BackContainer
    BackContainer -->|Prisma Connection Pool| DBCloud
```

### 10.2 Production Environment Variables Specification

#### Backend (`Backend/.env`)
```ini
NODE_ENV=production
PORT=5015
DATABASE_URL="postgresql://user:password@ep-sample-neon.region.neon.tech/notemeet?sslmode=require"
JWT_SECRET="super-secure-jwt-secret-min-32-chars-long"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="super-secure-refresh-jwt-secret-min-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"
COOKIE_SECRET="cookie-signing-secret"
CORS_ORIGIN="https://notemeet.ai,http://localhost:3015"
UPLOAD_PATH="uploads"
GEMINI_API_KEY="AIzaSyYourGoogleGenAIApiKey"
```

#### Frontend (`Frontend/.env`)
```ini
NEXT_PUBLIC_API_URL="http://localhost:5015/api/v1"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5015"
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSyYourGoogleGenAIApiKey"
NEXTAUTH_URL="http://localhost:3015"
NEXTAUTH_SECRET="nextauth-super-secret"
```

---

## 11. Architectural Verification & Quality Metrics

1. **Scalability**: Stateless Express API instances allow seamless horizontal autoscaling behind AWS ALB / GCP Cloud Run / Kubernetes Ingress.
2. **Reliability**: Multi-tier AI fallback guarantees that even during high-load Google SDK throttling, requests fall back directly to REST endpoints without dropping user notes.
3. **Auditability**: Complete user activity tracking with `LoginHistory`, IP address recording, User-Agent parsing, and structured Pino request logging.
4. **Data Integrity**: Foreign key constraints, atomic Prisma database transactions, and cascading deletes ensure clean data lifecycle management across workspaces, teams, notes, and action items.

---
*Document maintained by the NoteMeet-Ai Engineering Core Team.*
