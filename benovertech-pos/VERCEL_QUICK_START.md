# Quick Vercel Deployment - 5 Minute Setup

## ⚡ Fast Track (TL;DR)

### 1. Choose Database (2 min)

**Option A: Vercel Postgres** (Recommended - easiest)
```bash
npm install -g vercel
vercel postgres create
# Copy the connection string
```

**Option B: Railway** (Simple - free tier available)
- Go to https://railway.app
- Create PostgreSQL project
- Copy connection string

**Option C: Neon** (Serverless - good for low traffic)
- Go to https://neon.tech
- Create project
- Copy connection string

### 2. Update Database (1 min)
```bash
# Prisma already updated to PostgreSQL in this repo
# Just verify it's set correctly:
cat prisma/schema.prisma | grep provider
# Should show: provider = "postgresql"
```

### 3. Configure Vercel (1 min)

Go to https://vercel.com/new

1. Import GitHub repository (DECENTPRINTS/benovertech-pos)
2. Click "Deploy"

When asked for environment variables, add:

```
DATABASE_URL = postgresql://...  (paste connection string)
NODE_ENV = production
CLIENT_URL = https://your-project.vercel.app
```

### 4. Wait for Deployment (1 min)
- Vercel builds and deploys
- Shows progress in dashboard
- Ready when status = "Ready"

### 5. Test It! (TBD)
```bash
# Test the API
curl https://your-project.vercel.app/api/products

# Open in browser
https://your-project.vercel.app
```

---

## 🚨 Most Common Issues

### Issue 1: Database Connection Failed
**Fix**: Verify DATABASE_URL environment variable
```bash
vercel env ls
# Should show DATABASE_URL with PostgreSQL connection string
```

### Issue 2: API Returns 404
**Fix**: Check vercel.json routing
```bash
# Redeploy
vercel --prod --force
```

### Issue 3: CORS Error
**Fix**: CLIENT_URL must match your Vercel URL
```bash
vercel env add CLIENT_URL https://your-actual-vercel-url.vercel.app
```

### Issue 4: Build Fails
**Fix**: Clear cache and rebuild
```bash
npm cache clean --force
git push origin main
# Vercel will rebuild
```

---

## 📋 Checklist Before Deployment

- [ ] Code pushed to GitHub (main branch)
- [ ] PostgreSQL database created
- [ ] Connection string copied
- [ ] All dependencies installed: `npm install`
- [ ] Build works locally: `npm run build`
- [ ] No errors in console: `npm run dev`

---

## 🎯 After Deployment

1. Check URL: https://your-project.vercel.app
2. Test API: `/api/products`, `/api/sales`
3. Test Frontend: All pages load
4. Test Offline: Open DevTools → Network → Offline
5. Check PWA: Install prompt appears

---

## 🆘 If Something Goes Wrong

```bash
# View logs
vercel logs https://your-project.vercel.app

# See environment variables
vercel env ls

# Redeploy
vercel --prod --force

# Go back to previous version
vercel rollback
```

---

## 📚 Full Documentation

Need more details? Read these files:
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete setup guide
- `VERCEL_DEPLOYMENT_CHECKLIST.md` - Detailed checklist

---

## ✅ You're Done!

Your app is now live on Vercel! 🚀

**Your production URL**: https://your-project.vercel.app

Share it with your team and start using the app!
