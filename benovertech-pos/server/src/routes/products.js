import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getLowStock,
} from '../controllers/productController.js';

const router = express.Router();

// Routes
router.get('/', getProducts);                   // GET /api/products
router.get('/search', searchProducts);          // GET /api/products/search?q=query
router.get('/low-stock', getLowStock);          // GET /api/products/low-stock?threshold=10
router.get('/:id', getProduct);                 // GET /api/products/:id (by ID or barcode)
router.post('/', createProduct);                // POST /api/products
router.put('/:id', updateProduct);              // PUT /api/products/:id
router.delete('/:id', deleteProduct);           // DELETE /api/products/:id

export default router;
