const {
    createIssue,
    getIssues
} = require("../services/issueService");

function addIssue(req, res) {
    try {
        const { product, warehouse, quantity, issuedTo } = req.body;

        if (!product || !warehouse || quantity === undefined || !issuedTo) {
            return res.status(400).json({
                success: false,
                message: "product, warehouse, quantity and issuedTo are required"
            });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "quantity must be greater than 0"
            });
        }

        const issue = createIssue(req.body);

        res.status(201).json({
            success: true,
            message: "Stock issued successfully",
            data: issue
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

function listIssues(req, res) {
    try {
        const issues = getIssues();

        res.status(200).json({
            success: true,
            data: issues
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    addIssue,
    listIssues
};