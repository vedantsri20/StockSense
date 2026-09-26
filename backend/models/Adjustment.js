const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema(
  {
    adjustmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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
    systemQuantity: {
      type: Number,
      required: true,
      min: [0, 'System quantity cannot be negative'],
    },
    physicalQuantity: {
      type: Number,
      required: [true, 'Please enter physical count'],
      min: [0, 'Physical quantity cannot be negative'],
    },
    difference: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide an adjustment reason'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Done'],
      default: 'Draft',
    },
    validatedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Adjustment', adjustmentSchema);
