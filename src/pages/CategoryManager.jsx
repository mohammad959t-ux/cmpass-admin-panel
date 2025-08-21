import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, TextField, IconButton } from '@mui/material';
import { Delete, Edit, AddPhotoAlternate } from '@mui/icons-material';
import axios from 'axios';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/category');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) return alert('أدخل اسم التصنيف');
    const formData = new FormData();
    formData.append('name', newCategoryName);
    if (newImage) formData.append('image', newImage);

    try {
      await axios.post('/api/category', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewCategoryName('');
      setNewImage(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('هل تريد حذف هذا التصنيف؟')) return;
    try {
      await axios.delete(`/api/category/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>إدارة التصنيفات</Typography>

      {/* إضافة تصنيف جديد */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
        <TextField 
          label="اسم التصنيف" 
          value={newCategoryName} 
          onChange={e => setNewCategoryName(e.target.value)} 
        />
        <Button
          variant="contained"
          component="label"
          startIcon={<AddPhotoAlternate />}
        >
          رفع صورة
          <input
            type="file"
            hidden
            onChange={e => setNewImage(e.target.files[0])}
          />
        </Button>
        <Button variant="contained" color="primary" onClick={handleAddCategory}>
          إضافة
        </Button>
      </Box>

      {/* عرض التصنيفات */}
      <Grid container spacing={3}>
        {categories.map(cat => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat._id}>
            <Card>
              {cat.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={cat.imageUrl}
                  alt={cat.name}
                />
              )}
              <CardContent>
                <Typography variant="h6">{cat.name}</Typography>
              </CardContent>
              <CardActions>
                <IconButton color="error" onClick={() => handleDeleteCategory(cat._id)}>
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryManager;
