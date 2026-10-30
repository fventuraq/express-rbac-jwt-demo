# Simple RBAC & JWT Authentication Demo

Basic Node.js API demonstrating Role-Based Access Control (RBAC) and JSON Web Tokens (JWT).

## Prerequisites
- Node.js v18+
- PostgreSQL

## Setup
1. Clone repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Create database and run `schema.sql`.
4. Configure `.env` file based on `.env.example`.
5. Start server: `npm start`

## API Endpoints
- `POST /api/auth/login` - Authenticate user & return JWT.
- `GET /api/roles` - Protected route (requires `Authorization: Bearer <token>`).