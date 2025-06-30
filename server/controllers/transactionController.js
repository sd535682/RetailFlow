import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Public
export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      productId,
      supplierId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (type) {
      query.type = type;
    }

    if (productId) {
      query.productId = productId;
    }

    if (supplierId) {
      query.supplierId = supplierId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(query)
      .populate('productId', 'name sku category')
      .populate('supplierId', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Public
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('productId', 'name sku category price')
      .populate('supplierId', 'name email phone contactPerson');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Public
export const createTransaction = async (req, res) => {
  try {
    const { productId, type, quantity, unitPrice } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product not found'
      });
    }

    // For sales, check if sufficient stock is available
    if (type === 'SALE' && product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      ...req.body,
      supplierId: product.supplierId
    });

    // Update product quantity based on transaction type
    let newQuantity = product.quantity;
    switch (type) {
      case 'PURCHASE':
        newQuantity += quantity;
        break;
      case 'SALE':
        newQuantity -= quantity;
        break;
      case 'ADJUSTMENT':
        newQuantity = quantity; // For adjustments, set to exact quantity
        break;
    }

    await Product.findByIdAndUpdate(productId, {
      quantity: Math.max(0, newQuantity)
    });

    // Populate the transaction before sending response
    await transaction.populate([
      { path: 'productId', select: 'name sku category' },
      { path: 'supplierId', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Public
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // For completed transactions, only allow status updates
    if (transaction.status === 'COMPLETED' && req.body.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify quantity of completed transaction'
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'productId', select: 'name sku category' },
      { path: 'supplierId', select: 'name email' }
    ]);

    res.json({
      success: true,
      data: updatedTransaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Public
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Reverse the stock changes if transaction is completed
    if (transaction.status === 'COMPLETED') {
      const product = await Product.findById(transaction.productId);
      if (product) {
        let newQuantity = product.quantity;
        switch (transaction.type) {
          case 'PURCHASE':
            newQuantity -= transaction.quantity;
            break;
          case 'SALE':
            newQuantity += transaction.quantity;
            break;
        }
        await Product.findByIdAndUpdate(transaction.productId, {
          quantity: Math.max(0, newQuantity)
        });
      }
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
};

// @desc    Get transaction summary report
// @route   GET /api/transactions/reports/summary
// @access  Public
export const getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    const summary = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$total' }
        }
      }
    ]);

    // Get daily transaction trends
    const dailyTrends = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Get top products by transaction volume
    const topProducts = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$productId',
          transactionCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$total' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          productSku: '$product.sku',
          transactionCount: 1,
          totalQuantity: 1,
          totalValue: 1
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary,
        dailyTrends,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating transaction summary',
      error: error.message
    });
  }
};