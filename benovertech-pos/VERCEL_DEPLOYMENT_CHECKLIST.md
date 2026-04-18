# Vercel Deployment Checklist - BENOVERTECH POS

## ✅ Pre-Deployment Setup

### Database Setup
- [ ] Choose PostgreSQL provider:
  - [ ] Vercel Postgres (easiest, integrated)
  - [ ] Railway (simple, no credit card needed)
  - [ ] Neon (serverless, scalable)
  - [ ] AWS RDS (enterprise)
- [ ] Create database instance
- [ ] Copy connection string
- [ ] Test connection locally

### GitHub Setup
- [ ] GitHub repository created
- [ ] Code pushed to main branch
- [ ] `.gitignore` configured
- [ ] No sensitive data in repository

### Local Testing
- [ ] `npm install` works without errors
- [ ] `npm run build` succeeds
- [ ] `npm run dev` runs without errors
- [ ] Test all API endpoints locally
- [ ] Test all frontend features
- [ ] Offline PWA functionality works

---

## 📋 Vercel Configuration

### Step 1: Create Vercel Account
- [ ] Sign up at https://vercel.com
- [ ] Connect GitHub account
- [ ] Create new project

### Step 2: Configure Project Settings

**Project Name**:
- [ ] Set to `benovertech-pos` (or preferred name)

**Build Settings**:
- [ ] Root Directory: `.` (repository root)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `client/dist`
- [ ] Install Command: `npm install`

**Environment Variables** (critical):

```
Name: DATABASE_URL
Value: postgresql://user:password@host:port/database
[ ] Production checkbox
[ ] Preview checkbox (optional)

Name: NODE_ENV
Value: production
[ ] Production checkbox

Name: CLIENT_URL
Value: https://your-project.vercel.app
[ ] Production checkbox
```

- [ ] Add `DATABASE_URL`
- [ ] Add `NODE_ENV`
- [ ] Add `CLIENT_URL`

### Step 3: Framework Detection
- [ ] Vercel should auto-detect as monorepo
- [ ] Ensure build command is correct
- [ ] Verify output directory is correct

---

## 🗄️ Database Migration

### Update Prisma
- [ ] Change `datasource` from `sqlite` to `postgresql` in `prisma/schema.prisma`
- [ ] Verify schema file looks correct

### Test Migration Locally

Create test PostgreSQL database:

```bash
# If using Railway or similar
export DATABASE_URL="postgresql://..."

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed data (optional)
npm run seed
```

- [ ] Migrations run without errors
- [ ] Database tables created
- [ ] Data seeded (if applicable)

---

## 🔐 Security Checks

### Environment Variables
- [ ] No hardcoded API keys
- [ ] No database credentials in code
- [ ] No API URLs hardcoded to localhost
- [ ] `.env` files not in git (check `.gitignore`)

### CORS Configuration
- [ ] CORS allows production URL
- [ ] CORS doesn't allow all origins (`*`)
- [ ] Credentials properly configured

### Dependencies
- [ ] No critical vulnerabilities: `npm audit`
- [ ] All packages up-to-date
- [ ] No abandoned packages

---

## 🧪 Testing Before Deployment

### Backend Tests
- [ ] All API endpoints respond
- [ ] Database operations work
- [ ] Error handling works
- [ ] CORS allows frontend

**Test Commands:**
```bash
# Start server
npm run dev:server

# In another terminal
curl http://localhost:5000/api/products
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"Test","costPrice":100,"sellingPrice":150,"barcode":"123"}'
```

### Frontend Tests
- [ ] App loads
- [ ] Navigation works
- [ ] API calls succeed
- [ ] Forms submit correctly
- [ ] Offline mode works (PWA)
- [ ] No console errors

**Test Checklist:**
- [ ] Sales page loads and creates sales
- [ ] Inventory page shows products
- [ ] Analytics page displays data
- [ ] Dashboard loads
- [ ] Receipt printing works
- [ ] Barcode scanning works
- [ ] PWA install prompt appears

### Build Tests
```bash
# Test production build locally
npm run build
npm run preview

# Test all environments
npm run build:client
npm run build:server
```

- [ ] Build completes without errors
- [ ] No build warnings
- [ ] Preview loads

---

## 🚀 Deployment Steps

### Method 1: Dashboard (Recommended for First Time)

1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New..." → "Project"
3. [ ] Select your GitHub repository
4. [ ] Vercel auto-detects monorepo (might need configuration)
5. [ ] Set build command: `npm run build`
6. [ ] Set output directory: `client/dist`
7. [ ] Add environment variables (DATABASE_URL, NODE_ENV, CLIENT_URL)
8. [ ] Click "Deploy"
9. [ ] Wait for deployment to complete

### Method 2: Git Push (After Initial Setup)

```bash
# Commit all changes
git add .
git commit -m "chore: prepare for Vercel deployment"

# Push to main branch
git push origin main

# Vercel auto-deploys when code is pushed
```

