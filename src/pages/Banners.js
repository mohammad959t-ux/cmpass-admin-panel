import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { Delete, Edit, ToggleOn, ToggleOff } from '@mui/icons-material';
import API from '../api/axios';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentBanner, setCurrentBanner] = useState({});
  const [title, setTitle] = useState('');
  const [offerLink, setOfferLink] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const fetchBanners = async () => {
    try {
      // FIX: إضافة '/api' للمسار
      const res = await API.get('/api/banners');
      setBanners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      // FIX: إضافة '/api' للمسار
      await API.delete(`/api/banners/${id}`);
      setBanners(banners.filter(b => b._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id) => {
    try {
      // FIX: إضافة '/api' للمسار
      const res = await API.patch(`/api/banners/${id}/toggle`);
      setBanners(banners.map(b => b._id === id ? res.data : b));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditOpen = (banner) => {
    setCurrentBanner(banner);
    setTitle(banner.title);
    setOfferLink(banner.offerLink);
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setImageFile(null);
  };

  const handleEditSubmit = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('offerLink', offerLink);
    if (imageFile) formData.append('image', imageFile);

    try {
      // FIX: إضافة '/api' للمسار
      const res = await API.put(`/api/banners/${currentBanner._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBanners(banners.map(b => b._id === currentBanner._id ? res.data : b));
      handleEditClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>Banners</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banners.map(banner => (
              <TableRow key={banner._id}>
                <TableCell>{banner.title}</TableCell>
                <TableCell>
                  <img src={banner.imageUrl} alt={banner.title} width="100" />
                </TableCell>
                <TableCell>{banner.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleToggle(banner._id)}>
                    {banner.isActive ? <ToggleOff /> : <ToggleOn />}
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleEditOpen(banner)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(banner._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog لتعديل البانر */}
      <Dialog open={openEdit} onClose={handleEditClose}>
        <DialogTitle>Edit Banner</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Offer Link"
            fullWidth
            value={offerLink}
            onChange={e => setOfferLink(e.target.value)}
          />
          <input type="file" onChange={e => setImageFile(e.target.files[0])} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Banners;
