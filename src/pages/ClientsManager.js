// src/pages/ClientsManager.js
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Pagination
} from '@mui/material';
import { Delete, Edit, AddPhotoAlternate } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import API from '../api/axios'; // Assumed API instance with authentication

const PAGE_LIMIT = 20;

const ClientsManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: '', logoFile: null, previewUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch clients from the backend
  const fetchClients = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await API.get('/api/clients'); // Changed API endpoint
      const data = res.data.clients; // Access the clients array from the response
      setClients(data);
      // NOTE: Pagination logic for a small dataset
      setTotalPages(Math.ceil(data.length / PAGE_LIMIT));
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to fetch clients', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  // Open Add/Edit modal
  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({ 
        name: client.name, 
        logoFile: null, 
        previewUrl: client.logoUrl ? `https://compass-backend-87n1.onrender.com${client.logoUrl}` : '' 
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', logoFile: null, previewUrl: '' });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({
          ...prev,
          logoFile: file,
          previewUrl: URL.createObjectURL(file)
        }));
        enqueueSnackbar('Logo selected successfully', { variant: 'success' });
      } else {
        setFormData(prev => ({ ...prev, logoFile: null, previewUrl: '' }));
        enqueueSnackbar('Logo selection canceled', { variant: 'info' });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return enqueueSnackbar('Please enter a client name', { variant: 'warning' });
    // For new clients, a logo is required
    if (!editingClient && !formData.logoFile) {
        return enqueueSnackbar('Please select a logo for the new client', { variant: 'warning' });
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.logoFile) data.append('logo', formData.logoFile);

      if (editingClient) {
        await API.put(`/api/clients/${editingClient.id}`, data, { // Changed endpoint and ID field
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Client updated successfully', { variant: 'success' });
      } else {
        await API.post('/api/clients', data, { // Changed endpoint
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Client added successfully', { variant: 'success' });
      }
      fetchClients(page);
      handleCloseModal();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to save client', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await API.delete(`/api/clients/${id}`); // Changed endpoint
      enqueueSnackbar('Client deleted successfully', { variant: 'success' });
      fetchClients(page);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete client', { variant: 'error' });
    }
  };

  const handlePageChange = (event, value) => { fetchClients(value); };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clients Management</Typography>
        <Button variant="contained" onClick={() => handleOpenModal()}>Add Client</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Logo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell>
                      {client.logoUrl ? (
                        <img
                          src={`https://compass-backend-87n1.onrender.com${client.logoUrl}`}
                          alt={client.name}
                          width={50} height={50}
                        />
                      ) : 'No Logo'}
                    </TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenModal(client)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(client.id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            {/* Pagination is kept for structural similarity, but its logic might change with a real backend */}
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
          </Box>
        </>
      )}

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{editingClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Client Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
          <Button
            variant="contained"
            component="label"
            startIcon={<AddPhotoAlternate />}
            sx={{ mt: 2 }}
          >
            Upload Logo
            <input type="file" hidden name="logo" onChange={handleChange} />
          </Button>

          {formData.previewUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Logo Preview:</Typography>
              <img
                src={formData.previewUrl}
                alt="Preview"
                style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 5, borderRadius: 4 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : editingClient ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsManager;