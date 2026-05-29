import { Navigate, Route, Routes } from "react-router-dom";

import PlaceholderPage from "../components/common/PlaceholderPage";
import ProtectedRoute from "../components/layout/ProtectedRoute";
/* Pages are lazy-loaded via lazyPages – see vite.config manualChunks for vendor splits */
import * as P from "./lazyPages";
import LiveProduction from "../pages/factoryMonitor/LiveProduction";
import MachineStatus from "../pages/factoryMonitor/MachineStatus";
import ProductionLines from "../pages/factoryMonitor/ProductionLines";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/landing" element={<P.Landing />} />
      <Route path="/login" element={<P.Login />} />
      <Route path="/register" element={<P.Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <P.Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production"
        element={
          <ProtectedRoute>
            <P.ProductionDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/dashboard"
        element={
          <ProtectedRoute>
            <P.ProductionDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/planning"
        element={
          <ProtectedRoute>
            <P.ProductionPlanning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/work-orders"
        element={
          <ProtectedRoute>
            <P.WorkOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/batches"
        element={
          <ProtectedRoute>
            <P.BatchTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/machines"
        element={
          <ProtectedRoute>
            <P.MachineStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/machines/create"
        element={
          <ProtectedRoute>
            <P.CreateMachine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/reports"
        element={
          <ProtectedRoute>
            <P.DailyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/create"
        element={
          <ProtectedRoute>
            <P.CreateProduction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/work-orders/create-quick"
        element={
          <ProtectedRoute>
            <P.QuickCreateWorkOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <P.InventoryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/items"
        element={
          <ProtectedRoute>
            <P.InventoryList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/items/create"
        element={
          <ProtectedRoute>
            <P.CreateItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/stock-movement"
        element={
          <ProtectedRoute>
            <P.StockMovement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/warehouses"
        element={
          <ProtectedRoute>
            <P.Warehouses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/suppliers"
        element={
          <ProtectedRoute>
            <P.Suppliers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/warehouses/create"
        element={
          <ProtectedRoute>
            <P.CreateWarehouse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/suppliers/create"
        element={
          <ProtectedRoute>
            <P.CreateSupplier />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr"
        element={
          <ProtectedRoute>
            <P.HRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/attendance"
        element={
          <ProtectedRoute>
            <P.Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/shifts"
        element={
          <ProtectedRoute>
            <P.Shifts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/shifts/create"
        element={
          <ProtectedRoute>
            <P.CreateShift />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/payroll"
        element={
          <ProtectedRoute>
            <P.Payroll />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/performance"
        element={
          <ProtectedRoute>
            <P.Performance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <ProtectedRoute>
            <P.Employees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employees/create"
        element={
          <ProtectedRoute>
            <P.CreateEmployee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/payroll/create"
        element={
          <ProtectedRoute>
            <P.CreatePayroll />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/performance/create"
        element={
          <ProtectedRoute>
            <P.CreatePerformance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/invoices"
        element={
          <ProtectedRoute>
            <P.InvoiceDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/invoices/create"
        element={
          <ProtectedRoute>
            <P.TaxInvoiceForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/orders"
        element={
          <ProtectedRoute>
            <P.SalesOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/orders/create"
        element={
          <ProtectedRoute>
            <P.CreateSalesOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/orders/:id"
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Sales order detail"
              description="Full order view and line items will appear here. Use the list to manage orders."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/customers"
        element={
          <ProtectedRoute>
            <P.Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/customers/create"
        element={
          <ProtectedRoute>
            <P.CreateCustomer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/payments"
        element={
          <ProtectedRoute>
            <P.PaymentTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/payments/create"
        element={
          <ProtectedRoute>
            <P.CreatePayment />
          </ProtectedRoute>
        }
      />
      <Route path="/accounts" element={<ProtectedRoute><P.AccountsDashboard /></ProtectedRoute>} />
      <Route path="/accounts/profit-loss" element={<ProtectedRoute><P.ProfitLoss /></ProtectedRoute>} />
      <Route path="/accounts/expenses" element={<ProtectedRoute><P.ExpenseTracking /></ProtectedRoute>} />
      <Route path="/accounts/expenses/record" element={<ProtectedRoute><P.RecordExpense /></ProtectedRoute>} />
      <Route path="/accounts/tax-reports" element={<ProtectedRoute><P.TaxReports /></ProtectedRoute>} />
      <Route path="/accounts/income/record" element={<ProtectedRoute><P.RecordIncome /></ProtectedRoute>} />
      <Route path="/procurement/purchase-orders" element={<ProtectedRoute><P.PurchaseOrders /></ProtectedRoute>} />
      <Route path="/procurement/purchase-orders/create" element={<ProtectedRoute><P.CreatePurchaseOrder /></ProtectedRoute>} />
      <Route path="/procurement/vendors" element={<ProtectedRoute><P.VendorManagement /></ProtectedRoute>} />
      <Route path="/procurement/vendors/create" element={<ProtectedRoute><P.CreateVendor /></ProtectedRoute>} />
      <Route path="/procurement/material-requests" element={<ProtectedRoute><P.MaterialRequests /></ProtectedRoute>} />
      <Route path="/procurement/material-requests/create" element={<ProtectedRoute><P.CreateMaterialRequest /></ProtectedRoute>} />
      <Route path="/procurement/goods-receipt" element={<ProtectedRoute><P.GoodsReceipt /></ProtectedRoute>} />
      <Route path="/procurement/goods-receipt/create" element={<ProtectedRoute><P.CreateGoodsReceipt /></ProtectedRoute>} />
      <Route path="/procurement/supplier-payments" element={<ProtectedRoute><P.SupplierPayments /></ProtectedRoute>} />
      <Route path="/procurement/supplier-payments/create" element={<ProtectedRoute><P.CreateSupplierPayment /></ProtectedRoute>} />
      <Route path="/quality/inspection" element={<ProtectedRoute><P.QualityInspection /></ProtectedRoute>} />
      <Route path="/quality/defects" element={<ProtectedRoute><P.DefectTracking /></ProtectedRoute>} />
      <Route path="/quality/batch-reports" element={<ProtectedRoute><P.BatchQualityReports /></ProtectedRoute>} />
      <Route path="/quality/compliance" element={<ProtectedRoute><P.ComplianceLogs /></ProtectedRoute>} />
      <Route path="/maintenance/machines" element={<ProtectedRoute><P.MachineMaintenance /></ProtectedRoute>} />
      <Route path="/maintenance/preventive" element={<ProtectedRoute><P.PreventiveMaintenance /></ProtectedRoute>} />
      <Route path="/maintenance/breakdowns" element={<ProtectedRoute><P.BreakdownReports /></ProtectedRoute>} />
      <Route path="/maintenance/schedule" element={<ProtectedRoute><P.MaintenanceSchedule /></ProtectedRoute>} />
      <Route path="/analytics/production" element={<ProtectedRoute><P.ProductionAnalytics /></ProtectedRoute>} />
      <Route path="/analytics/machine-efficiency" element={<ProtectedRoute><P.MachineEfficiency /></ProtectedRoute>} />
      <Route path="/analytics/inventory" element={<ProtectedRoute><P.InventoryAnalytics /></ProtectedRoute>} />
      <Route path="/analytics/profit" element={<ProtectedRoute><P.ProfitAnalysis /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><P.AllAlerts /></ProtectedRoute>} />
      <Route path="/alerts/low-stock" element={<ProtectedRoute><P.LowStockAlerts /></ProtectedRoute>} />
      <Route path="/alerts/machine-failure" element={<ProtectedRoute><P.MachineFailureAlerts /></ProtectedRoute>} />
      <Route path="/alerts/production-delay" element={<ProtectedRoute><P.ProductionDelayAlerts /></ProtectedRoute>} />
      <Route path="/alerts/maintenance" element={<ProtectedRoute><P.MaintenanceReminders /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><P.UserManagement /></ProtectedRoute>} />
      <Route path="/admin/roles" element={<ProtectedRoute><P.RolesPermissions /></ProtectedRoute>} />
      <Route path="/admin/access-logs" element={<ProtectedRoute><P.AccessLogs /></ProtectedRoute>} />
      <Route path="/documents/purchase" element={<ProtectedRoute><P.PurchaseDocuments /></ProtectedRoute>} />
      <Route path="/documents/production" element={<ProtectedRoute><P.ProductionFiles /></ProtectedRoute>} />
      <Route path="/documents/quality" element={<ProtectedRoute><P.QualityCertificates /></ProtectedRoute>} />
      <Route path="/documents/reports" element={<ProtectedRoute><P.ReportsArchive /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><P.SettingsLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/settings/users" replace />} />
        <Route path="users" element={<P.SettingsUsers />} />
        <Route path="teams" element={<P.SettingsTeams />} />
        <Route path="addresses">
          <Route index element={<Navigate to="/settings/addresses/billing" replace />} />
          <Route path="billing" element={<P.SettingsBillingAddress />} />
          <Route path="delivery" element={<P.SettingsDeliveryLocation />} />
        </Route>
        <Route path="permissions" element={<P.SettingsMyPermissions />} />
        <Route path="subscription" element={<P.SettingsMySubscription />} />
        <Route path="alerts" element={<P.SettingsAlertsPreferences />} />
        <Route path="accounts">
          <Route index element={<Navigate to="/settings/accounts/bank-details" replace />} />
          <Route path="bank-details" element={<P.SettingsBankDetails />} />
          <Route path="payment-terms" element={<P.SettingsPaymentTerms />} />
          <Route path="tax-options" element={<P.SettingsTaxOptions />} />
        </Route>
        <Route path="documents">
          <Route index element={<Navigate to="/settings/documents/number-format" replace />} />
          <Route path="logistic-details" element={<P.SettingsLogisticDetails />} />
          <Route path="terms-conditions" element={<P.SettingsTermsConditions />} />
          <Route path="number-format" element={<P.SettingsDocumentNumberFormat />} />
          <Route path="package-type" element={<P.SettingsPackageTypeMaster />} />
          <Route path="transporter" element={<PlaceholderPage title="Transporter Details" />} />
          <Route path="custom-fields" element={<PlaceholderPage title="Custom Fields" />} />
          <Route path="excel" element={<PlaceholderPage title="Excel Documents" />} />
        </Route>
        <Route path="inventory" element={<PlaceholderPage title="Inventory" />} />
        <Route path="production" element={<PlaceholderPage title="Production" />} />
        <Route path="buyers" element={<PlaceholderPage title="Buyers & Suppliers" />} />
        <Route path="gst" element={<PlaceholderPage title="GST API" />} />
      </Route>
      <Route path="/factory-monitor/live-production" element={<ProtectedRoute><LiveProduction /></ProtectedRoute>} />
      <Route path="/factory-monitor/machine-status" element={<ProtectedRoute><MachineStatus /></ProtectedRoute>} />
      <Route path="/factory-monitor/production-lines" element={<ProtectedRoute><ProductionLines /></ProtectedRoute>} />
      <Route path="/iot" element={<ProtectedRoute><P.IotDashboard /></ProtectedRoute>} />
      <Route path="/iot/wearables" element={<ProtectedRoute><P.Wearables /></ProtectedRoute>} />
      <Route path="/iot/machine-analytics" element={<ProtectedRoute><P.MachineAnalytics /></ProtectedRoute>} />
      <Route path="/iot/sensors" element={<ProtectedRoute><P.Sensors /></ProtectedRoute>} />
      <Route path="/iot/cobots" element={<ProtectedRoute><P.Cobots /></ProtectedRoute>} />
      <Route path="/iot/agvs" element={<ProtectedRoute><P.Agvs /></ProtectedRoute>} />
      <Route path="/iot/drones" element={<ProtectedRoute><P.Drones /></ProtectedRoute>} />
      <Route path="/iot/smart-packaging" element={<ProtectedRoute><P.SmartPackaging /></ProtectedRoute>} />
    </Routes>
  );
}
