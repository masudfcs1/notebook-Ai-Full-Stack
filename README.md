# NoteMeet-Ai (Notebook-Ai-Full-Stack)

A powerful, full-stack enterprise-grade application for note-taking and AI-powered collaboration. Built with a modern tech stack featuring Next.js for the frontend and Node.js/Express for the backend.

## 🚀 Core Features

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

## 📂 Project Structure

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
