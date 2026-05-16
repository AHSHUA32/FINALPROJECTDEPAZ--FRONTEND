# FINALPROJECTDEPAZ — Frontend (Angular 21)

## 🚀 Live Deployment
- **Frontend (Vercel):** https://finalprojectdepaz-frontend.vercel.app
- **Backend API (Render):** https://finalprojectdepaz-backend.onrender.com
- **Swagger API Docs:** https://finalprojectdepaz-backend.onrender.com/api-docs
- **Backend Repository:** https://github.com/AHSHUA32/FINALPROJECTDEPAZ--BACKEND

## 📋 Project Overview
Full-stack Angular 21 + Node.js/MySQL authentication system with:
- JWT Access Tokens (15-min expiry, stored in memory)
- HTTP-Only Refresh Token Cookies (7-day rotation)
- Role-Based Access Control (Admin / User)
- Email Verification via Nodemailer (Ethereal preview in logs)
- Angular lazy-loaded modules: Account, Profile, Admin

## 🏗️ Architecture
```
Angular 21 (Frontend)          Node.js Express (Backend)
├── AccountModule   ────────►  POST /accounts/authenticate
├── ProfileModule   ────────►  GET  /accounts/:id
├── AdminModule     ────────►  GET  /accounts (Admin only)
└── FakeBackend    (Stage A)   MySQL (Railway) ← stores users/tokens
```

## 🧪 Stage A — Fake Backend (Offline Testing)
The `fakeBackendProvider` is enabled in `app.module.ts`. Run locally:
```bash
npm install
npm start
# Open http://localhost:4200
```
1. Register a new account → check browser alert for mock email link
2. First registered account becomes **Admin**
3. Login → Admin sees Admin panel, User does not

## 🔗 Stage B — Live Integration Testing
Production build connects to the live Render backend automatically.
Visit: https://finalprojectdepaz-frontend.vercel.app

## ⚙️ Local Setup
```bash
git clone https://github.com/AHSHUA32/FINALPROJECTDEPAZ--FRONTEND.git
cd FINALPROJECTDEPAZ--FRONTEND
npm install
npm start
```

## 🏭 Production Build
```bash
ng build --configuration production
# Output: dist/angular-auth-boilerplate/browser/
```

## 🔒 Security
- JWT secret stored in backend `.env` (never committed)
- Refresh token in `httpOnly` cookie (not accessible by JavaScript)
- CORS restricted to Vercel frontend URL only
