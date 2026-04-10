import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      await register(name, email, password);
      navigate('/events');
    } catch {
      setError('Registration failed. Email may already be in use.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Card sx={{ maxWidth: 440, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>Create Account</Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 3 }}>Join EventHub</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField fullWidth label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
              <TextField fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <TextField fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <Button type="submit" variant="contained" size="large" fullWidth>Register</Button>
            </Stack>
          </form>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
