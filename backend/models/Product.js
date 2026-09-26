const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'Please provide a unique SKU'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    unitOfMeasure: {
      type: String,
      default: 'Units',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative'],
    },
    supplier: {
      type: String,
      trim: true,
      default: '',
    },
    reorderLevel: {
      type: Number,
      default: 5,
      min: [0, 'Reorder level cannot be negative'],
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    totalStock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', sku: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
