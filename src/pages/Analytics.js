import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchTotalIncome } from './analyticsService';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState(['USD', 'IQD', 'SYP']);
  const [services, setServices] = useState([]); // يمكن جلبها من API
  const [categories, setCategories] = useState([]); // يمكن جلبها من API

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const statsData = await fetchTotalIncome(filters);
      setStats(statsData);
    } catch (error) {
      console.error(error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({
      startDate,
      endDate,
      serviceName,
      mainCategory,
      currency: selectedCurrency
    });
  }, [startDate, endDate, serviceName, mainCategory, selectedCurrency]);

  const currencySymbol = (currency) => {
    switch (currency) {
      case 'IQD': return 'د.ع';
      case 'SYP': return 'ل.س';
      default: return '$';
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!stats) return <Typography>Failed to load analytics. Please check your network or try again later.</Typography>;

  const lineData = stats.weeklyStats?.map((w, index) => ({
    name: `Week ${index + 1}`,
    Income: parseFloat(w.income),
    Profit: parseFloat(w.profit),
    Expenses: parseFloat(w.expenses)
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Analytics</Typography>
      
      {/* Filter controls */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Service</InputLabel>
            <Select
              value={serviceName}
              label="Service"
              onChange={(e) => setServiceName(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {services.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={mainCategory}
              label="Category"
              onChange={(e) => setMainCategory(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={selectedCurrency}
              label="Currency"
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {currencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Total Income', value: stats.totalIncome },
          { label: 'Total Profit', value: stats.totalProfit },
          { label: 'Total Expenses', value: stats.totalExpenses },
          { label: 'Net Profit', value: stats.netProfit, color: 'secondary' },
          { label: 'Completed Orders', value: stats.numberOfCompletedOrders }
        ].map((card, idx) => (
          <Grid key={idx} item xs={12} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{card.label}</Typography>
              <Typography variant="h5" color={card.color || 'inherit'}>
                {card.label.includes('Orders') ? card.value : `${currencySymbol(selectedCurrency)}${card.value}`}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Weekly Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Income, Profit, and Expenses (Weekly)</Typography>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${currencySymbol(selectedCurrency)}${value}`} />
              <Legend />
              <Line type="monotone" dataKey="Income" stroke="#1976d2" />
              <Line type="monotone" dataKey="Profit" stroke="#388e3c" />
              <Line type="monotone" dataKey="Expenses" stroke="#d32f2f" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography>No weekly stats for the selected period.</Typography>
        )}
      </Paper>

      {/* Recent Orders Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Orders</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service Name</TableCell>
                <TableCell>Price ({selectedCurrency})</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Expenses ({selectedCurrency})</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Creation Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.orders.length > 0 ? (
                stats.orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.serviceName}</TableCell>
                    <TableCell>{currencySymbol(selectedCurrency)}{order.price}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{currencySymbol(selectedCurrency)}{parseFloat(order.orderExpenses).toFixed(2)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No recent orders.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Analytics;
