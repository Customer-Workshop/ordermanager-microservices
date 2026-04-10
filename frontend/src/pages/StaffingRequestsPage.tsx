import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import type { StaffingRequest } from '../types';
import { fetchStaffingRequests, createStaffingRequest } from '../services/api';

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#d63e04', high: '#e87722', medium: '#00838f', low: '#5a6872',
};

export default function StaffingRequestsPage() {
  const [requests, setRequests] = useState<StaffingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', role_id: 0, location_id: 0, number_of_positions: 1, priority: 'medium', description: '' });

  useEffect(() => {
    fetchStaffingRequests()
      .then((res) => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    try {
      await createStaffingRequest(form);
      const res = await fetchStaffingRequests();
      setRequests(res.data);
      setOpen(false);
      setForm({ title: '', role_id: 0, location_id: 0, number_of_positions: 1, priority: 'medium', description: '' });
    } catch { /* */ }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: '#00838f' }} /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h4">Staffing Requests</Typography>
          <Typography sx={{ fontSize: 13, color: '#5a6872' }}>Manage WMT-originated staffing requests</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}
          sx={{ bgcolor: '#00838f', '&:hover': { bgcolor: '#006b77' } }}>
          New Request
        </Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell><TableCell>Title</TableCell><TableCell>WMT Ref</TableCell>
                  <TableCell>Priority</TableCell><TableCell align="center">Positions</TableCell>
                  <TableCell>Status</TableCell><TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: '#5a6872' }}>No staffing requests yet</TableCell></TableRow>
                ) : requests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>#{req.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{req.title}</TableCell>
                    <TableCell>{req.wmt_reference_id || '\u2014'}</TableCell>
                    <TableCell>
                      <Chip label={req.priority} size="small" sx={{ bgcolor: `${PRIORITY_COLORS[req.priority] || '#5a6872'}18`, color: PRIORITY_COLORS[req.priority] || '#5a6872', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{req.number_of_positions}</TableCell>
                    <TableCell><Chip label={req.status} size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f' }} /></TableCell>
                    <TableCell sx={{ fontSize: 12, color: '#5a6872' }}>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#00263e' }}>New Staffing Request</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} size="small" />
          <TextField label="Role ID" type="number" value={form.role_id} onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })} size="small" />
          <TextField label="Location ID" type="number" value={form.location_id} onChange={(e) => setForm({ ...form, location_id: Number(e.target.value) })} size="small" />
          <TextField label="Positions" type="number" value={form.number_of_positions} onChange={(e) => setForm({ ...form, number_of_positions: Number(e.target.value) })} size="small" />
          <TextField label="Priority" select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} size="small">
            {['critical','high','medium','low'].map((p) => <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</MenuItem>)}
          </TextField>
          <TextField label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} size="small" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#00838f', '&:hover': { bgcolor: '#006b77' } }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
