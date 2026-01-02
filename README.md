# FlowOps

<div align="center">

**A modern, full-stack project management application inspired by Jira**

Built with the MERN stack (MongoDB, Express.js, React, Node.js)

[![CI Pipeline](https://github.com/DevITJAX/FlowOps/actions/workflows/ci.yml/badge.svg)](https://github.com/DevITJAX/FlowOps/actions/workflows/ci.yml)

</div>

---

## ✨ Features

### Project Management
- **Projects** – Create and manage multiple projects with customizable settings
- **Tasks** – Full task lifecycle management with priorities, statuses, and assignments
- **Sprints** – Plan and track work in agile sprints
- **Backlog** – Organize and prioritize upcoming work

### Team Collaboration
- **Teams** – Create teams with role-based access (Admin, Member, Viewer)
- **Comments** – Discuss tasks with threaded comments
- **Attachments** – Upload and manage files on tasks
- **Real-time Updates** – Live notifications via WebSocket (Socket.IO)

### Tracking & Analytics
- **Time Logging** – Track time spent on tasks
- **Activity Feed** – Monitor project activity
- **Reports** – Generate insights and analytics
- **Labels** – Categorize and filter tasks

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, React Router, Bootstrap 5, Axios, Socket.IO Client |
| **Backend** | Node.js, Express 5, Mongoose, JWT Authentication, Socket.IO |
| **Database** | MongoDB |
| **DevOps** | Docker, GitHub Actions (CI/CD), Azure App Services |
| **Testing** | Jest, Supertest, MongoDB Memory Server |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### Option 1: Docker Compose (Recommended)

The easiest way to run FlowOps locally:

```bash
# Clone the repository
git clone https://github.com/DevITJAX/FlowOps.git
cd FlowOps

# Start all services
docker-compose up --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB**: localhost:27017

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/flowops
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

---

## 📁 Project Structure

```
FlowOps/
├── backend/
│   ├── config/          # Database & app configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── tests/           # Jest test suites
│   └── server.js        # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context providers
│   │   ├── pages/       # Page components
│   │   └── services/    # API service layer
│   └── index.html
│
├── .github/workflows/   # CI/CD pipelines
├── docker-compose.yml   # Multi-container setup
└── seed-data.js         # Database seeding script
```

---

## 🔌 API Endpoints

The backend exposes a RESTful API:

| Resource | Endpoints |
|----------|-----------|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login` |
| **Users** | `GET /api/users`, `PUT /api/users/:id` |
| **Projects** | `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id` |
| **Tasks** | `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id` |
| **Sprints** | `GET /api/sprints`, `POST /api/sprints` |
| **Teams** | `GET /api/teams`, `POST /api/teams` |
| **Comments** | `GET /api/comments`, `POST /api/comments` |

Full API documentation available via Swagger at `/api-docs` when running the backend.

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage
```

---

## ☁️ Deployment

FlowOps includes GitHub Actions workflows for CI/CD:

- **CI Pipeline** (`ci.yml`) – Runs on every push/PR to validate builds
- **CD Pipeline** (`cd.yml`) – Deploys to Azure App Services

See `.github/workflows/cd.yml` for Azure deployment configuration and required secrets.

---

## 📄 License

This project is licensed under the ISC License.

---

<div align="center">

**[⬆ Back to Top](#flowops)**

</div>
