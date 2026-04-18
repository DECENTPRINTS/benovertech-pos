import express from 'express';
import {
  getAnalytics,
  getMonthlyAnalytics,
  getInventoryReport,
} from '../controllers/analyticsController.js';

const router = express.Router();

// Routes
router.get('/', getAnalytics);                  // GET /api/analytics
router.get('/monthly', getMonthlyAnalytics);    // GET /api/analytics/monthly?month=1&year=2024
router.get('/inventory', getInventoryReport);   // GET /api/analytics/inventory

export default router;
