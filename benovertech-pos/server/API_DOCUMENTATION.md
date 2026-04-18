# 🚀 BENOVERTECH POS - Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## ✅ Core Endpoints

### Health & Info

#### 1. Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "message": "POS Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Get Business Info
```
GET /business-info
```
**Response:**
```json
{
  "success": true,
  "data": {
    "name": "BENOVERTECH GADGETS",
    "address": "14 Benson Ojukwu Street, Canal Estate, Ago Palace Lagos",
    "phone": "08107271610",
    "email": "benovertech@gmail.com"
  }
}
```

---

## 📦 Products Endpoints

### 1. Get All Products
```
GET /products
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "iPhone 15",
      "category": "Phones",
      "costPrice": 280000,
      "sellingPrice": 350000,
      "stock": 5,
      "barcode": "1234567890",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

### 2. Get Product by ID or Barcode
```
GET /products/:id
```
**Parameters:**
- `id` - Product ID (cuid) or barcode (string)

**Example:**
```
GET /products/abc123
GET /products/1234567890
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "iPhone 15",
    "category": "Phones",
    "costPrice": 280000,
    "sellingPrice": 350000,
    "stock": 5,
    "barcode": "1234567890",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 3. Create Product
```
POST /products
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Samsung S24",
  "category": "Phones",
  "costPrice": 300000,
  "sellingPrice": 380000,
  "stock": 10,
  "barcode": "9876543210"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "def456",
    "name": "Samsung S24",
    "category": "Phones",
    "costPrice": 300000,
    "sellingPrice": 380000,
    "stock": 10,
    "barcode": "9876543210",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Validation Rules:**
- All fields required
- costPrice must be < sellingPrice
- Barcode must be unique
- Prices cannot be negative
- Stock cannot be negative

### 4. Update Product
```
PUT /products/:id
Content-Type: application/json
```
**Request Body (all fields optional):**
```json
{
  "name": "Samsung S24 Ultra",
  "category": "Phones",
  "costPrice": 320000,
  "sellingPrice": 400000,
  "stock": 8,
  "barcode": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { /* updated product */ }
}
```

### 5. Delete Product
```
DELETE /products/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": { /* deleted product */ }
}
```

**Note:** Cannot delete products with existing sales records.

### 6. Search Products
```
GET /products/search?q=keyword
```
**Query Parameters:**
- `q` - Search term (searches name or barcode)

**Example:**
```
GET /products/search?q=iPhone
GET /products/search?q=1234567890
```

**Response:**
```json
{
  "success": true,
  "data": [
    { /* matching products */ }
  ],
  "total": 1
}
```

### 7. Get Low Stock Products
```
GET /products/low-stock?threshold=10
```
**Query Parameters:**
- `threshold` - Stock level threshold (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    { /* products with stock <= threshold */ }
  ],
  "total": 2
}
```

---

## 💰 Sales Endpoints

### 1. Create Sale (Most Important - Contains Business Logic)
```
POST /sales
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "abc123",
      "quantity": 2
    },
    {
      "productId": "def456",
      "quantity": 1
    }
  ],
  "customerName": "John Doe",
  "customerPhone": "08012345678",
  "paymentMethod": "cash"
}
```

**Business Logic Applied:**
- ✅ Validates sufficient stock for each product
- ✅ Calculates profit per item: `sellingPrice - costPrice`
- ✅ Reduces stock from inventory
- ✅ Calculates totalAmount and totalProfit
- ✅ Updates daily analytics

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "id": "sale123",
    "totalAmount": 730000,
    "totalProfit": 120000,
    "customerName": "John Doe",
    "customerPhone": "08012345678",
    "paymentMethod": "cash",
    "itemCount": 2,
    "createdAt": "2024-01-15T12:00:00Z",
    "items": [
      {
        "id": "item1",
        "saleId": "sale123",
        "productId": "abc123",
        "quantity": 2,
        "price": 350000,
        "profit": 70000
      }
    ]
  }
}
```

**Validation Rules:**
- Items array must contain at least 1 item
- Each item must have productId and quantity > 0
- Product must exist
- Stock must be sufficient
- Payment method must be: `cash`, `card`, or `transfer`

### 2. Get All Sales
```
GET /sales?limit=50&offset=0&startDate=2024-01-01&endDate=2024-01-31&paymentMethod=cash
```

**Query Parameters:**
- `limit` - Records per page (default: 50)
- `offset` - Pagination offset (default: 0)
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `paymentMethod` - Filter by payment method (cash, card, transfer)

**Example:**
```
GET /sales?limit=20&offset=0
GET /sales?startDate=2024-01-15&endDate=2024-01-15
GET /sales?paymentMethod=cash
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sale123",
      "totalAmount": 730000,
      "totalProfit": 120000,
      "customerName": "John Doe",
      "customerPhone": "08012345678",
      "paymentMethod": "cash",
      "createdAt": "2024-01-15T12:00:00Z",
      "items": [
        {
          "id": "item1",
          "quantity": 2,
          "price": 350000,
          "profit": 70000,
          "product": {
            "id": "abc123",
            "name": "iPhone 15",
            "category": "Phones"
          }
        }
      ]
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

