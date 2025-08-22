import React, { useContext } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Switch, Button } from '@mui/material';
import { 
  Dashboard, 
  People, 
  Build, 
  ShoppingCart, 
  Image, 
  BarChart, 
  Brightness4, 
  Brightness7,
  AttachMoney,
  ReceiptLong,
  Logout,
  Group
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';

import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';

const getLogo = (mode) => (mode === 'dark' ? logoDark : logoLight);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useContext(ThemeContext);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Services', icon: <Build />, path: '/services' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Expenses', icon: <AttachMoney />, path: '/expenses' },
    { text: 'Banners', icon: <Image />, path: '/banners' },
    { text: 'Analytics', icon: <BarChart />, path: '/analytics' },
    { text: 'Categories', icon: <Image />, path: '/categories' }, 
    { text: 'Receipts', icon: <ReceiptLong />, path: '/receipts' },
    { text: 'Clients', icon: <Group />, path: '/clients' }, // <--- إضافة مسار العملاء
  ];

  const iconColorDark = '#43C6E8';

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        overflowY: 'auto',
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <img 
          src={getLogo(mode)} 
          alt="Admin Panel Logo" 
          style={{ width: '150px', height: 'auto' }} 
        />
      </Box>

      <List>
        {menuItems.map(item => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon sx={{ color: mode === 'dark' ? iconColorDark : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: mode === 'dark' ? '#fff' : 'inherit' }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Brightness7 color="action" />
        <Switch checked={mode === 'dark'} onChange={toggleMode} />
        <Brightness4 color="action" />
      </Box>

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
          fullWidth
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;