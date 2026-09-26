const mongoose = require("mongoose");

const deliveryItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    default: 0,
  },
});

const deliveryOrderSchema = new mongoose.Schema(
  {
    deliveryNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    warehouse: {
      type: String,
      required: true,
      trim: true,
      default: "Main Warehouse",
    },
    items: [deliveryItemSchema],
    totalQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    deliveryDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Draft", "Waiting", "Ready", "Done", "Canceled"],
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

module.exports = mongoose.model("DeliveryOrder", deliveryOrderSchema);
