# StockSense Inventory Rules

## 1. Receipts

- A receipt contains a supplier, product, quantity and destination location.
- Quantity must be greater than 0.
- A receipt does not increase stock until it is validated.
- On validation, received quantity is added to the destination location.
- A stock ledger entry is created after validation.

## 2. Delivery Orders

- A delivery contains a product, quantity and source location.
- Quantity must be greater than 0.
- The system must check available stock before validation.
- A delivery cannot be validated if requested quantity exceeds available stock.
- Pick and Pack must happen before final validation.
- On validation, delivered quantity is removed from the source location.
- A stock ledger entry is created.

## 3. Internal Transfers

- A transfer has a source location and destination location.
- Source and destination locations must be different.
- Quantity must be greater than 0.
- Source location must have sufficient stock.
- On validation, stock is decreased at the source.
- On validation, stock is increased at the destination.
- A stock ledger entry is created.

## 4. Stock Adjustments

- An adjustment contains a product, location and physical quantity.
- Physical quantity cannot be negative.
- The system compares physical quantity with recorded quantity.
- Difference = Physical Quantity - Recorded Quantity.
- On validation, stock is updated to the physical quantity.
- A stock ledger entry is created.

## 5. Low Stock

- Each product can have a minimum/reorder stock level.
- Current stock is compared with the minimum level.
- Products at or below the threshold should appear in low-stock alerts.

## 6. Stock Ledger

Every stock-changing operation should record:

- Product
- Location
- Operation type
- Quantity change
- Resulting balance
- Date/time