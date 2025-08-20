import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  CircularProgress,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchTotalIncome } from './analyticsService';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedExpenseType, setSelectedExpenseType] = useState('');
  const [currencies, setCurrencies] = useState(['USD', 'IQD', 'SYP']);
  const [expenseTypes, setExpenseTypes] = useState(['Ads', 'Shipping', 'Other']);

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const statsData = await fetchTotalIncome(filters);
      setStats(statsData);
      // setCurrencies(statsData.availableCurrencies);
    } catch (err) {
      console.error(err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({
      startDate,
      endDate,
      currency: selectedCurrency,
      expenseType: selectedExpenseType
    });
  }, [startDate, endDate, selectedCurrency, selectedExpenseType]);

  const currencySymbol = (currency) => {
    switch (currency) {
      case 'IQD':
        return 'د.ع';
      case 'SYP':
        return 'ل.س';
      case 'USD':
      default:
        return '$';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const lineData = stats.weeklyStats?.map((w, index) => ({
    name: `Week ${index + 1}`,
    Income: parseFloat(w.income),
    Profit: parseFloat(w.profit),
    Expenses: parseFloat(w.expenses)
  })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      {/* Filter controls */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={selectedCurrency}
              label="Currency"
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency} value={currency}>{currency}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Expense Type</InputLabel>
            <Select
              value={selectedExpenseType}
              label="Expense Type"
              onChange={(e) => setSelectedExpenseType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {expenseTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Income" value={`${currencySymbol(selectedCurrency)}${stats.totalIncome}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Expenses" value={`${currencySymbol(selectedCurrency)}${stats.totalExpenses}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Net Profit" value={`${currencySymbol(selectedCurrency)}${stats.netProfit}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed Orders" value={stats.numberOfCompletedOrders} />
        </Grid>
      </Grid>

      {/* Line Chart */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Income, Profit, and Expenses (Weekly)</Typography>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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

      {/* Recent Orders */}
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
              {stats?.orders?.length > 0 ? (
                stats.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.serviceName}</TableCell>
                    <TableCell>{currencySymbol(selectedCurrency)}{order.price}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{currencySymbol(selectedCurrency)}{order.expenses}</TableCell>
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

      {/* Logout button at the bottom */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
