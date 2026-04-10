import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import type { StaffingRequest } from '../types';
import { fetchStaffingRequests, createStaffingRequest } from '../services/api';

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  new: 'info', sourcing: 'primary', shortlisted: 'warning',
  interviewing: 'warning', offer_pending: 'info', fulfilled: 'success',
  cancelled: 'error', on_hold: 'default',
};

export default function StaffingRequestsPage() {
  const [requests, setRequests] = useState<StaffingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ role_id: 0, location_id: 0, headcount: 1, priority: 'medium', description: '' });

  useEffect(() => {
    fetchStaffingRequests()
      .then((res) => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    createStaffingRequest(form)
      .then((res) => { setRequests([res.data, ...requests]); setDialogOpen(false); })
      .catch(() => alert('Failed to create request'));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Staffing Requests</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: '#6c63ff', '&:hover': { bgcolor: '#5a52e0' } }}>
          New Request
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>WMT Ref</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Headcount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No staffing requests yet</TableCell></TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell>{req.id}</TableCell>
                      <TableCell>{req.wmt_reference_id || '—'}</TableCell>
                      <TableCell><Chip label={req.priority} size="small" /></TableCell>
                      <TableCell>{req.headcount}</TableCell>
                      <TableCell>
                        <Chip label={req.status} size="small" color={STATUS_COLORS[req.status] || 'default'} />
                      </TableCell>
                      <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Staffing Request</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Role ID" type="number" value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })} />
          <TextField label="Location ID" type="number" value={form.location_id}
            onChange={(e) => setForm({ ...form, location_id: Number(e.target.value) })} />
          <TextField label="Headcount" type="number" value={form.headcount}
            onChange={(e) => setForm({ ...form, headcount: Number(e.target.value) })} />
          <TextField select label="Priority" value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </TextField>
          <TextField label="Description" multiline rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#6c63ff' }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
