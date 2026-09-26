const mongoose = require('mongoose');
const Product = require('../models/Product');
const WarehouseStock = require('../models/WarehouseStock');
const Warehouse = require('../models/Warehouse');
const InventoryTransaction = require('../models/InventoryTransaction');

/**
 * Recalculates and caches the product's aggregate totalStock across all warehouses.
 */
async function syncProductTotalStock(productId) {
  const stocks = await WarehouseStock.find({ product: productId });
  const total = stocks.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  await Product.findByIdAndUpdate(productId, { totalStock: total });
  return total;
}

/**
 * Gets stock for a specific product in a specific warehouse
 */
async function getWarehouseStock(productId, warehouseId) {
  const stock = await WarehouseStock.findOne({ product: productId, warehouse: warehouseId });
  return stock ? stock.quantity : 0;
}

/**
 * Process a validated inbound Receipt
 */
async function processReceipt({ productId, warehouseId, quantity, reference, userId, note = '' }) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) throw new Error('Warehouse not found');

  let warehouseStock = await WarehouseStock.findOne({ product: productId, warehouse: warehouseId });
  const beforeStock = warehouseStock ? warehouseStock.quantity : 0;
  const afterStock = beforeStock + Number(quantity);

  if (!warehouseStock) {
    warehouseStock = new WarehouseStock({
      product: productId,
      warehouse: warehouseId,
      quantity: afterStock,
    });
  } else {
    warehouseStock.quantity = afterStock;
  }
  await warehouseStock.save();

  await syncProductTotalStock(productId);

  const transaction = await InventoryTransaction.create({
    product: productId,
    sku: product.sku,
    type: 'RECEIPT',
    quantity: Number(quantity),
    destinationWarehouse: warehouseId,
    beforeStock,
    afterStock,
    reference,
    performedBy: userId,
    note: note || `Receipt from supplier for ${quantity} ${product.unitOfMeasure || 'units'}`,
  });

  return { warehouseStock, transaction };
}

/**
 * Process a validated outbound Delivery Order
 */
async function processDelivery({ productId, warehouseId, quantity, reference, userId, note = '' }) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) throw new Error('Warehouse not found');

  let warehouseStock = await WarehouseStock.findOne({ product: productId, warehouse: warehouseId });
  const beforeStock = warehouseStock ? warehouseStock.quantity : 0;

  if (beforeStock < Number(quantity)) {
    throw new Error('Insufficient stock available.');
  }

  const afterStock = beforeStock - Number(quantity);
  warehouseStock.quantity = afterStock;
  await warehouseStock.save();

  await syncProductTotalStock(productId);

  const transaction = await InventoryTransaction.create({
    product: productId,
    sku: product.sku,
    type: 'DELIVERY',
    quantity: Number(quantity),
    sourceWarehouse: warehouseId,
    beforeStock,
    afterStock,
    reference,
    performedBy: userId,
    note: note || `Delivery to customer of ${quantity} ${product.unitOfMeasure || 'units'}`,
  });

  return { warehouseStock, transaction };
}

/**
 * Process a validated Internal Warehouse Transfer
 */
async function processTransfer({ productId, sourceWarehouseId, destinationWarehouseId, quantity, reference, userId, note = '' }) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  if (sourceWarehouseId.toString() === destinationWarehouseId.toString()) {
    throw new Error('Source and destination warehouse cannot be the same');
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const [srcWarehouse, dstWarehouse] = await Promise.all([
    Warehouse.findById(sourceWarehouseId),
    Warehouse.findById(destinationWarehouseId),
  ]);
  if (!srcWarehouse) throw new Error('Source warehouse not found');
  if (!dstWarehouse) throw new Error('Destination warehouse not found');

  let srcStock = await WarehouseStock.findOne({ product: productId, warehouse: sourceWarehouseId });
  const srcBefore = srcStock ? srcStock.quantity : 0;

  if (srcBefore < Number(quantity)) {
    throw new Error('Insufficient stock available in source warehouse.');
  }

  // Deduct from source
  srcStock.quantity = srcBefore - Number(quantity);
  await srcStock.save();

  // Add to destination
  let dstStock = await WarehouseStock.findOne({ product: productId, warehouse: destinationWarehouseId });
  const dstBefore = dstStock ? dstStock.quantity : 0;
  const dstAfter = dstBefore + Number(quantity);

  if (!dstStock) {
    dstStock = new WarehouseStock({
      product: productId,
      warehouse: destinationWarehouseId,
      quantity: dstAfter,
    });
  } else {
    dstStock.quantity = dstAfter;
  }
  await dstStock.save();

  // Total product stock doesn't change globally, but we sync to guarantee data consistency
  await syncProductTotalStock(productId);

  const transaction = await InventoryTransaction.create({
    product: productId,
    sku: product.sku,
    type: 'TRANSFER',
    quantity: Number(quantity),
    sourceWarehouse: sourceWarehouseId,
    destinationWarehouse: destinationWarehouseId,
    beforeStock: srcBefore,
    afterStock: srcStock.quantity,
    reference,
    performedBy: userId,
    note: note || `Internal transfer of ${quantity} ${product.unitOfMeasure || 'units'} from ${srcWarehouse.name} to ${dstWarehouse.name}`,
  });

  return { srcStock, dstStock, transaction };
}

/**
 * Process a validated Inventory Adjustment
 */
async function processAdjustment({ productId, warehouseId, physicalQuantity, reason, reference, userId, note = '' }) {
  if (physicalQuantity < 0) {
    throw new Error('Physical quantity cannot be negative');
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) throw new Error('Warehouse not found');

  let warehouseStock = await WarehouseStock.findOne({ product: productId, warehouse: warehouseId });
  const beforeStock = warehouseStock ? warehouseStock.quantity : 0;
  const targetStock = Number(physicalQuantity);
  const diff = targetStock - beforeStock;

  if (!warehouseStock) {
    warehouseStock = new WarehouseStock({
      product: productId,
      warehouse: warehouseId,
      quantity: targetStock,
    });
  } else {
    warehouseStock.quantity = targetStock;
  }
  await warehouseStock.save();

  await syncProductTotalStock(productId);

  const transaction = await InventoryTransaction.create({
    product: productId,
    sku: product.sku,
    type: 'ADJUSTMENT',
    quantity: Math.abs(diff),
    sourceWarehouse: warehouseId,
    beforeStock,
    afterStock: targetStock,
    reference,
    performedBy: userId,
    note: `Adjustment (${reason}): Diff ${diff >= 0 ? '+' : ''}${diff}. ${note}`,
  });

  return { warehouseStock, diff, transaction };
}

module.exports = {
  syncProductTotalStock,
  getWarehouseStock,
  processReceipt,
  processDelivery,
  processTransfer,
  processAdjustment,
};
