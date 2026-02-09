# Quick Start Checklist

## Before You Start
- [ ] PostgreSQL installed on your computer
- [ ] You know your PostgreSQL password

---

## Setup Steps (Do Once)

### 1. Install PostgreSQL
Download from: https://www.postgresql.org/download/windows/
- Remember your password!
- Use default port 5432

### 2. Create Database
Open pgAdmin or command line:
```sql
CREATE DATABASE protocol_builder;
```

### 3. Update .env File
Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/protocol_builder?schema=public"
```
Replace `YOUR_PASSWORD` with your actual password!

### 4. Run Migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### 5. Start Backend
```bash
npm run dev
```

Should see: `🚀 Protocol Builder API running on http://localhost:3001`

---

## Daily Use (After Setup)

### Start Everything
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd ..
npm run dev
```

### Check It's Working
- Backend: http://localhost:3001/health
- Frontend: http://localhost:5173
- Protocol Builder: http://localhost:5173/protocol-builder

---

## Troubleshooting

**Backend won't start?**
1. Is PostgreSQL running? (Check Services on Windows)
2. Is password correct in `.env`?
3. Did you run migrations? (`npx prisma migrate dev`)

**Can't connect to database?**
1. Check PostgreSQL is running
2. Check database exists: `protocol_builder`
3. Check password in `.env` matches PostgreSQL password

**Need to reset everything?**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## That's It!

Once setup is done, you just need to:
1. Start backend (`npm run dev` in backend folder)
2. Start frontend (`npm run dev` in main folder)
3. Use the app!
