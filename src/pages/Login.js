import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { TextField, Button, Container, Typography } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data } = await API.post('/users/login', { email, password });
      localStorage.setItem('adminToken', data.token);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ mb: 3 }}>Admin Login</Typography>
      <TextField label="Email" fullWidth sx={{ mb: 2 }} value={email} onChange={e => setEmail(e.target.value)} />
      <TextField label="Password" type="password" fullWidth sx={{ mb: 2 }} value={password} onChange={e => setPassword(e.target.value)} />
      <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>
    </Container>
  );
};

export default Login;
