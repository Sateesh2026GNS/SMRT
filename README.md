# SMRT

A full-stack **Production Management**, **Inventory & Raw Material Management**, **Sales & Billing**, and **Accounts & Reports** system with multi-tenant support.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React 18, Vite, React Router, Axios, Tailwind CSS, React i18next

### Frontend performance

- **Route-level code splitting** – Each page is loaded on demand (`lazyPages.jsx` + `React.lazy`), so the initial JS bundle stays small (~77 KB gzip for the main entry vs. a single 500+ KB chunk before).
- **Localized Suspense** – While a chunk loads, a **light inline fallback** (`RouteFallback`) appears in the main area only; the sidebar/nav stay mounted so navigation doesn’t feel like a full reload.
- **Vendor chunking** – `vite.config.js` splits **recharts**, **react-vendor**, **i18n**, **axios**, and **export-libs** (xlsx/jspdf) so the browser can cache them and load them in parallel only when needed.
- **Dashboard** – Chart code lives in the `recharts` chunk and is fetched only when the user opens the dashboard.

## Features

### Production Management
- Production planning (orders, scheduling)
- Work orders
- Batch tracking
- Machine status monitoring
- Daily production reports

### Inventory & Raw Material Management
- Raw material tracking
- Low stock alerts
- Barcode support (scan or manual lookup)
- Warehouse management
- Supplier tracking
- Stock movements (in/out/adjustment)

### HR & Employee Management
- Worker attendance (clock in/out)
- Shift management
- Payroll
- Overtime calculation
- Performance tracking

### Sales & Billing Module
- Sales orders (with invoiced / packed / shipped status)
- GST billing (SGST, CGST, IGST)
- Invoice generation (Tax Invoice form)
- Payment tracking
- Customer management

### Accounts & Reports
- Accounts dashboard (invoice analytics, overdue tracking, settlement metrics)
- Profit & Loss (Revenue vs Cost/Expense by month)
- Expense tracking
- Tax reports (GST summary)
- Export to Excel / PDF

### Quality Control
- Quality inspection
- Defect tracking
- Batch quality reports
- Compliance logs

### Maintenance
- Machine maintenance
- Preventive maintenance
- Breakdown reports
- Maintenance schedule

### Analytics
- Production analytics
- Machine efficiency
- Inventory analytics
- Profit analysis

### Alerts & Notifications
- Low stock alerts
- Machine failure alerts
- Production delay alerts
- Maintenance reminders

### Multi-Language Support
- **Languages:** English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు)
- Language selector in top navigation bar
- Full UI translation (sidebar, pages, buttons, labels, messages)
- Selection persisted in localStorage across page refresh

## User Flows (High-Level)

All flows follow the pattern: **Select → Enter → Save → View**. Tasks complete in **3 steps max**.

### 1. Overall SMRT Flow
Login → Dashboard → Choose Module → Perform Action → Save Data → View Reports

### 2. Production Management
Dashboard → Production Module → **Create Work Order** (3 fields: Product, Quantity, Machine) → Assign Machine → Start Production → Track Status → Complete Production → Move to Inventory

- **Quick Create Work Order:** Dashboard → Click "Create Work Order" → Fill 3 fields → Save → Done ✅

### 3. Inventory
Purchase Raw Material → Add to Inventory → Use in Production → Update Stock → Low Stock Alert → Reorder

### 4. Sales
Create Customer → Create Sales Order → Generate Invoice → Dispatch Product → Receive Payment

### 5. HR (Employee)
Add Employee → Assign Role → Track Attendance → Calculate Payroll → Generate Salary Report

### 6. Machine Monitoring
Add Machine → Track Status → Detect Issue → Create Maintenance Task → Fix Machine → Update Status

### 7. Reports & Analytics
Dashboard → Select Report → Apply Filters → View Data → Export (PDF/Excel)

### 8. User / Admin
Login → Admin Panel → Create User → Assign Role → Set Permissions

## Project Structure

