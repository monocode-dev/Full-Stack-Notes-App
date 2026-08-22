# Notebook — Full-Stack Notes App

A per-user notes application with authentication, category management, and full CRUD — built end-to-end in TypeScript and React.

## Stack
- **Backend:** Node.js, Express, better-sqlite3, express-session (bcrypt-hashed passwords, session-based auth)
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

Create a `.env` file inside `server/`:


Then start the full application:
```bash
npm run dev
```
- Server: http://localhost:3000
- Client: http://localhost:5173

## Project structure