# BENOVERTECH GADGETS - Point of Sale System

A production-ready POS (Point of Sale) application built with modern technologies for efficient retail operations.

**Business Details:**
- **Name:** BENOVERTECH GADGETS
- **Address:** 14 Benson Ojukwu Street, Canal Estate, Ago Palace Lagos
- **Phone:** 08107271610
- **Email:** benovertech@gmail.com

---

## 🏗️ Project Structure

```
benovertech-pos/
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand store (state management)
│   │   ├── api/             # API client & services
│   │   ├── utils/           # Helper functions
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Helper functions
│   │   └── index.js         # Server entry point
│   ├── package.json
│   ├── .env                 # Environment variables (local)
│   ├── .env.example
│   └── .gitignore
│
├── prisma/                    # Database
│   ├── schema.prisma        # Database schema
│   └── dev.db              # SQLite database (auto-generated)
│
├── package.json             # Monorepo root
└── .gitignore
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | UI framework & build tool |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Charts** | Recharts | Data visualization |
| **Backend** | Node.js + Express | API server |
| **Database** | SQLite + Prisma | Data persistence & ORM |
| **PDF** | html2canvas + jsPDF | Invoice generation |
| **Barcode** | BarcodeDetector API | Product scanning |
| **State** | Zustand | Client-side state |
| **HTTP** | Axios | API requests |
| **PWA** | (Ready for setup) | Progressive Web App |

---

## 📋 Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org))
- **npm** v9+ or **yarn** v3+
- **Git** (optional)

Verify installation:
```bash
node --version
npm --version
```

---

## 🚀 Installation & Setup

### 1️⃣ Navigate to Project Directory

```bash
cd c:\decent\benovertech-pos
```

### 2️⃣ Install Root Dependencies

Install `concurrently` for running both servers simultaneously:

```bash
npm install
```

### 3️⃣ Install Backend Dependencies

```bash
npm install --workspace=server
```

This installs:
- `express` - Web framework
- `@prisma/client` - Database client
- `cors` - Cross-origin middleware
- `dotenv` - Environment configuration
- `nodemon` - Auto-reload on changes

### 4️⃣ Install Frontend Dependencies

```bash
npm install --workspace=client
```

This installs:
- `react` & `react-dom` - UI framework
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `recharts` - Charts library
- `html2canvas` & `jspdf` - PDF generation
- `zustand` - State management
- `axios` - HTTP client

### 5️⃣ Setup Prisma & Database

Initialize the database schema:

```bash
npm run prisma:migrate --workspace=server
```

This will:
- Create SQLite database (`server/dev.db`)
- Apply Prisma migrations
- Generate Prisma Client

**Verify database was created:**
```bash
ls server/dev.db
```

---

## ▶️ Running the Application

### Option 1: Run Both Servers Simultaneously (Recommended)

From root directory:

```bash
npm run dev
```

This starts:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

Watch for success messages:
```
✅ BENOVERTECH POS Server running on http://localhost:5000
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev:client
```

---

## 📱 Accessing the Application

Once both servers are running:

1. **Open Browser:** http://localhost:5173
2. **Dashboard loads automatically** (no login required)
3. You'll see the main dashboard with:
   - Business info (BENOVERTECH GADGETS)
   - Quick statistics (Today's Sales, Transactions, etc.)
   - Navigation menu (Sales, Products, Reports, Expenses, Settings)

---

## 🗄️ Database Management

### View Database (Prisma Studio)

Interactive database GUI:

```bash
npm run prisma:studio --workspace=server
```

Opens at: http://localhost:5555

### Generate Prisma Client

After schema changes:

```bash
npm run prisma:generate --workspace=server
```

### Create New Migration

After modifying `prisma/schema.prisma`:

```bash
npm run prisma:migrate --workspace=server
```

---

## 📦 Build for Production

### Build Both Projects

```bash
npm run build
```

Outputs:
- `client/dist/` - Static frontend build
- Backend ready for deployment

### Build Individually

```bash
# Frontend only
npm run build:client

