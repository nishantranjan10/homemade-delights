import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Specials from './pages/Specials.jsx';
import Order from './pages/Order.jsx';
import OrderConfirm from './pages/OrderConfirm.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ManageMenu from './pages/admin/ManageMenu.jsx';
import ManageOrders from './pages/admin/ManageOrders.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/specials" element={<Specials />} />
        <Route path="/order" element={<Order />} />
        <Route path="/order/confirm" element={<OrderConfirm />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin login (public) */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* Admin protected area */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/menu" element={<ManageMenu />} />
        <Route path="/admin/orders" element={<ManageOrders />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
