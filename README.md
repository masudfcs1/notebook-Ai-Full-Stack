# NoteMeet-Ai (Notebook-Ai-Full-Stack)

A powerful, full-stack enterprise-grade application for note-taking and AI-powered collaboration. Built with a modern tech stack featuring Next.js for the frontend and Node.js/Express for the backend.

## Core Features

- **Enterprise-Grade Authentication**: Secure authentication system featuring JWT access and refresh tokens, HTTP-only cookies, OTP support, and email verification.
- **Role-Based Access Control (RBAC)**: Fine-grained access management with roles such as Super Admin, Admin, Manager, Employee, and User.
- **Advanced Note-Taking & MDX**: Rich text editing and markdown support using `@mdxeditor/editor` and `react-markdown`.
- **AI Integration**: Built-in AI features powered by `z-ai-web-dev-sdk` to assist in generating, summarizing, and managing notes.
- **Interactive UI**: Drag-and-drop capabilities (`@dnd-kit`), responsive design, and accessible components built with Tailwind CSS and Shadcn UI.
- **Internationalization (i18n)**: Multi-language support built right in using `next-intl`.
- **Robust State Management**: Combining Redux Toolkit and Zustand for efficient client-side state, along with TanStack React Query for server state caching.
- **Database Management**: PostgreSQL (Supabase) integration managed safely and efficiently through Prisma ORM on both frontend and backend.
- **Clean Architecture**: Backend strictly adheres to SOLID principles, repository patterns, and feature-based modules for maximum scalability.

## 💻 Tech Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Shadcn UI, Radix UI
- **State Management**: Redux Toolkit, Zustand, React Query
- **Authentication**: NextAuth.js
- **Forms & Validation**: React Hook Form, Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Security**: Helmet, CORS, Express Rate Limiter, Bcrypt
- **Validation**: Zod
- **Logging**: Pino

## 📂 Project Structures

```text
NoteMeet-Ai/
├── Backend/                 # Express.js REST API server
│   ├── src/                 # Backend source code
│   ├── prisma/              # Backend database schema and migrations
│   └── package.json         # Backend dependencies
├── Frontend/                # Next.js web application
│   ├── src/                 # Frontend source code
│   ├── public/              # Static assets
│   ├── prisma/              # Frontend database schema (if applicable)
│   └── package.json         # Frontend dependencies
└── package.json             # Root workspace package.json
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm or bun
- PostgreSQL database

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd NoteMeet-Ai
   ```

2. **Install dependencies for both Frontend and Backend:**
   ```bash
   npm run postinstall
   ```
   *(This will run `npm install` in both the `Frontend` and `Backend` directories)*

3. **Set up environment variables:**
   - Create a `.env` file in the `Backend` directory based on `Backend/.env.example`.
   - Create a `.env` file in the `Frontend` directory with necessary keys (NextAuth secret, API URLs, etc.).

4. **Initialize the Database:**
   Navigate to the Backend directory and run migrations:
   ```bash
   cd Backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

### Running the Application

To run both the frontend and backend development servers concurrently from the root directory:

```bash
npm run dev
```

- **Frontend** will typically be available at `http://localhost:3000`
- **Backend** will typically be available at the port specified in your `.env` file (e.g., `http://localhost:5000`)

## 🏗 Frontend Architecture Analysis

This document provides a comprehensive overview of the frontend architecture, state management, UI components, and routing strategy for the **NoteMeet-Ai** (NoteFlow AI) application.

### Core Architecture

The frontend is built using **Next.js 16** (with React 19) utilizing the modern **App Router** (`src/app`). 
Interestingly, despite being a Next.js application, the core user experience is designed as a **Single Page Application (SPA)** within the main layout. 

Instead of traditional Next.js file-system routing for every screen, the application relies on a Redux-managed "view" state to render different screens (e.g., Dashboard, Upload, Action Items) seamlessly without full page reloads.

### State Management (Redux Toolkit)

The application state is deeply integrated with **Redux Toolkit**, located in `src/lib/redux/`. It is divided into two primary slices:

#### 1. `appSlice.ts` (UI State)
Manages the global user interface state and layout interactions.
- **`view`**: Determines the currently active screen (`landing`, `dashboard`, `ongoing`, `upload`, `summary`, `action-items`, `history`, `settings`).
- **Sidebar & Nav**: Controls the collapsed state of the sidebar and mobile navigation.
- **Notifications**: An array of `NotificationItem` objects to handle in-app alerts (e.g., "Summary ready", "Storage almost full").
- **Search & AI Widget**: Controls the global search query and the visibility of the AI assistant widget.

#### 2. `dataSlice.ts` (Application Data)
Manages the core business data entities and mock/seed data during development.
- **Notes (`MeetingNote`)**: Stores meeting notes with their source (`manual`, `upload`, `ongoing`) and status (`draft`, `summarized`).
- **Summaries (`Summary`)**: Contains AI-generated summaries, key points, decisions, extracted participants, and sentiment analysis.
- **Tasks (`ActionItem`)**: Manages the task board with priorities and statuses (`pending`, `in_progress`, `completed`).
- **Loading States**: Flags for standard loading and AI `generating` states.

### UI & Styling

The application aims for a highly premium, animated, and responsive user interface.

- **Tailwind CSS**: The primary styling engine, heavily utilizing CSS variables for theme colors (`bg-background`, `text-foreground`), and rich gradients (e.g., `from-indigo-500 to-violet-500`).
- **Shadcn UI & Radix UI**: An extensive set of accessible, headless components are implemented in `src/components/ui`. This includes complex components like `resizable`, `command`, `carousel`, `sheet`, and `dialog`.
- **Framer Motion**: Used extensively across views (like `dashboard-view.tsx`) for micro-animations, layout transitions, stagger effects, and dynamic charts (e.g., animating the height of the weekly chart bars).
- **Icons & Typography**: Utilizes `lucide-react` for clean, consistent iconography and the `Inter` font from Google Fonts.

### Component Structure

#### Views (`src/components/views/`)
These act as the "pages" of the application, rendered dynamically based on the Redux `appSlice`:
- `dashboard-view.tsx`: The main hub showing productivity statistics, a weekly chart, and recent activity.
- `action-items-view.tsx`: The Kanban-style task management board.
- `summary-view.tsx` & `upload-view.tsx`: Screens handling the core AI generation and file upload flows.
- `ongoing-view.tsx`: Interface for capturing live meeting notes.
- `landing-view.tsx`: The initial marketing/landing page.

#### Core Layout (`src/app/layout.tsx`)
Wraps the application in a unified `<Providers>` component which injects the Redux store, ThemeProvider, NextAuth sessions, and Toast providers (both standard Shadcn toasts and `sonner` rich toasts).

### AI Integration & Features

- The application uses `z-ai-web-dev-sdk` (as seen in `package.json`) which likely powers the note summarization, task extraction, and sentiment analysis logic handled in the `dataSlice`.
- The UX is heavily optimized to show the transition between "Draft" notes and "Summarized" notes, with dedicated AI generating states.
