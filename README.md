# 💼 Merchant Expense & Debt Tracker (Production Edition)

A **premium, scalable, and production-ready financial management system** designed for small to medium-sized merchants to track expenses, sales, and debts with accuracy and real-time insights.

---

## 🌐 Live Application

🚀 **Frontend (Vercel):**  
👉 https://tracker-kohl-seven.vercel.app/

---

## ⚙️ Full System Architecture

```
Frontend (Next.js - Vercel)
        ↓
Backend API (Node.js - Render)
        ↓
Database (PostgreSQL - Neon / Docker)
```

---

## 🚀 Quick Start (Docker - Recommended)

Run the full production stack in seconds.

### 🔹 Prerequisites
- Docker
- Docker Compose

---

### 🔹 1. Environment Setup

Create a `.env` file in the root directory:

```env
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=merchant_db
JWT_SECRET=your_super_secure_secret
```

---

### 🔹 2. Start All Services

```bash
docker-compose up --build -d
```

### This will start:
- 🐘 PostgreSQL → `localhost:5432`
- ⚙️ Backend API → `localhost:5000`
- 🌐 Frontend → `localhost:3000`

---

### 🔹 3. Initialize Database

```bash
docker-compose exec backend npx prisma db push
```

---

## 🧠 Tech Stack

### Frontend
- Next.js 16 (App Router)
- Tailwind CSS
- Zustand (State Management)
- Recharts (Analytics)

### Backend
- Node.js + Express
- Prisma ORM
- Socket.io (Real-time updates)
- Winston (Logging)

### Database
- PostgreSQL (Docker / Neon)

### Security
- JWT Authentication
- Bcrypt Password Hashing
- Helmet (HTTP Security)
- Express Rate Limit (Anti-Brute Force)

---

## 🛡️ Production Features

### 🔒 Security
- XSS Protection
- SQL Injection Protection
- Rate Limiting
- Secure JWT Authentication

### ⚡ Performance
- Indexed database queries
- Optimized API responses
- Efficient state management

### 🔄 Reliability
- Atomic transactions using Prisma `$transaction`
- Request deduplication
- Sync guards to prevent race conditions

### 📊 Observability
- Structured JSON logging
- Error tracking ready
- Debug-friendly logs

---

## 🔗 Environment Variables (Production)

### Backend (Render)

```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=https://tracker-kohl-seven.vercel.app
```

---

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_APP_NAME=Merchant Tracker
NEXT_PUBLIC_DEFAULT_CURRENCY=ETB
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## 🔌 API Connection (Important)

All frontend requests must use:

```js
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/...`)
```

---

## 🔐 CORS Configuration (Backend)

```js
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://tracker-kohl-seven.vercel.app"
  ],
  credentials: true
}));
```

---

## 🧪 Testing

Run backend tests:

```bash
cd backend
npm test
```

---

## 📜 Maintenance

### View Logs
```bash
docker-compose logs -f backend
```

### Stop Services
```bash
docker-compose down
```

---

## 🚀 Deployment Guide

### Frontend (Vercel)
- Connect GitHub repo
- Add environment variables
- Deploy

### Backend (Render)
- Create Web Service
- Add environment variables
- Deploy & enable auto-deploy

---

## 💡 Future Improvements

- 📱 Mobile App Version
- 📊 Advanced AI Financial Insights
- 📤 PDF & Excel Export Reports
- 🌍 Multi-language (Amharic Support)
- 🔄 Offline Mode Sync

---

## 👨‍💻 Author

**Merchant Financial System - Production Build**

---

## ⭐ Final Note

This system is built to be:
- Stable
- Scalable
- Secure
- Production-ready

Perfect for real-world merchant financial management.

---
