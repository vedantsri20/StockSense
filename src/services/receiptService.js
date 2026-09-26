const receipts = require("../models/receiptModel");

function createReceipt(receiptData) {
    const receipt = {
        id: receipts.length + 1,
        product: receiptData.product,
        warehouse: receiptData.warehouse,
        supplier: receiptData.supplier,
        quantity: receiptData.quantity,
        receivedDate: receiptData.receivedDate || new Date(),
        reference: receiptData.reference || `REC-${receipts.length + 1}`,
        status: "RECEIVED"
    };

    receipts.push(receipt);

    return receipt;
}

function getReceipts() {
    return receipts;
}

module.exports = {
    createReceipt,
    getReceipts
};