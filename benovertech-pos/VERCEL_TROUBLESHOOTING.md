# Vercel Deployment Troubleshooting Guide

## 🔧 Problem Solver

### Build Fails

#### Error: "ERR! npm ERR! 404 Not Found"

**Cause**: Dependency not found or package.json corrupted

**Solution**:
```bash
# Clear everything and reinstall
npm cache clean --force
rm -r node_modules package-lock.json
npm install

# Verify build
npm run build

# Commit and push
git add .
git commit -m "fix: rebuild dependencies"
git push origin main
```

**Alternative**: Delete node_modules in Vercel and force rebuild
1. Go to Vercel dashboard
2. Settings → Environment Variables → Delete and re-add
3. Click "Redeploy"

---

#### Error: "Cannot find module 'module-name'"

**Cause**: Missing dependency in package.json

**Solution**:
```bash
# Check which dependency is missing
npm list module-name

# Install it
npm install module-name

# Update package.json and push
git add package.json package-lock.json
git commit -m "fix: add missing dependency"
git push origin main
```

---

#### Error: "Build exceeded maximum file limit"

**Cause**: Deployment package too large (usually > 250MB)

**Solution**:
```bash
# Check what's big
npm run build:client

# Find large node_modules
du -sh node_modules/* | sort -rh | head -10

# Remove dev dependencies for production
npm prune --production

# Optimize images (reduce file sizes)
# Remove unnecessary node_modules packages
# Use tree-shaking with Vite build
```

Update `.gitignore` to exclude unnecessary files:
```
node_modules/
.env
.env.*.local
dist/
build/
*.db
*.sqlite
```

---

### Database Issues

#### Error: "connect ECONNREFUSED or ENOTFOUND"

**Cause**: Database connection string invalid or database unreachable

**Solution**:

1. **Verify connection string format**:
   ```
   ✅ postgresql://user:password@host:port/database
   ❌ postgresql://user:password@host/database (missing port)
   ❌ mysql://user:password@host:port/database (wrong provider)
   ```

2. **Check if database is running**:
   ```bash
   # If using local database for testing
   psql -h localhost -U user -d database
   
   # If using remote database
   # Test with psql or database client connection
   ```

3. **Verify environment variable is set**:
   ```bash
   vercel env ls
   # Should show DATABASE_URL with full connection string
   ```

4. **Test connection locally**:
   ```bash
   DATABASE_URL="postgresql://..." npm run dev:server
   # Should connect without errors
   ```

5. **Check firewall/IP whitelist**:
   - Database might be blocking Vercel IPs
   - Add Vercel IP ranges to whitelist if using provider dashboard
   - Vercel docs: https://vercel.com/docs/concepts/solutions/databases#ip-addresses

6. **Redeploy after fixing**:
   ```bash
   vercel --prod --force
   ```

---

#### Error: "relation 'Product' does not exist"

**Cause**: Database tables not created (migrations not run)

**Solution**:
```bash
# Verify schema
npx prisma validate

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# If starting fresh
npx prisma migrate reset
```

**For Vercel deployment**:
1. Run migrations locally first
2. Commit schema.prisma
3. Vercel will run migrations on deploy

---

#### Error: "too many connections"

**Cause**: Connection pool exhausted

**Solution**:
1. Limit database connections in Prisma:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")  # Direct connection for migrations
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["clientExtensions"]
}
```

2. Use connection pooling service (PgBouncer, etc.)
3. Upgrade database plan to allow more connections

---

### API Routing Issues

#### Error: "Cannot POST /api/products" (404)

**Cause**: API routes not mapped correctly in vercel.json

**Solution**:

Verify `vercel.json`:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.js"
    },
    {
      "src": "/.*",
      "dest": "client/dist/$1"
    }
  ]
}
```

If still not working:
1. Check that `server/src/index.js` exports the Express app
2. Verify API routes are defined in server
3. Check CORS configuration
4. Redeploy: `vercel --prod --force`

---

#### Error: "req.body is undefined" in API

**Cause**: Express body parser not configured

**Solution**:

