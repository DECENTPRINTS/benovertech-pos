import express from 'express';
import {
  createSale,
  getSales,
  getSaleById,
  getDailySales,
} from '../controllers/saleController.js';

const router = express.Router();

// Routes
router.post('/', createSale);                   // POST /api/sales
router.get('/', getSales);                      // GET /api/sales
router.get('/daily', getDailySales);            // GET /api/sales/daily?date=2024-01-01
router.get('/:id', getSaleById);                // GET /api/sales/:id

export default router;
