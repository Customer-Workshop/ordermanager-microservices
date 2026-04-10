import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import type { PracticeUnit } from '../types';
import { fetchPracticeUnits, createPracticeUnit } from '../services/api';

export default function PracticeUnitsPage() {
  const [units, setUnits] = useState<PracticeUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '' });

  useEffect(() => {
    fetchPracticeUnits()
      .then((res) => setUnits(res.data))
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    createPracticeUnit(form)
      .then((res) => { setUnits([...units, res.data]); setDialogOpen(false); setForm({ code: '', name: '', description: '' }); })
      .catch(() => alert('Failed to create practice unit'));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Practice Units</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: '#6c63ff', '&:hover': { bgcolor: '#5a52e0' } }}>
          Add Practice Unit
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {units.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">No practice units yet</TableCell></TableRow>
                ) : (
                  units.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell><Chip label={u.code} size="small" color="primary" /></TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                      <TableCell>{u.description || '—'}</TableCell>
                      <TableCell>
                        <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small"
                          color={u.is_active ? 'success' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Practice Unit</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Code (e.g. ADM, CIS)" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <TextField label="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Description" multiline rows={2} value={form.description}
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
