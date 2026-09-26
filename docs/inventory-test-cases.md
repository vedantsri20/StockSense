# StockSense Inventory Test Cases

## 1. Receipt

### TC-REC-01: Valid Receipt
Starting stock: 50
Receive: 20
Expected stock: 70

### TC-REC-02: Zero Quantity
Receive: 0
Expected: Reject

### TC-REC-03: Negative Quantity
Receive: -10
Expected: Reject

---

## 2. Delivery

### TC-DEL-01: Valid Delivery
Starting stock: 50
Deliver: 20
Expected stock: 30

### TC-DEL-02: Insufficient Stock
Starting stock: 10
Deliver: 20
Expected: Reject

### TC-DEL-03: Zero Quantity
Deliver: 0
Expected: Reject

---

## 3. Internal Transfer

### TC-TRF-01: Valid Transfer
Location A stock: 50
Location B stock: 20
Transfer: 10 from A to B
Expected:
- A = 40
- B = 30

### TC-TRF-02: Insufficient Source Stock
Location A stock: 5
Transfer: 10
Expected: Reject

### TC-TRF-03: Same Source and Destination
Expected: Reject

---

## 4. Stock Adjustment

### TC-ADJ-01: Decrease Stock
System stock: 50
Physical stock: 45
Expected stock: 45

### TC-ADJ-02: Increase Stock
System stock: 50
Physical stock: 60
Expected stock: 60

### TC-ADJ-03: Negative Physical Quantity
Physical stock: -5
Expected: Reject

---

## 5. Low Stock

### TC-LOW-01: Stock Below Minimum
Current stock: 5
Minimum stock: 10
Expected: Low-stock alert

### TC-LOW-02: Stock Above Minimum
Current stock: 20
Minimum stock: 10
Expected: No low-stock alert