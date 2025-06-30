import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Public
export const getSuppliers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      activeOnly = 'true',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (activeOnly === 'true') {
      query.activeStatus = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const suppliers = await Supplier.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Supplier.countDocuments(query);

    // Add product count for each supplier
    const suppliersWithProductCount = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await Product.countDocuments({
          supplierId: supplier._id,
          isActive: true
        });
        return {
          ...supplier.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: suppliersWithProductCount,
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
      message: 'Error fetching suppliers',
      error: error.message
    });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Public
export const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Get supplier's products
    const products = await Product.find({
      supplierId: req.params.id,
      isActive: true
    }).select('name sku quantity price category');

    res.json({
      success: true,
      data: {
        ...supplier.toObject(),
        products
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier',
      error: error.message
    });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Public
export const createSupplier = async (req, res) => {
  try {
    // Check if email already exists
    const existingSupplier = await Supplier.findOne({ email: req.body.email });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const supplier = await Supplier.create(req.body);

    res.status(201).json({
      success: true,
      data: supplier,
      message: 'Supplier created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating supplier',
      error: error.message
    });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Public
export const updateSupplier = async (req, res) => {
  try {
    // Check if supplier exists
    let supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if email already exists (excluding current supplier)
    if (req.body.email) {
      const existingSupplier = await Supplier.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: supplier,
      message: 'Supplier updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating supplier',
      error: error.message
    });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Public
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if supplier has products
    const productCount = await Product.countDocuments({
      supplierId: req.params.id,
      isActive: true
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier. ${productCount} products are associated with this supplier.`
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting supplier',
      error: error.message
    });
  }
};

// @desc    Get supplier performance report
// @route   GET /api/suppliers/reports/performance
// @access  Public
export const getSupplierPerformance = async (req, res) => {
  try {
    const result = await Supplier.aggregate([
      { $match: { activeStatus: true } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'supplierId',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'supplierId',
          as: 'transactions'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
          totalInventoryValue: {
            $sum: {
              $map: {
                input: '$products',
                as: 'product',
                in: { $multiply: ['$$product.quantity', '$$product.price'] }
              }
            }
          },
          transactionCount: { $size: '$transactions' },
          totalTransactionValue: { $sum: '$transactions.total' }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          contactPerson: 1,
          rating: 1,
          productCount: 1,
          totalInventoryValue: 1,
          transactionCount: 1,
          totalTransactionValue: 1,
          createdAt: 1
        }
      },
      { $sort: { totalInventoryValue: -1 } }
    ]);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier performance',
      error: error.message
    });
  }
};