- [ ] Changes committed
- [ ] Pushed to main branch
- [ ] Vercel deployment triggered

### Method 3: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

- [ ] Vercel CLI installed
- [ ] Logged in to Vercel
- [ ] Deployment started

---

## ✅ Post-Deployment Verification

### Deployment Status
- [ ] Deployment shows "Ready"
- [ ] Build took < 5 minutes
- [ ] No build errors in logs

### URL Access
- [ ] App accessible at Vercel URL: `https://your-project.vercel.app`
- [ ] No 404 or error pages
- [ ] Page loads in < 3 seconds

### Frontend Functionality
- [ ] Homepage loads
- [ ] All pages accessible
- [ ] No console errors
- [ ] CSS/styling correct
- [ ] Images load
- [ ] PWA manifest loads

### API Functionality
- [ ] API endpoints respond: `/api/products`, `/api/sales`, etc.
- [ ] CORS headers present
- [ ] Database queries work
- [ ] Create/Read/Update operations successful

**Test API:**
```bash
# Replace with your URL
curl https://your-project.vercel.app/api/products

# Should return array of products
```

### Database Connection
- [ ] Data persists after page reload
- [ ] New sales saved
- [ ] Products queries work
- [ ] No database timeout errors

### Performance
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] No memory errors
- [ ] Caching working

---

## 🔍 Troubleshooting

### Build Failures

**Error: "Failed to build"**
```bash
# Check build logs in Vercel dashboard
# Deployments → [Latest] → Build

# Common fixes:
npm cache clean --force
rm -r node_modules package-lock.json
npm install
git push origin main
```

- [ ] Checked error message in build logs
- [ ] Confirmed all dependencies installed
- [ ] Verified build command is correct

### Database Connection Issues

**Error: "Error: connect ECONNREFUSED"**

```bash
# Verify DATABASE_URL in Vercel
vercel env ls

# Check connection string format
# Should be: postgresql://user:password@host:port/database

# Test locally with same DATABASE_URL
DATABASE_URL="postgresql://..." npm run dev
```

- [ ] DATABASE_URL is set in Vercel environment
- [ ] Connection string is valid PostgreSQL format
- [ ] Database is accessible from Vercel IP ranges
- [ ] No firewall blocking connection

### API Not Found

**Error: "Cannot POST /api/products"**

```bash
# Verify vercel.json routing
# Check if /api/* routes to server

# Verify server/src/index.js exports app
# Check if routes are registered
```

- [ ] `vercel.json` configured correctly
- [ ] API routes properly defined
- [ ] CORS middleware before routes

### CORS Errors

**Error: "Access to XMLHttpRequest blocked by CORS"**

```javascript
// In server/src/index.js
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
```

- [ ] CLIENT_URL set to production URL
- [ ] CORS middleware before routes
- [ ] Credentials: true if needed

### Slow Performance

**Issue: App loading slowly**

```bash
# Check bundle size
npm run build:client
# Look for large node_modules files

# Optimize images
# Remove unnecessary dependencies
# Enable Vercel caching
```

- [ ] No large files in bundle
- [ ] Dependencies minimized
- [ ] Caching configured

---

## 📊 Monitoring

### Vercel Dashboard
- [ ] Visit https://vercel.com/dashboard/[your-project]
- [ ] Monitor deployment status
- [ ] Review analytics
- [ ] Check performance metrics

### Logs
- [ ] Access deployment logs
- [ ] Monitor for errors
- [ ] Track API requests

```bash
vercel logs https://your-project.vercel.app
```

### Alerts
- [ ] Set up deployment failure notifications
- [ ] Monitor error rate
- [ ] Track performance degradation

---

## 🔄 Updates & Maintenance

### Regular Updates
- [ ] Update dependencies monthly: `npm update`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review Vercel dashboard for issues

### Database Backups
- [ ] Configure automatic backups in database provider
- [ ] Test restore process
- [ ] Document backup schedule

### Deployments
- [ ] Test in staging before production
- [ ] Review changes before pushing
- [ ] Keep deployment history clean

---

## 🎉 Success Criteria

Your deployment is successful if:

✅ App loads at `https://your-project.vercel.app`  
✅ All pages accessible and functional  
✅ API endpoints return data  
✅ Database persists data  
✅ No console errors  
✅ PWA works offline  
✅ Performance is acceptable (< 2s load time)  
✅ Mobile responsive  

---

## 📞 Getting Help

### Documentation
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs

### Support
- Vercel Support: https://vercel.com/support
- Database Provider Support (Railway, Neon, etc.)
- GitHub Issues

### Common Issues
See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed troubleshooting

---

## Next Steps After Successful Deployment

1. [ ] Share production URL with team
2. [ ] Set up custom domain (optional)
3. [ ] Configure SSL/HTTPS (automatic)
4. [ ] Set up monitoring and alerts
5. [ ] Document deployment process
6. [ ] Plan backup strategy
7. [ ] Schedule regular updates

---

**Last Updated**: April 18, 2026
**Status**: Ready for Deployment
