import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Stack, TextField, MenuItem, Button,
  TablePagination,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import type { AuditLog } from '../types';

const ACTIONS = ['ALL', 'CREATE_EVENT', 'APPROVE_EVENT', 'REJECT_EVENT', 'UPDATE_ROLE', 'CREATE_CAMPAIGN', 'SEND_CAMPAIGN', 'UPDATE_CONFIG', 'CREATE_ACCESS_GRANT'];

const actionColors: Record<string, string> = {
  CREATE_EVENT: '#1976d2', APPROVE_EVENT: '#388e3c', REJECT_EVENT: '#d32f2f',
  UPDATE_ROLE: '#7b1fa2', CREATE_CAMPAIGN: '#f57c00', SEND_CAMPAIGN: '#00897b',
  UPDATE_CONFIG: '#616161', CREATE_ACCESS_GRANT: '#5c6bc0',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  const fetchLogs = async () => {
    try {
      const params: Record<string, string | number> = { page: page + 1, limit: 25 };
      if (actionFilter !== 'ALL') params.action = actionFilter;
      const res = await api.get('/admin/audit-logs', { params });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch { /* ignore */ }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Audit Logs</Typography>
        <Stack direction="row" sx={{ gap: 2 }}>
          <TextField select size="small" label="Action" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(0); }} sx={{ minWidth: 180 }}>
            {ACTIONS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
          <Button startIcon={<Refresh />} onClick={fetchLogs}>Refresh</Button>
        </Stack>
      </Stack>
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Resource</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell><Typography variant="caption">{format(new Date(log.createdAt), 'MMM dd HH:mm:ss')}</Typography></TableCell>
                  <TableCell>{log.user.name}</TableCell>
                  <TableCell><Chip label={log.action} size="small" sx={{ bgcolor: actionColors[log.action] || '#616161', color: 'white', fontSize: 11 }} /></TableCell>
                  <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{log.resource}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details || '-'}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={25} rowsPerPageOptions={[25]} />
      </Card>
    </Box>
  );
}
