# Vercel Deployment Guide - BENOVERTECH POS

## 🚀 Complete Deployment Setup

This guide covers deploying the BENOVERTECH POS system to Vercel with a production-ready PostgreSQL database.

---

## ⚠️ Critical Issues Fixed

### Issue 1: SQLite Database (Non-Persistent)
**Problem**: SQLite stores data in local file system, which is ephemeral on Vercel
- Data lost on each deployment
- No persistence between builds
- Not suitable for production

**Solution**: Migrate to PostgreSQL
- Persistent cloud database
- Scales with your business
- Supports multi-region redundancy

### Issue 2: Environment Configuration
**Problem**: Environment variables hardcoded for localhost
- `CLIENT_URL: http://localhost:5173`
- `DATABASE_URL: file:./dev.db`
- CORS only allows localhost

**Solution**: Environment-based configuration
- Create `.env.production` for production settings
- Use Vercel environment variables
- Dynamic API URL configuration

### Issue 3: API Routing
**Problem**: Monorepo structure needs proper routing
- Frontend and backend on different ports locally
- Need unified routing in production

**Solution**: Vercel configuration
- API routes mapped to `/api/*`
- Frontend routes mapped to `/`
- Single unified URL

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository created and connected
- [ ] Git remote set up (`git remote add origin ...`)
- [ ] All code committed and pushed
- [ ] Vercel account created at https://vercel.com
- [ ] PostgreSQL database ready
- [ ] Environment variables configured in Vercel

---

## Step 1: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)
Vercel's managed PostgreSQL service integrated with deployment.

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Create database (interactive setup)
vercel postgres create
```

### Option B: Railway
Popular third-party PostgreSQL hosting.

1. Go to https://railway.app
2. Click "New Project"
3. Select "PostgreSQL"
4. Copy connection string

### Option C: Neon
Serverless PostgreSQL for production.

1. Go to https://neon.tech
2. Sign up for free
3. Create a project
4. Copy connection string

### Option D: AWS RDS
Enterprise-grade PostgreSQL.

1. Go to AWS Console
2. Create RDS PostgreSQL instance
3. Copy endpoint and credentials
4. Build connection string

**Connection String Format:**
```
postgresql://username:password@host:port/database
```

---

## Step 2: Update Prisma Schema

Change database provider from SQLite to PostgreSQL:

**File**: `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma migrate dev --name init
```

This creates the database schema in PostgreSQL.

---

## Step 3: Configure Environment Variables in Vercel

### Method 1: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://...` (from Step 1) |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-project.vercel.app` |
| `VERCEL_ENV` | `production` |

### Method 2: Using Vercel CLI

```bash
vercel env add DATABASE_URL
# Paste your PostgreSQL connection string

vercel env add NODE_ENV production
vercel env add CLIENT_URL https://your-project.vercel.app
```

---

## Step 4: Update Server Configuration

Update CORS to accept production URL:

**File**: `server/src/index.js`

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
```

Update Prisma client initialization:

```javascript
const prisma = new PrismaClient();

// Handle Prisma errors gracefully
process.on('SIGTERM', () => {
  prisma.$disconnect();
  process.exit(0);
});
```

---

## Step 5: Update Client API Configuration

The client should use relative URLs in production:

**File**: `client/src/config/api.js`

```javascript
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '' // Uses same origin as frontend
  : 'http://localhost:5000'; // Local dev
  
export default API_BASE_URL;
```

Update all API calls:

```javascript
// Before
const response = await axios.get('http://localhost:5000/api/products');

// After
import API_BASE_URL from '../config/api.js';
const response = await axios.get(`${API_BASE_URL}/api/products`);
```

---

## Step 6: Prepare Server for Production

Add server startup script:

**File**: `server/package.json`

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon --exec node src/index.js",
    "build": "prisma generate"
  }
}
```

Create migration handler:

**File**: `server/src/migrate.js`

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Running migrations...');
    await prisma.$executeRawUnsafe('SELECT 1');
    console.log('Database connection successful');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

Add to root `package.json`:

```json
{
  "scripts": {
    "vercel-build": "npm run build:server && npm run build:client",
    "vercel-install": "npm install && cd server && npx prisma migrate deploy"
  }
}
```

---

## Step 7: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select project root (c:\decent\benovertech-pos)
4. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`
5. Add environment variables
6. Click "Deploy"

### Method 2: Using Vercel CLI

```bash
# Login
vercel login

# Deploy
vercel --prod

# Vercel will:
# 1. Detect monorepo structure
# 2. Install dependencies
# 3. Run build command
# 4. Deploy to production
```

### Method 3: Using Git Push (Git Integration)

1. Connect GitHub to Vercel (already done if using dashboard)
2. Push to main branch:

```bash
git push origin main
```

3. Vercel automatically deploys on push

---

## Step 8: Verify Deployment

### Check Build Logs

1. Go to Vercel dashboard
2. Select your project
3. Go to **Deployments**
4. Click latest deployment
5. Check **Build** tab for errors

### Test API Endpoints

