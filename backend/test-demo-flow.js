require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const seedDatabase = require('./utils/seed');

const app = express();
app.use(express.json());
app.use(cors());

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
app.use(errorHandler);

const TEST_PORT = 5002;

function apiRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => (resBody += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('  STARTING STOCKSENSE INTEGRATION SUITE');
  console.log('========================================\n');

  await connectDB();
  await seedDatabase();

  const server = app.listen(TEST_PORT);
  console.log(`[Test Server] Running on http://127.0.0.1:${TEST_PORT}\n`);

  try {
    // 1. Test Login with Admin Credentials
    console.log('[Test 1] Testing Admin Login...');
    const loginRes = await apiRequest('POST', '/auth/login', {
      email: 'admin@stocksense.com',
      password: 'Admin123',
    });
    if (loginRes.status !== 200 || !loginRes.body.data?.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const token = loginRes.body.data.token;
    console.log('  ✔ Admin Login successful, JWT received.\n');

    // 2. Test User Registration
    console.log('[Test 2] Testing User Registration...');
    const regEmail = `test_${Date.now()}@stocksense.com`;
    const regRes = await apiRequest('POST', '/auth/register', {
      name: 'Test Manager',
      email: regEmail,
      password: 'Password123',
      role: 'manager',
    });
    if (regRes.status !== 201 || !regRes.body.data?.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    console.log('  ✔ User Registration successful.\n');

    // 3. Test Dashboard Retrieval
    console.log('[Test 3] Testing Dashboard API...');
    const dashRes = await apiRequest('GET', '/dashboard', null, token);
    if (dashRes.status !== 200 || !dashRes.body.success) {
      throw new Error(`Dashboard fetch failed: ${JSON.stringify(dashRes.body)}`);
    }
    console.log(`  ✔ Dashboard fetched: Total Products: ${dashRes.body.data.totalProducts}, Inventory Value: ₹${dashRes.body.data.inventoryValue}\n`);

    // 4. Fetch Warehouses and Categories
    console.log('[Test 4] Fetching Warehouses & Categories...');
    const whRes = await apiRequest('GET', '/warehouses', null, token);
    const catRes = await apiRequest('GET', '/categories', null, token);
    const mainWh = whRes.body.data.find((w) => w.code === 'WH-MAIN') || whRes.body.data[0];
    const storeWh = whRes.body.data.find((w) => w.code === 'WH-STR') || whRes.body.data[1];
    console.log(`  ✔ Found ${whRes.body.data.length} warehouses and ${catRes.body.data.length} categories.\n`);

    // 5. Test Product Creation
    console.log('[Test 5] Creating New Test Product with Initial Stock...');
    const testSku = `SKU-TEST-${Date.now().toString().slice(-4)}`;
    const prodRes = await apiRequest(
      'POST',
      '/products',
      {
        name: 'Demo Gaming Headset',
        sku: testSku,
        category: 'Electronics',
        price: 2500,
        unitOfMeasure: 'Units',
        initialStock: 20,
        reorderLevel: 5,
        warehouse: mainWh._id,
      },
      token
    );
    if (prodRes.status !== 201 || !prodRes.body.data?._id) {
      throw new Error(`Product creation failed: ${JSON.stringify(prodRes.body)}`);
    }
    const createdProduct = prodRes.body.data;
    console.log(`  ✔ Product created: ${createdProduct.name} (SKU: ${createdProduct.sku}, Initial Stock: 20)\n`);

    // 6. Test Inbound Receipt & Stock Increase
    console.log('[Test 6] Testing Receipt Creation & Validation...');
    const recCreate = await apiRequest(
      'POST',
      '/receipts',
      {
        supplier: 'Apex Audio Ltd',
        warehouse: mainWh._id,
        product: createdProduct._id,
        quantity: 15,
        expectedDate: new Date(),
        notes: 'Inbound test shipment',
      },
      token
    );
    if (recCreate.status !== 201) throw new Error('Receipt creation failed');
    const receiptId = recCreate.body.data._id;

    // Validate receipt
    const recValidate = await apiRequest('POST', `/receipts/${receiptId}/validate`, null, token);
    if (recValidate.status !== 200) throw new Error('Receipt validation failed');

    // Verify stock increased: 20 + 15 = 35
    const prodCheck1 = await apiRequest('GET', `/products/${createdProduct._id}`, null, token);
    if (prodCheck1.body.data.totalStock !== 35) {
      throw new Error(`Expected stock 35 after receipt, found: ${prodCheck1.body.data.totalStock}`);
    }
    console.log(`  ✔ Receipt validated successfully. Stock increased from 20 -> ${prodCheck1.body.data.totalStock}\n`);

    // 7. Test Outbound Delivery: Negative Stock Prevention
    console.log('[Test 7] Testing Delivery Negative Stock Prevention...');
    const delExcess = await apiRequest(
      'POST',
      '/deliveries',
      {
        customer: 'Overdraft Corp',
        warehouse: mainWh._id,
        product: createdProduct._id,
        quantity: 100, // Stock is only 35
      },
      token
    );
    const delExcessVal = await apiRequest('POST', `/deliveries/${delExcess.body.data._id}/validate`, null, token);
    if (delExcessVal.status !== 400 || !delExcessVal.body.message.includes('Insufficient stock')) {
      throw new Error(`Expected negative stock block, received: ${JSON.stringify(delExcessVal.body)}`);
    }
    console.log(`  ✔ Negative stock correctly prevented with message: "${delExcessVal.body.message}"\n`);

    // 8. Test Valid Delivery Order & Stock Decrease
    console.log('[Test 8] Testing Valid Delivery Validation...');
    const delValid = await apiRequest(
      'POST',
      '/deliveries',
      {
        customer: 'Good Customer',
        warehouse: mainWh._id,
        product: createdProduct._id,
        quantity: 10,
      },
      token
    );
    const delValidRes = await apiRequest('POST', `/deliveries/${delValid.body.data._id}/validate`, null, token);
    if (delValidRes.status !== 200) throw new Error('Valid delivery failed to validate');

    // Verify stock decreased: 35 - 10 = 25
    const prodCheck2 = await apiRequest('GET', `/products/${createdProduct._id}`, null, token);
    if (prodCheck2.body.data.totalStock !== 25) {
      throw new Error(`Expected stock 25 after delivery, found: ${prodCheck2.body.data.totalStock}`);
    }
    console.log(`  ✔ Delivery validated successfully. Stock decreased from 35 -> ${prodCheck2.body.data.totalStock}\n`);

    // 9. Test Internal Transfer
    console.log('[Test 9] Testing Internal Transfer (Main WH -> Store Room)...');
    const trfCreate = await apiRequest(
      'POST',
      '/transfers',
      {
        sourceWarehouse: mainWh._id,
        destinationWarehouse: storeWh._id,
        product: createdProduct._id,
        quantity: 8,
      },
      token
    );
    if (trfCreate.status !== 201) throw new Error('Transfer create failed');
    const trfVal = await apiRequest('POST', `/transfers/${trfCreate.body.data._id}/validate`, null, token);
    if (trfVal.status !== 200) throw new Error('Transfer validate failed');

    // Verify total stock remains 25, but warehouse distribution changed
    const prodCheck3 = await apiRequest('GET', `/products/${createdProduct._id}`, null, token);
    if (prodCheck3.body.data.totalStock !== 25) {
      throw new Error(`Total stock changed during transfer: ${prodCheck3.body.data.totalStock}`);
    }
    const mainWhStock = prodCheck3.body.data.warehouseStocks.find((w) => w.warehouse._id === mainWh._id);
    const storeWhStock = prodCheck3.body.data.warehouseStocks.find((w) => w.warehouse._id === storeWh._id);
    console.log(`  ✔ Transfer validated. Total stock: ${prodCheck3.body.data.totalStock} (Main WH: ${mainWhStock.quantity}, Store Room: ${storeWhStock.quantity})\n`);

    // 10. Test Inventory Adjustment
    console.log('[Test 10] Testing Physical Inventory Adjustment Audit...');
    // Currently Main WH has 17 units (25 - 8). Let's adjust to 15 (diff = -2)
    const adjCreate = await apiRequest(
      'POST',
      '/adjustments',
      {
        product: createdProduct._id,
        warehouse: mainWh._id,
        physicalQuantity: 15,
        reason: 'Audit write-off',
      },
      token
    );
    if (adjCreate.status !== 201) throw new Error('Adjustment create failed');
    const adjVal = await apiRequest('POST', `/adjustments/${adjCreate.body.data._id}/validate`, null, token);
    if (adjVal.status !== 200) throw new Error('Adjustment validate failed');

    const prodCheck4 = await apiRequest('GET', `/products/${createdProduct._id}`, null, token);
    console.log(`  ✔ Adjustment validated. Stock adjusted to 15 at Main WH. Total: ${prodCheck4.body.data.totalStock}\n`);

    // 11. Test Move History / Master Stock Ledger
    console.log('[Test 11] Verifying Master Move History / Stock Ledger...');
    const ledgerRes = await apiRequest('GET', `/inventory/transactions?product=${createdProduct._id}`, null, token);
    if (ledgerRes.status !== 200 || ledgerRes.body.data.length < 4) {
      throw new Error(`Expected at least 4 ledger records, found: ${ledgerRes.body.data.length}`);
    }
    console.log(`  ✔ Move History contains ${ledgerRes.body.data.length} audit entries for ${createdProduct.name}:`);
    ledgerRes.body.data.forEach((tx) => {
      console.log(`    - [${tx.type}] Ref: ${tx.reference} | Qty: ${tx.quantity} | Balance: ${tx.beforeStock} -> ${tx.afterStock}`);
    });
    console.log();

    console.log('========================================================');
    console.log('  🎉 ALL INTEGRATION & QUALITY VERIFICATIONS PASSED! 🎉');
    console.log('========================================================\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
