const {
    createReceipt,
    getReceipts
} = require("../services/receiptService");
function addReceipt(req, res) {
    console.log("ADD RECEIPT CONTROLLER HIT");
    try {
        const { product, warehouse, supplier, quantity } = req.body;

        if (!product || !warehouse || !supplier || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "product, warehouse, supplier and quantity are required"
            });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "quantity must be greater than 0"
            });
        }

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