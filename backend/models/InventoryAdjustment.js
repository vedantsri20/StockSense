const mongoose = require("mongoose");

const inventoryAdjustmentSchema = new mongoose.Schema(
  {
    adjustmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productSku: {
      type: String,
      required: true,
    },
    warehouse: {
      type: String,
      required: true,
      trim: true,
      default: "Main Warehouse",
    },
    systemQuantity: {
      type: Number,
      required: true,
    },
    physicalQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    difference: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      default: "Stock Count Audit",
    },
    status: {
      type: String,
      enum: ["Draft", "Validated", "Canceled"],
      default: "Draft",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    validatedDate: {
      type: Date,
      default: null,
    },
    validatedBy: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InventoryAdjustment", inventoryAdjustmentSchema);
