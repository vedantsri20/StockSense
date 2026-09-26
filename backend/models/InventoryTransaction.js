const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      default: "",
    },

    productSku: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["IN", "OUT", "TRANSFER", "ADJUSTMENT"],
      required: true,
    },

    operationType: {
      type: String,
      enum: ["Receipt", "Delivery", "Internal Transfer", "Inventory Adjustment"],
      default: "Receipt",
    },

    source: {
      type: String,
      trim: true,
      default: "Vendor / Supplier",
    },

    destination: {
      type: String,
      trim: true,
      default: "Main Warehouse",
    },

    quantity: {
      type: Number,
      required: true,
    },

    beforeStock: {
      type: Number,
      default: 0,
    },

    afterStock: {
      type: Number,
      default: 0,
    },

    reference: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      default: "Completed",
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    performedBy: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);