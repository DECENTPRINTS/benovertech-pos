# 🧪 Backend Testing Guide

## Quick Start (5 Steps)

### 1. Setup Database
```bash
npm run prisma:migrate --workspace=server
```

### 2. Seed Sample Data
```bash
npm run seed --workspace=server
```

### 3. Start Server
```bash
npm run dev:server
```

### 4. Open Browser
```
http://localhost:5000/api/products
```

### 5. Create a Sale
Use cURL or Postman to POST to `/api/sales`

---

## 🔗 Test Endpoints

### Health Check
```
URL: http://localhost:5000/api/health
Method: GET
```
✅ Should return `{"status": "OK"}`

---

### Get All Products
```
URL: http://localhost:5000/api/products
Method: GET
```
✅ Should return array of 15 products (after seed)

---

### Search Product
```
URL: http://localhost:5000/api/products/search?q=iPhone
Method: GET
```
✅ Should return iPhone products

---

### Get Product by Barcode
```
URL: http://localhost:5000/api/products/1001001001
Method: GET
```
✅ Should return iPhone 15 Pro

---

### Create Product
```
URL: http://localhost:5000/api/products
Method: POST
Header: Content-Type: application/json

Body:
{
  "name": "OnePlus 12",
  "category": "Smartphones",
  "costPrice": 250000,
  "sellingPrice": 320000,
  "stock": 8,
  "barcode": "1001001005"
}
```
✅ Should return the created product

---

### Get All Sales
```
URL: http://localhost:5000/api/sales
Method: GET
```
✅ Should return 3 sample sales (after seed)

---

### Get Today's Analytics
```
URL: http://localhost:5000/api/analytics
Method: GET
```
✅ Should return:
- totalSalesAmount: 2,610,000
- totalProfit: 460,000
- profitMargin: 17.62%
- transactionCount: 3
- totalItems: 11

---

### Create a Sale ⭐ (IMPORTANT)
```
URL: http://localhost:5000/api/sales
Method: POST
Header: Content-Type: application/json

Body:
{
  "items": [
    {
      "productId": "REPLACE_WITH_PRODUCT_ID",
      "quantity": 2
    }
  ],
  "customerName": "Test Customer",
  "customerPhone": "08012345678",
  "paymentMethod": "cash"
}
```

**How to get productId:**
1. GET http://localhost:5000/api/products
2. Copy an `id` from the response
3. Replace `REPLACE_WITH_PRODUCT_ID` above
4. Send the POST request

✅ Should return:
- Sale created with unique ID
- totalAmount = 2 × sellingPrice
- totalProfit = 2 × (sellingPrice - costPrice)
- Product stock reduced by 2

---

### Get Monthly Analytics
```
URL: http://localhost:5000/api/analytics/monthly?month=1&year=2024
Method: GET
```
✅ Should return monthly breakdown

---

### Get Inventory Report
```
URL: http://localhost:5000/api/analytics/inventory
Method: GET
```
✅ Should show:
- Total products: 15
- Total items in stock
- Stock value
- Profit potential

---

## 📝 Test Scenarios

### Scenario 1: Normal Sale
1. GET products to get ID
2. POST sale with existing product
3. GET same product to verify stock reduced
4. GET analytics to see updated totals

**Expected:**
- Stock: 15 → 13 (if ordered 2)
- Analytics updated
- Sale created

### Scenario 2: Insufficient Stock
```json
{
  "items": [{
    "productId": "PRODUCT_ID",
    "quantity": 1000
  }],
  "customerName": "Test",
  "paymentMethod": "cash"
}
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Insufficient stock for iPhone 15 Pro. Available: 13, Requested: 1000"
}
```

### Scenario 3: Invalid Data
```json
{
  "items": [{
    "productId": "invalid_id",
    "quantity": 1
  }],
  "paymentMethod": "cash"
}
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Product invalid_id not found"
}
```

### Scenario 4: Check Profit
After creating a sale:
- GET `/api/sales/:saleId`
- Verify: totalProfit = Σ(sellingPrice - costPrice) × quantity

---

## 🗄️ Database Inspection

### View All Data
```bash
npm run prisma:studio --workspace=server
```
- Opens http://localhost:5555
- Browse Products, Sales, SaleItems
- See relationships visually

### Check Stock
In Prisma Studio:
1. Click "Product"
2. See all products
3. Click on any product
4. See related SaleItems

---

## 🐛 Debugging

### Check Server Logs
When running `npm run dev:server`, watch for:
- Request logs with timestamps
- Error messages
- Validation failures

**Example Log:**
```
2024-01-15T10:30:00.000Z - POST /api/sales
2024-01-15T10:30:01.000Z - GET /api/analytics
```

### Check Database Directly
```bash
npm run prisma:studio --workspace=server
```
Then:
1. Navigate to Sales table
2. Check if sale was created
3. Check SaleItems were created
4. Verify Product stock changed

### Test Raw SQL (Optional)
```bash
# Start SQLite CLI
sqlite3 server/dev.db

# View tables
.tables

# Query products
SELECT * FROM Product;

# Query sales
SELECT * FROM Sale;
```

---

## 🎯 Test Checklist

- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] Get products returns list
- [ ] Search works by name
- [ ] Search works by barcode
- [ ] Create product validates input
- [ ] Get sales returns list
- [ ] Create sale validates stock
- [ ] Create sale reduces stock
- [ ] Analytics returns correct totals
- [ ] Profit calculated correctly
- [ ] Low stock endpoint works
- [ ] Monthly analytics works
- [ ] Inventory report works
- [ ] Database seeding completes

---

## 💡 Important Notes

### Profit Calculation
```
Per Item Profit = sellingPrice - costPrice
Sale Total Profit = Σ(profit × quantity)

Example:
iPhone 15: costPrice=280,000, sellingPrice=350,000
Profit per unit = 70,000
If sold 2: Total profit = 140,000
```

### Stock Reduction
```
Initial stock: 15
After sale of 2: 15 - 2 = 13
Cannot sell if stock < quantity
```

### Daily Analytics
```
Updated automatically when:
- Sale created
- Includes today's totals only
- Resets daily
```

---

## 📊 Sample Data Overview

**Products (after seed):**
- 4 Smartphones: ₦300,000-380,000
- 3 Tablets: ₦450,000-530,000
- 3 Laptops: ₦450,000-850,000
- 5 Accessories: ₦3,500-50,000

**Sample Sales (after seed):**
- Sale 1: 2x iPhone 15 Pro = ₦700,000
- Sale 2: 1x Samsung S24 Ultra + 3x Galaxy Buds = ₦530,000
- Sale 3: 1x iPad Air + 2x iPhone 15 + 2x AirPods = ₦1,380,000

**Total After Seed:**
- Total Sales: ₦2,610,000
- Total Profit: ₦460,000
- Items Sold: 11
- Transactions: 3

---

## 🚀 What to Test First

1. **Server Health**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Products List**
   ```bash
   curl http://localhost:5000/api/products
   ```

3. **Today's Analytics**
   ```bash
   curl http://localhost:5000/api/analytics
   ```

4. **Create Sale** (Most Important)
   - Copy a product ID from step 2
   - Create sale with that product
   - Verify stock reduced
   - Verify profit calculated

5. **View Database**
   ```bash
   npm run prisma:studio --workspace=server
   ```

---

## ✅ Everything Working?

If all tests pass:
- ✅ Backend is fully functional
- ✅ Database is working
- ✅ Business logic is correct
- ✅ Ready for frontend integration

---

**Happy Testing! 🎉**

Next: Connect the frontend to these APIs
