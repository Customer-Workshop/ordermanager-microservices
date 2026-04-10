import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/events');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Card sx={{ maxWidth: 440, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>EventHub</Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 3 }}>Enterprise Event Management</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Demo Credentials:</Typography>
            <Typography variant="caption">admin@eventhub.com / organizer@eventhub.com / speaker1@eventhub.com</Typography>
            <br />
            <Typography variant="caption">Password: password123</Typography>
          </Alert>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <TextField fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <Button type="submit" variant="contained" size="large" fullWidth>Sign In</Button>
            </Stack>
          </form>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
