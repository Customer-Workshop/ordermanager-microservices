import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import type { PracticeUnit } from '../types';
import { fetchPracticeUnits } from '../services/api';

export default function PracticeUnitsPage() {
  const [units, setUnits] = useState<PracticeUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPracticeUnits()
      .then((res) => setUnits(res.data))
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: '#00838f' }} /></Box>;

  const defaultUnits = [
    { code: 'ADM', name: 'Application Development & Maintenance', desc: 'Development roles' },
    { code: 'CIS', name: 'Cloud & Infrastructure Services', desc: 'Infra support roles' },
    { code: 'QES', name: 'Quality Engineering & Services', desc: 'Testing roles' },
    { code: 'ARC', name: 'Architecture & Design', desc: 'Architecture roles' },
    { code: 'DAA', name: 'Data & Analytics', desc: 'Data analytics roles' },
    { code: 'CSC', name: 'Cyber Security Center', desc: 'Cyber security roles' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h4">Practice Units</Typography>
          <Typography sx={{ fontSize: 13, color: '#5a6872' }}>Manage organizational practice units and assign anchors</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: '#00838f', '&:hover': { bgcolor: '#006b77' } }}>Add Unit</Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell><TableCell>Unit Name</TableCell>
                  <TableCell>Description</TableCell><TableCell>Anchors</TableCell><TableCell>Roles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {units.length === 0 ? defaultUnits.map((u) => (
                  <TableRow key={u.code} hover>
                    <TableCell><Chip label={u.code} size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f', fontWeight: 600, fontSize: 11 }} /></TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                    <TableCell sx={{ color: '#5a6872' }}>{u.desc}</TableCell>
                    <TableCell sx={{ color: '#5a6872' }}>1-2 designated</TableCell>
                    <TableCell>0</TableCell>
                  </TableRow>
                )) : units.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell><Chip label={u.unit_code} size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f', fontWeight: 600, fontSize: 11 }} /></TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{u.unit_name}</TableCell>
                    <TableCell sx={{ color: '#5a6872' }}>{u.description || '\u2014'}</TableCell>
                    <TableCell sx={{ color: '#5a6872' }}>{u.anchors?.length || 0} assigned</TableCell>
                    <TableCell>{u.roles?.length || 0}</TableCell>
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
