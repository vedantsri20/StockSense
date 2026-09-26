const mongoose = require("mongoose");

const reorderRuleSchema = new mongoose.Schema(
  {
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
    minQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    maxQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 100,
    },
    reorderQuantity: {
      type: Number,
      required: true,
      min: 1,
      default: 25,
    },
    status: {
      type: String,
      enum: ["Active", "Triggered", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ReorderRule", reorderRuleSchema);
