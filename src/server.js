const express = require("express");

const receiptRoutes = require("./routes/receiptRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "StockSense API is running"
    });
});

app.use("/api/receipts", receiptRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`StockSense server running on http://localhost:${PORT}`);
});