import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getInventoryValue,
  getProductsBySupplier
} from '../controllers/productController.js';
import {
  validateProduct,
  validateObjectId,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// Report routes (must come before /:id routes)
router.get('/reports/low-stock', getLowStockProducts);
router.get('/reports/inventory-value', getInventoryValue);
router.get('/reports/by-supplier', getProductsBySupplier);

// CRUD routes
router.route('/')
  .get(validatePagination, getProducts)
  .post(validateProduct, createProduct);

router.route('/:id')
  .get(validateObjectId, getProduct)
  .put(validateObjectId, validateProduct, updateProduct)
  .delete(validateObjectId, deleteProduct);

export default router;