const express = require("express");

const {
    addReceipt,
    listReceipts
} = require("../controllers/receiptController");

const router = express.Router();

// Create a new receipt
router.post("/", addReceipt);

// Get all receipts
router.get("/", listReceipts);

module.exports = router;