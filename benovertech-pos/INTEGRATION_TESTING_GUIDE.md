# API Integration Testing Guide

## ✅ Integration Status: COMPLETE

All frontend pages are now connected to the Express backend. This guide helps you verify everything is working.

---

## Pre-Flight Checklist

### Backend Ready? ✓
```bash
# Terminal 1: Backend
cd c:\decent\benovertech-pos\server
npm install
npm run seed
npm run dev
```

**Check:** Can you see "Server listening on http://localhost:5000"?

### Frontend Ready? ✓
```bash
# Terminal 2: Frontend
cd c:\decent\benovertech-pos\client
npm install
npm run dev
```

**Check:** Can you see "Local: http://localhost:5173"?

### Browser Ready? ✓
Open: **http://localhost:5173**

**Check:** Does the app load without errors?

---

## Integration Verification Tests

### Test 1: Dashboard Integration ✅

**What to test:**
1. Navigate to Dashboard (default page)
2. Wait for data to load

**Expected Results:**
- [ ] Page loads without errors
- [ ] "Total Sales" shows a number (not 0 or ₦0)
- [ ] "Profit" shows a number
- [ ] "Items Sold" shows a count
- [ ] "Low Stock Items" shows a count
- [ ] Recent sales list displays transactions
- [ ] "Refresh" button works

**Pass:** All metrics show real data from backend

### Test 2: Sales Page Integration ✅

**What to test:**
1. Click "Sales" tab
2. Wait for products to load

**Expected Results:**
- [ ] Product list loads from database
- [ ] At least 6 products visible
- [ ] Each product shows name and price
- [ ] Stock badges show correctly (green if >0, red if 0)
- [ ] Search box filters products in real-time
- [ ] Can add product to cart
- [ ] Cart updates with quantities
- [ ] Total calculations are correct
- [ ] Can complete a sale
- [ ] Success message appears
- [ ] Product stock updates

**Pass:** Full POS workflow works end-to-end

### Test 3: Inventory Page Integration ✅

**What to test:**
1. Click "Inventory" tab
2. Wait for table to load

**Expected Results:**
- [ ] Product table displays all items
- [ ] Column headers show correctly (Name, Category, Stock, Cost, Price, Margin, Actions)
- [ ] Stock levels are color-coded (green if >2, red if ≤2)
- [ ] Search works for product names
- [ ] Search works for barcodes
- [ ] Category filter dropdown has options
- [ ] Category filter works
- [ ] Low stock alert banner shows count
- [ ] Delete button removes product
- [ ] Summary stats show correct totals

**Pass:** All inventory operations work with real data

### Test 4: Analytics Page Integration ✅

**What to test:**
1. Click "Analytics" tab
2. Wait for charts to load

**Expected Results:**
- [ ] Page loads without errors
- [ ] Metrics cards show data (Total Sales, Profit, Transactions, Avg Order Value)
- [ ] Bar chart renders (daily sales)
- [ ] Pie chart renders (payment methods)
- [ ] Top products table displays
- [ ] Time range buttons work (week, month, year)
- [ ] Refresh button works
- [ ] All numbers are from backend (not hardcoded)

**Pass:** All visualizations display real data

---

## API Endpoint Verification

Use browser DevTools Network tab to verify API calls:

### 1. Open DevTools
Press **F12** → Go to **Network** tab

### 2. Refresh Page
Press **F5**

### 3. Look for API Calls
You should see requests like:
- `GET /api/analytics`
- `GET /api/products`
- `GET /api/sales`

### 4. Check Response
Click on each request:
- Status should be **200**
- Response should show data (not error)

### 5. Expected Calls per Page

**Dashboard:**
- 3 parallel requests:
  - `/api/analytics` → returns metrics
  - `/api/sales` → returns transactions
  - `/api/products` → returns product list

**Sales Page:**
- 1 initial request:
  - `/api/products` → returns product list
- 1 on completion:
  - `/api/sales` (POST) → submits new sale

**Inventory:**
- 1 initial request:
  - `/api/products` → returns all products
- 1 for each delete:
  - `/api/products/:id` (DELETE) → removes product

**Analytics:**
- 2 parallel requests:
  - `/api/analytics` → returns metrics
  - `/api/products` → returns product list
- Optional:
  - `/api/analytics/monthly` → monthly breakdown

---

## Error Handling Tests

