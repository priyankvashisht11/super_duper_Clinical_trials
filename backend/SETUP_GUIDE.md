# PostgreSQL Setup Guide - Step by Step

## What You Need to Understand

**PostgreSQL** = A database (like Excel but way more powerful)
**Prisma** = A tool that talks to PostgreSQL for us
**Migration** = Creating the tables/structure in the database

---

## Step 1: Install PostgreSQL

### Option A: Download PostgreSQL (Recommended)
1. Go to: https://www.postgresql.org/download/windows/
2. Download the installer
3. Run it and follow the wizard
4. **IMPORTANT**: Remember the password you set for "postgres" user
5. Default port is 5432 (keep it)

### Option B: Use Docker (If you have it)
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

---

## Step 2: Verify PostgreSQL is Running

Open Command Prompt and type:
```bash
psql --version
```

You should see something like: `psql (PostgreSQL) 16.x`

If not, you may need to add PostgreSQL to your PATH.

---

## Step 3: Create the Database

### Using pgAdmin (GUI - Easier)
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to your server (password you set earlier)
3. Right-click "Databases" → "Create" → "Database"
4. Name it: `protocol_builder`
5. Click Save

### Using Command Line
```bash
psql -U postgres
# Enter your password
CREATE DATABASE protocol_builder;
\q
```

---

## Step 4: Update Your .env File

Open `backend/.env` and make sure it matches your setup:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/protocol_builder?schema=public"
PORT=3001
NODE_ENV=development
```

**Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation!**

Example:
```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/protocol_builder?schema=public"
```

---

## Step 5: Run Migrations (Create Tables)

Open terminal in the `backend` folder:

```bash
cd backend
npx prisma migrate dev --name init
```

**What this does:**
- Reads your `schema.prisma` file
- Creates all the tables in PostgreSQL
- Sets up relationships between tables
- Generates Prisma Client (code to talk to database)

You should see:
```
✔ Generated Prisma Client
✔ The migration has been created successfully
```

---

## Step 6: Verify It Worked

Check your database has tables:

```bash
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can see your empty tables!

---

## Step 7: Start the Backend

```bash
npm run dev
```

You should see:
```
🚀 Protocol Builder API running on http://localhost:3001
📊 Health check: http://localhost:3001/health
```

---

## Common Issues & Fixes

### Issue: "Can't connect to database"
**Fix**: Check PostgreSQL is running
- Windows: Open Services → Find "postgresql" → Make sure it's "Running"
- Or restart your computer

### Issue: "Password authentication failed"
**Fix**: Your password in `.env` doesn't match PostgreSQL password
- Update the `DATABASE_URL` in `.env` with correct password

### Issue: "Database doesn't exist"
**Fix**: Create the database (see Step 3)

### Issue: "Port 5432 already in use"
**Fix**: PostgreSQL is already running, or another app is using that port
- Check Task Manager for postgres.exe

### Issue: "Prisma Client not generated"
**Fix**: Run this:
```bash
npx prisma generate
```

---

## Quick Reference Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create new migration (after schema changes)
npx prisma migrate dev --name description_of_change

# Open database GUI
npx prisma studio

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Check database connection
npx prisma db pull
```

---

## What Happens After Setup?

1. ✅ PostgreSQL is installed and running
2. ✅ Database `protocol_builder` exists
3. ✅ Tables are created (Protocol, Objective, etc.)
4. ✅ Backend can connect to database
5. ✅ You can create protocols through the API

---

## Next Steps After Setup

1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run dev` (in main folder)
3. Open http://localhost:5173/protocol-builder
4. Create your first protocol!

The frontend will save data to PostgreSQL through the backend API.
