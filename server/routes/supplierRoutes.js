import express from 'express';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierPerformance
} from '../controllers/supplierController.js';
import {
  validateSupplier,
  validateObjectId,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// Report routes
router.get('/reports/performance', getSupplierPerformance);

// CRUD routes
router.route('/')
  .get(validatePagination, getSuppliers)
  .post(validateSupplier, createSupplier);

router.route('/:id')
  .get(validateObjectId, getSupplier)
  .put(validateObjectId, validateSupplier, updateSupplier)
  .delete(validateObjectId, deleteSupplier);

export default router;