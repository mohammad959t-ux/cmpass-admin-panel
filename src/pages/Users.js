// src/pages/Users.js
import React, { useEffect, useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import API from '../api/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [historyData, setHistoryData] = useState([]);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  
  // حالات جديدة للفلترة
  const [searchBy, setSearchBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminFilter, setIsAdminFilter] = useState(null); // null, true, or false

  const fetchUsers = async () => {
    try {
      // FIX: إضافة '/api' للمسار
      const res = await API.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      // FIX: إضافة '/api' للمسار
      await API.delete(`/api/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTopUp = (user) => {
    setSelectedUser(user);
    setTopUpAmount(0);
    setTopUpOpen(true);
  };
  const handleCloseTopUp = () => setTopUpOpen(false);

  const handleSubmitTopUp = async () => {
    try {
      // FIX: إضافة '/api' للمسار
      await API.post('/api/users/add-balance', { userId: selectedUser._id, amount: Number(topUpAmount) });
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, balance: u.balance + Number(topUpAmount) } : u));
      handleCloseTopUp();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenHistory = (user) => {
    setSelectedUser(user);
    setHistoryData(user.transactions || []);
    setHistoryOpen(true);
  };
  const handleCloseHistory = () => setHistoryOpen(false);

  const handleUpdateUser = async () => {
    try {
      const payload = {};
      if (editEmail) payload.email = editEmail;
      if (editPassword) payload.password = editPassword;

      // FIX: إضافة '/api' للمسار
      const res = await API.put(`/api/users/${selectedUser._id}`, payload);
      setUsers(users.map(u => u._id === selectedUser._id ? res.data : u));
      setEditEmail('');
      setEditPassword('');
      handleCloseHistory();
    } catch (err) {
      console.error(err);
    }
  };
  
  // منطق الفلترة المتقدم
  const filteredUsers = users.filter(user => {
    if (searchBy === 'name') {
      return user.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchBy === 'email') {
      return user.email.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchBy === 'id') {
      return user._id.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchBy === 'isAdmin') {
      if (isAdminFilter === null) return true;
      return user.isAdmin === isAdminFilter;
    }
    return true; // في حالة عدم وجود فلتر
  });

  return (
    <>
      <Typography variant="h4" gutterBottom>Users</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchBy}
            label="Search By"
            onChange={(e) => {
              setSearchBy(e.target.value);
              setSearchQuery(''); // إعادة تعيين قيمة البحث عند تغيير الفلتر
              setIsAdminFilter(null);
            }}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="isAdmin">Admin Status</MenuItem>
          </Select>
        </FormControl>

        {searchBy !== 'isAdmin' ? (
          <TextField
            fullWidth
            label={`Search by ${searchBy}`}
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        ) : (
          <FormControl fullWidth>
            <InputLabel>Admin Status</InputLabel>
            <Select
              value={isAdminFilter === null ? '' : isAdminFilter}
              label="Admin Status"
              onChange={(e) => setIsAdminFilter(e.target.value === 'true')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user._id}>
                <TableCell>{user._id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                <TableCell>${user.balance}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => handleOpenTopUp(user)} sx={{ mr: 1 }}>Top Up</Button>
                  <Button variant="outlined" size="small" onClick={() => handleOpenHistory(user)} sx={{ mr: 1 }}>Edit/History</Button>
                  <IconButton color="error" onClick={() => handleDelete(user._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* مودال شحن الرصيد */}
      <Dialog open={topUpOpen} onClose={handleCloseTopUp}>
        <DialogTitle>Top Up Balance</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount (USD)"
            type="number"
            fullWidth
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTopUp}>Cancel</Button>
          <Button onClick={handleSubmitTopUp}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* مودال تعديل البريد وكلمة السر + عرض سجل المعاملات */}
      <Dialog open={historyOpen} onClose={handleCloseHistory} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User / Transaction History</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>ID: {selectedUser?._id}</Typography>
          <TextField
            margin="dense"
            label="New Email"
            type="email"
            fullWidth
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>Transaction History:</Typography>
          {historyData.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount (USD)</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.map((t, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{t.type}</TableCell>
                    <TableCell>{t.amountUSD}</TableCell>
                    <TableCell>{t.note}</TableCell>
                    <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No transactions found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory}>Close</Button>
          <Button onClick={handleUpdateUser}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Users;
