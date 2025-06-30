import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      supplierId,
      stockStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (supplierId) {
      query.supplierId = supplierId;
    }

    // Handle stock status filter
    if (stockStatus) {
      switch (stockStatus) {
        case 'LOW_STOCK':
          query.$expr = { $lte: ['$quantity', '$minimumStock'] };
          break;
        case 'OUT_OF_STOCK':
          query.quantity = 0;
          break;
        case 'IN_STOCK':
          query.$expr = { $gt: ['$quantity', '$minimumStock'] };
          break;
      }
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .populate('supplierId', 'name email contactPerson')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
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
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplierId', 'name email phone contactPerson address');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Public
export const createProduct = async (req, res) => {
  try {
    // Check if supplier exists
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: req.body.sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    const product = await Product.create(req.body);
    await product.populate('supplierId', 'name email contactPerson');

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public
export const updateProduct = async (req, res) => {
  try {
    // Check if product exists
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if SKU already exists (excluding current product)
    if (req.body.sku) {
      const existingProduct = await Product.findOne({
        sku: req.body.sku.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }

    // Check if supplier exists
    if (req.body.supplierId) {
      const supplier = await Supplier.findById(req.body.supplierId);
      if (!supplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier not found'
        });
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplierId', 'name email contactPerson');

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product has transactions
    const transactionCount = await Transaction.countDocuments({ productId: req.params.id });
    if (transactionCount > 0) {
      // Soft delete - mark as inactive
      await Product.findByIdAndUpdate(req.params.id, { isActive: false });
      return res.json({
        success: true,
        message: 'Product deactivated (has transaction history)'
      });
    }

    // Hard delete if no transactions
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// @desc    Get products running low on stock
// @route   GET /api/products/reports/low-stock
// @access  Public
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    })
    .populate('supplierId', 'name email contactPerson')
    .sort({ quantity: 1 });

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: error.message
    });
  }
};

// @desc    Get inventory value report
// @route   GET /api/products/reports/inventory-value
// @access  Public
export const getInventoryValue = async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);

    const categoryBreakdown = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: result[0] || {
          totalProducts: 0,
          totalQuantity: 0,
          totalValue: 0,
          averagePrice: 0
        },
        categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating inventory value',
      error: error.message
    });
  }
};

// @desc    Get products by supplier
// @route   GET /api/products/reports/by-supplier
// @access  Public
export const getProductsBySupplier = async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier'
        }
      },
      { $unwind: '$supplier' },
      {
        $group: {
          _id: '$supplierId',
          supplierName: { $first: '$supplier.name' },
          supplierEmail: { $first: '$supplier.email' },
          productCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          products: {
            $push: {
              id: '$_id',
              name: '$name',
              sku: '$sku',
              quantity: '$quantity',
              price: '$price',
              category: '$category'
            }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by supplier',
      error: error.message
    });
  }
};