const express = require("express");

const {
    listInventory
} = require("../controllers/inventoryController");

const router = express.Router();

router.get("/", listInventory);

module.exports = router;