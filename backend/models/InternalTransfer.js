const mongoose = require("mongoose");

const internalTransferSchema = new mongoose.Schema(
  {
    transferNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    sourceWarehouse: {
      type: String,
      required: true,
      trim: true,
    },
    destinationWarehouse: {
      type: String,
      required: true,
      trim: true,
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Done", "Canceled"],
      default: "Scheduled",
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

module.exports = mongoose.model("InternalTransfer", internalTransferSchema);
