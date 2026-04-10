import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import type { Candidate } from '../types';
import { fetchCandidates } from '../services/api';

const STATUS_COLORS: Record<string, string> = {
  available: '#2e8540', shortlisted: '#00838f', interviewing: '#e87722',
  offered: '#00263e', active: '#2e8540', rejected: '#d63e04', withdrawn: '#5a6872',
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: '#00838f' }} /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h4">Candidates</Typography>
          <Typography sx={{ fontSize: 13, color: '#5a6872' }}>Track candidates through the staffing lifecycle</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}
          sx={{ bgcolor: '#00838f', '&:hover': { bgcolor: '#006b77' } }}>
          Add Candidate
        </Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell><TableCell>Hybrid Work</TableCell><TableCell>Rotation Due</TableCell>
                  <TableCell>Skills</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: '#5a6872' }}>No candidates yet</TableCell></TableRow>
                ) : candidates.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{c.first_name} {c.last_name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.years_of_experience} years</TableCell>
                    <TableCell>
                      <Chip label={c.status} size="small" sx={{ bgcolor: `${STATUS_COLORS[c.status] || '#5a6872'}18`, color: STATUS_COLORS[c.status] || '#5a6872', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label="Pending" size="small" sx={{ bgcolor: '#fff3e0', color: '#e87722', fontSize: 10 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: '#5a6872' }}>24 months</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {c.skills.slice(0, 3).map((s) => (
                          <Chip key={s.id} label={s.skill_name} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                        ))}
                        {c.skills.length > 3 && <Chip label={`+${c.skills.length - 3}`} size="small" sx={{ fontSize: 10 }} />}
                      </Box>
                    </TableCell>
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
