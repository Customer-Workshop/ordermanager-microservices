import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress,
} from '@mui/material';
import { People, Assignment, CheckCircle, Warning, Home, SwapHoriz, TrendingUp } from '@mui/icons-material';
import type { DashboardData } from '../types';
import { fetchDashboard } from '../services/api';

const WAVES = [
  { name: 'Wave 1', positions: 70, timeline: 'Month 1-3', filled: 0, color: '#00838f' },
  { name: 'Wave 2', positions: 180, timeline: 'Month 4-6', filled: 0, color: '#00acc1' },
  { name: 'Wave 3', positions: 250, timeline: 'Month 7-9', filled: 0, color: '#e87722' },
  { name: 'Wave 4', positions: 200, timeline: 'Month 10-12', filled: 0, color: '#00263e' },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then((res) => setData(res.data))
      .catch(() => {
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

  const totalWavePositions = WAVES.reduce((a, w) => a + w.positions, 0);
  const totalFilled = WAVES.reduce((a, w) => a + w.filled, 0);

  const statCards = [
    { label: 'Total Requests', value: data.total_requests, icon: <Assignment />, color: '#00263e', bg: '#e8edf1' },
    { label: 'Candidates', value: data.total_candidates, icon: <People />, color: '#00838f', bg: '#e0f7fa' },
    { label: 'Active Positions', value: data.total_active_positions, icon: <Warning />, color: '#e87722', bg: '#fff3e0' },
    { label: 'Onboarded', value: data.total_onboarded, icon: <CheckCircle />, color: '#2e8540', bg: '#e8f5e9' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>Dashboard</Typography>
      <Typography sx={{ fontSize: 13, color: '#5a6872', mb: 2.5 }}>Onboarding 700 team members across 5 locations over 12 months</Typography>

      {/* Wave-Based Staffing Plan */}
      <Card sx={{ mb: 2.5, borderTop: '3px solid #00838f' }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUp sx={{ color: '#00838f', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontSize: 14 }}>Wave-Based Staffing Plan</Typography>
            <Chip label={`${totalFilled} / ${totalWavePositions} positions`} size="small" sx={{ ml: 'auto', bgcolor: '#e0f7fa', color: '#00838f', fontWeight: 600 }} />
          </Box>
          <Grid container spacing={2}>
            {WAVES.map((wave) => {
              const pct = wave.positions > 0 ? (wave.filled / wave.positions) * 100 : 0;
              return (
                <Grid size={{ xs: 6, md: 3 }} key={wave.name}>
                  <Box sx={{ border: '1px solid #e0e3e6', borderRadius: 1.5, p: 1.5, borderLeft: `3px solid ${wave.color}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, color: wave.color }}>{wave.name}</Typography>
                      <Typography sx={{ fontSize: 10, color: '#5a6872' }}>{wave.timeline}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#00263e' }}>{wave.positions}</Typography>
                    <Typography sx={{ fontSize: 10, color: '#5a6872', mb: 0.5 }}>positions planned</Typography>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2, bgcolor: '#e0e3e6', '& .MuiLinearProgress-bar': { bgcolor: wave.color } }} />
                    <Typography sx={{ fontSize: 10, color: '#5a6872', mt: 0.25 }}>{wave.filled} filled ({pct.toFixed(0)}%)</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {statCards.map(({ label, value, icon, color, bg }) => (
          <Grid size={{ xs: 6, md: 3 }} key={label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ bgcolor: bg, borderRadius: 2, p: 1, display: 'flex', color }}>{icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color }}>{value}</Typography>
                  <Typography sx={{ fontSize: 11, color: '#64748b', mt: 0.25 }}>{label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderLeft: '4px solid #00838f' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Home sx={{ color: '#00838f', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontSize: 14 }}>Hybrid Work Compliance</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: '#5a6872', mb: 1.5 }}>
                All team members must work at least <strong style={{ color: '#00838f' }}>3 days/week from office</strong> (company or client location)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 100, bgcolor: '#e8f5e9', borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#2e8540' }}>0</Typography>
                  <Typography sx={{ fontSize: 10, color: '#64748b' }}>Compliant</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 100, bgcolor: '#fff3e0', borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#e87722' }}>0</Typography>
                  <Typography sx={{ fontSize: 10, color: '#5a6872' }}>Pending</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 100, bgcolor: '#fbe9e7', borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#d63e04' }}>0</Typography>
                  <Typography sx={{ fontSize: 10, color: '#5a6872' }}>Non-Compliant</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderLeft: '4px solid #e87722' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <SwapHoriz sx={{ color: '#e87722', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontSize: 14 }}>24-Month Rotation Tracker</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: '#5a6872', mb: 1.5 }}>
                Every candidate must be <strong style={{ color: '#e87722' }}>replaced after 24 months</strong> with a new resource
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`Active: ${data.rotation_summary.active}`} size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f', fontWeight: 600 }} />
                <Chip label={`Due 30d: ${data.rotation_summary.due_in_30_days}`} size="small" sx={{ bgcolor: '#fbe9e7', color: '#d63e04' }} />
                <Chip label={`Due 90d: ${data.rotation_summary.due_in_90_days}`} size="small" sx={{ bgcolor: '#fff3e0', color: '#e87722' }} />
                <Chip label={`Due 180d: ${data.rotation_summary.due_in_180_days}`} size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f' }} />
                <Chip label={`Overdue: ${data.rotation_summary.overdue}`} size="small" variant="outlined" sx={{ borderColor: '#d63e04', color: '#d63e04' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="h6" sx={{ fontSize: 14, mb: 1.5 }}>SLA Performance</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[
              { label: 'On Track', val: data.sla_summary.on_track, color: '#10b981' },
              { label: 'At Risk', val: data.sla_summary.at_risk, color: '#f59e0b' },
              { label: 'Breached', val: data.sla_summary.breached, color: '#ef4444' },
              { label: 'Met', val: data.sla_summary.met, color: '#3b82f6' },
            ].map(({ label, val, color }) => (
              <Box key={label} sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color }}>{val}</Typography>
                <Typography sx={{ fontSize: 10, color: '#64748b' }}>{label}</Typography>
                <LinearProgress variant="determinate" value={val > 0 ? 100 : 0} sx={{ mt: 0.5, height: 3, borderRadius: 2, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: color } }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" sx={{ fontSize: 14, mb: 1 }}>Locations (5 Sites)</Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Location</TableCell><TableCell align="center">Type</TableCell><TableCell align="right">Requests</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {data.location_breakdown.length === 0 ? (
                      <>
                        {['Richardson, TX', 'Raleigh, NC', 'Phoenix, AZ', 'Plano, TX', 'Reston, VA'].map((loc, i) => (
                          <TableRow key={loc}>
                            <TableCell sx={{ fontWeight: 500 }}>{loc}</TableCell>
                            <TableCell align="center">
                              <Chip label={i < 3 ? 'Company' : 'Client'} size="small" sx={{ bgcolor: i < 3 ? '#eef2ff' : '#fef3c7', color: i < 3 ? '#4f46e5' : '#b45309', fontSize: 10 }} />
                            </TableCell>
                            <TableCell align="right">0</TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : data.location_breakdown.map((loc) => {
                      const isCompany = ['Richardson', 'Raleigh', 'Phoenix'].some(c => loc.location_name.includes(c));
                      return (
                        <TableRow key={loc.location_name}>
                          <TableCell sx={{ fontWeight: 500 }}>{loc.location_name}</TableCell>
                          <TableCell align="center">
                            <Chip label={isCompany ? 'Company' : 'Client'} size="small" sx={{ bgcolor: isCompany ? '#e0f7fa' : '#fff3e0', color: isCompany ? '#00838f' : '#e87722', fontSize: 10 }} />
                          </TableCell>
                          <TableCell align="right">{loc.total_requests}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" sx={{ fontSize: 14, mb: 1 }}>Practice Units</Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Code</TableCell><TableCell>Unit</TableCell><TableCell align="right">Roles</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {data.practice_unit_breakdown.length === 0 ? (
                      <>
                        {[['ADM','Application Development & Maintenance'],['CIS','Cloud & Infrastructure Services'],['QES','Quality Engineering & Services'],['ARC','Architecture & Design'],['DAA','Data & Analytics'],['CSC','Cyber Security Center']].map(([code,name]) => (
                          <TableRow key={code}>
                            <TableCell><Chip label={code} size="small" sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 600, fontSize: 10 }} /></TableCell>
                            <TableCell>{name}</TableCell>
                            <TableCell align="right">0</TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : data.practice_unit_breakdown.map((pu) => (
                      <TableRow key={pu.unit_code}>
                        <TableCell><Chip label={pu.unit_code} size="small" sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 600, fontSize: 10 }} /></TableCell>
                        <TableCell>{pu.unit_name}</TableCell>
                        <TableCell align="right">{pu.total_requests}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
