import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import productRoutes from './routes/products.js';
import saleRoutes from './routes/sales.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// BUSINESS INFO (Static)
const BUSINESS_INFO = {
  name: 'BENOVERTECH GADGETS',
  address: '14 Benson Ojukwu Street, Canal Estate, Ago Palace Lagos',
  phone: '08107271610',
  email: 'benovertech@gmail.com'
};

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'POS Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Business Info
app.get('/api/business-info', (req, res) => {
  res.json({
    success: true,
    data: BUSINESS_INFO,
  });
});

// Product Routes
app.use('/api/products', productRoutes);

// Sales Routes
app.use('/api/sales', saleRoutes);

// Analytics Routes
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server (only in development or non-serverless environments)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ BENOVERTECH POS Server');
    console.log('='.repeat(60));
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🏢 Business: ${BUSINESS_INFO.name}`);
    console.log(`📞 Phone: ${BUSINESS_INFO.phone}`);
    console.log(`📧 Email: ${BUSINESS_INFO.email}`);
    console.log('='.repeat(60));
    console.log('\nAvailable Endpoints:');
    console.log('  GET    /api/health');
    console.log('  GET    /api/business-info');
    console.log('  GET    /api/products');
    console.log('  POST   /api/products');
    console.log('  GET    /api/products/:id');
    console.log('  PUT    /api/products/:id');
    console.log('  DELETE /api/products/:id');
    console.log('  GET    /api/products/search?q=query');
    console.log('  GET    /api/products/low-stock?threshold=10');
    console.log('  POST   /api/sales');
    console.log('  GET    /api/sales');
    console.log('  GET    /api/sales/:id');
    console.log('  GET    /api/sales/daily?date=2024-01-01');
    console.log('  GET    /api/analytics');
    console.log('  GET    /api/analytics/monthly?month=1&year=2024');
    console.log('  GET    /api/analytics/inventory');
    console.log('='.repeat(60) + '\n');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✅ Server closed. Goodbye!');
      process.exit(0);
    });
  });
}

export default app;
