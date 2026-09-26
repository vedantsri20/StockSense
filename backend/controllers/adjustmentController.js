const Adjustment = require('../models/Adjustment');
const WarehouseStock = require('../models/WarehouseStock');
const { processAdjustment } = require('../services/stockService');

const generateAdjustmentId = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Adjustment.countDocuments();
  const seq = (count + 1).toString().padStart(4, '0');
  return `ADJ-${dateStr}-${seq}`;
};

// @desc    Get all inventory adjustments
// @route   GET /api/adjustments
// @access  Private
exports.getAdjustments = async (req, res, next) => {
  try {
    const { status, warehouse, product } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (warehouse && warehouse !== 'all') query.warehouse = warehouse;
    if (product && product !== 'all') query.product = product;

    const adjustments = await Adjustment.find(query)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: adjustments.length,
      data: adjustments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single adjustment
// @route   GET /api/adjustments/:id
// @access  Private
exports.getAdjustmentById = async (req, res, next) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id)
      .populate('warehouse', 'name code location')
      .populate('product', 'name sku unitOfMeasure')
      .populate('createdBy', 'name email');

    if (!adjustment) {
      return res.status(404).json({ success: false, message: 'Adjustment not found' });
    }

    res.status(200).json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new adjustment
// @route   POST /api/adjustments
// @access  Private
exports.createAdjustment = async (req, res, next) => {
  try {
    const { product, warehouse, physicalQuantity, reason, notes } = req.body;

    if (!product || !warehouse || physicalQuantity === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product, warehouse, physical count, and reason',
      });
    }

    const currentStockDoc = await WarehouseStock.findOne({ product, warehouse });
    const systemQuantity = currentStockDoc ? currentStockDoc.quantity : 0;
    const diff = Number(physicalQuantity) - systemQuantity;

    const adjustmentId = await generateAdjustmentId();

    const adjustment = await Adjustment.create({
      adjustmentId,
      product,
      warehouse,
      systemQuantity,
      physicalQuantity: Number(physicalQuantity),
      difference: diff,
      reason: reason.trim(),
      notes: notes ? notes.trim() : '',
      status: 'Draft',
      createdBy: req.user ? req.user._id : null,
    });

    const populated = await Adjustment.findById(adjustment._id)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(201).json({
      success: true,
      message: 'Adjustment record created in draft',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate adjustment and overwrite stock
// @route   POST /api/adjustments/:id/validate
// @access  Private
exports.validateAdjustment = async (req, res, next) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id);
    if (!adjustment) {
      return res.status(404).json({ success: false, message: 'Adjustment not found' });
    }

    if (adjustment.status === 'Done') {
      return res.status(400).json({
        success: false,
        message: 'This adjustment has already been validated and applied',
      });
    }

    // Process adjustment logic
    await processAdjustment({
      productId: adjustment.product,
      warehouseId: adjustment.warehouse,
      physicalQuantity: adjustment.physicalQuantity,
      reason: adjustment.reason,
      reference: adjustment.adjustmentId,
      userId: req.user ? req.user._id : null,
      note: adjustment.notes,
    });

    adjustment.status = 'Done';
    adjustment.validatedAt = new Date();
    await adjustment.save();

    const populated = await Adjustment.findById(adjustment._id)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(200).json({
      success: true,
      message: `Stock successfully adjusted to ${adjustment.physicalQuantity}. Difference of ${adjustment.difference >= 0 ? '+' : ''}${adjustment.difference} recorded.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
