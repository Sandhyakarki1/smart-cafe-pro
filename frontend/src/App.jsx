import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminSignup from "./pages/AdminSignup.jsx";
import StaffLogin from "./pages/StaffLogin.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

// Admin Layout
import AdminLayout from "./components/AdminLayout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import StaffManagement from "./pages/StaffManagement.jsx";
import Menumanagement from "./pages/Menumanagement.jsx";
import Billing from "./pages/Billing.jsx";
import Orders from "./pages/Orders.jsx";
import QRCode from "./pages/QRCode.jsx";
import TableSettings from "./pages/TableSettings.jsx";

// Staff
import KitchenDashboard from "./pages/KitchenDashboard";
import WaiterDashboard from "./pages/WaiterDashboard";

// Customer
import CustomerMenu from "./pages/CustomerMenu.jsx";
import CustomerCart from "./pages/CustomerCart.jsx";
import CustomerOrderTracking from "./pages/CustomerOrderTracking";
import FeedbackManagement from "./pages/FeedbackManagement.jsx";

//  eSewa payment result pages
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentFailure from "./pages/PaymentFailure.jsx";

function App() {
  return (
    <Router>
      <Routes>

        {/* ================= AUTH ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup/>} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="menu" element={<Menumanagement />} />
          <Route path="orders" element={<Orders />} />
          <Route path="feedback" element={<FeedbackManagement />} />
          <Route path="billing" element={<Billing />} />
          <Route path="qrcode" element={<QRCode />} />
          <Route path="tables" element={<TableSettings />} />
        </Route>

        {/* ================= STAFF ================= */}
        <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
        <Route path="/waiter/dashboard" element={<WaiterDashboard />} />

        {/* ================= CUSTOMER ================= */}
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/menu/:tableId" element={<CustomerMenu />} />
        <Route path="/cart" element={<CustomerCart />} />
        <Route path="/track/:id" element={<CustomerOrderTracking />} />

        {/* ================= PAYMENT (ESEWA) ================= */}
        <Route path="/payment-success/:orderId" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />

        {/* ================= DEFAULT ================= */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* ================= 404 ================= */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
              <h1 className="text-9xl font-black text-slate-200">404</h1>
              <p className="text-xl font-bold text-slate-500 -mt-10">
                Page Not Found
              </p>
              <button
                onClick={() => window.location.href = "/"}
                className="mt-6 text-indigo-600 font-bold border-b-2 border-indigo-600"
              >
                Go to Homepage
              </button>
            </div>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;