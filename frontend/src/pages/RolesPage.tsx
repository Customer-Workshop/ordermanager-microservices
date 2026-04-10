import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import type { Role } from '../types';
import { fetchRoles } from '../services/api';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles()
      .then((res) => setRoles(res.data))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: '#00838f' }} /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h4">Roles</Typography>
          <Typography sx={{ fontSize: 13, color: '#5a6872' }}>Define roles and assign to practice units</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: '#00838f', '&:hover': { bgcolor: '#006b77' } }}>Add Role</Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role Title</TableCell><TableCell>Category</TableCell>
                  <TableCell>Experience</TableCell><TableCell>Practice Unit</TableCell><TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#5a6872' }}>No roles defined yet</TableCell></TableRow>
                ) : roles.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{r.title}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>{r.min_experience}–{r.max_experience} yrs</TableCell>
                    <TableCell>
                      {r.practice_unit ? (
                        <Chip label={r.practice_unit.unit_code} size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f', fontWeight: 600, fontSize: 10 }} />
                      ) : '—'}
                    </TableCell>
                    <TableCell><Chip label={r.is_active ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: r.is_active ? '#e8f5e9' : '#fafafa', color: r.is_active ? '#2e8540' : '#5a6872' }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
