const Product = require('../models/Product');
const WarehouseStock = require('../models/WarehouseStock');
const Warehouse = require('../models/Warehouse');
const Category = require('../models/Category');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const Transfer = require('../models/Transfer');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Get complete real-time dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { warehouse, category, dateRange, operationType, status } = req.query;

    // Fetch baseline entities
    const [allProducts, allWarehouses, allCategories, allStocks] = await Promise.all([
      Product.find({ status: 'active' }),
      Warehouse.find({ status: 'active' }),
      Category.find(),
      WarehouseStock.find().populate('warehouse product'),
    ]);

    // Apply warehouse and category filtering to product set if requested
    let filteredProducts = allProducts;
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;
    const lowStockAlerts = [];

    filteredProducts.forEach((product) => {
      let productStocks = allStocks.filter(
        (s) => s.product && s.product._id.toString() === product._id.toString()
      );

      if (warehouse && warehouse !== 'all') {
        productStocks = productStocks.filter(
          (s) => s.warehouse && s.warehouse._id.toString() === warehouse
        );
      }

      const totalUnits = productStocks.reduce((sum, s) => sum + s.quantity, 0);
      const productValue = totalUnits * (product.price || 0);
      totalInventoryValue += productValue;

      if (totalUnits === 0) {
        outOfStockCount++;
        lowStockAlerts.push({
          _id: product._id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          stock: totalUnits,
          reorderLevel: product.reorderLevel,
          unitOfMeasure: product.unitOfMeasure,
          status: 'out_of_stock',
        });
      } else if (totalUnits <= product.reorderLevel) {
        lowStockCount++;
        lowStockAlerts.push({
          _id: product._id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          stock: totalUnits,
          reorderLevel: product.reorderLevel,
          unitOfMeasure: product.unitOfMeasure,
          status: 'low_stock',
        });
      }
    });

    // Pending counts with optional warehouse filter
    const receiptQuery = { status: { $in: ['Draft', 'Waiting', 'Ready'] } };
    const deliveryQuery = { status: { $in: ['Draft', 'Waiting', 'Ready'] } };
    const transferQuery = { status: 'Scheduled' };

    if (warehouse && warehouse !== 'all') {
      receiptQuery.warehouse = warehouse;
      deliveryQuery.warehouse = warehouse;
      transferQuery.$or = [{ sourceWarehouse: warehouse }, { destinationWarehouse: warehouse }];
    }

    const [pendingReceipts, pendingDeliveries, scheduledTransfers] = await Promise.all([
      Receipt.countDocuments(receiptQuery),
      Delivery.countDocuments(deliveryQuery),
      Transfer.countDocuments(transferQuery),
    ]);

    // Category Distribution Chart
    const categoryStats = [];
    const catMap = {};

    allProducts.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      if (!catMap[cat]) {
        catMap[cat] = { name: cat, count: 0, stock: 0, value: 0 };
      }
      const pStocks = allStocks.filter(
        (s) => s.product && s.product._id.toString() === p._id.toString()
      );
      const units = pStocks.reduce((sum, s) => sum + s.quantity, 0);
      catMap[cat].count += 1;
      catMap[cat].stock += units;
      catMap[cat].value += units * (p.price || 0);
    });

    for (const key in catMap) {
      categoryStats.push(catMap[key]);
    }

    // Recent Transactions table with filters
    const txQuery = {};
    if (warehouse && warehouse !== 'all') {
      txQuery.$or = [{ sourceWarehouse: warehouse }, { destinationWarehouse: warehouse }];
    }
    if (operationType && operationType !== 'all') {
      txQuery.type = operationType.toUpperCase();
    }

    const recentTransactions = await InventoryTransaction.find(txQuery)
      .populate('product', 'name sku unitOfMeasure')
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Stock Movement 7-day stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const pastTransactions = await InventoryTransaction.find({
      createdAt: { $gte: sevenDaysAgo },
    });

    const movementMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      movementMap[dayKey] = { date: dayKey, receipts: 0, deliveries: 0, transfers: 0, adjustments: 0 };
    }

    pastTransactions.forEach((tx) => {
      const dayKey = new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (movementMap[dayKey]) {
        if (tx.type === 'RECEIPT') movementMap[dayKey].receipts += tx.quantity;
        else if (tx.type === 'DELIVERY') movementMap[dayKey].deliveries += tx.quantity;
        else if (tx.type === 'TRANSFER') movementMap[dayKey].transfers += tx.quantity;
        else if (tx.type === 'ADJUSTMENT') movementMap[dayKey].adjustments += tx.quantity;
      }
    });

    const stockMovementStats = Object.values(movementMap);

    res.status(200).json({
      success: true,
      data: {
        totalProducts: filteredProducts.length,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
        inventoryValue: Math.round(totalInventoryValue),
        recentTransactions,
        categoryStats,
        stockMovementStats,
        lowStockAlerts: lowStockAlerts.slice(0, 8),
      },
    });
  } catch (error) {
    next(error);
  }
};