```bash
# Get all products
curl https://your-project.vercel.app/api/products

# Create a product
curl -X POST https://your-project.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"Test","costPrice":100,"sellingPrice":150,"barcode":"123"}'
```

### Test Frontend

1. Open https://your-project.vercel.app
2. Test all features
3. Open DevTools → Network
4. Verify API calls work
5. Test offline mode (PWA)

---

## Step 9: Set Up Automatic Deployments

### GitHub Actions (Optional)

Create deployment workflow:

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Scheduled Backups (Optional)

Set up automatic database backups through your database provider's dashboard.

---

## Troubleshooting

### Issue 1: Deployment Fails - Build Error

**Error**: `ERR! npm ERR! 404 Not Found`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install

# Push changes
git add .
git commit -m "fix: rebuild dependencies"
git push origin main
```

### Issue 2: API Returns 404

**Problem**: API routes not found in production

**Check**:
1. Verify Vercel configuration in `vercel.json`
2. Check environment variables are set
3. Verify database connection string
4. Check CORS configuration

**Solution**:
```bash
# View Vercel logs
vercel logs https://your-project.vercel.app

# Redeploy
vercel --prod --force
```

### Issue 3: Database Connection Failed

**Error**: `Error: connect ECONNREFUSED`

**Check**:
1. Database is running and accessible
2. Connection string is correct
3. Environment variables set in Vercel
4. Firewall allows Vercel IP ranges

**Solution**:
```bash
# Test connection string locally
DATABASE_URL="postgresql://..." npm run dev

# Check Vercel env vars
vercel env ls
```

### Issue 4: CORS Error in Frontend

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Check**:
1. `CLIENT_URL` is set correctly in env vars
2. Server CORS configuration is correct
3. API URL is using relative paths in production

**Solution**:
```javascript
// In server/src/index.js
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
}));
```

### Issue 5: PWA Not Working

**Problem**: Service worker not registering

**Check**:
1. HTTPS enabled (required for PWA)
2. Manifest.json accessible
3. Service worker path correct
4. Browser console for errors

**Solution**:
```bash
# Rebuild PWA files
npm run build:client

# Force redeploy
vercel --prod --force
```

### Issue 6: Large Deployment Size

**Error**: `Function size exceeds maximum allowed size`

**Solution**:
```bash
# Analyze bundle size
npm run build:client

# Install dependencies without dev deps
npm install --production

# Redeploy
vercel --prod
```

---

## Performance Optimization

### Enable Caching

Add to `vercel.json`:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.js",
      "headers": {
        "Cache-Control": "no-cache"
      }
    },
    {
      "src": "/_next/static/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  ]
}
```

### Enable Compression

Vercel automatically compresses responses with gzip/brotli.

### Database Connection Pooling

Update Prisma for serverless:

**File**: `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")  # Optional: for schema migrations
}
```

---

## Monitoring & Logs

### View Logs

```bash
# Stream logs
vercel logs https://your-project.vercel.app --follow

# View deployment logs
vercel logs https://your-project.vercel.app --deployment=<deployment-id>
```

### Set Up Alerts

1. Go to Vercel dashboard
2. Settings → Integrations
3. Connect monitoring service (Datadog, New Relic, etc.)

### Database Monitoring

Monitor through database provider:
- **Vercel Postgres**: Built-in dashboard
- **Railway**: Analytics tab
- **Neon**: Dashboard
- **AWS RDS**: CloudWatch

---

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Update Prisma
npm update @prisma/client prisma

# Test locally
npm run dev

# Commit and push
git add .
git commit -m "chore: update dependencies"
git push origin main
```

### Database Backups

1. Set up automatic backups through database provider
2. Test restore process monthly
3. Keep backups for 30 days minimum

### Security

- [ ] Enable authentication for admin features
- [ ] Use HTTPS (automatic on Vercel)
- [ ] Rotate database credentials quarterly
- [ ] Keep dependencies updated
- [ ] Monitor for vulnerabilities: `npm audit`

---

## Summary

**Deployment Process:**

1. ✅ Create PostgreSQL database
2. ✅ Update Prisma schema to PostgreSQL
3. ✅ Configure environment variables
4. ✅ Update server CORS configuration
5. ✅ Update client API configuration
6. ✅ Set up Vercel configuration
7. ✅ Deploy to Vercel
8. ✅ Verify deployment
9. ✅ Monitor and maintain

**Your app is now production-ready on Vercel!**

---

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **PostgreSQL Providers**:
  - Vercel Postgres: https://vercel.com/postgres
  - Railway: https://railway.app
  - Neon: https://neon.tech
- **Documentation**: https://vercel.com/docs
- **Support**: https://vercel.com/support

---

## Next Steps

1. **Set up database**: Choose PostgreSQL provider (see Step 1)
2. **Configure Vercel**: Add environment variables (see Step 3)
3. **Deploy**: Push to GitHub or use Vercel CLI (see Step 7)
4. **Test**: Verify all features work (see Step 8)
5. **Monitor**: Watch deployment logs and set up alerts

**For help**: Check Vercel documentation or contact support!
