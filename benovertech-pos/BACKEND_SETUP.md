# 🚀 Backend Setup & API Guide

## 📋 Prerequisites

- Node.js v18+
- npm v9+
- Ensure you completed the initial project setup

---

## 1️⃣ Initialize Database

Run Prisma migrations to create the SQLite database:

```bash
npm run prisma:migrate --workspace=server
```

**Output:**
```
Prisma Migrate

✔ Generated Prisma Client (5.7.1) in XXX ms

Enter a name for the new migration: › init
✔ Created migration folder(s) in XXX ms
✔ Generated migration file in /prisma/migrations/init_update_date

Your database is now in sync with your schema. Fab!
✔ Created SQLite database at server/dev.db
```

---

## 2️⃣ Seed Sample Data (Optional but Recommended)

Populate the database with 15 sample products and 3 test sales:

```bash
npm run seed --workspace=server
```

**Output:**
```
🌱 Seeding database with sample data...
✅ Cleared existing data
✅ Created 15 sample products
✅ Created 3 sample sales with items
✅ Updated product stock
✅ Created daily analytics

🌱 Database seeded successfully!

📊 Sample Data Created:
  ✓ 15 Products across 5 categories
  ✓ 3 Sales transactions (today)
  ✓ Daily analytics record

💡 Test the API:
  1. GET  http://localhost:5000/api/products
  2. GET  http://localhost:5000/api/sales
  3. GET  http://localhost:5000/api/analytics
```

---

## 3️⃣ Start the Backend Server

```bash
npm run dev:server
```

**Success Output:**
```
============================================================
✅ BENOVERTECH POS Server
============================================================
📍 Server: http://localhost:5000
🏢 Business: BENOVERTECH GADGETS
📞 Phone: 08107271610
📧 Email: benovertech@gmail.com
============================================================

Available Endpoints:
  GET    /api/health
  GET    /api/business-info
  GET    /api/products
  POST   /api/products
  GET    /api/products/:id
  PUT    /api/products/:id
  DELETE /api/products/:id
  GET    /api/products/search?q=query
  GET    /api/products/low-stock?threshold=10
  POST   /api/sales
  GET    /api/sales
  GET    /api/sales/:id
  GET    /api/sales/daily?date=2024-01-01
  GET    /api/analytics
  GET    /api/analytics/monthly?month=1&year=2024
  GET    /api/analytics/inventory
============================================================
```

---

## 🧪 Test the API

### Option 1: Using Browser

1. **Health Check:**
   ```
   http://localhost:5000/api/health
   ```

2. **Get Products:**
   ```
   http://localhost:5000/api/products
   ```

3. **Get Analytics:**
   ```
   http://localhost:5000/api/analytics
   ```

### Option 2: Using cURL

**Get all products:**
```bash
curl http://localhost:5000/api/products
```

**Get today's analytics:**
```bash
curl http://localhost:5000/api/analytics
```

**Search product by barcode:**
```bash
curl http://localhost:5000/api/products/search?q=1001001001
```

**Create a new product:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sony WH-1000XM5",
    "category": "Accessories",
    "costPrice": 45000,
    "sellingPrice": 65000,
    "stock": 25,
    "barcode": "1005001001"
  }'
```

**Create a sale:**
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_HERE",
        "quantity": 2
      }
    ],
    "customerName": "Test Customer",
    "customerPhone": "08012345678",
    "paymentMethod": "cash"
  }'
```

### Option 3: Using Insomnia/Postman

Import the API collection from `API_DOCUMENTATION.md`

---

## 🗄️ Manage Database

### View Database GUI

```bash
npm run prisma:studio --workspace=server
```

Opens at: **http://localhost:5555**

Features:
- ✅ Browse all records
- ✅ Add/edit/delete data
- ✅ Export as CSV
- ✅ See relationships visually

### Reset Database

```bash
# Delete database file
rm server/dev.db

# Re-migrate
npm run prisma:migrate --workspace=server

# Re-seed
npm run seed --workspace=server
```

---

## 📊 Database Schema

