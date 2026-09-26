const ReorderingRule = require('../models/ReorderingRule');
const WarehouseStock = require('../models/WarehouseStock');

// @desc    Get all reordering rules with live stock status
// @route   GET /api/reordering-rules
// @access  Private
exports.getRules = async (req, res, next) => {
  try {
    const rules = await ReorderingRule.find()
      .populate('product', 'name sku unitOfMeasure price')
      .populate('warehouse', 'name code location')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      rules.map(async (rule) => {
        if (!rule.product || !rule.warehouse) return null;
        const stock = await WarehouseStock.findOne({
          product: rule.product._id,
          warehouse: rule.warehouse._id,
        });
        const currentStock = stock ? stock.quantity : 0;
        const isTriggered = currentStock <= rule.minQuantity;

        return {
          ...rule.toObject(),
          currentStock,
          isTriggered,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enriched.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create reordering rule
// @route   POST /api/reordering-rules
// @access  Private
exports.createRule = async (req, res, next) => {
  try {
    const { product, warehouse, minQuantity, maxQuantity, reorderQuantity } = req.body;

    if (!product || !warehouse || minQuantity === undefined || maxQuantity === undefined || reorderQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product, warehouse, minQuantity, maxQuantity, and reorderQuantity',
      });
    }

    if (Number(minQuantity) > Number(maxQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum quantity cannot exceed maximum quantity',
      });
    }

    const existing = await ReorderingRule.findOne({ product, warehouse });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A reordering rule already exists for this product in this warehouse',
      });
    }

    const rule = await ReorderingRule.create({
      product,
      warehouse,
      minQuantity: Number(minQuantity),
      maxQuantity: Number(maxQuantity),
      reorderQuantity: Number(reorderQuantity),
    });

    const populated = await ReorderingRule.findById(rule._id)
      .populate('product', 'name sku unitOfMeasure')
      .populate('warehouse', 'name code');

    res.status(201).json({
      success: true,
      message: 'Reordering rule created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reordering rule
// @route   PUT /api/reordering-rules/:id
// @access  Private
exports.updateRule = async (req, res, next) => {
  try {
    const { minQuantity, maxQuantity, reorderQuantity } = req.body;

    const rule = await ReorderingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Reordering rule not found' });
    }

    if (minQuantity !== undefined) rule.minQuantity = Number(minQuantity);
    if (maxQuantity !== undefined) rule.maxQuantity = Number(maxQuantity);
    if (reorderQuantity !== undefined) rule.reorderQuantity = Number(reorderQuantity);

    if (rule.minQuantity > rule.maxQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Minimum quantity cannot exceed maximum quantity',
      });
    }

    await rule.save();

    const populated = await ReorderingRule.findById(rule._id)
      .populate('product', 'name sku unitOfMeasure')
      .populate('warehouse', 'name code');

    res.status(200).json({
      success: true,
      message: 'Reordering rule updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete reordering rule
// @route   DELETE /api/reordering-rules/:id
// @access  Private
exports.deleteRule = async (req, res, next) => {
  try {
    const rule = await ReorderingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Reordering rule not found' });
    }

    await ReorderingRule.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Reordering rule deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
