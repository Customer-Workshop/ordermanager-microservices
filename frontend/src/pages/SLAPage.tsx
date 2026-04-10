import { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress,
} from '@mui/material';
import { Upload, Description } from '@mui/icons-material';
import type { SLADefinition } from '../types';
import { fetchSLADefinitions, uploadSLAAttachment } from '../services/api';

export default function SLAPage() {
  const [definitions, setDefinitions] = useState<SLADefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSLADefinitions()
      .then((res) => setDefinitions(res.data))
      .catch(() => setDefinitions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = (slaId: number) => {
    setUploadingId(slaId);
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;
    try {
      await uploadSLAAttachment(uploadingId, file, file.name);
      const res = await fetchSLADefinitions();
      setDefinitions(res.data);
    } catch {
      alert('Failed to upload SLA file');
    }
    setUploadingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>SLA Management</Typography>
      </Box>

      <input ref={fileInputRef} type="file" accept=".xls,.xlsx" hidden onChange={onFileSelected} />

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Target Days</TableCell>
                  <TableCell>Warning Threshold</TableCell>
                  <TableCell>Attachments</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {definitions.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No SLA definitions yet</TableCell></TableRow>
                ) : (
                  definitions.map((sla) => (
                    <TableRow key={sla.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{sla.name}</TableCell>
                      <TableCell><Chip label={sla.stage} size="small" /></TableCell>
                      <TableCell>{sla.target_days} days</TableCell>
                      <TableCell>{sla.warning_threshold_days} days</TableCell>
                      <TableCell>
                        {sla.attachments.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">None</Typography>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {sla.attachments.map((a) => (
                              <Chip key={a.id} icon={<Description />} label={a.file_name} size="small"
                                variant="outlined" onClick={() => window.open(a.file_url)} />
                            ))}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Upload />} onClick={() => handleUpload(sla.id)}>
                          Upload XLS
                        </Button>
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
