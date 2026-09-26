const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema(
  {
    transferId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sourceWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Please select a source warehouse'],
    },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Please select a destination warehouse'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please select a product to transfer'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify transfer quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    scheduledDate: {
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
      enum: ['Draft', 'Scheduled', 'Done', 'Canceled'],
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

module.exports = mongoose.model('Transfer', transferSchema);
