const express = require('express');
const router = express.Router();
const {
  getRules,
  createRule,
  updateRule,
  deleteRule,
} = require('../controllers/reorderingRuleController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getRules)
  .post(createRule);

router.route('/:id')
  .put(updateRule)
  .delete(deleteRule);

module.exports = router;
