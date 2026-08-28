# Notebook — Full-Stack Notes App

A per-user notes application with authentication, category management, and full CRUD — built end-to-end in React, Typescript and PostgreSQL.

## Stack
- **Backend:** Node.js, Express, PostgreSQL, express-session (bcrypt-hashed passwords, session-based auth)
- **Frontend:** React, TypeScript

## Features
- Signup/login/logout with per-user session-based authentication
- Notes: create, read, update, delete — scoped to the logged-in user
- Categories: create, delete, filter notes by category
- Responsive UI with a collapsible sidebar drawer on mobile

## Running locally

```bash
npm install
npm run install:all
```

Copy `.env.example` to `.env` inside `server/` and fill in your own values:
```bash
cp server/.env.example server/.env
```

Then start the full application:
```bash
npm run dev
```
- Server: http://localhost:3000
- Client: http://localhost:5173