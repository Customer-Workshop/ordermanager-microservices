import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Button, Alert, Stack,
} from '@mui/material';
import { Save, Add } from '@mui/icons-material';
import api from '../services/api';
import type { AppConfig as AppConfigType } from '../types';

export default function AppConfig() {
  const [configs, setConfigs] = useState<AppConfigType[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    try {
      const res = await api.get('/admin/config');
      setConfigs(res.data);
      const values: Record<string, string> = {};
      res.data.forEach((c: AppConfigType) => { values[c.key] = c.value; });
      setEditValues(values);
    } catch { /* ignore */ }
  };

  const handleSave = async (key: string) => {
    try { await api.put('/admin/config', { key, value: editValues[key] }); setMessage(`Config "${key}" saved`); fetchConfigs(); } catch { /* ignore */ }
  };

  const handleAdd = async () => {
    if (!newKey || !newValue) return;
    try { await api.put('/admin/config', { key: newKey, value: newValue }); setNewKey(''); setNewValue(''); setMessage(`Config "${newKey}" added`); fetchConfigs(); } catch { /* ignore */ }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>App Configuration</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
      <Card sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Key</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
                <TableCell width={100}><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map(c => (
                <TableRow key={c.id}>
                  <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{c.key}</Typography></TableCell>
                  <TableCell>
                    <TextField size="small" fullWidth value={editValues[c.key] || ''} onChange={e => setEditValues({ ...editValues, [c.key]: e.target.value })} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Save />} onClick={() => handleSave(c.key)} disabled={editValues[c.key] === c.value}>Save</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Card>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Add New Config</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2, alignItems: 'center' }}>
            <TextField size="small" label="Key" value={newKey} onChange={e => setNewKey(e.target.value)} sx={{ minWidth: 200 }} />
            <TextField size="small" label="Value" value={newValue} onChange={e => setNewValue(e.target.value)} sx={{ flexGrow: 1 }} fullWidth />
            <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add</Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
