# StockSense – Enterprise Inventory Management System

StockSense is a centralized, real-time multi-warehouse Inventory Management System designed to replace spreadsheets and manual paper registers. Built with a modern full-stack architecture (Node.js, Express, MongoDB Atlas, React, Vite, and Tailwind CSS), StockSense delivers an immutable stock ledger, real-time KPI metrics, automated low-stock warnings, and multi-step operational workflows.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
5. [Environment Variables](#environment-variables)
6. [Installation & Setup](#installation--setup)
7. [Database Seeding & Demo Flow](#database-seeding--demo-flow)
8. [Demo Credentials](#demo-credentials)
9. [API Overview](#api-overview)
10. [Git & Deployment Instructions](#git--deployment-instructions)

---

## Key Features

- **Real-Time KPI Dashboard**:
  - Live counts for Total Products, Low Stock, Out of Stock, Pending Receipts, Pending Deliveries, and Scheduled Transfers.
  - Total real-time Inventory Valuation ($ / ₹).
  - Visual analytics using Recharts: Stock by Category (Donut), Category Valuation (Bar), and 7-day Movement Timeline (Area).
  - Interactive multi-dimensional filter bar (Warehouse, Category, Operation Type).

- **Multi-Warehouse Stock Model**:
  - Tracks individual product stock per warehouse (e.g. Main Warehouse, Production Floor, Store Room) as well as global aggregates.
  - Safe deletion preventing orphaned stock.

- **Inbound Receipts (Supplier Operations)**:
  - Multi-stage lifecycle: `Draft` → `Ready` → `Validate` → `Done`.
  - Validating automatically increments destination warehouse stock and creates an immutable ledger entry.

- **Outbound Delivery Orders (Sales Operations)**:
  - Step-by-step picking and packing workflow: `Draft` → `Pick` (Waiting) → `Pack` (Ready) → `Validate` → `Done`.
  - **Negative Stock Prevention**: Validates stock availability on the backend. Transactions exceeding available warehouse stock are blocked with an immediate `"Insufficient stock available."` warning.

- **Internal Transfers (Warehouse Rebalancing)**:
  - Workflow: `Create` → `Scheduled` → `Validate` → `Done`.
  - Atomically decrements source warehouse and increments destination warehouse while keeping total inventory unchanged.

- **Physical Inventory Adjustments**:
  - Automatically calculates discrepancy: `Difference = Physical Count - System Quantity`.
  - Displays Before, Physical, Difference, and After reconciliation preview.

- **Master Stock Ledger (Move History)**:
  - Immutable audit trail recording every stock-affecting event with Date, Reference, Product, SKU, Operation Type, Source, Destination, Quantity, Before Stock, After Stock, and User.
  - Filterable by reference, product, warehouse, operation type, and date range.

- **Reordering Rules & Alerts**:
  - Configurable minimum and maximum boundaries and reorder quantities.
  - Global topbar notification popover and dashboard alert panels.

- **SaaS Light-Mode UI/UX**:
  - Designed for high-density enterprise productivity with white cards, light slate backgrounds, navy text, responsive collapsible sidebar, topbar breadcrumbs, and floating toast notifications.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Lucide React, Recharts, Tailwind CSS |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose ODM, JWT, bcryptjs, CORS, dotenv |
| **Database** | MongoDB Atlas (or local MongoDB) |
| **Ports** | Backend: `5001` \| Frontend: `5173` |

---

## Project Structure

```text
StockSense/
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/       # Table, Modal, Button, Input, Select, Badge, StatCard, LoadingSpinner, EmptyState
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── layouts/          # AppLayout, Sidebar, Topbar
│   │   ├── pages/            # Dashboard, Products, ProductDetail, Receipts, Deliveries, Transfers, Adjustments, MoveHistory, Warehouses, Categories, ReorderingRules, Profile, Login, Register, ForgotPassword, ResetPassword
│   │   ├── services/         # Axios API layer and service modules
│   │   ├── styles/           # index.css with Tailwind & custom ERP utilities
│   │   ├── App.jsx           # Protected and Public Route guards
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── .env.example
│
├── backend/
│   ├── config/               # db.js connection handling
│   ├── controllers/          # auth, products, warehouses, categories, receipts, deliveries, transfers, adjustments, inventory, dashboard, reordering rules
│   ├── middleware/           # authMiddleware (JWT), errorMiddleware
│   ├── models/               # User, Product, Warehouse, Category, WarehouseStock, ReorderingRule, Receipt, Delivery, Transfer, Adjustment, InventoryTransaction
│   ├── routes/               # REST API route definitions
│   ├── services/             # stockService (atomic mutations, negative stock prevention, ledger logging)
│   ├── utils/                # seed.js (idempotent seeder)
│   ├── server.js             # Express application entry on port 5001
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── package.json              # Root npm workspace runner (npm run dev)
├── README.md                 # Complete documentation
└── .gitignore                # Git exclusions
```

---

## Database Setup (MongoDB Atlas)

1. Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free tier cluster (M0).
2. Under **Database Access**, create a database user (e.g. username `stocksense_admin` and a strong password).
3. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** for development/demo purposes.
4. Click **Connect** → **Drivers** (Node.js) and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/stocksense?retryWrites=true&w=majority
   ```
5. Paste this connection string into `StockSense/backend/.env` under `MONGO_URI`.

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/stocksense?retryWrites=true&w=majority
JWT_SECRET=stocksense_jwt_secure_super_secret_key_2025
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

---

## Installation & Setup

You can run the entire stack using npm workspaces from the root `StockSense` folder, or start each service independently.

### Option A: Quickstart via Root Workspaces

```bash
# 1. Enter the project root
cd StockSense

# 2. Install all dependencies (frontend, backend, and root)
npm install

# 3. Seed the database with demo admin and catalog
npm run seed

# 4. Start both Backend (:5001) and Frontend (:5173) concurrently
npm run dev
```

### Option B: Independent Installation

#### Backend:
```bash
cd StockSense/backend
npm install
npm run seed     # Seeds demo admin and baseline products/warehouses
npm run dev      # Starts Express server on http://localhost:5001
```

#### Frontend:
```bash
cd StockSense/frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@stocksense.com` | `Admin123` |

> *Tip: On the Login screen, click the **Autofill** button in the demo credentials badge for 1-click access.*

---

## Complete Demo Flow (Hackathon Demonstration)

To demonstrate the full lifecycle of StockSense during a presentation:

1. **Sign In**:
   - Navigate to `http://localhost:5173/login`. Click **Autofill** and log in as `admin@stocksense.com`.
2. **Dashboard Overview**:
   - Inspect live KPI metrics, total valuation, category distribution donut, 7-day movement timeline, and active low-stock alerts.
   - Use the filter toolbar to filter by warehouse or category.
3. **Product Catalog**:
   - Navigate to **Products**. View the seeded catalog (Wireless Keyboard, Mouse, Chair, Steel Rod).
   - Click **+ Add Product** and create a new item: `Ergonomic Headset` (SKU: `HS001`, Category: `Electronics`, Price: `2499`, Initial Stock: `10`, Warehouse: `Main Warehouse`).
4. **Receive Stock (Receipt)**:
   - Navigate to **Receipts** → click **Create Receipt**.
   - Select Supplier `AudioCorp`, Warehouse `Main Warehouse`, Product `Ergonomic Headset`, Quantity `20`.
   - On the receipt row, click **Set Ready**, then click **Validate**.
   - Notice the toast `"Receipt validated successfully."` and verify the product stock increases from `10` to `30`.
5. **Dispatch Stock (Delivery Order)**:
   - Navigate to **Delivery Orders** → click **Create Delivery Order**.
   - Select Customer `Acme Studios`, Warehouse `Main Warehouse`, Product `Ergonomic Headset`, Quantity `50`.
   - Click **Validate** → Observe the system block negative stock with the toast: `"Insufficient stock available."`
   - Modify or create a valid order for `5` units → Advance **Pick** → **Pack** → **Validate Delivery** → Verify stock decrements to `25`.
6. **Internal Warehouse Transfer**:
   - Navigate to **Internal Transfers** → click **Schedule Transfer**.
   - Source: `Main Warehouse`, Destination: `Store Room`, Product: `Ergonomic Headset`, Quantity `10`.
   - Click **Validate Transfer** → Verify `Main Warehouse` decrements by 10 and `Store Room` gains 10, while global stock remains 25.
7. **Inventory Adjustment (Stocktake Audit)**:
   - Navigate to **Inventory Adjustments** → click **New Stock Adjustment**.
   - Select `Ergonomic Headset` at `Main Warehouse`. The modal displays System Count: `15`.
   - Enter Physical Count: `14` → Live calculator indicates Difference: `-1`.
   - Click **Save & Apply Adjustment** → Stock resets to 14 and difference is logged.
8. **Master Stock Ledger (Move History)**:
   - Navigate to **Move History**.
   - Observe that every action taken above (Receipt, Delivery, Transfer, Adjustment) is logged chronologically with exact Before/After balances, reference numbers, and timestamps.
9. **Dashboard Reflection**:
   - Return to **Dashboard** and view updated valuation, recent activity table, and movement charts.

---

## API Overview

All routes except authentication require a valid Bearer JWT in the `Authorization` header.

### Authentication
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Authenticate & receive JWT
- `POST /api/auth/forgot-password` - Request 6-digit reset OTP
- `POST /api/auth/reset-password` - Validate OTP and update password
- `GET /api/auth/me` - Get current session identity

### Products & Warehouses
- `GET /api/products` - List products with filters (search, category, warehouse, stockStatus)
- `POST /api/products` - Create product with initial stock allocation
- `GET /api/products/:id` - Product detail with warehouse breakdown & movements
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/warehouses` - List warehouses with stock counts
- `POST /api/warehouses` - Create warehouse

### Operations
- `GET /api/receipts` & `POST /api/receipts` - Receipts CRUD
- `POST /api/receipts/:id/validate` - Validate receipt & increase stock
- `GET /api/deliveries` & `POST /api/deliveries` - Delivery orders CRUD
- `POST /api/deliveries/:id/validate` - Validate delivery & decrease stock (prevents negative)
- `GET /api/transfers` & `POST /api/transfers` - Internal transfers CRUD
- `POST /api/transfers/:id/validate` - Validate transfer & rebalance facilities
- `GET /api/adjustments` & `POST /api/adjustments` - Stock adjustments CRUD
- `POST /api/adjustments/:id/validate` - Validate physical count audit

### Ledger & Analytics
- `GET /api/inventory/transactions` - Master move history ledger with filters
- `GET /api/inventory/summary` - Aggregate stock valuation
- `GET /api/dashboard` - Real-time telemetry, KPIs, and chart series

---

## Git & Deployment Instructions

To push this fresh project to your GitHub repository:

```bash
cd "/Users/vedantsmac/Desktop/Stock Sense Antigravity/StockSense"

# Initialize git repository
git init

# Stage all files (node_modules and .env are protected by .gitignore)
git add .

# Initial commit
git commit -m "feat: complete full-stack StockSense inventory management system"

# Set main branch and connect remote repository
git branch -M main
git remote add origin https://github.com/<your-username>/StockSense.git

# Push to GitHub
git push -u origin main
```

---

## License
MIT License. Built for hackathons, enterprise demos, and production inventory operations.
