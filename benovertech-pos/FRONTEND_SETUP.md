# 🚀 Frontend Setup & Quick Start

## ⚡ Get Started (5 Minutes)

### 1. Install Dependencies
```bash
cd c:\decent\benovertech-pos\client
npm install
```
⏱️ Takes ~1-2 minutes

### 2. Start Development Server
```bash
npm run dev
```
⏱️ Should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
```

### 3. Open in Browser
```
http://localhost:5173
```

✅ You should see the POS interface with 4 pages

---

## 📱 What You See

### Desktop (768px+)
- Black sidebar on left
- Main content area
- All 4 pages accessible

### Mobile (<768px)
- Full-width content
- Bottom navigation bar
- Same 4 pages, mobile-optimized

---

## 🎯 Test Each Page

### Dashboard
- View sales metrics
- Recent transactions
- Quick actions
- Top products

### Sales (POS)
1. Search for products
2. Click "Add" to cart
3. Adjust quantities
4. View receipt
5. Click "Complete Sale" (demo)

### Inventory
- Search/filter products
- View stock levels
- See prices & margins
- Check low stock alerts

### Analytics
- View sales trends
- Payment breakdown
- Top products
- Export reports

---

## 🧩 Project Structure

```
client/
├── src/
│   ├── App.jsx              ← Main router & layout
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Sales.jsx
│   │   ├── Inventory.jsx
│   │   └── Analytics.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── BottomNav.jsx
│   │   ├── Card.jsx
│   │   └── Button.jsx
│   ├── api/
│   │   └── client.js        ← API calls (ready)
│   ├── index.css            ← Apple-style design
│   └── main.jsx
├── package.json
├── tailwind.config.js
├── vite.config.js
└── index.html
```

---

## 🎨 Design Features

✅ **Premium Apple-Style UI**
- Black primary color
- Orange/gold accent
- Purple highlights
- Rounded cards
- Soft shadows

✅ **Responsive Design**
- Desktop: Sidebar navigation
- Mobile: Bottom navigation
- Adapts to all screen sizes

✅ **Modern Components**
- Card component (reusable)
- Button with variants
- Navigation components
- Form elements

---

## 📦 Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm run preview         # Preview build locally

# Code Quality
npm run lint            # Run ESLint
npm run lint -- --fix   # Auto-fix issues
```

---

## 🔌 Ready for Backend

All pages are ready to connect to the backend APIs:

### Dashboard
```javascript
// In useEffect hook:
const data = await fetch('/api/analytics')
setStats(data)
```

### Sales
```javascript
// Get products
const products = await fetch('/api/products')

// Create sale
await fetch('/api/sales', {
  method: 'POST',
  body: JSON.stringify({ items, customerName, paymentMethod })
})
```

### Inventory
```javascript
// Get products
const products = await fetch('/api/products')

// Search
const results = await fetch(`/api/products/search?q=${query}`)
```

### Analytics
```javascript
// Get analytics
const analytics = await fetch('/api/analytics?date_range=month')
```

---

## 📝 Important Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main router & page switcher |
| `src/pages/*.jsx` | 4 page components |
| `src/components/*.jsx` | Reusable UI components |
| `src/index.css` | Design system & styles |
| `tailwind.config.js` | Tailwind configuration |
| `vite.config.js` | Vite configuration |

---

## 🎓 Component Usage

### Import Components
```javascript
import Card from '../components/Card';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
```

### Use Card
```jsx
<Card className="p-6">
  <h2>Title</h2>
  <p>Content here</p>
</Card>
```

### Use Button
```jsx
<Button variant="accent" size="md" onClick={handleClick}>
  Click Me
</Button>
```

### Button Variants
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

---

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
# Use different port
npm run dev -- --port 5174
```

### Module not found: lucide-react
```bash
# Install missing dependency
npm install lucide-react
```

### Tailwind styles not working
```bash
# Clear cache and rebuild
npm run build -- --force
```

### Blank white screen
1. Check browser console for errors (F12)
2. Make sure npm install completed
3. Try clearing browser cache (Ctrl+Shift+Delete)
4. Restart dev server

---

## 📊 Pages Overview

### Dashboard
**Purpose:** Overview of sales and metrics

**Components:**
- Metric cards (Sales, Profit, Items, Stock)
- Recent sales list
- Quick actions
- Top products

**Data Displayed:**
- Today's sales: ₦2,610,000
- Profit: ₦460,000
- Items sold: 11
- Low stock: 3

### Sales (POS)
**Purpose:** Process new transactions

**Features:**
- Product search
- Shopping cart
- Stock validation
- Price display
- Profit calculation
- Payment method selection
- Receipt display

### Inventory
**Purpose:** Manage products and stock

**Features:**
- Product list with table
- Search by name/SKU/barcode
- Filter by category
- Stock level indicators
- Cost & selling prices
- Profit margin display
- Edit/Delete actions
- Low stock alerts

### Analytics
**Purpose:** Sales reports and insights

**Features:**
- Key metrics display
- Daily sales chart
- Payment method breakdown
- Top products ranking
- Monthly comparison
- Profit analysis
- Export button

---

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

---

## 💾 Local Storage (Optional)

Store user preferences:
```javascript
// Save
localStorage.setItem('theme', 'dark');

// Retrieve
const theme = localStorage.getItem('theme');
```

---

## ⚡ Performance Tips

1. **Lazy load images** - Use native `loading="lazy"`
2. **Code splitting** - Already done with Vite
3. **Debounce search** - Throttle API calls
4. **Caching** - Cache API responses

---

## 🔐 Environment Variables

Create `.env` in client directory:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=BENOVERTECH POS
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

---

## 📚 Next Steps

1. ✅ **UI is complete** - All pages built
2. ⏳ **Connect backend** - Add API calls
3. ⏳ **Add authentication** - Login system
4. ⏳ **Real data** - Replace mock data
5. ⏳ **Testing** - Run tests
6. ⏳ **Deployment** - Deploy to production

---

## 🎉 Frontend Ready!

Your POS interface is:
- ✅ Fully designed
- ✅ Responsive
- ✅ Interactive
- ✅ Ready for backend integration

**Start now:**
```bash
npm install && npm run dev
```

Open: **http://localhost:5173** 🚀
