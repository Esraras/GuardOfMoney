# 🚀 PostgreSQL Integration Guide

## What Was Added

Your GuardiansOfMoneyProject now has a complete PostgreSQL database setup with:

✅ **Backend Server** - Express.js API  
✅ **Database ORM** - Prisma for PostgreSQL  
✅ **Authentication** - JWT + Bcrypt password hashing  
✅ **API Routes** - Auth, Transactions, Categories  
✅ **Database Schema** - Users, Transactions, Categories  
✅ **Environment Config** - .env.local setup  
✅ **Seed Script** - Default test data  

---

## 📁 Project Structure (Updated)

```
GuardiansOfMoneyProject/
├── server/                    # ✨ NEW Backend
│   ├── index.js              # Express server entry
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   └── routes/
│       ├── auth.js           # Auth endpoints
│       ├── transactions.js    # Transaction endpoints
│       └── categories.js      # Category endpoints
├── prisma/                    # ✨ NEW Database
│   ├── schema.prisma         # Database schema
│   └── seed.js               # Seed data
├── src/                      # Frontend (React)
├── .env.local               # ✨ NEW Environment vars
├── .env.example             # ✨ NEW Example env
├── package.json             # ✨ UPDATED Scripts
└── DATABASE_SETUP.md        # ✨ NEW Setup guide
```

---

## ⚡ Quick Setup (5 minutes)

### Step 1: PostgreSQL Installation

**Windows:**
```bash
# Using Chocolatey
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
psql -U postgres

CREATE DATABASE money_guard_db;
\q
```

### Step 3: Configure Environment

```bash
# Copy example to local
cp .env.example .env.local

# Edit .env.local and update DATABASE_URL password
nano .env.local
```

Update this line with your PostgreSQL password:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/money_guard_db?schema=public"
```

### Step 4: Initialize Database

```bash
# Install dependencies
npm install

# Create tables
npm run db:push

# Seed with test data
npm run db:seed
```

### Step 5: Run Application

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npm run dev:server
```

Or use both simultaneously:
```bash
npm run dev:all
```

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/sign-up         # Register
POST   /api/auth/sign-in         # Login
GET    /api/auth/current         # Get user
DELETE /api/auth/sign-out        # Logout
```

### Transactions
```
GET    /api/transactions         # List all
POST   /api/transactions         # Create
PATCH  /api/transactions/:id     # Update
DELETE /api/transactions/:id     # Delete
GET    /api/transactions/category/:id  # By category
```

### Categories
```
GET    /api/categories           # List all
POST   /api/categories           # Create
PATCH  /api/categories/:id       # Update
DELETE /api/categories/:id       # Delete
```

---

## 🔐 Authentication Flow

1. **Register**: User submits email, username, password
2. **Hash Password**: Bcrypt hashes password (cost: 10)
3. **Create User**: Stored in PostgreSQL
4. **Generate Token**: JWT token with userId + 7 day expiry
5. **Login**: User submits email, password
6. **Verify**: Compare password hashes
7. **Return Token**: JWT for subsequent requests
8. **Protected Routes**: All require Bearer token

---

## 💾 Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT cuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  balance FLOAT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);
```

### Categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT cuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- "INCOME" or "EXPENSE"
  userId UUID NOT NULL REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),
  UNIQUE(userId, name)
);
```

### Transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT cuid(),
  amount FLOAT NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- "INCOME" or "EXPENSE"
  date TIMESTAMP NOT NULL,
  categoryId UUID NOT NULL REFERENCES categories(id),
  userId UUID NOT NULL REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);
```

---

## 📝 Environment Variables

### .env.local
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/money_guard_db?schema=public"

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"

# Node Environment
NODE_ENV="development"

# API Configuration
API_PORT=3001
CORS_ORIGIN="http://localhost:5173"

# Frontend API
VITE_API_URL="http://localhost:3001/api"
```

---

## 🛠️ Available Commands

### Database
```bash
npm run db:push       # Push schema changes
npm run db:migrate    # Create migration
npm run db:studio     # Visual database editor
npm run db:seed       # Seed test data
```

### Development
```bash
npm run dev           # Frontend (Vite)
npm run dev:server    # Backend (Node)
npm run dev:all       # Both simultaneously
npm run build         # Production build
npm run lint          # Code quality
```

---

## 🧪 Test Credentials

After seeding, use:

```
Email: test@example.com
Username: testuser
Password: password123
Balance: ₴5000
```

---

## 🔗 Frontend Integration

The frontend is already configured to use the backend API. The `config/userTransactionsApi.js` file handles:

✅ Base URL from `VITE_API_URL`  
✅ Automatic token injection  
✅ Request/response interceptors  
✅ Error handling with timeouts  

---

## 🐛 Troubleshooting

### "Database connection refused"
```bash
# Start PostgreSQL
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows: Start from Services or pgAdmin
```

### "Error: connect ECONNREFUSED"
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Verify password is correct

### "Port 3001 already in use"
Change `API_PORT=3002` in .env.local

### "Prisma Client Error"
```bash
npx prisma generate
npx prisma db push
```

### "No auth token"
- Login first to get token
- Token sent as `Authorization: Bearer <token>`
- Token expires after 7 days

---

## 📈 Performance Tips

1. **Indexes** - Already set on userId and date
2. **Connection Pooling** - Use pgBouncer for production
3. **Caching** - Add Redis for frequently accessed data
4. **Query Optimization** - Prisma handles this well

---

## 🚀 Production Deployment

### 1. Use Managed Database Service
- **Vercel PostgreSQL**
- **AWS RDS**
- **Heroku PostgreSQL**
- **Render**
- **DigitalOcean**

### 2. Update Environment
```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/db"
JWT_SECRET="new-strong-secret"
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com"
```

### 3. Deploy Backend
```bash
npm install
npm run db:push
node server/index.js
```

### 4. Environment Secrets
Store sensitive data in:
- **Vercel**: Settings → Environment Variables
- **Heroku**: Settings → Config Vars
- **Railway**: Variables
- **Render**: Environment

---

## 📚 Useful Resources

- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Auth](https://jwt.io/)
- [Bcrypt Hashing](https://github.com/kelektiv/node.bcrypt.js)

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `money_guard_db` created
- [ ] `.env.local` configured with DATABASE_URL
- [ ] `npm install` completed
- [ ] `npm run db:push` successful
- [ ] `npm run db:seed` completed
- [ ] Frontend running: `npm run dev`
- [ ] Backend running: `npm run dev:server`
- [ ] Can login with test@example.com
- [ ] Can create transactions
- [ ] Can view statistics

---

## 🎉 You're All Set!

Your GuardiansOfMoneyProject now has:
- ✅ Full-stack application (Frontend + Backend)
- ✅ PostgreSQL database
- ✅ User authentication
- ✅ Complete API
- ✅ Data persistence

**Ready to start building! 🚀**

---

*Integration Date: January 22, 2026*  
*Database: PostgreSQL*  
*ORM: Prisma*  
*Status: Complete*
