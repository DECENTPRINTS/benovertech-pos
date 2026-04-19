import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import productRoutes from '../server/src/routes/products.js';
import saleRoutes from '../server/src/routes/sales.js';
import analyticsRoutes from '../server/src/routes/analytics.js';

dotenv.config();

const prisma = new PrismaClient();

// Create Express app
const app = express();

// BUSINESS INFO (Static)
const BUSINESS_INFO = {
  name: 'BENOVERTECH GADGETS',
  address: '14 Benson Ojukwu Street, Canal Estate, Ago Palace Lagos',
  phone: '08107271610',
  email: 'benovertech@gmail.com'
};

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Export for Vercel
export default app;