# Backend only
npm run build:server
```

---

## 🔧 Environment Variables

### Server (.env)

Already configured in `server/.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Client Configuration

Frontend uses Vite's proxy to reach backend at `/api`.

---

## 📚 Database Schema

### Tables

1. **Product** - Product inventory
   - id, barcode, name, category, price, cost, quantity, image

2. **Sale** - Sales transactions
   - id, saleNo, total, discount, paid, paymentMethod, status

3. **SaleItem** - Items in each sale
   - id, saleId, productId, quantity, unitPrice, discount, total

4. **DailyReport** - Daily summaries
   - id, date, totalSales, totalCost, revenue, itemsSold, transactionCount

5. **Expense** - Operational expenses
   - id, category, amount, description, date

---

## 🔗 API Endpoints (Ready to Implement)

### Business Info
- `GET /api/business-info` - Get company details

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `GET /api/products/search?q=query` - Search products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales` - List sales
- `GET /api/sales/:id` - Get sale details

### Reports
- `GET /api/reports/daily?date=2024-01-01` - Daily report
- `GET /api/reports/monthly?month=1&year=2024` - Monthly report

---

## 🎨 Frontend Features (Ready to Implement)

- ✅ Dashboard with key metrics
- ✅ Responsive sidebar navigation
- ✅ Tailwind CSS styling
- ⏳ Sales module (cart, checkout)
- ⏳ Product management
- ⏳ Barcode scanning
- ⏳ PDF invoice generation
- ⏳ Charts & reports
- ⏳ Expense tracking
- ⏳ PWA manifest

---

## 🧪 Testing Backend

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "POS Server is running"
}
```

### Business Info

```bash
curl http://localhost:5000/api/business-info
```

---

## 📝 Development Notes

### Adding New Dependencies

```bash
# Server package
npm install package-name --workspace=server

# Client package
npm install package-name --workspace=client
```

### Prettier Integration (Optional)

```bash
npm install --save-dev prettier --workspace=client
npm install --save-dev prettier --workspace=server
```

### File Conventions

- **Components:** PascalCase (e.g., `Dashboard.jsx`)
- **Utils:** camelCase (e.g., `formatters.js`)
- **Routes:** lowercase (e.g., `/api/products`)
- **Store:** lowercase (e.g., `usePOSStore`)

---

## 🐛 Troubleshooting

### "Port already in use"

If port 5000 or 5173 is in use:

```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change ports in .env and vite.config.js
```

### "Cannot find module"

```bash
# Reinstall dependencies
rm -r node_modules server/node_modules client/node_modules
npm install
```

### "Database connection error"

```bash
# Recreate database
rm server/dev.db
npm run prisma:migrate --workspace=server
```

### Frontend can't reach backend

- Ensure backend is running on http://localhost:5000
- Check CORS settings in `server/src/index.js`
- Verify `CLIENT_URL` in `server/.env`

---

## 📖 Next Steps

After setup is complete, the following features will be implemented:

1. **Product Module** - Add, edit, delete products with barcode scanning
2. **Sales Module** - Complete checkout flow with payment methods
3. **Reports** - Daily/monthly sales analytics with charts
4. **Expense Tracking** - Track business expenses
5. **Invoice Generation** - Print/email receipts and invoices
6. **PWA Setup** - Install as app on devices
7. **Advanced Features** - Inventory alerts, stock levels, multi-user support

---

## 📞 Support

**Business Contact:**
- Email: benovertech@gmail.com
- Phone: 08107271610
- Address: 14 Benson Ojukwu Street, Canal Estate, Ago Palace Lagos

---

## 📄 License

This project is proprietary software for BENOVERTECH GADGETS.

---

**Ready to start development! 🚀**

```bash
npm run dev
```
