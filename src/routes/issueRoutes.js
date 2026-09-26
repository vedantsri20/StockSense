const express = require("express");

const {
    addIssue,
    listIssues
} = require("../controllers/issueController");

const router = express.Router();

// Create a new issue
router.post("/", addIssue);

// Get all issues
router.get("/", listIssues);

module.exports = router;