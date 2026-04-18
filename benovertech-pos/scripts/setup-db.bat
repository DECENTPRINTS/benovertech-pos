@echo off
REM Database setup script for Vercel deployment (Windows)
REM This script prepares the database for production

echo.
echo Vercel Deployment - Database Setup
echo ===================================
echo.

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
  echo.
  echo ❌ ERROR: DATABASE_URL environment variable not set
  echo Please set DATABASE_URL in your Vercel environment variables
  echo.
  exit /b 1
)

echo ✅ DATABASE_URL is set
echo.

REM Generate Prisma client
echo 📦 Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
  echo ❌ Failed to generate Prisma client
  exit /b 1
)
echo ✅ Prisma client generated
echo.

REM Run migrations
echo 🗄️  Running database migrations...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
  echo ❌ Failed to run migrations
  exit /b 1
)
echo ✅ Migrations completed
echo.

REM Optional: Seed database
if "%SEED_DB%"=="true" (
  echo 🌱 Seeding database...
  call node server\seed.js
  echo ✅ Database seeded
  echo.
)

echo ✅ Database setup complete!
echo.
echo Next steps:
echo 1. Verify deployment in Vercel dashboard
echo 2. Test API endpoints: curl https://your-app.vercel.app/api/products
echo 3. Access the app: https://your-app.vercel.app
echo.
