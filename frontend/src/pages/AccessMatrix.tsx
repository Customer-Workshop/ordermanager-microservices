import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert, Chip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import api from '../services/api';
import type { AccessGrant, OrgGroup } from '../types';

interface UserOption { id: string; name: string; email: string; }

export default function AccessMatrix() {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [role, setRole] = useState('ORGANIZER');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchGrants();
    api.get('/users').then(r => setUsers(r.data)).catch(() => {});
    api.get('/groups').then(r => setGroups(r.data)).catch(() => {});
  }, []);

  const fetchGrants = async () => {
    try { const res = await api.get('/admin/access-grants'); setGrants(res.data); } catch { /* ignore */ }
  };

  const handleCreate = async () => {
    try { await api.post('/admin/access-grants', { userId, groupId, role }); setOpen(false); setMessage('Access grant created'); fetchGrants(); } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/admin/access-grants/${id}`); setMessage('Access grant removed'); fetchGrants(); } catch { /* ignore */ }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Access Matrix</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Grant</Button>
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Group</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grants.map(g => (
                <TableRow key={g.id}>
                  <TableCell>{g.user.name} ({g.user.email})</TableCell>
                  <TableCell><Chip label={`${g.group.name} (${g.group.type})`} size="small" /></TableCell>
                  <TableCell><Chip label={g.role} size="small" color="primary" /></TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDelete(g.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {grants.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center">No access grants configured</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Access Grant</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 2, mt: 1 }}>
            <TextField select fullWidth label="User" value={userId} onChange={e => setUserId(e.target.value)}>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Group" value={groupId} onChange={e => setGroupId(e.target.value)}>
              {groups.map(g => <MenuItem key={g.id} value={g.id}>{g.name} ({g.type})</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Role" value={role} onChange={e => setRole(e.target.value)}>
              <MenuItem value="ORGANIZER">Organizer</MenuItem>
              <MenuItem value="GOVERNANCE">Governance</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
