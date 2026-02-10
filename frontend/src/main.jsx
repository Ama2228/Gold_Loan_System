import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './style.css'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import LoginAs from './pages/LoginAs.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import MyReceipts from './pages/customer/MyReceipts.jsx'
import PartPayments from './pages/customer/PartPayments.jsx'
import CustomerAppointments from './pages/customer/Appointments.jsx'
import Profile from './pages/customer/Profile.jsx'
import Notifications from './pages/customer/Notifications.jsx'
import NewTicket from './pages/staff/NewTicket.jsx'
import RegisterCustomer from './pages/staff/RegisterCustomer.jsx'
import CustomerInquiry from './pages/staff/CustomerInquiry.jsx'
import RenewTicket from './pages/staff/RenewTicket.jsx'
import Redemption from './pages/staff/Redemption.jsx'
import PartPayment from './pages/staff/PartPayment.jsx'
import Tickets from './pages/staff/Tickets.jsx'
import Reminders from './pages/staff/Reminders.jsx'
import Appointments from './pages/staff/Appointments.jsx'
import Reports from './pages/staff/Reports.jsx'
import CustomerDashboard from './pages/customer/CustomerDashboard.jsx'
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login-as" element={<LoginAs />} />
        <Route path="/register" element={<Register />} />
        <Route path="/staff" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/staff/transactions/new" replace />} />
          
          {/* Transactions Routes */}
          <Route path="transactions/new" element={<NewTicket />} />
          <Route path="transactions/renewal" element={<RenewTicket />} />
          <Route path="transactions/redemption" element={<Redemption />} />
          <Route path="transactions/part-payment" element={<PartPayment />} />
          
          {/* Customers Routes */}
          <Route path="customers/register" element={<RegisterCustomer />} />
          <Route path="customers/inquiry" element={<CustomerInquiry />} />
          
          {/* Tickets Routes */}
          <Route path="tickets/auction" element={<Tickets />} />
          <Route path="tickets/expired" element={<Tickets />} />
          <Route path="tickets/inquiry" element={<Tickets />} />
          
          {/* Reminders Routes */}
          <Route path="reminders/status" element={<Reminders />} />
          
          {/* Appointments Routes */}
          <Route path="appointments/list" element={<Appointments />} />
          
          {/* Reports Routes */}
          <Route path="reports/monthly" element={<Reports />} />
          <Route path="reports/daily" element={<Reports />} />
        </Route>
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/receipts" element={<MyReceipts />} />
        <Route path="/customer/part-payments" element={<PartPayments />} />
        <Route path="/customer/appointments" element={<CustomerAppointments />} />
        <Route path="/customer/notifications" element={<Notifications />} />
        <Route path="/customer/profile" element={<Profile />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
