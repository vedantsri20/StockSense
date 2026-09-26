require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Warehouse = require('../models/Warehouse');
const Category = require('../models/Category');
const Product = require('../models/Product');
const WarehouseStock = require('../models/WarehouseStock');
const ReorderingRule = require('../models/ReorderingRule');
const InventoryTransaction = require('../models/InventoryTransaction');

const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Checking database connection...');
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[Seed] Database connected. Seeding baseline demo data...');

    // 1. Seed Admin User
    let admin = await User.findOne({ email: 'admin@stocksense.com' });
    if (!admin) {
      admin = await User.create({
        name: 'StockSense Admin',
        email: 'admin@stocksense.com',
        password: 'Admin123',
        role: 'admin',
      });
      console.log('  ✔ Admin user created: admin@stocksense.com / Admin123');
    } else {
      console.log('  ✔ Admin user already exists: admin@stocksense.com');
    }

    // 2. Seed Warehouses
    const warehouseData = [
      { name: 'Main Warehouse', code: 'WH-MAIN', location: 'Sector 62, Industrial Zone', manager: 'Rajesh Kumar' },
      { name: 'Production Floor', code: 'WH-PROD', location: 'Facility B, Assembly Wing', manager: 'Anita Sharma' },
      { name: 'Store Room', code: 'WH-STR', location: 'Hub Ground Floor, Depo 3', manager: 'Vikram Patel' },
    ];

    const warehouses = [];
    for (const wh of warehouseData) {
      let doc = await Warehouse.findOne({ code: wh.code });
      if (!doc) {
        doc = await Warehouse.create(wh);
        console.log(`  ✔ Warehouse created: ${doc.name} (${doc.code})`);
      }
      warehouses.push(doc);
    }

    const mainWh = warehouses.find((w) => w.code === 'WH-MAIN');
    const prodWh = warehouses.find((w) => w.code === 'WH-PROD');
    const storeWh = warehouses.find((w) => w.code === 'WH-STR');

    // 3. Seed Categories
    const categoryData = [
      { name: 'Electronics', description: 'Computing peripherals, digital instruments, electronic accessories' },
      { name: 'Furniture', description: 'Ergonomic office desks, chairs, cabinetry, workstations' },
      { name: 'Construction', description: 'Structural raw materials, metal rods, fittings, fabrication parts' },
      { name: 'Packaging', description: 'Cardboard boxes, bubble wrap, pallets, protective foam' },
    ];

    for (const cat of categoryData) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`  ✔ Category created: ${cat.name}`);
      }
    }

    // 4. Seed Products
    const productData = [
      {
        name: 'Wireless Keyboard',
        sku: 'KB001',
        category: 'Electronics',
        price: 1499,
        unitOfMeasure: 'Units',
        supplier: 'LogiTech Solutions',
        reorderLevel: 5,
        targetStock: 50,
      },
      {
        name: 'Wireless Mouse',
        sku: 'MS001',
        category: 'Electronics',
        price: 799,
        unitOfMeasure: 'Units',
        supplier: 'LogiTech Solutions',
        reorderLevel: 5,
        targetStock: 30,
      },
      {
        name: 'Office Chair',
        sku: 'CH001',
        category: 'Furniture',
        price: 5999,
        unitOfMeasure: 'Units',
        supplier: 'Featherlite Ergonomics',
        reorderLevel: 3,
        targetStock: 12,
      },
      {
        name: 'Steel Rod',
        sku: 'SR001',
        category: 'Construction',
        price: 450,
        unitOfMeasure: 'Pcs',
        supplier: 'Tata Structura',
        reorderLevel: 10,
        targetStock: 80,
      },
    ];

    for (const prod of productData) {
      let product = await Product.findOne({ sku: prod.sku });
      if (!product) {
        product = await Product.create({
          name: prod.name,
          sku: prod.sku,
          category: prod.category,
          price: prod.price,
          unitOfMeasure: prod.unitOfMeasure,
          supplier: prod.supplier,
          reorderLevel: prod.reorderLevel,
          totalStock: prod.targetStock,
        });

        // Seed stock into Main Warehouse
        if (mainWh) {
          await WarehouseStock.create({
            product: product._id,
            warehouse: mainWh._id,
            quantity: prod.targetStock,
          });

          // Seed baseline initial transaction
          await InventoryTransaction.create({
            product: product._id,
            sku: product.sku,
            type: 'RECEIPT',
            quantity: prod.targetStock,
            destinationWarehouse: mainWh._id,
            beforeStock: 0,
            afterStock: prod.targetStock,
            reference: `SEED-${product.sku}`,
            performedBy: admin ? admin._id : null,
            note: 'Initial demo stock baseline',
          });

          // Seed default reordering rule
          await ReorderingRule.create({
            product: product._id,
            warehouse: mainWh._id,
            minQuantity: prod.reorderLevel,
            maxQuantity: prod.targetStock * 2,
            reorderQuantity: prod.reorderLevel * 2,
          });
        }
        console.log(`  ✔ Product created: ${product.name} (${product.sku}) - Stock: ${prod.targetStock}`);
      }
    }

    console.log('[Seed] Database initialization complete! Demo data is ready.');
    return true;
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
    return false;
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = seedDatabase;
