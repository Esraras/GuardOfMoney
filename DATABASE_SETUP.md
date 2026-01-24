# 🗄️ PostgreSQL Database Setup Guide

## Quick Start

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey
choco install postgresql
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE money_guard_db;

# Exit
\q
```

Or using psql directly:
```bash
createdb -U postgres money_guard_db
```

### 3. Update .env.local

Edit `.env.local` and update the DATABASE_URL:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/money_guard_db?schema=public"
```

Replace `your_password` with your PostgreSQL password.

### 4. Set Up Prisma

```bash
# Install dependencies
npm install

# Push schema to database
npm run db:push

# Or create migration
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### 5. Run Development Server

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

Or use both simultaneously:
```bash
npm run dev:all
```

---

## Database Schema

### Users Table
```sql
- id (UUID)
- email (String, unique)
- username (String, unique)
- password (String, hashed)
- balance (Float, default: 0)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Categories Table
```sql
- id (UUID)
- name (String)
- type (String: "INCOME" or "EXPENSE")
- userId (UUID, foreign key)
- createdAt (DateTime)
- updatedAt (DateTime)
- Unique constraint: userId + name
```

### Transactions Table
```sql
- id (UUID)
- amount (Float)
- description (String)
- type (String: "INCOME" or "EXPENSE")
- date (DateTime)
- categoryId (UUID, foreign key)
- userId (UUID, foreign key)
- createdAt (DateTime)
- updatedAt (DateTime)
```

---

## Available Commands

### Database Commands
```bash
# Push schema changes to database
npm run db:push

# Create and run migration
npm run db:migrate

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed database with test data
npm run db:seed
```

### Development Commands
```bash
# Start frontend (Vite)
npm run dev

# Start backend (Node.js)
npm run dev:server

# Start both simultaneously
npm run dev:all

# Build for production
npm run build

# Run linting
npm run lint
```

---

## API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login user
- `GET /api/auth/current` - Get current user
- `DELETE /api/auth/sign-out` - Logout

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/category/:categoryId` - Get by category

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL from Services or use pgAdmin
```

### "Database already exists"
```bash
# Drop and recreate
dropdb -U postgres money_guard_db
createdb -U postgres money_guard_db
npm run db:push
```

### Prisma Schema Error
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: loses all data)
npx prisma migrate reset
```

### Port Already in Use
```bash
# Change port in .env.local
API_PORT=3002
```

---

## Default Test User

After seeding, use this account:

- **Email:** test@example.com
- **Username:** testuser
- **Password:** password123
- **Balance:** ₴5000

---

## Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/money_guard_db?schema=public"

# JWT Secret (change in production!)
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"

# Environment
NODE_ENV="development"

# API Configuration
API_PORT=3001
CORS_ORIGIN="http://localhost:5173"
VITE_API_URL="http://localhost:3001/api"
```

---

## Production Deployment

### 1. Use Managed Database Service
- **Heroku PostgreSQL**
- **AWS RDS**
- **DigitalOcean Database**
- **Render PostgreSQL**

### 2. Update DATABASE_URL
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### 3. Deploy Backend
```bash
# Build
npm run build

# Deploy to Vercel, Heroku, Railway, etc.
npm run db:push  # Run migrations
node server/index.js
```

### 4. Update Frontend API
```env
VITE_API_URL="https://your-api.com/api"
```

---

## Database Backup

### Backup
```bash
pg_dump -U postgres money_guard_db > backup.sql
```

### Restore
```bash
psql -U postgres money_guard_db < backup.sql
```

---

## Performance Tips

1. **Add Indexes**
```sql
CREATE INDEX idx_transactions_userId ON transactions(userId);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
```

2. **Enable Connection Pooling**
Use PgBouncer or Prisma's connection pooling

3. **Query Optimization**
Review slow queries in PostgreSQL logs

---

## Useful Links

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)

---

**Database setup complete! Your app is ready to store and manage data. 🎉**
