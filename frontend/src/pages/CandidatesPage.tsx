import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import type { Candidate } from '../types';
import { fetchCandidates } from '../services/api';

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  available: 'success', shortlisted: 'info', interviewing: 'warning',
  offered: 'primary', active: 'success', rejected: 'error', withdrawn: 'default',
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates()
      .then((res) => setCandidates(res.data))
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Candidates</Typography>
        <Button variant="contained" startIcon={<Add />}
          sx={{ bgcolor: '#6c63ff', '&:hover': { bgcolor: '#5a52e0' } }}>
          Add Candidate
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Skills</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">No candidates yet</TableCell></TableRow>
                ) : (
                  candidates.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{c.full_name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.experience_years} years</TableCell>
                      <TableCell>
                        <Chip label={c.status} size="small" color={STATUS_COLORS[c.status] || 'default'} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {c.skills.slice(0, 3).map((s) => (
                            <Chip key={s.id} label={s.skill_name} size="small" variant="outlined" />
                          ))}
                          {c.skills.length > 3 && <Chip label={`+${c.skills.length - 3}`} size="small" />}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
