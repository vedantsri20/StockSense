const {
    createReceipt,
    getReceipts
} = require("../services/receiptService");

function addReceipt(req, res) {
    try {
        const receipt = createReceipt(req.body);

        res.status(201).json({
            success: true,
            message: "Stock received successfully",
            data: receipt
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

function listReceipts(req, res) {
    try {
        const receipts = getReceipts();

        res.status(200).json({
            success: true,
            data: receipts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    addReceipt,
    listReceipts
};