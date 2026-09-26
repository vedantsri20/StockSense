const mongoose = require('mongoose');

const warehouseStockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Warehouse stock cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

warehouseStockSchema.index({ product: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model('WarehouseStock', warehouseStockSchema);
