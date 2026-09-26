# 🧪 StockSense - Integration Testing Checklist
*(Based on Odoo Hackathon 2026 Problem Statement)*

## 1. Authentication & Setup
- [ ] User signup & login works
- [ ] OTP password reset flow works
- [ ] Redirect to Dashboard on login

## 2. Inward Stock (Receipts) - PDF Step 1
- [x] Create Receipt for Supplier with items (e.g. 100 kg Steel)
- [x] Click "Validate"
- [x] Stock increases by +100 in Main Warehouse
- [x] Entry logged in Move History / Stock Ledger (Type: IN)
- [ ] "Pending Receipts" KPI updates on Dashboard

## 3. Internal Transfer - PDF Step 2
- [x] Transfer 20 kg Steel from `Main Store` -> `Production Rack`
- [x] Click "Validate"
- [ ] Main Store stock: drops by 20
- [ ] Production Rack stock: increases by 20
- [ ] Total Company Stock remains exactly 100 (Unchanged)
- [x] Ledger entry logged with Source and Destination

## 4. Outward Stock (Deliveries) - PDF Step 3
- [ ] Create Delivery Order for 20 units
- [ ] Pick -> Pack -> Validate
- [x] Stock reduces by -20
- [x] Ledger entry logged (Type: OUT)
- [x] **Negative Stock Protection:** System blocks delivery if available stock < requested quantity

## 5. Stock Adjustment - PDF Step 4
- [ ] Physical count reveals 3 kg damaged (Count = 77 instead of 80)
- [x] System auto-calculates difference: -3
- [x] Stock updates to 77
- [ ] Ledger entry logs adjustment with reason

## 6. Dashboard & Filters
- [ ] Low Stock alert triggers when stock <= Reorder Level
- [ ] Filter by Status (Draft, Waiting, Ready, Done, Canceled)
- [ ] Filter by Document Type (Receipts, Deliveries, Transfers, Adjustments)
- [ ] Filter by Warehouse / Location
