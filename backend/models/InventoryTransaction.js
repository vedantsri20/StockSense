const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sourceWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    beforeStock: {
      type: Number,
      required: true,
    },
    afterStock: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: true,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

inventoryTransactionSchema.index({ createdAt: -1 });
inventoryTransactionSchema.index({ product: 1 });
inventoryTransactionSchema.index({ type: 1 });
inventoryTransactionSchema.index({ reference: 1 });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
