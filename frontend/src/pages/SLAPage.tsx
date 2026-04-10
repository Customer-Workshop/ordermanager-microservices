import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { Upload } from '@mui/icons-material';

const DEMO_SLAS = [
  { id: 1, name: 'Onboarding Timeline', target: '30 days from offer', status: 'on_track', type: 'Onboarding' },
  { id: 2, name: 'Candidate Quality Score', target: '≥ 85% rubric pass rate', status: 'on_track', type: 'Quality' },
  { id: 3, name: 'Retention Rate (6-month)', target: '≥ 95%', status: 'at_risk', type: 'Retention' },
  { id: 4, name: 'Time-to-Fill', target: '≤ 45 days', status: 'on_track', type: 'Staffing' },
  { id: 5, name: 'Interview-to-Offer Ratio', target: '≤ 3:1', status: 'on_track', type: 'Efficiency' },
  { id: 6, name: 'Hybrid Compliance', target: '100% agreement within 7 days', status: 'on_track', type: 'Compliance' },
];

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  on_track: { label: 'On Track', bg: '#e8f5e9', color: '#2e8540' },
  at_risk: { label: 'At Risk', bg: '#fff3e0', color: '#e87722' },
  breached: { label: 'Breached', bg: '#fbe9e7', color: '#d63e04' },
  met: { label: 'Met', bg: '#e0f7fa', color: '#00838f' },
};

export default function SLAPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h4">SLA Management</Typography>
          <Typography sx={{ fontSize: 13, color: '#5a6872' }}>Track and manage client SLA compliance</Typography>
        </Box>
        <Button variant="contained" component="label" startIcon={<Upload />}
          sx={{ bgcolor: '#00838f', '&:hover': { bgcolor: '#006b77' } }}>
          Upload SLA (XLS)
          <input type="file" hidden accept=".xls,.xlsx" onChange={handleUpload} />
        </Button>
      </Box>

      {file && (
        <Card sx={{ mb: 2, borderLeft: '4px solid #2e8540' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography sx={{ fontSize: 13 }}>Uploaded: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SLA</TableCell><TableCell>Type</TableCell>
                  <TableCell>Target</TableCell><TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_SLAS.map((sla) => {
                  const s = STATUS_MAP[sla.status] || STATUS_MAP.on_track;
                  return (
                    <TableRow key={sla.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{sla.name}</TableCell>
                      <TableCell><Chip label={sla.type} size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f', fontSize: 10 }} /></TableCell>
                      <TableCell sx={{ color: '#5a6872' }}>{sla.target}</TableCell>
                      <TableCell><Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
