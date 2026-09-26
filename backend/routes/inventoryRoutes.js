const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getSummary,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/transactions', getTransactions);
router.get('/summary', getSummary);

module.exports = router;
