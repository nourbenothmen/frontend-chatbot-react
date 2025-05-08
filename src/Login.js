import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { TextField, Button, Box, Typography } from '@mui/material';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (!result.success) {
      console.error(result.error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        label="Username"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
      />
      <TextField
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      <Button type="submit">Login</Button>
    </Box>
  );
};

export default Login;