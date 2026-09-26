const Product = require("../models/Product");
const InventoryTransaction = require("../models/InventoryTransaction");

// STOCK IN / STOCK OUT
const updateStock = async (req, res) => {
  try {
    const { productId, type, quantity, note } = req.body;

    if (!productId || !type || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID, type and quantity are required",
      });
    }

    if (!["IN", "OUT"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be IN or OUT",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // STOCK OUT
    if (type === "OUT") {
      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock available",
          availableStock: product.quantity,
        });
      }

      product.quantity -= quantity;
    }

    // STOCK IN
    if (type === "IN") {
      product.quantity += quantity;
    }

    await product.save();

    const transaction = await InventoryTransaction.create({
      product: product._id,
      type,
      quantity,
      note: note || "",
    });

    res.json({
      success: true,
      message: `Stock ${type === "IN" ? "added" : "removed"} successfully`,
      currentStock: product.quantity,
      transaction,
    });
  } catch (error) {
    console.error("Stock update error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET TRANSACTION HISTORY
const getTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate("product", "name sku")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Transaction history error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  updateStock,
  getTransactions,
};