```
SMRT/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, router registration, DB init
│   │   ├── core/                # Config, database, seed_tenant, seed_roles, seed_users, seed_products
│   │   ├── models/              # SQLAlchemy: user, tenant, role, production, inventory, procurement, sales, accounts, hr, machine, quality, maintenance, alert, document
│   │   ├── schemas/             # Pydantic: auth, production, inventory, procurement, sales, accounts, hr, quality, maintenance, alert, document, admin
│   │   ├── services/            # Business logic: auth, production, inventory, procurement, sales, accounts, hr, analytics, quality, maintenance, alert, document, admin
│   │   └── api/                 # Routers: auth, production, inventory, procurement, hr, sales, accounts, analytics, quality, maintenance, alerts, admin, documents
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # authApi, productionApi, inventoryApi, procurementApi, salesApi, hrApi, accountsApi, analyticsApi, adminApi
│   │   ├── components/          # layout (Navbar, Sidebar), common (Loader, Table, DataTable, EmptyState, PageHeader, PlaceholderPage, ErrorBoundary, RouteFallback)
│   │   ├── context/             # AuthContext, SettingsContext
│   │   ├── hooks/               # useAuth
│   │   ├── pages/               # auth, dashboard, production, inventory, procurement, sales, accounts, hr, quality, maintenance, analytics, alerts, admin, documents, settings
│   │   └── routes/              # AppRoutes, lazyPages (code-split)
│   ├── package.json
│   └── .env
│
└── README.md
```

### Backend Code Map

| Module | API (`app/api/`) | Service (`app/services/`) | Models |
|--------|------------------|---------------------------|--------|
| Auth | auth.py | auth_service.py | user, tenant, role |
| Production | production.py | production_service.py | production, product, machine |
| Inventory | inventory.py | inventory_service.py | inventory (Warehouse, Supplier, Item, StockLevel, StockMovement) |
| Procurement | procurement.py | procurement_service.py | procurement (PurchaseOrder, MaterialRequest, GoodsReceipt, SupplierPayment) |
| Sales | sales.py | sales_service.py | sales (Customer, SalesOrder, Invoice, Payment) |
| Accounts | accounts.py | accounts_service.py | accounts (Income, Expense) |
| HR | hr.py | hr_service.py | hr (Employee, Shift, Attendance, Payroll, Performance) |
| Analytics | analytics.py | analytics_service.py | aggregates from other modules |
| Quality | quality.py | quality_service.py | quality (Inspection, Defect, BatchReport, Compliance) |
| Maintenance | maintenance.py | maintenance_service.py | maintenance (Record, Preventive, Breakdown, Schedule) |
| Alerts | alerts.py | alert_service.py | alert |
| Admin | admin.py | admin_service.py | admin (AccessLog) |
| Documents | documents.py | document_service.py | document |

### Frontend Code Map

| Area | Pages | API Client |
|------|-------|------------|
| Auth | Login, Register | authApi |
| Dashboard | Dashboard (KPIs, charts) | productionApi, inventoryApi, hrApi, analyticsApi, accountsApi |
| Production | Planning, WorkOrders, BatchTracking, MachineStatus, DailyReports, CreateProduction, CreateMachine | productionApi |
| Inventory | Dashboard, InventoryList, Warehouses, Suppliers, StockMovement, CreateItem/Warehouse/Supplier | inventoryApi |
| Procurement | PurchaseOrders, VendorManagement, MaterialRequests, GoodsReceipt, SupplierPayments + create pages | procurementApi |
| Sales | InvoiceDashboard, TaxInvoiceForm, SalesOrders, Customers, PaymentTracking + create pages | salesApi |
| Accounts | Dashboard, ProfitLoss, ExpenseTracking, TaxReports, RecordIncome, RecordExpense | accountsApi |
| HR | HRDashboard, Attendance, Shifts, Payroll, Performance, Employees + create pages | hrApi |
| Quality, Maintenance, Analytics, Alerts | Inspection, Defects, BatchReports, Compliance; MachineMaintenance, Preventive, Breakdowns, Schedule; Production/Machine/Inventory/Profit analytics; AllAlerts, LowStock, etc. | quality/maintenance/analytics/alert APIs |
| Admin, Documents, Settings | UserManagement, RolesPermissions, AccessLogs; Purchase/Production/Quality/Reports docs; Settings sub-pages | adminApi, document APIs |

## Prerequisites

- Python 3.10+
- Node.js 18+

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env` (optional):

```env
DATABASE_URL=sqlite:///./smrt.db
```

No extra database server is required. The SQLite file `backend/smrt.db` is created automatically on first backend start.

### DB Browser for SQLite

- **File location:** `backend/smrt.db` (relative to the backend folder when you run uvicorn from `backend/`)
- **Open the database:** Use [DB Browser for SQLite](https://sqlitebrowser.org/) to inspect tables and data
- **Important:** Stop the backend before opening the file in DB Browser — SQLite uses file locking while the app is running
- **Seeded admin user** (created on first start): `admin@smrt.local` / `admin123`

Run the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

App: http://localhost:5173

## Auth API (Login & Registration)

Base URL: `http://localhost:8000` (or your `VITE_API_BASE_URL`).

