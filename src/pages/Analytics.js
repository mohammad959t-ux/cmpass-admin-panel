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
import API from '../api/axios'; // This is no longer needed for recent orders

const Analytics = () => {
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
      // You can also dynamically fetch the list of currencies here if needed
      // setCurrencies(statsData.availableCurrencies);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
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

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Income</Typography>
            <Typography variant="h5">{currencySymbol(selectedCurrency)}{stats.totalIncome}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Profit</Typography>
            <Typography variant="h5">{currencySymbol(selectedCurrency)}{stats.totalProfit}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Expenses</Typography>
            <Typography variant="h5">{currencySymbol(selectedCurrency)}{stats.totalExpenses}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Net Profit</Typography>
            <Typography variant="h5" color="secondary">{currencySymbol(selectedCurrency)}{stats.netProfit}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Completed Orders</Typography>
            <Typography variant="h5">{stats.numberOfCompletedOrders}</Typography>
          </Paper>
        </Grid>
      </Grid>

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
                stats.orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.serviceName}</TableCell>
                    <TableCell>{currencySymbol(selectedCurrency)}{order.price}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{currencySymbol(selectedCurrency)}{order.expenses.toFixed(2)}</TableCell>
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
