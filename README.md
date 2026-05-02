# Merchant Expense & Debt Tracker (Production Edition)

A premium, stable, and persistent financial tracking system designed for small to medium-sized merchants.

## 🚀 Quick Start (Production)

The easiest way to run the entire stack is using **Docker**.

### Prerequisites
- Docker and Docker Compose installed.
- A `.env` file in the root (see `.env.example`).

### Deployment Steps
1. **Configure Environment**
   Create a `.env` file in the root:
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_NAME=merchant_db
   JWT_SECRET=your_jwt_secret
   ```

2. **Launch the Stack**
   ```bash
   docker-compose up --build -d
   ```
   This will start:
   - **PostgreSQL**: Database (Port 5432)
   - **Backend API**: Node.js (Port 5000)
   - **Frontend**: Next.js (Port 3000)

3. **Initialize Database**
   ```bash
   docker-compose exec backend npx prisma db push
   ```

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Zustand, Recharts.
- **Backend**: Node.js, Express, Socket.io, Winston Logging.
- **Database**: PostgreSQL with Prisma ORM.
- **Security**: JWT Auth, Bcrypt, Helmet, Express-Rate-Limit.

## 🛡️ Key Production Features
- **Data Integrity**: Atomic transactions using Prisma `$transaction`.
- **Performance**: Strategic indexing on all high-traffic tables.
- **Observability**: Structured JSON logging for production monitoring.
- **Reliability**: Request deduplication and sync guards to prevent race conditions.
- **Security**: Protected against Brute Force, XSS, and SQL Injection.

## 🧪 Testing
Run backend tests:
```bash
cd backend
npm test
```

## 📜 Maintenance
To view logs:
```bash
docker-compose logs -f backend
```

To stop the system:
```bash
docker-compose down
```