### Product
```prisma
id            String      (unique ID)
name          String      (unique product name)
category      String      (e.g., "Smartphones", "Laptops")
costPrice     Float       (what we paid)
sellingPrice  Float       (what we sell for)
stock         Int         (quantity in inventory)
barcode       String      (unique barcode)
createdAt     DateTime
updatedAt     DateTime
```

### Sale
```prisma
id            String      (unique ID)
totalAmount   Float       (sum of all items)
totalProfit   Float       (sum of profits)
customerName  String      (optional)
customerPhone String      (optional)
paymentMethod String      (cash | card | transfer)
createdAt     DateTime
items         SaleItem[]  (relationship)
```

### SaleItem
```prisma
id            String      (unique ID)
saleId        String      (FK to Sale)
productId     String      (FK to Product)
quantity      Int         (how many)
price         Float       (selling price at time of sale)
profit        Float       (price - cost)
```

### DailyAnalytics
```prisma
id               String      (unique ID)
date             DateTime    (unique per day)
totalSales       Float
totalProfit      Float
totalCost        Float
itemsSold        Int
transactionCount Int
```

---

## 🔧 Troubleshooting

### "Cannot find module '@prisma/client'"

```bash
npm install --workspace=server
npx prisma generate --schema=prisma/schema.prisma
```

### "SQLITE_CANTOPEN: unable to open database file"

```bash
# Ensure directory exists
mkdir -p server

# Re-migrate
npm run prisma:migrate --workspace=server
```

### "Port 5000 already in use"

```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in server/.env
PORT=5001
```

### "Cannot delete product with existing sales"

This is intentional for data integrity. Use Prisma Studio to manually delete sales first if needed.

---

## 🎯 Business Logic Implemented

### Profit Calculation
```
Per Item Profit = sellingPrice - costPrice
Sale Total Profit = Sum of (profit × quantity) for all items
```

### Stock Management
✅ Validates stock before sale
✅ Automatically reduces stock after successful sale
✅ Prevents sale if insufficient stock
✅ Returns clear error messages

### Sales Transaction
✅ Creates sale record
✅ Creates sale items with product details
✅ Calculates totals automatically
✅ Updates daily analytics
✅ Reduces product stock in one transaction

### Analytics Tracking
✅ Daily summaries (sales, profit, items, transactions)
✅ Payment method breakdown
✅ Top products ranking
✅ Monthly reports
✅ Inventory valuation
✅ Profit margin calculation

---

## 📈 Key Endpoints for Frontend

**Products:**
- `GET /api/products` - List all
- `POST /api/products` - Create
- `GET /api/products/:id` - Get by ID or barcode
- `PUT /api/products/:id` - Update
- `DELETE /api/products/:id` - Delete
- `GET /api/products/search?q=query` - Search

**Sales:**
- `POST /api/sales` - Create sale (MOST IMPORTANT)
- `GET /api/sales` - List with filters
- `GET /api/sales/:id` - Get details
- `GET /api/sales/daily?date=2024-01-15` - Daily summary

**Analytics:**
- `GET /api/analytics` - Today's dashboard
- `GET /api/analytics/monthly?month=1&year=2024` - Monthly report
- `GET /api/analytics/inventory` - Stock valuation

---

## ✅ Next Steps

1. ✅ Database created with Prisma
2. ✅ API routes implemented
3. ✅ Business logic complete
4. ✅ Sample data available
5. ⏳ Connect frontend to API
6. ⏳ Build UI components
7. ⏳ Add barcode scanning
8. ⏳ Generate PDFs
9. ⏳ PWA support

---

## 📚 API Documentation

See `API_DOCUMENTATION.md` for complete endpoint reference with:
- Request/response examples
- Query parameters
- Error handling
- cURL examples
- Business logic notes

---

## 🎉 Backend is Ready!

Your POS backend is fully functional with:
- ✅ 6 database models
- ✅ 15+ API endpoints
- ✅ Complete business logic
- ✅ Sample data
- ✅ Error handling
- ✅ Analytics tracking

Start the server:
```bash
npm run dev:server
```

Test the API:
```bash
http://localhost:5000/api/products
```

Next: Connect the frontend! 🚀
