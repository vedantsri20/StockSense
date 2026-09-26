const {
    getReceipts
} = require("./receiptService");

const {
    getIssues
} = require("./issueService");

function getInventory() {
    const receipts = getReceipts();
    const issues = getIssues();

    const inventory = {};

    receipts.forEach((receipt) => {
        const key = `${receipt.product}-${receipt.warehouse}`;

        if (!inventory[key]) {
            inventory[key] = {
                product: receipt.product,
                warehouse: receipt.warehouse,
                received: 0,
                issued: 0,
                available: 0
            };
        }

        inventory[key].received += Number(receipt.quantity);
    });

    issues.forEach((issue) => {
        const key = `${issue.product}-${issue.warehouse}`;

        if (!inventory[key]) {
            inventory[key] = {
                product: issue.product,
                warehouse: issue.warehouse,
                received: 0,
                issued: 0,
                available: 0
            };
        }

        inventory[key].issued += Number(issue.quantity);
    });

    Object.values(inventory).forEach((item) => {
        item.available = item.received - item.issued;
    });

    return Object.values(inventory);
}

module.exports = {
    getInventory
};