### POST `/auth/login`

**Request (JSON):**

| Field      | Type   | Required |
|-----------|--------|----------|
| `email`   | string | Yes      |
| `password`| string | Yes      |

**Response (200):**

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@smrt.local",
    "full_name": "Admin",
    "tenant_id": 1,
    "tenant_name": "GNS",
    "role": "Admin"
  }
}
```

**Errors:** `401` — Invalid email or password.

**Default seeded user (after first backend start):** `admin@smrt.local` / `admin123`

### POST `/auth/register`

**Request (JSON):**

| Field           | Type   | Required | Notes        |
|----------------|--------|----------|--------------|
| `company_name` | string | Yes      | New tenant   |
| `full_name`    | string | Yes      |              |
| `email`        | string | Yes      | Valid email  |
| `password`     | string | Yes      | Min 6 chars  |

**Response (200):** Same shape as login — returns JWT and user (role `Admin` for the new tenant).

**Errors:** `409` — Email already registered.

### Frontend

- **Login** (`/login`): Calls `POST /auth/login`, stores `access_token` in `localStorage` as `smrt-token`, persists user in `smrt-user`. Axios sends `Authorization: Bearer <token>` on subsequent requests.
- **Register** (`/register`): Calls `POST /auth/register`, then same as login.
- **Demo login:** Still available without API (role picker).

Optional `backend/.env`:

```env
JWT_SECRET_KEY=your-long-random-secret
```

## Usage

1. **Login:** API login with `admin@smrt.local` / `admin123`, or use "Continue as …" for demo without backend.
2. **Language:** Click the Language button (🌐) in the top bar to switch between English, Hindi, Tamil, or Telugu.
3. **Dashboard:** View production, inventory, HR, and machine status summaries.
4. **Production:** Create production orders, work orders, machines; track batches and daily reports. Tables support search, sorting, pagination.
5. **Inventory:** Add warehouses and suppliers, create items (SKU, barcode), record stock movements.
6. **Procurement:** Purchase orders, vendor management, material requests, goods receipt (GRN), supplier payments.
7. **Sales:** Manage invoices, sales orders, customers, and payments.
8. **Accounts:** View analytics dashboard, Profit & Loss, expense tracking, tax reports; export to Excel/PDF.
9. **Settings:** Configure theme (light/dark), language, date format, currency, company profile.

## API Overview

| Prefix | Endpoints |
|--------|-----------|
| `/auth/` | `POST /login`, `POST /register` (JWT bearer) |
| `/production/` | products, orders, work-orders, batches, machines, machine-status, daily-reports |
| `/inventory/` | warehouses, suppliers, items, items/barcode/{barcode}, dashboard, stock-levels, stock-movements |
| `/procurement/` | purchase-orders, vendors, material-requests, goods-receipt, supplier-payments |
| `/hr/` | dashboard, employees, shifts, attendance (clock-in, clock-out), payroll, performance |
| `/sales/` | customers, sales-orders, invoices, invoices/{id}, payments |
| `/accounts/` | dashboard, profit-loss, tax-report, income, expenses |
| `/analytics/` | production-trend, machine-efficiency, inventory-turnover, worker-performance, profit, dashboard |
| `/quality/` | inspection, defects, batch-reports, compliance |
| `/maintenance/` | records, preventive, breakdowns, schedule |
| `/alerts/` | list, create, acknowledge |
| `/admin/` | users, roles, access-logs |
| `/documents/` | list, create |

All list endpoints accept `tenant_id` as a query parameter (default: 1 for demo). Full docs: http://localhost:8000/docs

---

## Future Upgrades (Roadmap)

| Feature | Description |
|---------|-------------|
| **IoT Machine Integration** | Real-time machine data feeds, sensor connectivity, OEE metrics |
| **AI Production Prediction** | Demand forecasting, production optimization, anomaly detection |
| **Mobile App (React Native)** | Native mobile app for on-floor data entry, approvals, and notifications |

---

## License

Private / Internal Use
