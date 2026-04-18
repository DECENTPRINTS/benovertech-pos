# 🏗️ BENOVERTECH POS - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BENOVERTECH POS SYSTEM                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────┐          ┌──────────────────────────┐
│                         │          │                          │
│   FRONTEND (React)      │          │   BACKEND (Express)      │
│   Port: 5173            │◄────────►│   Port: 5000             │
│                         │   API    │                          │
│  - Dashboard            │ Calls    │  - Routes (15 endpoints) │
│  - Products             │   &      │  - Controllers (logic)   │
│  - Sales/POS            │ JSON     │  - Database (Prisma)     │
│  - Reports              │          │  - Analytics             │
│  - Barcode Scanner      │          │                          │
│                         │          │                          │
└─────────────────────────┘          └──────────────────────────┘
          │                                      │
          │                                      │
          └──────────────────────────────────────┘
                   Shared: SQLite DB
                   (server/dev.db)


┌────────────────────────────────────────────────────────────┐
│              DATABASE (SQLite + Prisma)                    │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Product  │  │  Sale    │  │SaleItem  │  │ Daily    │  │
│  │          │  │          │  │          │  │Analytics │  │
│  │• id      │  │• id      │  │• id      │  │• id      │  │
│  │• name    │  │• total   │  │• saleId  │  │• date    │  │
│  │• cost    │  │• profit  │  │• product │  │• sales   │  │
│  │• price   │  │• customer│  │• qty     │  │• profit  │  │
│  │• stock   │  │• payment │  │• price   │  │• items   │  │
│  │• barcode │  │• date    │  │• profit  │  │• trans   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  ┌──────────┐                                             │
│  │ Expense  │  (Future)                                   │
│  └──────────┘                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### 1. Create Sale (Most Important Transaction)

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (React)                           │
│  User clicks "Checkout" in POS                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ POST /api/sales
                         │ {items, customer, payment}
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND (Express Router)                       │
│  POST /api/sales ──► saleController.createSale()          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            BUSINESS LOGIC (Controller)                      │
│                                                             │
│  1. Validate items (required, quantity > 0)                │
│  2. For each item:                                         │
│     - Get product from database                           │
│     - Check: stock >= quantity ✓                          │
│     - Calculate: profit = sellingPrice - costPrice        │
│     - Calculate: itemTotal = price × quantity             │
│  3. Calculate totals:                                      │
│     - totalAmount = sum of all itemTotal                  │
│     - totalProfit = sum of all (profit × qty)             │
│  4. Validate payment method (cash, card, transfer)        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           DATABASE TRANSACTION (Prisma)                    │
│                                                             │
│  1. Create Sale record                                     │
│     - Insert: totalAmount, totalProfit, customer, etc.    │
│  2. Create SaleItem records                               │
│     - For each item: product, quantity, price, profit    │
│  3. Update Product stock                                  │
│     - For each product: stock -= quantity                 │
│  4. Create/Update DailyAnalytics                          │
│     - Increment: totalSales, totalProfit, items, trans   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            RESPONSE (Success)                               │
│  {                                                          │
│    success: true,                                          │
│    data: {                                                 │
│      id: "sale_123",                                       │
│      totalAmount: 700000,                                  │
│      totalProfit: 140000,                                  │
│      items: [...]                                         │
│    }                                                       │
│  }                                                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (React)                           │
│  - Update cart (clear)                                     │
│  - Show receipt                                            │
│  - Update dashboard                                        │
│  - Play success sound                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoint Groups

### Health & Information (2 endpoints)
```
GET  /api/health          → Server status
GET  /api/business-info   → Company details
```

### Products Management (7 endpoints)
```
GET    /api/products               → List all products
POST   /api/products               → Create product
GET    /api/products/:id           → Get by ID/barcode
PUT    /api/products/:id           → Update product
DELETE /api/products/:id           → Delete product
GET    /api/products/search        → Search products
GET    /api/products/low-stock     → Low stock alert
```

### Sales Processing (4 endpoints)
```
POST   /api/sales                  → Create sale ⭐
GET    /api/sales                  → List sales
GET    /api/sales/:id              → Get sale details
GET    /api/sales/daily            → Daily summary
```

### Analytics & Reports (3 endpoints)
```
GET    /api/analytics              → Today's dashboard
GET    /api/analytics/monthly      → Monthly breakdown
GET    /api/analytics/inventory    → Stock valuation
```

---

## Data Relationships

