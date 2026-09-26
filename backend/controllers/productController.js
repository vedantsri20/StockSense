const Product = require('../models/Product');
const WarehouseStock = require('../models/WarehouseStock');
const Warehouse = require('../models/Warehouse');
const InventoryTransaction = require('../models/InventoryTransaction');
const ReorderingRule = require('../models/ReorderingRule');
const { syncProductTotalStock } = require('../services/stockService');

// @desc    Get all products with filters & search
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, warehouse, stockStatus } = req.query;
    let query = {};

    // Text / SKU search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Status filter
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    let products = await Product.find(query).sort({ createdAt: -1 });

    // Populate warehouse stocks for each product
    const productIds = products.map((p) => p._id);
    const allStocks = await WarehouseStock.find({ product: { $in: productIds } }).populate('warehouse');

    // Attach warehouse stocks
    let enrichedProducts = products.map((p) => {
      const pStocks = allStocks.filter((s) => s.product.toString() === p._id.toString());
      const totalStock = pStocks.reduce((sum, s) => sum + s.quantity, 0);

      let computedStatus = 'in_stock';
      if (totalStock === 0) {
        computedStatus = 'out_of_stock';
      } else if (totalStock <= p.reorderLevel) {
        computedStatus = 'low_stock';
      }

      return {
        ...p.toObject(),
        totalStock,
        warehouseStocks: pStocks,
        computedStatus,
      };
    });

    // Warehouse filter
    if (warehouse && warehouse !== 'all') {
      enrichedProducts = enrichedProducts.filter((p) =>
        p.warehouseStocks.some((ws) => ws.warehouse && ws.warehouse._id.toString() === warehouse)
      );
    }

    // Stock Status filter (in_stock, low_stock, out_of_stock)
    if (stockStatus && stockStatus !== 'all') {
      enrichedProducts = enrichedProducts.filter((p) => p.computedStatus === stockStatus);
    }

    res.status(200).json({
      success: true,
      count: enrichedProducts.length,
      data: enrichedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product with warehouse breakdowns & movements
// @route   GET /api/products/:id
// @access  Private
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const [warehouseStocks, recentMovements, reorderingRules] = await Promise.all([
      WarehouseStock.find({ product: product._id }).populate('warehouse'),
      InventoryTransaction.find({ product: product._id })
        .populate('sourceWarehouse destinationWarehouse performedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(20),
      ReorderingRule.find({ product: product._id }).populate('warehouse'),
    ]);

    const totalStock = warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        totalStock,
        warehouseStocks,
        recentMovements,
        reorderingRules,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      unitOfMeasure,
      initialStock = 0,
      price,
      reorderLevel,
      supplier,
      warehouse,
    } = req.body;

    if (!name || !sku || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name, SKU, category, and price',
      });
    }

    const formattedSku = sku.trim().toUpperCase();
    const existingSku = await Product.findOne({ sku: formattedSku });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: `Product with SKU '${formattedSku}' already exists`,
      });
    }

    const product = await Product.create({
      name: name.trim(),
      sku: formattedSku,
      category: category.trim(),
      unitOfMeasure: unitOfMeasure || 'Units',
      price: Number(price),
      reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : 5,
      supplier: supplier ? supplier.trim() : '',
      totalStock: Number(initialStock) || 0,
    });

    // If initial stock provided with warehouse, record initial stock
    if (Number(initialStock) > 0 && warehouse) {
      const wh = await Warehouse.findById(warehouse);
      if (wh) {
        await WarehouseStock.create({
          product: product._id,
          warehouse: wh._id,
          quantity: Number(initialStock),
        });

        await InventoryTransaction.create({
          product: product._id,
          sku: product.sku,
          type: 'RECEIPT',
          quantity: Number(initialStock),
          destinationWarehouse: wh._id,
          beforeStock: 0,
          afterStock: Number(initialStock),
          reference: `INIT-${product.sku}`,
          performedBy: req.user ? req.user._id : null,
          note: 'Initial stock on product creation',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, sku, category, unitOfMeasure, price, reorderLevel, supplier, status } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (sku && sku.trim().toUpperCase() !== product.sku) {
      const formattedSku = sku.trim().toUpperCase();
      const existing = await Product.findOne({ sku: formattedSku });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `SKU '${formattedSku}' is already assigned to another product`,
        });
      }
      product.sku = formattedSku;
    }

    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (unitOfMeasure) product.unitOfMeasure = unitOfMeasure.trim();
    if (price !== undefined) product.price = Number(price);
    if (reorderLevel !== undefined) product.reorderLevel = Number(reorderLevel);
    if (supplier !== undefined) product.supplier = supplier.trim();
    if (status) product.status = status;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Promise.all([
      Product.findByIdAndDelete(req.params.id),
      WarehouseStock.deleteMany({ product: req.params.id }),
      ReorderingRule.deleteMany({ product: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
