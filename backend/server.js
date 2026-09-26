require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const seedDatabase = require('./utils/seed');

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Request Logger in Development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'StockSense Inventory API',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/warehouses', require('./routes/warehouseRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reordering-rules', require('./routes/reorderingRuleRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/transfers', require('./routes/transferRoutes'));
app.use('/api/adjustments', require('./routes/adjustmentRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
  });
});

// Central Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Start Server & Connect Database
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    // Run idempotent seeder in background
    seedDatabase().catch((err) =>
      console.warn(`[Seed Warning] Auto-seeding skipped: ${err.message}`)
    );
  }

  const server = app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`  🚀 StockSense Backend API Server`);
    console.log(`  🌐 Port: ${PORT}`);
    console.log(`  🔗 Endpoint: http://localhost:${PORT}/api`);
    console.log(`  📦 Health check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Fatal Unhandled Error]: ${err.message}`);
  });
};

startServer();
