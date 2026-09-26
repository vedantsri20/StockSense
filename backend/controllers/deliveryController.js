const Delivery = require('../models/Delivery');
const { processDelivery } = require('../services/stockService');

const generateDeliveryId = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Delivery.countDocuments();
  const seq = (count + 1).toString().padStart(4, '0');
  return `DEL-${dateStr}-${seq}`;
};

// @desc    Get all delivery orders with filters
// @route   GET /api/deliveries
// @access  Private
exports.getDeliveries = async (req, res, next) => {
  try {
    const { status, warehouse, product, search } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (warehouse && warehouse !== 'all') query.warehouse = warehouse;
    if (product && product !== 'all') query.product = product;
    if (search) {
      query.$or = [
        { deliveryId: { $regex: search, $options: 'i' } },
        { customer: { $regex: search, $options: 'i' } },
      ];
    }

    const deliveries = await Delivery.find(query)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure price')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single delivery order
// @route   GET /api/deliveries/:id
// @access  Private
exports.getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('warehouse', 'name code location')
      .populate('product', 'name sku unitOfMeasure price')
      .populate('createdBy', 'name email');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new delivery order
// @route   POST /api/deliveries
// @access  Private
exports.createDelivery = async (req, res, next) => {
  try {
    const { customer, warehouse, product, quantity, deliveryDate, notes, status } = req.body;

    if (!customer || !warehouse || !product || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer, warehouse, product, and quantity',
      });
    }

    const deliveryId = await generateDeliveryId();

    const delivery = await Delivery.create({
      deliveryId,
      customer: customer.trim(),
      warehouse,
      product,
      quantity: Number(quantity),
      deliveryDate: deliveryDate || Date.now(),
      notes: notes ? notes.trim() : '',
      status: status || 'Draft',
      createdBy: req.user ? req.user._id : null,
    });

    const populated = await Delivery.findById(delivery._id)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(201).json({
      success: true,
      message: 'Delivery order created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery order / advance status (Pick, Pack, etc.)
// @route   PUT /api/deliveries/:id
// @access  Private
exports.updateDelivery = async (req, res, next) => {
  try {
    const { customer, warehouse, product, quantity, deliveryDate, notes, status } = req.body;

    let delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }

    if (delivery.status === 'Done') {
      return res.status(400).json({
        success: false,
        message: 'Completed deliveries cannot be modified',
      });
    }

    if (customer) delivery.customer = customer.trim();
    if (warehouse) delivery.warehouse = warehouse;
    if (product) delivery.product = product;
    if (quantity) delivery.quantity = Number(quantity);
    if (deliveryDate) delivery.deliveryDate = deliveryDate;
    if (notes !== undefined) delivery.notes = notes.trim();
    if (status) delivery.status = status;

    await delivery.save();

    const populated = await Delivery.findById(delivery._id)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(200).json({
      success: true,
      message: 'Delivery order updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate delivery order & decrease stock
// @route   POST /api/deliveries/:id/validate
// @access  Private
exports.validateDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }

    if (delivery.status === 'Done') {
      return res.status(400).json({
        success: false,
        message: 'This delivery order has already been validated and delivered',
      });
    }

    if (delivery.status === 'Canceled') {
      return res.status(400).json({
        success: false,
        message: 'Canceled deliveries cannot be validated',
      });
    }

    // Process stock decrease and ledger creation
    await processDelivery({
      productId: delivery.product,
      warehouseId: delivery.warehouse,
      quantity: delivery.quantity,
      reference: delivery.deliveryId,
      userId: req.user ? req.user._id : null,
      note: delivery.notes || `Customer delivery validation (${delivery.customer})`,
    });

    delivery.status = 'Done';
    delivery.validatedAt = new Date();
    await delivery.save();

    const populated = await Delivery.findById(delivery._id)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku unitOfMeasure');

    res.status(200).json({
      success: true,
      message: 'Delivery validated successfully.',
      data: populated,
    });
  } catch (error) {
    // If stockService threw 'Insufficient stock available.'
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available.',
      });
    }
    next(error);
  }
};
