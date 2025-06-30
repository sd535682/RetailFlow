import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} from '../controllers/transactionController.js';
import {
  validateTransaction,
  validateObjectId,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// Report routes
router.get('/reports/summary', getTransactionSummary);

// CRUD routes
router.route('/')
  .get(validatePagination, getTransactions)
  .post(validateTransaction, createTransaction);

router.route('/:id')
  .get(validateObjectId, getTransaction)
  .put(validateObjectId, updateTransaction)
  .delete(validateObjectId, deleteTransaction);

export default router;