const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    receiptId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplier: {
      type: String,
      required: [true, 'Please provide supplier name'],
      trim: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Please select a destination warehouse'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please select a product'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    expectedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'],
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

module.exports = mongoose.model('Receipt', receiptSchema);
