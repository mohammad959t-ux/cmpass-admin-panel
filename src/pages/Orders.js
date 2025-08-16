import React, { useEffect, useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, FormControl, InputLabel, Select, MenuItem, Box, TextField, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import API from '../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState({});
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualData, setManualData] = useState({ 
    userId: '', serviceId: '', quantity: 1, customPrice: '', expectedCompletion: '',
    clientName: '', clientPhone: '', description: ''
  });

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/recent');
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    let tempOrders = [...orders];
    if (statusFilter) tempOrders = tempOrders.filter(o => o.status === statusFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      tempOrders = tempOrders.filter(
        o => (o.userName && o.userName.toLowerCase().includes(term)) ||
             (o.serviceName && o.serviceName.toLowerCase().includes(term)) ||
             (o.clientName && o.clientName.toLowerCase().includes(term)) ||
             (o.clientPhone && o.clientPhone.includes(term))
      );
    }
    setFilteredOrders(tempOrders);
  }, [statusFilter, searchTerm, orders]);

  const getRowStyle = (order) => {
    const now = new Date();
    const expected = new Date(order.expectedCompletion);
    if (order.status === 'Completed') return { backgroundColor: '#d0f0c0' };
    if (order.status === 'Canceled') return { backgroundColor: '#f8d7da' };
    if (expected < now) return { backgroundColor: '#fce5cd' };
    if ((expected - now) / 1000 / 60 / 60 < 6) return { backgroundColor: '#fff3cd' };
    return {};
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setLoadingUpdate(prev => ({ ...prev, [orderId]: true }));
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setLoadingUpdate(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleManualSubmit = async () => {
    try {
      await API.post('/orders/manual', manualData);
      setManualDialogOpen(false);
      setManualData({ userId: '', serviceId: '', quantity: 1, customPrice: '', expectedCompletion: '', clientName: '', clientPhone: '', description: '' });
      fetchOrders();
    } catch (err) {
      console.error('Failed to create manual order:', err);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>Orders</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search by User, Service or Client"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Canceled">Canceled</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Currency</InputLabel>
          <Select value="USD" label="Currency" disabled>
            <MenuItem value="USD">USD</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => setManualDialogOpen(true)}>Add Manual Order</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>User / Client</TableCell>
              <TableCell>Service / Description</TableCell>
              <TableCell>Price (USD)</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount Paid</TableCell>
              <TableCell>Wallet Deduction</TableCell>
              <TableCell>Expected Completion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <TableRow key={order._id} sx={getRowStyle(order)}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.userName || order.clientName || 'Unknown'}</TableCell>
                  <TableCell>{order.serviceName || order.description || 'Unknown'}</TableCell>
                  <TableCell>${order.price}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={loadingUpdate[order._id]}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Canceled">Canceled</MenuItem>
                      </Select>
                    </FormControl>
                    {loadingUpdate[order._id] && <CircularProgress size={20} />}
                  </TableCell>
                  <TableCell>{order.amountPaid} USD</TableCell>
                  <TableCell>${order.walletDeduction}</TableCell>
                  <TableCell>{new Date(order.expectedCompletion).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">No orders found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Manual Order Dialog */}
      <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)}>
        <DialogTitle>Add Manual Order</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="User ID (optional)" value={manualData.userId} onChange={e => setManualData({...manualData, userId: e.target.value})} />
          <TextField label="Service ID (optional)" value={manualData.serviceId} onChange={e => setManualData({...manualData, serviceId: e.target.value})} />
          <TextField type="number" label="Quantity" value={manualData.quantity} onChange={e => setManualData({...manualData, quantity: Number(e.target.value)})} />
          <TextField type="number" label="Custom Price (optional)" value={manualData.customPrice} onChange={e => setManualData({...manualData, customPrice: Number(e.target.value)})} />
          <TextField type="datetime-local" label="Expected Completion (optional)" value={manualData.expectedCompletion} onChange={e => setManualData({...manualData, expectedCompletion: e.target.value})} InputLabelProps={{ shrink: true }} />
          <TextField label="Client Name (optional)" value={manualData.clientName} onChange={e => setManualData({...manualData, clientName: e.target.value})} />
          <TextField label="Client Phone (optional)" value={manualData.clientPhone} onChange={e => setManualData({...manualData, clientPhone: e.target.value})} />
          <TextField label="Description (optional)" value={manualData.description} onChange={e => setManualData({...manualData, description: e.target.value})} multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleManualSubmit}>Add Order</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Orders;
