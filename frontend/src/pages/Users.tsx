import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, MenuItem, Select, Alert,
} from '@mui/material';
import api from '../services/api';

interface UserRow {
  id: string; email: string; name: string; role: string; title?: string; createdAt: string;
}

const ROLES = ['ADMIN', 'ORGANIZER', 'GOVERNANCE', 'SPEAKER', 'AUDIENCE'];
const roleColors: Record<string, string> = {
  ADMIN: '#d32f2f', ORGANIZER: '#1976d2', GOVERNANCE: '#7b1fa2', SPEAKER: '#388e3c', AUDIENCE: '#f57c00',
};

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const res = await api.get('/users'); setUsers(res.data); } catch { /* ignore */ }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try { await api.patch(`/users/${userId}/role`, { role }); setMessage('Role updated'); fetchUsers(); } catch { /* ignore */ }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>User Management</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Change Role</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.title || '-'}</TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" sx={{ bgcolor: roleColors[u.role], color: 'white' }} />
                  </TableCell>
                  <TableCell>
                    <Select size="small" value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                      {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
