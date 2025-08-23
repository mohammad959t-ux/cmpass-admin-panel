// src/pages/ClientsManager.js
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  CircularProgress, Pagination
} from '@mui/material';
import { Delete, Edit, AddPhotoAlternate } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import API from '../api/axios';

const PAGE_LIMIT = 20;

const ClientsManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [newClients, setNewClients] = useState([]); // [{file, name, previewUrl, status}]
  const [submitting, setSubmitting] = useState(false);

  // Fetch clients
  const fetchClients = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await API.get('/api/clients');
      const data = res.data.clients || [];
      setClients(data);
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

  // Open modal
  const handleOpenModal = () => {
    setNewClients([]);
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);

  // Handle file selection (multiple logos)
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(f => ({
      file: f,
      name: '',
      previewUrl: URL.createObjectURL(f),
      status: 'pending' // pending, success, failed
    }));
    setNewClients(prev => [...prev, ...newFiles]);
    enqueueSnackbar(`${files.length} file(s) selected`, { variant: 'info' });
  };

  // Handle name input for each client
  const handleNameChange = (index, value) => {
    setNewClients(prev => {
      const updated = [...prev];
      updated[index].name = value;
      return updated;
    });
  };

  // Remove a client before upload
  const handleRemoveClient = (index) => {
    setNewClients(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Upload all clients
  const handleSubmit = async () => {
    let hasEmptyName = newClients.some(c => !c.name.trim());
    if (hasEmptyName) {
      return enqueueSnackbar('Please fill in all client names', { variant: 'warning' });
    }
    if (newClients.length === 0) return;

    setSubmitting(true);

    const updatedClients = [...newClients];
    for (let i = 0; i < newClients.length; i++) {
      try {
        const data = new FormData();
        data.append('name', newClients[i].name);
        data.append('logo', newClients[i].file);

        await API.post('/api/clients', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        updatedClients[i].status = 'success';
      } catch (err) {
        console.error(err);
        updatedClients[i].status = 'failed';
      }
      setNewClients([...updatedClients]); // update UI after each upload
    }

    enqueueSnackbar('Upload completed', { variant: 'success' });
    fetchClients(page);
    setSubmitting(false);
    // Close modal if all successful
    if (updatedClients.every(c => c.status === 'success')) handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await API.delete(`/api/clients/${id}`);
      enqueueSnackbar('Client deleted successfully', { variant: 'success' });
      fetchClients(page);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete client', { variant: 'error' });
    }
  };

  const handlePageChange = (event, value) => fetchClients(value);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clients Management</Typography>
        <Button variant="contained" onClick={handleOpenModal}>Add Clients</Button>
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
                  <TableRow key={client._id}>
                    <TableCell>
                      {client.logoUrl ? (
                        <img src={client.logoUrl} alt={client.name} width={50} height={50} style={{ objectFit: 'cover' }} />
                      ) : 'No Logo'}
                    </TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDelete(client._id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
          </Box>
        </>
      )}

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Add Multiple Clients</DialogTitle>
        <DialogContent>
          <Button variant="contained" component="label" startIcon={<AddPhotoAlternate />}>
            Select Logos
            <input type="file" hidden multiple accept="image/*" onChange={handleFilesChange} />
          </Button>

          <Box sx={{ mt: 2 }}>
            {newClients.map((client, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <img src={client.previewUrl} alt="preview" width={60} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} />
                <TextField
                  label="Client Name"
                  value={client.name}
                  onChange={e => handleNameChange(idx, e.target.value)}
                  fullWidth
                  size="small"
                />
                <Typography variant="body2" sx={{ minWidth: 60 }}>
                  {client.status === 'success' && '✅'}
                  {client.status === 'failed' && '❌'}
                </Typography>
                <Button color="error" onClick={() => handleRemoveClient(idx)}>Remove</Button>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || newClients.length === 0}>
            {submitting ? <CircularProgress size={24} /> : 'Add Clients'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsManager;
