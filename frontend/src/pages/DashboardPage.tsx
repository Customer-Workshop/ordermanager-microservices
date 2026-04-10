import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress,
} from '@mui/material';
import { People, Assignment, CheckCircle, Warning } from '@mui/icons-material';
import type { DashboardData } from '../types';
import { fetchDashboard } from '../services/api';

const STAT_CARDS = [
  { key: 'total_requests', label: 'Total Requests', icon: <Assignment />, color: '#6c63ff' },
  { key: 'total_candidates', label: 'Total Candidates', icon: <People />, color: '#00bcd4' },
  { key: 'total_active_positions', label: 'Active Positions', icon: <Warning />, color: '#ff9800' },
  { key: 'total_onboarded', label: 'Onboarded', icon: <CheckCircle />, color: '#4caf50' },
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then((res) => setData(res.data))
      .catch(() => {
        // Use placeholder data if API is not available
        setData({
          total_requests: 0, total_candidates: 0, total_active_positions: 0, total_onboarded: 0,
          request_status_breakdown: [], location_breakdown: [], practice_unit_breakdown: [],
          sla_summary: { on_track: 0, at_risk: 0, breached: 0, met: 0 },
          rotation_summary: { active: 0, due_in_30_days: 0, due_in_90_days: 0, due_in_180_days: 0, overdue: 0 },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;
  if (!data) return null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Dashboard</Typography>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STAT_CARDS.map(({ key, label, icon, color }) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
            <Card sx={{ borderTop: `3px solid ${color}` }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: `${color}20`, borderRadius: 2, p: 1, display: 'flex' }}>
                  {icon}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{data[key]}</Typography>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* SLA Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>SLA Status</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`On Track: ${data.sla_summary.on_track}`} color="success" />
                <Chip label={`At Risk: ${data.sla_summary.at_risk}`} color="warning" />
                <Chip label={`Breached: ${data.sla_summary.breached}`} color="error" />
                <Chip label={`Met: ${data.sla_summary.met}`} color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>24-Month Rotation</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Active: ${data.rotation_summary.active}`} color="primary" />
                <Chip label={`Due 30d: ${data.rotation_summary.due_in_30_days}`} color="error" />
                <Chip label={`Due 90d: ${data.rotation_summary.due_in_90_days}`} color="warning" />
                <Chip label={`Due 180d: ${data.rotation_summary.due_in_180_days}`} color="info" />
                <Chip label={`Overdue: ${data.rotation_summary.overdue}`} color="error" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Location Breakdown */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Requests by Location</Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Fulfilled</TableCell>
                  <TableCell align="right">In Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.location_breakdown.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">No data yet</TableCell></TableRow>
                ) : (
                  data.location_breakdown.map((loc) => (
                    <TableRow key={loc.location_name}>
                      <TableCell>{loc.location_name}</TableCell>
                      <TableCell align="right">{loc.total_requests}</TableCell>
                      <TableCell align="right">{loc.fulfilled}</TableCell>
                      <TableCell align="right">{loc.in_progress}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Practice Unit Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Requests by Practice Unit</Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Practice Unit</TableCell>
                  <TableCell align="right">Requests</TableCell>
                  <TableCell align="right">Candidates</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.practice_unit_breakdown.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">No data yet</TableCell></TableRow>
                ) : (
                  data.practice_unit_breakdown.map((pu) => (
                    <TableRow key={pu.unit_code}>
                      <TableCell><Chip label={pu.unit_code} size="small" /></TableCell>
                      <TableCell>{pu.unit_name}</TableCell>
                      <TableCell align="right">{pu.total_requests}</TableCell>
                      <TableCell align="right">{pu.total_candidates}</TableCell>
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
