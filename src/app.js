import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

// استيراد AppThemeProvider من ملف السياق
import { AppThemeProvider } from './contexts/ThemeContext';

// صفحات Admin Panel
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Services from './pages/Services';
import Orders from './pages/Orders';
import Banners from './pages/Banners';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Expenses from './pages/Expenses';
import CategoryManager from './pages/CategoryManager';
import Receipts from './pages/Receipts';
import ClientsManager from './pages/ClientsManager'; // <--- استيراد صفحة العملاء

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

const App = () => {
  return (
    // تغليف التطبيق بالكامل بـ AppThemeProvider
    <AppThemeProvider>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* حماية كل المسارات */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/services" element={<Services />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/categories" element={<CategoryManager />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/clients" element={<ClientsManager />} /> {/* <--- إضافة مسار العملاء */}
          </Route>
        </Route>

        {/* إعادة التوجيه للمسارات غير المعروفة */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppThemeProvider>
  );
};

export default App;