Check `server/src/index.js` has:
```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

These must come before route definitions.

---

### CORS Issues

#### Error: "Access to XMLHttpRequest blocked by CORS policy"

**Cause**: Frontend and backend CORS mismatch

**Check list**:
1. **Verify CLIENT_URL in Vercel**:
   ```bash
   vercel env ls | grep CLIENT_URL
   # Should be: https://your-project.vercel.app
   ```

2. **Check CORS configuration**:
   ```javascript
   // In server/src/index.js
   app.use(cors({
     origin: process.env.CLIENT_URL || 'http://localhost:5173',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
     allowedHeaders: ['Content-Type'],
   }));
   ```

3. **Verify API URL in frontend**:
   ```javascript
   // In client/src/config/api.js
   const API_BASE_URL = import.meta.env.MODE === 'production' 
     ? '' // Relative URL uses same origin
     : 'http://localhost:5000'; // Local dev
   ```

4. **Test preflight requests**:
   ```bash
   # Check if OPTIONS request succeeds
   curl -I -X OPTIONS https://your-project.vercel.app/api/products
   # Should return 200 with CORS headers
   ```

**Solution**:
1. Update CLIENT_URL in Vercel
2. Update CORS config to allow production URL
3. Redeploy: `vercel --prod --force`

---

### Frontend Issues

#### Error: "PWA service worker not registering"

**Cause**: HTTPS required for service worker (Vercel always uses HTTPS ✅)

**Solution**:
1. Verify service worker path is correct
2. Check manifest.json is accessible
3. Clear browser cache: DevTools → Application → Clear storage
4. Check browser console for registration errors

```bash
# In DevTools console
navigator.serviceWorker.getRegistrations()
```

---

#### Error: "Assets not loading (CSS, images, fonts)"

**Cause**: Wrong asset paths or build output directory

**Solution**:

1. **Verify build output**:
   ```bash
   npm run build:client
   ls client/dist/
   # Should contain index.html, assets/, etc.
   ```

2. **Check vercel.json output directory**:
   ```json
   "builds": [
     {
       "use": "@vercel/static-build",
       "config": {
         "distDir": "dist"  // Should be "client/dist"
       }
     }
   ]
   ```

3. **Fix vite.config.js**:
   ```javascript
   export default {
     build: {
       outDir: 'dist',  // Relative to package.json location
       sourcemap: false,
     },
   }
   ```

---

#### Error: "Blank page or 404 after deployment"

**Cause**: Frontend not deployed or routing misconfigured

**Solution**:

1. **Check if frontend built**:
   ```bash
   npm run build:client
   ls -la client/dist/
   ```

2. **Check vercel.json has fallback**:
   ```json
   {
     "routes": [
       {
        "src": "/.*",
         "dest": "client/dist/index.html"
       }
     ]
   }
   ```

3. **Clear Vercel cache**:
   - Go to Settings → Clear Build Cache
   - Redeploy: `vercel --prod --force`

---

### Environment Variables

#### Error: "process.env.DATABASE_URL is undefined"

**Cause**: Environment variable not set in Vercel

**Solution**:
```bash
# Check if variable exists
vercel env ls

# Add it
vercel env add DATABASE_URL
# Paste connection string when prompted

# Redeploy
vercel --prod --force
```

---

#### Error: "Wrong environment variable value in production"

**Cause**: Variable has different values for different environments

**Solution**:
```bash
# Check current values
vercel env ls

# Remove and readd variable
vercel env rm DATABASE_URL
vercel env add DATABASE_URL
# Paste correct value

# Make sure to check "Production" checkbox in dashboard
```

---

### Performance Issues

#### Problem: "App is very slow to load"

**Causes & Solutions**:

1. **Large bundle size**:
   ```bash
   npm run build:client
   # Check dist/assets/
   # Files > 500KB should be investigated
   ```

2. **Slow database queries**:
   ```bash
   # Add indexes to frequently queried fields
   # In prisma/schema.prisma
   @@index([productName])
   @@index([saleDate])
   ```

3. **Missing caching**:
   - Add cache headers in vercel.json
   - Enable browser caching for static assets

4. **Cold starts**:
   - First request to serverless function is slow
   - Subsequent requests are fast
   - Normal behavior for serverless

---

#### Problem: "Database queries timing out"

**Cause**: Query too complex or connection slow

**Solution**:
```bash
# Set query timeout
DATABASE_URL="postgresql://...?statement_timeout=30000"

# Optimize queries
# Add database indexes
# Break complex queries into smaller ones
```

---

### Deployment Failure Recovery

#### Rollback to Previous Version

```bash
# View deployment history
vercel deployments

# Rollback to specific deployment
vercel rollback <deployment-id>

# Or redeploy previous commit
git revert HEAD
git push origin main
```

---

#### Force Rebuild

```bash
# Clear build cache and redeploy
vercel --prod --force

# Or through dashboard:
# Deployments → [Latest] → More → Redeploy
```

---

### Check Logs

```bash
# View all logs
vercel logs https://your-project.vercel.app

# Follow live logs
vercel logs https://your-project.vercel.app --follow

# View specific deployment logs
vercel logs https://your-project.vercel.app --deployment=<id>
```

---

## 🆘 Still Stuck?

### Get Help

1. **Check Vercel Status**: https://www.vercel-status.com/
2. **Vercel Support**: https://vercel.com/support
3. **GitHub Issues**: Your repository discussions
4. **Stack Overflow**: Tag questions with `vercel` and `postgresql`

### Share Debugging Info

When asking for help, include:
```bash
# Vercel environment
vercel env ls

# Build output
vercel logs https://your-project.vercel.app

# Deployment ID
vercel deployments

# Error message (full text)
```

---

## ✅ Common Success Indicators

If you see these, your deployment is working:

✅ App loads without 404 errors
✅ Pages render without blank space
✅ API calls return data (check Network tab)
✅ Database operations succeed
✅ No console errors
✅ Performance acceptable (< 2s load time)

---

## 🚀 Prevention Tips

- Test locally before pushing: `npm run dev`
- Run builds locally: `npm run build`
- Use staging environment for testing
- Monitor logs regularly
- Keep dependencies updated: `npm update`
- Test after dependency updates
- Use environment variables for all config
- Never commit `.env` files

---

**Last Updated**: April 18, 2026
