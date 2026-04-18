#!/bin/bash
# Database setup script for Vercel deployment
# This script prepares the database for production

set -e

echo "🔧 Setting up database for production..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo "Please set DATABASE_URL in your Vercel environment variables"
  exit 1
fi

echo "✅ DATABASE_URL is set"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Seed database (optional)
if [ "$SEED_DB" = "true" ]; then
  echo "🌱 Seeding database..."
  node server/seed.js
fi

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify deployment in Vercel dashboard"
echo "2. Test API endpoints: curl https://your-app.vercel.app/api/products"
echo "3. Access the app: https://your-app.vercel.app"
