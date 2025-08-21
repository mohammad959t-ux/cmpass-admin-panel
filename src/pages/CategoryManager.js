// src/pages/CategoryManager.js
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Pagination
} from '@mui/material';
import { Delete, Edit, AddPhotoAlternate } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import API from '../api/axios';

const PAGE_LIMIT = 20;

const CategoryManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', imageFile: null, previewUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  const fetchCategories = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await API.get('/api/category', {
        params: { page: pageNumber, limit: PAGE_LIMIT }
      });
      const data = res.data;
      setCategories(data);
      setTotalPages(Math.ceil(data.length / PAGE_LIMIT));
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Open Add/Edit modal
  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name, 
        imageFile: null, 
        previewUrl: category.imageUrl ? `https://compass-backend-87n1.onrender.com${category.imageUrl}` : '' 
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', imageFile: null, previewUrl: '' });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          previewUrl: URL.createObjectURL(file)
        }));
        enqueueSnackbar('Image selected successfully', { variant: 'success' });
      } else {
        setFormData(prev => ({ ...prev, imageFile: null, previewUrl: '' }));
        enqueueSnackbar('Image selection canceled', { variant: 'info' });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return enqueueSnackbar('Please enter a category name', { variant: 'warning' });

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.imageFile) data.append('image', formData.imageFile);

      if (editingCategory) {
        await API.put(`/api/category/${editingCategory._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Category updated successfully', { variant: 'success' });
      } else {
        await API.post('/api/category', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Category added successfully', { variant: 'success' });
      }
      fetchCategories(page);
      handleCloseModal();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to save category', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/api/category/${id}`);
      enqueueSnackbar('Category deleted successfully', { variant: 'success' });
      fetchCategories(page);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete category', { variant: 'error' });
    }
  };

  const handlePageChange = (event, value) => { fetchCategories(value); };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Category Management</Typography>
        <Button variant="contained" onClick={() => handleOpenModal()}>Add Category</Button>
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
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map(cat => (
                  <TableRow key={cat._id}>
                    <TableCell>
                      {cat.imageUrl ? (
                        <img
                          src={`https://compass-backend-87n1.onrender.com${cat.imageUrl}`}
                          alt={cat.name}
                          width={50} height={50}
                        />
                      ) : 'No Image'}
                    </TableCell>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenModal(cat)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(cat._id)}><Delete /></IconButton>
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

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Category Name"
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
            Upload Image
            <input type="file" hidden name="image" onChange={handleChange} />
          </Button>

          {formData.previewUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Image Preview:</Typography>
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
            {submitting ? <CircularProgress size={24} /> : editingCategory ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManager;
