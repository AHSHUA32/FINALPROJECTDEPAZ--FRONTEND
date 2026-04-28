# Angular Auth Boilerplate — Final Project (DEPAZ)

A full-stack Angular 21 + Node.js application featuring JWT authentication, refresh tokens, role-based access control (RBAC), and email verification.

---

## 🔗 Live Links

| Service | URL |
|---|---|
| **Frontend (Vercel)** | `https://YOUR-FRONTEND-URL.vercel.app` ← *Update after deployment* |
| **Backend API (Render)** | `https://YOUR-BACKEND-URL.onrender.com` ← *Update after deployment* |
| **Swagger API Docs** | `https://YOUR-BACKEND-URL.onrender.com/api-docs` |

---

## 📁 Repositories

| Repo | URL |
|---|---|
| **Frontend** | `https://github.com/YOUR_USERNAME/LAB7DEPAZ` |
| **Backend** | `https://github.com/YOUR_USERNAME/LAB7DEPAZ-backend` |

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MySQL 8
- Angular CLI (`npm install -g @angular/cli`)

---

### Frontend

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/LAB7DEPAZ.git
cd LAB7DEPAZ

# 2. Install dependencies
npm install

# 3. Run in development mode (fake backend enabled by default)
npm start
# Visit http://localhost:4200
```

**To run with the real backend**, update `src/environments/environment.development.ts`:
```ts
export const environment = {
    production: false,
    apiUrl: 'http://localhost:4000'
};
```
Then disable the `fakeBackendProvider` line in `src/app/app.module.ts`.

---

### Backend

```bash
# 1. Clone the backend repo
git clone https://github.com/YOUR_USERNAME/LAB7DEPAZ-backend.git
cd LAB7DEPAZ-backend

# 2. Install dependencies
npm install

# 3. Copy environment file and fill in your values
cp .env.example .env

# 4. Run database migrations
npm run migrate

# 5. Start the server
npm run dev
# API runs on http://localhost:4000
# Swagger docs at http://localhost:4000/api-docs
```

---

## 🏗️ Architecture

```
Frontend (Angular 21)          Backend (Node.js + Express)
       │                                │
       │──── HTTP + JWT Bearer ────────▶│
       │                                │──── MySQL (PlanetScale/Railway)
       │◀─── JSON + refreshToken ───────│
       │       (httpOnly cookie)        │──── Nodemailer (Ethereal SMTP)
```

---

## 🔐 Features

- **Registration** with email verification token
- **Login** with JWT (15 min) + refresh token (7 days, httpOnly cookie)
- **Role-Based Access Control**: `Admin` (first user) and `User`
- **Admin Panel**: Manage all accounts
- **Forgot / Reset Password** via email link
- **Swagger UI** at `/api-docs`
- **Fake Backend** for offline testing (Stage A demo)

---

## 🧪 Evaluation Guide

### Stage A — Fake Backend (Offline Demo)
The fake backend is **enabled by default** in `src/app/app.module.ts`.
Run `npm start` and demonstrate: Register → Verify Email (link shown in alert) → Login → Admin panel.

### Stage B — Live Backend Integration
1. Deploy the backend and get its public URL.
2. Update `src/environments/environment.prod.ts` with the backend URL.
3. Run `ng build --configuration production`.
4. Deploy the `dist/` folder to Vercel.
5. Demonstrate the full auth flow with a real MySQL database.

---

## 📜 Production Build

```bash
ng build --configuration production
```
Output is in `dist/angular-auth-boilerplate/browser/`. Deploy this folder to Vercel.
