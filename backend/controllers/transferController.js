const Transfer = require('../models/Transfer');
const { processTransfer } = require('../services/stockService');

const generateTransferId = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Transfer.countDocuments();
  const seq = (count + 1).toString().padStart(4, '0');
  return `TRF-${dateStr}-${seq}`;
};

// @desc    Get all internal transfers
// @route   GET /api/transfers
// @access  Private
exports.getTransfers = async (req, res, next) => {
  try {
    const { status, sourceWarehouse, destinationWarehouse, product } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (sourceWarehouse && sourceWarehouse !== 'all') query.sourceWarehouse = sourceWarehouse;
    if (destinationWarehouse && destinationWarehouse !== 'all') query.destinationWarehouse = destinationWarehouse;
    if (product && product !== 'all') query.product = product;

    const transfers = await Transfer.find(query)
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transfer
// @route   GET /api/transfers/:id
// @access  Private
exports.getTransferById = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('sourceWarehouse', 'name code location')
      .populate('destinationWarehouse', 'name code location')
      .populate('product', 'name sku unitOfMeasure')
      .populate('createdBy', 'name email');

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transfer
// @route   POST /api/transfers
// @access  Private
exports.createTransfer = async (req, res, next) => {
  try {
    const { sourceWarehouse, destinationWarehouse, product, quantity, scheduledDate, notes } = req.body;

    if (!sourceWarehouse || !destinationWarehouse || !product || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide source warehouse, destination warehouse, product, and quantity',
      });
    }

    if (sourceWarehouse.toString() === destinationWarehouse.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination warehouses cannot be the same',
      });
    }

    const transferId = await generateTransferId();

    const transfer = await Transfer.create({
      transferId,
      sourceWarehouse,
      destinationWarehouse,
      product,
      quantity: Number(quantity),
      scheduledDate: scheduledDate || Date.now(),
      notes: notes ? notes.trim() : '',
      status: 'Scheduled',
      createdBy: req.user ? req.user._id : null,
    });

    const populated = await Transfer.findById(transfer._id)
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(201).json({
      success: true,
      message: 'Internal transfer scheduled successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transfer
// @route   PUT /api/transfers/:id
// @access  Private
exports.updateTransfer = async (req, res, next) => {
  try {
    const { sourceWarehouse, destinationWarehouse, product, quantity, scheduledDate, notes, status } = req.body;

    let transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    if (transfer.status === 'Done') {
      return res.status(400).json({
        success: false,
        message: 'Completed transfers cannot be modified',
      });
    }

    if (sourceWarehouse) transfer.sourceWarehouse = sourceWarehouse;
    if (destinationWarehouse) transfer.destinationWarehouse = destinationWarehouse;
    if (product) transfer.product = product;
    if (quantity) transfer.quantity = Number(quantity);
    if (scheduledDate) transfer.scheduledDate = scheduledDate;
    if (notes !== undefined) transfer.notes = notes.trim();
    if (status) transfer.status = status;

    await transfer.save();

    const populated = await Transfer.findById(transfer._id)
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(200).json({
      success: true,
      message: 'Transfer updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate transfer and execute warehouse rebalancing
// @route   POST /api/transfers/:id/validate
// @access  Private
exports.validateTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    if (transfer.status === 'Done') {
      return res.status(400).json({
        success: false,
        message: 'This transfer has already been completed',
      });
    }

    if (transfer.status === 'Canceled') {
      return res.status(400).json({
        success: false,
        message: 'Canceled transfers cannot be validated',
      });
    }

    // Process source decrement and destination increment
    await processTransfer({
      productId: transfer.product,
      sourceWarehouseId: transfer.sourceWarehouse,
      destinationWarehouseId: transfer.destinationWarehouse,
      quantity: transfer.quantity,
      reference: transfer.transferId,
      userId: req.user ? req.user._id : null,
      note: transfer.notes || 'Internal warehouse stock transfer',
    });

    transfer.status = 'Done';
    transfer.validatedAt = new Date();
    await transfer.save();

    const populated = await Transfer.findById(transfer._id)
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(200).json({
      success: true,
      message: 'Transfer validated successfully. Stock balances updated across warehouses.',
      data: populated,
    });
  } catch (error) {
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available in source warehouse.',
      });
    }
    next(error);
  }
};
