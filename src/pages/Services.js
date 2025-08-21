// src/pages/Services.js
import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, Select, MenuItem, FormControl, InputLabel,
  Pagination, CircularProgress
} from '@mui/material';
import { Delete, Edit, Add, Refresh, DeleteForever } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import API from '../api/axios';

const PAGE_LIMIT = 50;

const Services = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [services, setServices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mainCategoryFilter, setMainCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', mainCategory: '', subCategory: '',
    apiServiceId: '', price: '', costPrice: '', stock: '', imageFile: null
  });

  const fetchServices = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNumber,
        limit: PAGE_LIMIT,
        search: searchTerm,
        mainCategory: mainCategoryFilter,
        subCategory: subCategoryFilter,
      };
      const res = await API.get('/api/services', { params });
      setServices(res.data.items);
      setTotalPages(res.data.pages);
      setPage(pageNumber);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to fetch services', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(1);
  }, [searchTerm, mainCategoryFilter, subCategoryFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await API.delete(`/api/services/${id}`);
      enqueueSnackbar('Service deleted successfully', { variant: 'success' });
      fetchServices(page);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delete service', { variant: 'error' });
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL services?')) return;
    try {
      setSyncing(true);
      await API.delete('/api/services'); // ✅ المسار الصحيح
      setServices([]);
      setTotalPages(1);
      setPage(1);
      enqueueSnackbar('All services deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delete all services', { variant: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncServices = async () => {
    try {
      setSyncing(true);
      await API.post('/api/services/sync');
      enqueueSnackbar('Services synced successfully', { variant: 'success' });
      fetchServices(1);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to sync services', { variant: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name || '',
        description: service.description || '',
        mainCategory: service.mainCategory || '',
        subCategory: service.subCategory || '',
        apiServiceId: service.apiServiceId || '',
        price: service.price || '',
        costPrice: service.costPrice || '',
        stock: service.stock || '',
        imageFile: null,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '', description: '', mainCategory: '', subCategory: '',
        apiServiceId: '', price: '', costPrice: '', stock: '', imageFile: null
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setFormData(prev => ({ ...prev, imageFile: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('mainCategory', formData.mainCategory);
      data.append('subCategory', formData.subCategory);
      if (formData.apiServiceId) data.append('apiServiceId', formData.apiServiceId);
      if (formData.price !== '') data.append('price', formData.price);
      if (formData.costPrice !== '') data.append('costPrice', formData.costPrice);
      if (formData.stock !== '') data.append('stock', formData.stock);
      if (formData.imageFile) data.append('image', formData.imageFile);

      if (editingService) {
        await API.put(`/api/services/${editingService._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Service updated successfully', { variant: 'success' });
      } else {
        await API.post('/api/services', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Service added successfully', { variant: 'success' });
      }

      fetchServices(page);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save service. Please check the fields.', error);
      enqueueSnackbar('Failed to save service', { variant: 'error' });
    }
  };

  const handlePageChange = (event, value) => {
    fetchServices(value);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Services</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="error" startIcon={<DeleteForever />} onClick={handleDeleteAll} disabled={syncing}>
            Delete All
          </Button>
          <Button variant="contained" color="secondary" startIcon={<Refresh />} onClick={handleSyncServices} disabled={syncing}>
            Sync Services
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
            Add Service
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Main Category</InputLabel>
          <Select
            value={mainCategoryFilter}
            onChange={e => setMainCategoryFilter(e.target.value)}
            label="Main Category"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="زيادة التفاعل">زيادة التفاعل</MenuItem>
            <MenuItem value="خدمات رقمية">خدمات رقمية</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sub Category</InputLabel>
          <Select
            value={subCategoryFilter}
            onChange={e => setSubCategoryFilter(e.target.value)}
            label="Sub Category"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="انستغرام">انستغرام</MenuItem>
            <MenuItem value="فيسبوك">فيسبوك</MenuItem>
            <MenuItem value="يوتيوب">يوتيوب</MenuItem>
            <MenuItem value="تويتر">تويتر</MenuItem>
            <MenuItem value="تيك توك">تيك توك</MenuItem>
            <MenuItem value="لينكدإن">لينكدإن</MenuItem>
            <MenuItem value="تيليجرام">تيليجرام</MenuItem>
            <MenuItem value="سبوتيفاي">سبوتيفاي</MenuItem>
            <MenuItem value="ساوندكلاود">ساوندكلاود</MenuItem>
            <MenuItem value="زيارات مواقع">زيارات مواقع</MenuItem>
            <MenuItem value="أخرى">أخرى</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {(loading || syncing) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Main Category</TableCell>
                <TableCell>Sub Category</TableCell>
                <TableCell>API Service ID</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Cost Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map(service => (
                <TableRow key={service._id}>
                  <TableCell>
                    {service.imageUrl ? (
                      <img loading="lazy" src={service.imageUrl} alt={service.name} width={50} height={50} />
                    ) : 'No Image'}
                  </TableCell>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>{service.mainCategory || '-'}</TableCell>
                  <TableCell>{service.subCategory || '-'}</TableCell>
                  <TableCell>{service.apiServiceId || '-'}</TableCell>
                  <TableCell>{service.price != null ? `$${service.price}` : '-'}</TableCell>
                  <TableCell>{service.costPrice != null ? `$${service.costPrice}` : '-'}</TableCell>
                  <TableCell>{service.stock != null ? service.stock : '-'}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenModal(service)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(service._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" name="name" fullWidth value={formData.name} onChange={handleChange} />
          <TextField margin="dense" label="Description" name="description" fullWidth value={formData.description} onChange={handleChange} />
          <TextField margin="dense" label="Main Category" name="mainCategory" fullWidth value={formData.mainCategory} onChange={handleChange} />
          <TextField margin="dense" label="Sub Category" name="subCategory" fullWidth value={formData.subCategory} onChange={handleChange} />
          <TextField margin="dense" label="API Service ID (optional)" name="apiServiceId" fullWidth value={formData.apiServiceId} onChange={handleChange} />
          <TextField margin="dense" label="Price (optional)" name="price" type="number" fullWidth value={formData.price} onChange={handleChange} />
          <TextField margin="dense" label="Cost Price (optional)" name="costPrice" type="number" fullWidth value={formData.costPrice} onChange={handleChange} />
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
