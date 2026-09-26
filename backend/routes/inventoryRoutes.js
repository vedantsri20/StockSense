const express = require("express");

const {
  updateStock,
  getTransactions,
} = require("../controllers/inventoryController");

const router = express.Router();

// Stock In / Stock Out
router.post("/stock", updateStock);

// Transaction history
router.get("/transactions", getTransactions);

module.exports = router;