### Test 1: Stop Backend, Refresh Frontend
1. Kill backend (`Ctrl+C` in Terminal 1)
2. Refresh page (`F5`)

**Expected:** Error message appears, not blank page ✓

### Test 2: Invalid Product Delete
1. Right-click on network tab
2. Add filter: `status:4`
3. Try to delete (if API returns error)

**Expected:** Error message shown, product still visible ✓

### Test 3: Network Throttle
1. DevTools → Network tab
2. Set throttle to "Slow 3G"
3. Refresh page

**Expected:** Loading spinner shows, data loads ✓

---

## Performance Checks

### Load Time
1. Open DevTools → Network tab
2. Refresh page
3. Check total load time

**Target:** < 3 seconds for all data

### API Response Times
1. Click each request in Network tab
2. Check "Time" column

**Target:** < 500ms per request

### Bundle Size
1. Check Network tab
2. Look for js/css files

**Expected:** main.js ~200KB (minified)

---

## Browser Console Check

### Open Console
Press **F12** → **Console** tab

### Expected
- [ ] No red errors
- [ ] No warning about missing dependencies
- [ ] No "Cannot GET" errors

### If you see errors:
1. Check backend is running
2. Check API endpoint URLs are correct
3. Check CORS is enabled
4. Refresh page

---

## Data Verification

### Verify Sample Data Created

**Check Products:**
```bash
# In backend terminal, make a request:
curl http://localhost:5000/api/products
```

Should show 15 products with names like:
- iPhone 15 Pro
- Samsung S24 Ultra
- iPad Pro
- MacBook Air M3
- AirPods Pro

**Check Analytics:**
```bash
curl http://localhost:5000/api/analytics
```

Should show totals (even if 0 initially):
```json
{
  "totalSales": 0,
  "totalProfit": 0,
  "transactionCount": 0,
  "itemsSold": 0
}
```

---

## Complete Integration Checklist

### Dashboard
- [ ] Loads without errors
- [ ] Shows real metrics
- [ ] Recent sales list populated
- [ ] Refresh button works
- [ ] Error handling works

### Sales (POS)
- [ ] Product list loads
- [ ] Search works
- [ ] Can add to cart
- [ ] Calculations correct
- [ ] Can complete sale
- [ ] Product stock updates
- [ ] Error handling works

### Inventory
- [ ] Product table displays
- [ ] Search works
- [ ] Filter works
- [ ] Delete works
- [ ] Stock color coding correct
- [ ] Stats accurate
- [ ] Error handling works

### Analytics
- [ ] Metrics display
- [ ] Charts render
- [ ] Time filter works
- [ ] Refresh works
- [ ] All data is real (from backend)
- [ ] Error handling works

### Technical
- [ ] API client working
- [ ] Error interceptor working
- [ ] Loading states visible
- [ ] No console errors
- [ ] All API calls successful
- [ ] Response times reasonable

---

## Success Criteria

✅ **Integration is successful if:**

1. All 4 pages load with real data
2. No connection errors in console
3. API calls visible in Network tab
4. All CRUD operations work
5. Error messages display properly
6. Loading spinners appear during requests
7. Data persists after page refresh
8. No hardcoded sample data visible

---

## Debugging Steps

### If Tests Fail:

**Step 1: Check Backend**
```bash
# Terminal 1
curl http://localhost:5000/api/health
# Should see: {"status":"ok"}
```

**Step 2: Check Frontend Logs**
```
Browser Console (F12) → Look for errors
```

**Step 3: Check Network**
```
DevTools → Network tab → Check API calls
```

**Step 4: Restart Both**
```
Ctrl+C in Terminal 1 (backend)
Ctrl+C in Terminal 2 (frontend)
npm run dev (in both)
```

**Step 5: Reseed Database**
```bash
# Terminal 1
npm run seed
```

---

## Success! 🎉

If all tests pass, your frontend-backend integration is complete and working perfectly!

**You can now:**
- ✅ View real data in Dashboard
- ✅ Process sales in POS
- ✅ Manage inventory
- ✅ View analytics with charts
- ✅ All data saved to database
- ✅ All errors handled gracefully

**Ready for production use!**

---

## Next Steps

Optional enhancements:
- Add user authentication
- Add product images
- Add barcode scanning
- Add receipt printing
- Add customer management
- Add advanced reporting

See `API_INTEGRATION_COMPLETE.md` for more details.
