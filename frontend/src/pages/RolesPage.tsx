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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Roles</Typography>
        <Button variant="contained" startIcon={<Add />}
          sx={{ bgcolor: '#6c63ff', '&:hover': { bgcolor: '#5a52e0' } }}>
          Add Role
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Experience Range</TableCell>
                  <TableCell>Required Skills</TableCell>
                  <TableCell>Practice Unit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">No roles defined yet</TableCell></TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{role.title}</TableCell>
                      <TableCell><Chip label={role.category} size="small" /></TableCell>
                      <TableCell>{role.experience_min}–{role.experience_max} years</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {role.required_skills.slice(0, 3).map((s) => (
                            <Chip key={s.id} label={s.skill_name} size="small" variant="outlined" />
                          ))}
                          {role.required_skills.length > 3 && (
                            <Chip label={`+${role.required_skills.length - 3}`} size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{role.practice_unit_id ?? '—'}</TableCell>
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