### 3. Get Sale by ID
```
GET /sales/:id
```

**Response:**
```json
{
  "success": true,
  "data": { /* full sale details with items */ }
}
```

### 4. Get Daily Sales Summary
```
GET /sales/daily?date=2024-01-15
```

**Query Parameters:**
- `date` - Date (YYYY-MM-DD format, default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "sales": [ /* all sales for that day */ ],
    "summary": {
      "totalSales": 5,
      "totalAmount": 3650000,
      "totalProfit": 600000,
      "itemsSold": 12,
      "averageTransaction": 730000
    }
  }
}
```

---

## 📊 Analytics Endpoints

### 1. Get Today's Analytics (Dashboard)
```
GET /analytics
GET /analytics?startDate=2024-01-15&endDate=2024-01-15
```

**Query Parameters:**
- `startDate` - Start date (ISO format, default: today)
- `endDate` - End date (ISO format, default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-15",
      "endDate": "2024-01-15"
    },
    "summary": {
      "totalSalesAmount": 3650000,
      "totalProfit": 600000,
      "totalCost": 2600000,
      "totalItems": 12,
      "transactionCount": 5,
      "averageTransaction": 730000,
      "profitMargin": "16.44"
    },
    "paymentMethods": {
      "cash": {
        "count": 4,
        "amount": 2920000
      },
      "card": {
        "count": 1,
        "amount": 730000
      }
    },
    "topProducts": [
      {
        "productId": "abc123",
        "quantity": 8,
        "revenue": 2800000,
        "profit": 560000,
        "product": {
          "id": "abc123",
          "name": "iPhone 15",
          "category": "Phones"
        }
      }
    ],
    "lowStockProducts": [
      {
        "id": "xyz789",
        "name": "iPad Air",
        "stock": 2,
        "sellingPrice": 450000
      }
    ]
  }
}
```

### 2. Get Monthly Analytics
```
GET /analytics/monthly?month=1&year=2024
```

**Query Parameters:**
- `month` - Month (1-12, required)
- `year` - Year (YYYY format, required)

**Response:**
```json
{
  "success": true,
  "data": {
    "month": 1,
    "year": 2024,
    "summary": {
      "totalSalesAmount": 50000000,
      "totalProfit": 8000000,
      "totalItems": 250,
      "transactionCount": 80,
      "averageDaily": 1612903.23
    },
    "daily": [
      {
        "date": "2024-01-01",
        "totalSales": 1500000,
        "totalProfit": 250000,
        "transactions": 3,
        "items": 10
      }
    ]
  }
}
```

### 3. Get Inventory Report
```
GET /analytics/inventory
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 50,
      "totalItems": 250,
      "totalStockValue": 75000000,
      "totalCostValue": 60000000,
      "totalProfit": 15000000
    },
    "byCategory": [
      {
        "category": "Phones",
        "items": 100,
        "stockValue": 35000000,
        "costValue": 28000000,
        "products": [ /* category products */ ]
      }
    ],
    "products": [ /* all products */ ]
  }
}
```

---

## 📝 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details (development only)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

**Example Error:**
```
POST /products
{
  "name": "iPhone 15"
  // Missing required fields
}

Response: 400 Bad Request
{
  "success": false,
  "message": "Missing required fields: name, category, costPrice, sellingPrice, barcode"
}
```

---

## 🧪 Testing with cURL

### Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "category": "Phones",
    "costPrice": 280000,
    "sellingPrice": 350000,
    "stock": 10,
    "barcode": "1234567890"
  }'
```

### Create a Sale
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "abc123",
        "quantity": 2
      }
    ],
    "customerName": "John Doe",
    "customerPhone": "08012345678",
    "paymentMethod": "cash"
  }'
```

### Get Analytics
```bash
curl http://localhost:5000/api/analytics
```

### Get Sales for Today
```bash
curl "http://localhost:5000/api/sales?startDate=2024-01-15&endDate=2024-01-15"
```

---

## 💡 Business Logic Summary

### Profit Calculation
```
Per Item Profit = sellingPrice - costPrice
Total Item Profit = (sellingPrice - costPrice) × quantity
Total Sale Profit = Sum of all item profits
```

### Stock Management
- Stock reduces automatically when sale is created
- Cannot sell if stock is insufficient
- Returns validation error with available stock

### Analytics Tracking
- Daily totals updated on each sale
- Tracks: sales amount, profit, items sold, transaction count
- Categories breakdown available

---

## 🔄 Integration Notes

1. **All timestamps** are in ISO 8601 format (UTC)
2. **All currency** is in Nigerian Naira (₦)
3. **Pagination** supports limit and offset
4. **Filters** are optional - omit for default behavior
5. **CORS** enabled for frontend at `http://localhost:5173`

---

**API Version:** 1.0
**Last Updated:** 2024-01-15
