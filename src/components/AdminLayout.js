import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Box } from '@mui/material';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* ✅ الـ Sidebar يبقى ثابت */}
      <Sidebar />

      {/* ✅ المحتوى يبتدي بعد الـ Sidebar */}
      <Box 
        component="main" 
        sx={{ flexGrow: 1, p: 3, ml: '240px' }} 
      >
        <Outlet /> {/* هنا تنعرض الصفحات الداخلية */}
      </Box>
    </Box>
  );
};

export default AdminLayout;
