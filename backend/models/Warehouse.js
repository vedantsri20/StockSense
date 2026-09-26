const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a warehouse name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide a warehouse code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide a warehouse location'],
      trim: true,
    },
    manager: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
