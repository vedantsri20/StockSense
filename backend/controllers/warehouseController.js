const Warehouse = require('../models/Warehouse');
const WarehouseStock = require('../models/WarehouseStock');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
exports.getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find().sort({ createdAt: -1 });

    // Aggregate stock counts per warehouse
    const stocks = await WarehouseStock.find({ quantity: { $gt: 0 } });

    const enriched = warehouses.map((wh) => {
      const whStocks = stocks.filter((s) => s.warehouse.toString() === wh._id.toString());
      const totalUnits = whStocks.reduce((sum, s) => sum + s.quantity, 0);
      const uniqueProductsCount = whStocks.length;

      return {
        ...wh.toObject(),
        totalUnits,
        uniqueProductsCount,
      };
    });

    res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new warehouse
// @route   POST /api/warehouses
// @access  Private
exports.createWarehouse = async (req, res, next) => {
  try {
    const { name, code, location, manager, status } = req.body;

    if (!name || !code || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide warehouse name, code, and location',
      });
    }

    const formattedCode = code.trim().toUpperCase();
    const existing = await Warehouse.findOne({ code: formattedCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Warehouse with code '${formattedCode}' already exists`,
      });
    }

    const warehouse = await Warehouse.create({
      name: name.trim(),
      code: formattedCode,
      location: location.trim(),
      manager: manager ? manager.trim() : '',
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private
exports.updateWarehouse = async (req, res, next) => {
  try {
    const { name, code, location, manager, status } = req.body;

    let warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    if (code && code.trim().toUpperCase() !== warehouse.code) {
      const formattedCode = code.trim().toUpperCase();
      const existing = await Warehouse.findOne({ code: formattedCode });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Warehouse code '${formattedCode}' already exists`,
        });
      }
      warehouse.code = formattedCode;
    }

    if (name) warehouse.name = name.trim();
    if (location) warehouse.location = location.trim();
    if (manager !== undefined) warehouse.manager = manager.trim();
    if (status) warehouse.status = status;

    await warehouse.save();

    res.status(200).json({
      success: true,
      message: 'Warehouse updated successfully',
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private
exports.deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    // Check if warehouse has active stock
    const activeStock = await WarehouseStock.findOne({
      warehouse: req.params.id,
      quantity: { $gt: 0 },
    });
    if (activeStock) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete warehouse with active stock. Transfer or adjust stock first.',
      });
    }

    await Warehouse.findByIdAndDelete(req.params.id);
    await WarehouseStock.deleteMany({ warehouse: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Warehouse deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
