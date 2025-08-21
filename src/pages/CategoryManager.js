// src/pages/Category.js
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
  const [formData, setFormData] = useState({ name: '', imageFile: null });

  // تحميل التصنيفات
  const fetchCategories = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await API.get('/category', {
        params: { page: pageNumber, limit: PAGE_LIMIT }
      });
      const data = res.data; // افترضنا backend يرسل مصفوفة
      setCategories(data);
      setTotalPages(Math.ceil(data.length / PAGE_LIMIT));
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('فشل في جلب التصنيفات', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // فتح نافذة إضافة/تعديل
  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, imageFile: null });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', imageFile: null });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') setFormData(prev => ({ ...prev, imageFile: files[0] }));
    else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) return enqueueSnackbar('أدخل اسم التصنيف', { variant: 'warning' });

    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.imageFile) data.append('image', formData.imageFile);

      if (editingCategory) {
        await API.put(`/category/${editingCategory._id}`, data);
        enqueueSnackbar('تم تعديل التصنيف بنجاح', { variant: 'success' });
      } else {
        await API.post('/category', data);
        enqueueSnackbar('تم إضافة التصنيف بنجاح', { variant: 'success' });
      }
      fetchCategories(page);
      handleCloseModal();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('فشل في حفظ التصنيف', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا التصنيف؟')) return;
    try {
      await API.delete(`/category/${id}`);
      enqueueSnackbar('تم حذف التصنيف', { variant: 'success' });
      fetchCategories(page);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('فشل في حذف التصنيف', { variant: 'error' });
    }
  };

  const handlePageChange = (event, value) => { fetchCategories(value); };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">إدارة التصنيفات</Typography>
        <Button variant="contained" onClick={() => handleOpenModal()}>إضافة تصنيف</Button>
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
                  <TableCell>الصورة</TableCell>
                  <TableCell>الاسم</TableCell>
                  <TableCell>الإجراءات</TableCell>
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
        <DialogTitle>{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="اسم التصنيف"
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
            رفع صورة
            <input type="file" hidden name="imageFile" onChange={handleChange} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>إلغاء</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingCategory ? 'تعديل' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManager;
