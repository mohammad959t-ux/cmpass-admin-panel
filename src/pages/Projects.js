import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, CircularProgress, Pagination
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import API from '../api/axios';

const PAGE_LIMIT = 20;

const Projects = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '', description: '', coverImage: null, details: []
  });
  const [newDetail, setNewDetail] = useState('');
  const [newImages, setNewImages] = useState([]);

  // جلب المشاريع
  const fetchProjects = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await API.get('/api/projects', { params: { page: pageNumber, limit: PAGE_LIMIT, search: searchTerm } });
      setProjects(res.data.items || res.data);
      setTotalPages(res.data.pages || Math.ceil((res.data.items || res.data).length / PAGE_LIMIT));
      setPage(pageNumber);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to fetch projects', { variant: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(1); }, [searchTerm]);

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        coverImage: null,
        details: project.details || []
      });
      setNewImages([]);
    } else {
      setEditingProject(null);
      setFormData({ title: '', description: '', coverImage: null, details: [] });
      setNewImages([]);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'coverImage') setFormData(prev => ({ ...prev, coverImage: files[0] }));
    else if (name === 'images') setNewImages([...files]);
    else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDetail = () => {
    if (newDetail.trim() !== '') {
      setFormData(prev => ({ ...prev, details: [...prev.details, newDetail] }));
      setNewDetail('');
    }
  };

  const handleRemoveDetail = (index) => {
    setFormData(prev => {
      const updated = [...prev.details];
      updated.splice(index, 1);
      return { ...prev, details: updated };
    });
  };

  const handleRemoveImage = (index) => {
    if (editingProject && editingProject.images && editingProject.images[index]) {
      API.delete(`/api/projects/${editingProject._id}/image`, { data: { imageName: editingProject.images[index].split('/').pop() } })
        .then(() => { enqueueSnackbar('Image removed', { variant: 'success' }); fetchProjects(page); })
        .catch(() => enqueueSnackbar('Failed to remove image', { variant: 'error' }));
    } else {
      setNewImages(prev => { const arr = [...prev]; arr.splice(index, 1); return arr; });
    }
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('details', JSON.stringify(formData.details));
      if (formData.coverImage) data.append('coverImage', formData.coverImage);
      newImages.forEach(img => data.append('images', img));

      if (editingProject) {
        await API.put(`/api/projects/${editingProject._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        enqueueSnackbar('Project updated successfully', { variant: 'success' });
      } else {
        await API.post('/api/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        enqueueSnackbar('Project added successfully', { variant: 'success' });
      }

      fetchProjects(page);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to save project', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`/api/projects/${id}`);
      enqueueSnackbar('Project deleted successfully', { variant: 'success' });
      fetchProjects(page);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delete project', { variant: 'error' });
    }
  };

  const handlePageChange = (event, value) => fetchProjects(value);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>Add Project</Button>
      </Box>

      <TextField label="Search by title" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} fullWidth sx={{ mb: 2 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cover</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Images</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map(proj => (
                <TableRow key={proj._id}>
                  <TableCell>{proj.coverImage ? <img src={proj.coverImage} alt={proj.title} width={50} height={50} /> : 'No Cover'}</TableCell>
                  <TableCell>{proj.title}</TableCell>
                  <TableCell>{proj.description}</TableCell>
                  <TableCell>{proj.details.length}</TableCell>
                  <TableCell>{proj.images.length}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenModal(proj)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(proj._id)}><Delete /></IconButton>
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

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Title" name="title" fullWidth value={formData.title} onChange={handleChange} />
          <TextField margin="dense" label="Description" name="description" fullWidth value={formData.description} onChange={handleChange} multiline rows={3} />

          <Box sx={{ mt: 2 }}>
            <Typography>Cover Image</Typography>
            <input type="file" name="coverImage" accept="image/*" onChange={handleChange} />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography>Additional Images</Typography>
            <input type="file" name="images" accept="image/*" multiple onChange={handleChange} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {editingProject?.images.map((img, idx) => (
                <Box key={idx} sx={{ position: 'relative' }}>
                  <img src={img} alt={`img-${idx}`} width={50} height={50} />
                  <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0 }} onClick={() => handleRemoveImage(idx)}>×</IconButton>
                </Box>
              ))}
              {newImages.map((img, idx) => (
                <Box key={idx} sx={{ position: 'relative' }}>
                  <img src={URL.createObjectURL(img)} alt={`new-${idx}`} width={50} height={50} />
                  <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0 }} onClick={() => handleRemoveImage(idx)}>×</IconButton>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography>Details</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField size="small" value={newDetail} onChange={e => setNewDetail(e.target.value)} placeholder="New detail" />
              <Button variant="outlined" onClick={handleAddDetail}>Add</Button>
            </Box>
            <Box sx={{ mt: 1 }}>
              {formData.details.map((d, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography>{d}</Typography>
                  <IconButton size="small" color="error" onClick={() => handleRemoveDetail(idx)}>×</IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingProject ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Projects;
