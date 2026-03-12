# Artist Management System

A full-stack web application for managing artists, their music, and user accounts. Built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

- **User Management** - Create, update, and manage user accounts with role-based access
- **Artist Management** - Add artists with details like name, DOB, gender, address, release year, and album count
- **Music Library** - Track songs for each artist with album names and genress
- **Authentication** - Secure JWT-based authentication with refresh token support
- **Soft Delete** - Records are soft-deleted, allowing data recovery and re-creation with the same information
- **Performance Optimized** - Lazy loading, memoized components, and optimized rendering
- **Responsive UI** - Clean, modern interface built with Tailwind CSSs

## Tech Stack

### Backend

- **Node.js** + **Express** - REST API server
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database
- **JWT** - Authentication with access and refresh tokens
- **Bcrypt** - Password hashing
- **Zod** - Schema validation

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **Axios** - HTTP client

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd artist-management-system
```

### 2. Database Setup

First, create a PostgreSQL database:

```bash
psql -U postgres

CREATE DATABASE artist_management;

\q
```

### 3. Backend Setup

```bash

cd backend

npm install


cp .env.example .env
```

Edit the `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/artist_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=3000
```

Run database migrations to set up the schema:

```bash
npm run migrate
```

Start the backend server:

```bash
npm run dev
```

The backend will be running at `http://localhost:3000`

### 4. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend

npm install

cp .env.example .env
```

Edit `.env` if you need to change the backend API URL:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## Project Structure

```
artist-management-system/
├── backend/
│   ├── db/
│   │   ├── migrations/      # Database migration files
│   │   └── schema/          # Database schema definitions
│   ├── src/
│   │   ├── config/          # Configuration files (database, etc.)
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware (auth, error handling)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic layer
│   │   ├── tools/           # Migration runner and utilities
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper functions
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── context/         # React context (Auth)
    │   ├── hooks/           # Custom React hooks
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   └── types/           # TypeScript types
    └── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user

### Artists

- `GET /api/artists` - Get all artists (paginated)
- `GET /api/artists/:id` - Get artist by ID
- `POST /api/artists` - Create new artist
- `PUT /api/artists/:id` - Update artist
- `DELETE /api/artists/:id` - Soft delete artist

### Music

- `GET /api/music/artist/:artistId` - Get music by artist (paginated)
- `GET /api/music/:id` - Get music by ID
- `POST /api/music` - Create new music
- `PUT /api/music/:id` - Update music
- `DELETE /api/music/:id` - Soft delete music

## Usage

1. **Register/Login** - Start by creating an account or logging in
2. **Dashboard** - View overview of users, artists, and music
3. **Manage Users** - Add, edit, or remove users from the system
4. **Manage Artists** - Create artist profiles with details
5. **Add Music** - Associate songs with artists, including album and genre information

## Development

### Running Tests

```bash
cd backend
npm run dev

cd frontend
npm run dev

```

### Building for Production

```bash
cd backend
npm run build

cd frontend
npm run build
```

### Database Migrations

To create a new migration:

```bash
cd backend

npm run migrate
```

## Features in Detail

### Soft Delete Implementation

All main entities (users, artists, music) use soft delete:

- Records are marked with `deleted_at` timestamp instead of being removed
- Queries automatically filter out deleted records
- Unique constraints only apply to active (non-deleted) records
- Users can re-register with the same email after deletion
- Artists can be re-created with the same name after deletion

### Authentication Flow

1. User registers or logs in
2. Server returns access token (15min expiry) and refresh token (30 days)
3. Access token is used for API requests
4. When access token expires, refresh token is used to get a new one
5. Refresh tokens are stored in database and invalidated on logout

### Performance Optimizations

- React.lazy for code splitting and lazy loading pages
- React.memo on components to prevent unnecessary re-renders
- useCallback for event handlers
- useMemo for expensive computations
- Memoized table sub-components for efficient rendering

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secret_key
PORT=3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```
