# FlowOps - MERN Stack Project Management App

A full-stack project management application built with the **MERN stack** (MongoDB, Express, React, Node.js) demonstrating modern DevOps practices with an automated CI/CD pipeline.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Bootstrap 5, Bootstrap Icons |
| **Backend** | Express.js, Node.js 20 |
| **Database** | MongoDB 7 with Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens) |
| **DevOps** | Docker, Docker Compose, GitHub Actions, Azure |

## 📦 Features

- **User Authentication**: Register, login, JWT-based sessions
- **Role-Based Access**: Admin, Project Manager, Member roles
- **Project Management**: Create, update, delete projects with status tracking
- **Task Board**: Kanban-style task management with priorities and due dates
- **Activity Logging**: Track all system events
- **Responsive UI**: Modern Bootstrap 5 design with dark sidebar

## 🏃 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Docker)
- npm or yarn

### Option 1: Docker Compose (Recommended)

```bash
# Clone and start
git clone <repository-url>
cd FlowOps
docker-compose up -d

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Option 2: Manual Setup

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/flowops
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:projectId/tasks` | Get tasks for project |
| POST | `/api/projects/:projectId/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/activity` | Get activity logs |

## 🏗️ Project Structure

```
FlowOps/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   └── services/    # API service
│   └── nginx.conf       # Production config
├── .github/workflows/   # CI/CD pipelines
├── docker-compose.yml   # Local development
└── README.md
```

## 🔐 Default Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, manage users |
| **Project Manager** | Manage projects and tasks |
| **Member** | View and update assigned tasks |

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run build  # Build verification
```

## 🚢 Deployment

The project includes GitHub Actions workflows for:
- **CI**: Automated testing and Docker builds
- **CD**: Azure Container Registry and App Service deployment

See `.github/workflows/` for details.

## 📄 License

MIT
