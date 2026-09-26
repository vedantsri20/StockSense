const mongoose = require('mongoose');

const reorderingRuleSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please select a product'],
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Please select a warehouse'],
    },
    minQuantity: {
      type: Number,
      required: [true, 'Please provide minimum quantity'],
      min: [0, 'Minimum quantity cannot be negative'],
    },
    maxQuantity: {
      type: Number,
      required: [true, 'Please provide maximum quantity'],
      min: [0, 'Maximum quantity cannot be negative'],
    },
    reorderQuantity: {
      type: Number,
      required: [true, 'Please provide reorder quantity'],
      min: [1, 'Reorder quantity must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

reorderingRuleSchema.index({ product: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model('ReorderingRule', reorderingRuleSchema);
