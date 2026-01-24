# ⚡ PostgreSQL Integration - Quick Reference

## ✅ What Was Added

### Files Created (15 new files)
```
✅ server/index.js                    - Express backend server
✅ server/middleware/auth.js          - JWT authentication middleware
✅ server/routes/auth.js              - Authentication endpoints
✅ server/routes/transactions.js      - Transaction CRUD endpoints
✅ server/routes/categories.js        - Category CRUD endpoints
✅ prisma/schema.prisma              - Database schema definition
✅ prisma/seed.js                    - Test data seeding script
✅ .env.local                        - Environment configuration
✅ .env.example                      - Environment template
✅ DATABASE_SETUP.md                 - Detailed setup guide
✅ POSTGRESQL_SETUP.md               - Integration guide
```

### Files Updated (2 files)
```
✅ package.json                      - Added backend scripts & dependencies
✅ .gitignore                        - Added .env & database files
```

---

## 🚀 First Time Setup (Copy & Paste)

```bash
# 1. Create PostgreSQL database
createdb -U postgres money_guard_db

# 2. Update .env.local with your password
# Edit .env.local line 1 and change "password" to your PostgreSQL password

# 3. Install dependencies
npm install

# 4. Create database tables
npm run db:push

# 5. Seed with test data
npm run db:seed

# 6. Run frontend (Terminal 1)
npm run dev

# 7. Run backend (Terminal 2)
npm run dev:server
```

---

## 📊 Database Overview

| Table | Purpose | Fields |
|-------|---------|--------|
| **users** | User accounts | id, email, username, password (hashed), balance |
| **categories** | Transaction categories | id, name, type (INCOME/EXPENSE), userId |
| **transactions** | Financial transactions | id, amount, description, type, date, categoryId, userId |

---

## 🔗 API Endpoints Quick List

### Auth
```
POST   /api/auth/sign-up      { email, username, password }
POST   /api/auth/sign-in      { email, password }
GET    /api/auth/current      (requires token)
DELETE /api/auth/sign-out     (requires token)
```

### Transactions
```
GET    /api/transactions      (requires token)
POST   /api/transactions      { amount, type, date, categoryId }
PATCH  /api/transactions/:id  { optional fields }
DELETE /api/transactions/:id
```

### Categories
```
GET    /api/categories        (requires token)
POST   /api/categories        { name, type }
PATCH  /api/categories/:id    { name, type }
DELETE /api/categories/:id
```

---

## 🧪 Test It

### 1. Register
```bash
curl -X POST http://localhost:3001/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"myuser","password":"pass123"}'
```

### 2. Get Token & Use It
```bash
# Login to get token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' | jq -r '.token')

# Get current user
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/current
```

---

## 📋 Commands

### Database Management
```bash
npm run db:push       # Apply schema changes
npm run db:migrate    # Create new migration
npm run db:studio     # Open Prisma Studio (visual DB)
npm run db:seed       # Seed test data
```

### Development
```bash
npm run dev           # Frontend only
npm run dev:server    # Backend only  
npm run dev:all       # Both (requires concurrently)
```

### Production
```bash
npm run build         # Build frontend
npm run lint          # Check code quality
```

---

## 🔐 Authentication

**How it works:**
1. User registers with email, username, password
2. Password hashed with bcrypt (10 rounds)
3. User logs in with email + password
4. Server returns JWT token (7 day expiry)
5. Client sends `Authorization: Bearer <token>` with requests
6. Server verifies token before accessing protected routes

**Token Format:**
```json
{
  "userId": "user-id-here",
  "iat": 1705920000,
  "exp": 1706524800
}
```

---

## 🧬 Database Schema

```prisma
model User {
  id        String       @id @default(cuid())
  email     String       @unique
  username  String       @unique
  password  String       // Hashed with bcrypt
  balance   Float        @default(0)
  
  transactions Transaction[]
  categories   Category[]
}

model Category {
  id        String  @id @default(cuid())
  name      String
  type      String  // "INCOME" or "EXPENSE"
  userId    String
  user      User    @relation(fields: [userId])
  
  transactions Transaction[]
}

model Transaction {
  id        String   @id @default(cuid())
  amount    Float
  type      String   // "INCOME" or "EXPENSE"
  date      DateTime
  categoryId String
  category  Category @relation(fields: [categoryId])
  userId    String
  user      User     @relation(fields: [userId])
}
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| PostgreSQL not running | `brew services start postgresql@15` (macOS) |
| Port 3001 in use | Change `API_PORT=3002` in .env.local |
| Database not found | Run `createdb -U postgres money_guard_db` |
| Schema errors | Run `npm run db:push` again |
| Token expired | User must login again |
| CORS error | Check `CORS_ORIGIN` in .env.local |

---

## 📁 Environment File

Create or update `.env.local`:

```env
# Required
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/money_guard_db?schema=public"
JWT_SECRET="any-random-secret-key"

# Optional (defaults shown)
NODE_ENV=development
API_PORT=3001
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3001/api
```

---

## 🎯 Next Steps

1. ✅ PostgreSQL installed
2. ✅ Database created
3. ✅ Backend server running
4. ✅ Frontend connected
5. 📝 Create your first transaction!
6. 📊 View statistics
7. 🔄 Edit & delete transactions
8. 📱 Deploy to production

---

## 📞 Common Issues

### Issue: "Error: connect ECONNREFUSED"
```bash
# PostgreSQL not running
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux
# Windows: Use pgAdmin to start PostgreSQL
```

### Issue: "Error: database does not exist"
```bash
createdb -U postgres money_guard_db
```

### Issue: "Error: Invalid token"
- Token expired → User must login again
- Token invalid → Check JWT_SECRET matches
- No token → Send `Authorization: Bearer <token>` header

### Issue: "CORS error"
- Check `CORS_ORIGIN` in `.env.local` matches frontend URL
- Should be `http://localhost:5173` for development

---

## ✨ Features Implemented

✅ User registration & login with JWT  
✅ Password hashing with bcrypt  
✅ Create/Read/Update/Delete transactions  
✅ Create/Read/Update/Delete categories  
✅ Automatic balance calculation  
✅ User isolation (can only see own data)  
✅ Full CORS support  
✅ Comprehensive error handling  
✅ Request validation  
✅ Database relationships  

---

## 🏁 You're Ready!

Your full-stack app now has:
- ✅ Frontend (React + Redux)
- ✅ Backend (Express + Prisma)
- ✅ Database (PostgreSQL)
- ✅ Authentication (JWT)
- ✅ API endpoints
- ✅ Documentation

**Start building! 🚀**

---

*Last Updated: January 22, 2026*  
*PostgreSQL Version: 12+*  
*Node.js Version: 18+*  
*Status: ✅ Ready to use*
