// src/pages/Services.js
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import API from '../api/axios';

const Services = () => {
  const [services, setServices] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    apiServiceId: '',
    price: '',
    stock: '',
    imageFile: null,
  });

  // جلب الخدمات
  const fetchServices = async () => {
    try {
      // FIX: إضافة '/api' للمسار
      const res = await API.get('/api/services');
      setServices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // حذف خدمة
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      // FIX: إضافة '/api' للمسار
      await API.delete(`/api/services/${id}`);
      setServices(services.filter((s) => s._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // فتح/إغلاق مودال
  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        apiServiceId: service.apiServiceId,
        price: service.price || '',
        stock: service.stock || '',
        imageFile: null,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        apiServiceId: '',
        price: '',
        stock: '',
        imageFile: null,
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setFormData((prev) => ({ ...prev, imageFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // إضافة/تعديل الخدمة
  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('apiServiceId', formData.apiServiceId);
      if (formData.price !== '') data.append('price', formData.price);
      if (formData.stock !== '') data.append('stock', formData.stock);
      if (formData.imageFile) data.append('image', formData.imageFile);

      let res;
      if (editingService) {
        // FIX: إضافة '/api' للمسار
        res = await API.put(`/api/services/${editingService._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setServices(services.map((s) => (s._id === editingService._id ? res.data : s)));
      } else {
        // FIX: إضافة '/api' للمسار
        res = await API.post('/api/services', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setServices([...services, res.data]);
      }

      handleCloseModal();
    } catch (error) {
      console.error(error);
      // NOTE: تم استبدال alert بـ console.error لتحسين تجربة المستخدم
      console.error('Failed to save service. Please check the fields.');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Services</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
          Add Service
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>API Service ID</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service._id}>
                <TableCell>{service.imageUrl ? <img src={service.imageUrl} alt={service.name} width={50} height={50} /> : 'No Image'}</TableCell>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.apiServiceId}</TableCell>
                <TableCell>{service.price !== undefined ? `$${service.price}` : ''}</TableCell>
                <TableCell>{service.stock !== undefined ? service.stock : ''}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenModal(service)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(service._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" name="name" fullWidth value={formData.name} onChange={handleChange} />
          <TextField margin="dense" label="Description" name="description" fullWidth value={formData.description} onChange={handleChange} />
          <TextField margin="dense" label="Category" name="category" fullWidth value={formData.category} onChange={handleChange} />
          <TextField margin="dense" label="API Service ID" name="apiServiceId" fullWidth value={formData.apiServiceId} onChange={handleChange} />
          <TextField margin="dense" label="Price (optional)" name="price" type="number" fullWidth value={formData.price} onChange={handleChange} />
          <TextField margin="dense" label="Stock (optional)" name="stock" type="number" fullWidth value={formData.stock} onChange={handleChange} />
          <input type="file" name="imageFile" accept="image/*" onChange={handleChange} style={{ marginTop: '15px' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingService ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Services;