```
┌──────────────┐
│   Product    │ (1 product)
│              │
│ id (PK)      │
│ name         │     ┌─────────────┐
│ category     │────►│  SaleItem   │ (many items)
│ costPrice    │     │             │
│ sellingPrice │     │ productId   │
│ stock        │     │ quantity    │
│ barcode      │     │ price       │
└──────────────┘     │ profit      │
                     └─────────────┘
                            ▲
                            │ (1 sale)
                            │
                        ┌───┴──────────┐
                        │   Sale       │
                        │              │
                        │ id (PK)      │
                        │ totalAmount  │
                        │ totalProfit  │
                        │ customer     │
                        │ payment      │
                        │ createdAt    │
                        └──────────────┘

    ┌─────────────────────────────────────────┐
    │    DailyAnalytics                       │
    │    (Updated on each sale)               │
    │    - totalSales                         │
    │    - totalProfit                        │
    │    - itemsSold                          │
    │    - transactionCount                   │
    └─────────────────────────────────────────┘
```

---

## Business Logic Flow

### Stock Management
```
Product has stock: 15

Customer buys: 2 units
├─ Check: 15 >= 2? ✓ YES
├─ Create sale
├─ Reduce stock: 15 - 2 = 13
└─ Update product

Next check: Stock is now 13
```

### Profit Calculation
```
Product:
- costPrice: 280,000
- sellingPrice: 350,000

Sale of 2 units:
- Profit per unit: 350,000 - 280,000 = 70,000
- Total profit: 70,000 × 2 = 140,000
- Sale amount: 350,000 × 2 = 700,000

Analytics:
- Total Sales +700,000
- Total Profit +140,000
- Margin: 140,000 / 700,000 = 20%
```

### Daily Analytics Update
```
Start of day:
- Total: ₦0
- Profit: ₦0
- Items: 0
- Transactions: 0

First sale: ₦700,000 (2 items, profit ₦140,000)
- Total: ₦700,000
- Profit: ₦140,000
- Items: 2
- Transactions: 1

Second sale: ₦530,000 (3 items, profit ₦110,000)
- Total: ₦1,230,000
- Profit: ₦250,000
- Items: 5
- Transactions: 2

And so on...
```

---

## Validation Rules

### Product Creation
```
✓ Name: Required, Unique
✓ Category: Required
✓ costPrice: Required, >= 0
✓ sellingPrice: Required, > costPrice
✓ stock: Optional, >= 0
✓ barcode: Required, Unique
```

### Sale Creation
```
✓ items: Required, non-empty array
✓ items[].productId: Required, must exist
✓ items[].quantity: Required, > 0
✓ Stock check: Available >= Requested
✓ paymentMethod: One of [cash, card, transfer]
✓ customerName: Optional
✓ customerPhone: Optional
```

---

## Error Handling

```
┌─────────────────────────────┐
│   Request comes in          │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│   Validate input            │
└─────────────────────────────┘
    │           │           │
    │(error)    │(error)    │(error)
    ▼           ▼           ▼
  400         400          404
Missing    Invalid        Not
Fields     Data           Found
    │           │           │
    └───────────┴───────────┘
               │
               ▼
      ┌─────────────────────────────┐
      │  Return Error Response      │
      │  {                          │
      │    success: false,          │
      │    message: "Error desc"    │
      │  }                          │
      └─────────────────────────────┘
```

---

## Deployment Architecture (Future)

```
┌──────────────────────────────────────────────────────────┐
│                  PRODUCTION (Azure)                      │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │   Frontend (Static Web App)                         │ │
│  │   - React build output                              │ │
│  │   - CDN distribution                                │ │
│  └─────────────────────────────────────────────────────┘ │
│                         │                                 │
│                         │ HTTPS                           │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │   Backend (App Service)                             │ │
│  │   - Node.js Express server                          │ │
│  │   - Auto-scaling                                    │ │
│  │   - Monitoring                                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                         │                                 │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │   Database (Azure SQL / SQLite)                     │ │
│  │   - Backups                                         │ │
│  │   - Encryption                                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Current Status

```
✅ COMPLETE:
   - Database schema
   - 15+ API endpoints
   - Business logic
   - Controllers
   - Routes
   - Error handling
   - Sample data
   - Documentation

⏳ NEXT PHASE:
   - Frontend integration
   - UI components
   - Barcode scanning
   - PDF generation
   - PWA setup
   - Deployment
```

---

## Testing Flow

```
┌─ Unit Tests (Backend)
│  - Controllers
│  - Validators
│  - Calculations
│
├─ Integration Tests
│  - API endpoints
│  - Database operations
│  - Business logic
│
├─ API Tests (Manual)
│  - cURL/Postman
│  - Sample data
│  - All endpoints
│
└─ End-to-End (Later)
   - Frontend + Backend
   - User workflows
   - Performance
```

---

## Performance Considerations

```
Database Indexes:
├─ Product.name (unique)
├─ Product.barcode (unique)
├─ Sale.createdAt (for sorting)
├─ DailyAnalytics.date (unique)
└─ SaleItem.saleId, productId (foreign keys)

Query Optimization:
├─ Select only needed fields
├─ Proper pagination
├─ Efficient filtering
└─ Relationship loading

Caching (Future):
├─ Product list cache
├─ Analytics cache (1 hour)
└─ Session storage
```

---

**System Architecture Complete! 🎉**

All components are designed for scalability and maintainability.
