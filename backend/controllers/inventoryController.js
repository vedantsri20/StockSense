const InventoryTransaction = require('../models/InventoryTransaction');
const Product = require('../models/Product');
const WarehouseStock = require('../models/WarehouseStock');
const Warehouse = require('../models/Warehouse');

// @desc    Get inventory transactions / move history (Stock Ledger)
// @route   GET /api/inventory/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { product, sku, warehouse, type, startDate, endDate, search, limit = 100 } = req.query;
    let query = {};

    if (product && product !== 'all') {
      query.product = product;
    }

    if (sku && sku !== 'all') {
      query.sku = { $regex: sku, $options: 'i' };
    }

    if (type && type !== 'all') {
      query.type = type.toUpperCase();
    }

    if (warehouse && warehouse !== 'all') {
      query.$or = [
        { sourceWarehouse: warehouse },
        { destinationWarehouse: warehouse },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      const searchOr = [
        { reference: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    const transactions = await InventoryTransaction.find(query)
      .populate('product', 'name sku unitOfMeasure price category')
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall inventory summary
// @route   GET /api/inventory/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' });
    const warehouses = await Warehouse.find({ status: 'active' });
    const warehouseStocks = await WarehouseStock.find().populate('warehouse product');

    let totalValuation = 0;
    let totalUnits = 0;

    products.forEach((p) => {
      const pStocks = warehouseStocks.filter(
        (ws) => ws.product && ws.product._id.toString() === p._id.toString()
      );
      const pTotal = pStocks.reduce((sum, s) => sum + s.quantity, 0);
      totalUnits += pTotal;
      totalValuation += pTotal * (p.price || 0);
    });

    const warehouseSummary = warehouses.map((wh) => {
      const whStocks = warehouseStocks.filter(
        (ws) => ws.warehouse && ws.warehouse._id.toString() === wh._id.toString()
      );
      const units = whStocks.reduce((sum, s) => sum + s.quantity, 0);
      const value = whStocks.reduce(
        (sum, s) => sum + s.quantity * (s.product ? s.product.price : 0),
        0
      );

      return {
        _id: wh._id,
        name: wh.name,
        code: wh.code,
        units,
        value,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts: products.length,
        totalUnits,
        totalValuation,
        warehouses: warehouseSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};
