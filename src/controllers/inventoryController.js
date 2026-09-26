const { getInventory } = require("../services/inventoryService");

function listInventory(req, res) {
    try {
        const inventory = getInventory();

        res.status(200).json({
            success: true,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    listInventory
};