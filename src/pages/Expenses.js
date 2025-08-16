import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Box, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import API from "../api/axios";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    date: ""
  });

  // Fetch expenses from the API
  const fetchExpenses = async () => {
    try {
      const { data } = await API.get("/expenses");
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Open the add/edit modal
  const handleOpen = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        type: expense.type,
        amount: expense.amount,
        description: expense.description,
        date: expense.date.split("T")[0], // to adjust the date input
      });
    } else {
      setEditingExpense(null);
      setFormData({ type: "", amount: "", description: "", date: "" });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Handle form data changes
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Add/edit an expense
  const handleSubmit = async () => {
    try {
      if (editingExpense) {
        await API.put(`/expenses/${editingExpense._id}`, formData);
      } else {
        await API.post("/expenses", formData);
      }
      fetchExpenses();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete an expense
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await API.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Manage Expenses
      </Typography>

      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add Expense
      </Button>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((exp) => (
              <TableRow key={exp._id}>
                <TableCell>{exp.type}</TableCell>
                <TableCell>{exp.amount}</TableCell>
                <TableCell>{exp.description}</TableCell>
                <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(exp)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(exp._id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for adding and editing */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            fullWidth
            margin="dense"
          >
            <MenuItem value="Ads">Ads</MenuItem>
            <MenuItem value="Shipping">Shipping</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;