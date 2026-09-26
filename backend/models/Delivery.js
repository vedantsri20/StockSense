const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    deliveryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Please select a source warehouse'],
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
    deliveryDate: {
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

module.exports = mongoose.model('Delivery', deliverySchema);
