import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress, 
  Paper 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios'; // Assuming this file configures the base URL

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // قم بإعادة المسار إلى ما كان عليه عند استدعاءه من الخادم المحلي
      // مع التأكد من أن ملف axios.js في الواجهة الأمامية
      // يوجه الطلبات إلى baseURL الصحيح
      const { data } = await API.post('/api/users/login', { email, password });
      
      localStorage.setItem('adminToken', data.token);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Admin Login
        </Typography>
        {error && (
          <Box sx={{ mt: 2, width: '100%' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
