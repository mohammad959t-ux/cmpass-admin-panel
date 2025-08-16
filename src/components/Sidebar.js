import React, { useContext } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Switch } from '@mui/material';
import { 
  Dashboard, 
  People, 
  Build, 
  ShoppingCart, 
  Image, 
  BarChart, 
  Brightness4, 
  Brightness7,
  AttachMoney // أيقونة جديدة للمصاريف
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext'; // استيراد السياق

// استيراد الشعارات من مجلد assets
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';

// دالة لتغيير الشعار بناءً على الوضع
const getLogo = (mode) => {
  return mode === 'dark' ? logoDark : logoLight;
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // استخدام useContext للحصول على الوضع الحالي ووظيفة التبديل من السياق
  const { mode, toggleMode } = useContext(ThemeContext);

  // المصفوفة المحدثة مع "Expenses"
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Services', icon: <Build />, path: '/services' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Expenses', icon: <AttachMoney />, path: '/expenses' },
    { text: 'Banners', icon: <Image />, path: '/banners' },
    { text: 'Analytics', icon: <BarChart />, path: '/analytics' },
  ];

  // لون ثابت للأيقونات في الوضع الداكن
  const iconColorDark = '#43C6E8'; // تم تغيير اللون إلى بداية التدرج

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
      {/* قسم الشعار */}
      <Box sx={{ p: 4, textAlign: 'center' }}> {/* تم تعديل قيمة p (padding) لزيادة المسافة */}
        <img 
          src={getLogo(mode)} 
          alt="Admin Panel Logo" 
          style={{ width: '150px', height: 'auto' }} 
        />
      </Box>

      {/* قائمة عناصر القائمة */}
      <List>
        {menuItems.map(item => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            {/* تطبيق اللون الثابت على الأيقونة في الوضع الداكن */}
            <ListItemIcon sx={{ color: mode === 'dark' ? iconColorDark : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: mode === 'dark' ? '#fff' : 'inherit' }} />
          </ListItemButton>
        ))}
      </List>

      {/* زر التبديل بين الوضع المظلم والفاتح */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Brightness7 color="action" />
        <Switch checked={mode === 'dark'} onChange={toggleMode} />
        <Brightness4 color="action" />
      </Box>
    </Box>
  );
};

export default Sidebar;
