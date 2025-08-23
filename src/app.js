import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

// استيراد AppThemeProvider من ملف السياق
import { AppThemeProvider } from './contexts/ThemeContext';

// صفحات Admin Panel
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Services from './pages/Services';
import Projects from './pages/Projects'; // <-- استيراد Projects
import Orders from './pages/Orders';
import Banners from './pages/Banners';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Expenses from './pages/Expenses';
import CategoryManager from './pages/CategoryManager';
import Receipts from './pages/Receipts';
import ClientsManager from './pages/ClientsManager';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

const App = () => {
  return (
    <AppThemeProvider>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} /> {/* <-- إضافة Projects */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/categories" element={<CategoryManager />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/clients" element={<ClientsManager />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppThemeProvider>
  );
};

export default App;
