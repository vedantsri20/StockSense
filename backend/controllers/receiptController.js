const Receipt = require('../models/Receipt');
const { processReceipt } = require('../services/stockService');

const generateReceiptId = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Receipt.countDocuments();
  const seq = (count + 1).toString().padStart(4, '0');
  return `REC-${dateStr}-${seq}`;
};

// @desc    Get all receipts with filters
// @route   GET /api/receipts
// @access  Private
exports.getReceipts = async (req, res, next) => {
  try {
    const { status, warehouse, product, search } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (warehouse && warehouse !== 'all') query.warehouse = warehouse;
    if (product && product !== 'all') query.product = product;
    if (search) {
      query.$or = [
        { receiptId: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }

    const receipts = await Receipt.find(query)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single receipt
// @route   GET /api/receipts/:id
// @access  Private
exports.getReceiptById = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('warehouse', 'name code location')
      .populate('product', 'name sku unitOfMeasure price')
      .populate('createdBy', 'name email');

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new receipt
// @route   POST /api/receipts
// @access  Private
exports.createReceipt = async (req, res, next) => {
  try {
    const { supplier, warehouse, product, quantity, expectedDate, notes, status } = req.body;

    if (!supplier || !warehouse || !product || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide supplier, warehouse, product, and quantity',
      });
    }

    const receiptId = await generateReceiptId();

    const receipt = await Receipt.create({
      receiptId,
      supplier: supplier.trim(),
      warehouse,
      product,
      quantity: Number(quantity),
      expectedDate: expectedDate || Date.now(),
      notes: notes ? notes.trim() : '',
      status: status || 'Draft',
      createdBy: req.user ? req.user._id : null,
    });

    const populated = await Receipt.findById(receipt._id)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(201).json({
      success: true,
      message: 'Receipt created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update receipt status/details
// @route   PUT /api/receipts/:id
// @access  Private
exports.updateReceipt = async (req, res, next) => {
  try {
    const { supplier, warehouse, product, quantity, expectedDate, notes, status } = req.body;

    let receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    if (receipt.status === 'Done') {
      return res.status(400).json({
        success: false,
        message: 'Completed receipts cannot be modified',
      });
    }

    if (supplier) receipt.supplier = supplier.trim();
    if (warehouse) receipt.warehouse = warehouse;
    if (product) receipt.product = product;
    if (quantity) receipt.quantity = Number(quantity);
    if (expectedDate) receipt.expectedDate = expectedDate;
    if (notes !== undefined) receipt.notes = notes.trim();
    if (status) receipt.status = status;

    await receipt.save();

    const populated = await Receipt.findById(receipt._id)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(200).json({
      success: true,
      message: 'Receipt updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate receipt and increase stock
// @route   POST /api/receipts/:id/validate
// @access  Private
exports.validateReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    if (receipt.status === 'Done') {
      return res.status(400).json({
        success: false,
        message: 'This receipt has already been validated and completed',
      });
    }

    if (receipt.status === 'Canceled') {
      return res.status(400).json({
        success: false,
        message: 'Canceled receipts cannot be validated',
      });
    }

    // Process stock increase and ledger creation
    await processReceipt({
      productId: receipt.product,
      warehouseId: receipt.warehouse,
      quantity: receipt.quantity,
      reference: receipt.receiptId,
      userId: req.user ? req.user._id : null,
      note: receipt.notes || `Supplier receipt validation (${receipt.supplier})`,
    });

    receipt.status = 'Done';
    receipt.validatedAt = new Date();
    await receipt.save();

    const populated = await Receipt.findById(receipt._id)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(200).json({
      success: true,
      message: 'Receipt validated successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
