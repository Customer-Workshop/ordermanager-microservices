import { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Add, Upload, Visibility } from '@mui/icons-material';
import type { RoleRubric } from '../types';
import { fetchRubrics, uploadRubricHtml, getRubricHtml } from '../services/api';

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState<RoleRubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRubrics()
      .then((res) => setRubrics(res.data))
      .catch(() => setRubrics([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = (rubricId: number) => {
    setUploadingId(rubricId);
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;
    try {
      await uploadRubricHtml(uploadingId, file);
      // Refresh rubrics
      const res = await fetchRubrics();
      setRubrics(res.data);
    } catch {
      alert('Failed to upload rubric HTML');
    }
    setUploadingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePreview = async (rubricId: number) => {
    try {
      const res = await getRubricHtml(rubricId);
      setPreviewHtml(typeof res.data === 'string' ? res.data : '');
    } catch {
      alert('No HTML content available for this rubric');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Role Rubrics</Typography>
        <Button variant="contained" startIcon={<Add />}
          sx={{ bgcolor: '#6c63ff', '&:hover': { bgcolor: '#5a52e0' } }}>
          Add Rubric
        </Button>
      </Box>

      <input ref={fileInputRef} type="file" accept=".html,.htm" hidden onChange={onFileSelected} />

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Role ID</TableCell>
                  <TableCell>Pass Band</TableCell>
                  <TableCell>Auto-Reject Rule</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>HTML</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rubrics.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">No rubrics yet</TableCell></TableRow>
                ) : (
                  rubrics.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{r.title}</TableCell>
                      <TableCell>{r.role_id}</TableCell>
                      <TableCell>{r.pass_band || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.auto_reject_rule || '—'}
                      </TableCell>
                      <TableCell><Chip label={`v${r.version}`} size="small" /></TableCell>
                      <TableCell>
                        <Chip label={r.html_content ? 'Uploaded' : 'No HTML'} size="small"
                          color={r.html_content ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<Upload />} onClick={() => handleUpload(r.id)}>
                            Upload HTML
                          </Button>
                          {r.html_content && (
                            <Button size="small" startIcon={<Visibility />} onClick={() => handlePreview(r.id)}>
                              Preview
                            </Button>
                          )}
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

      {/* HTML Preview Dialog */}
      <Dialog open={previewHtml !== null} onClose={() => setPreviewHtml(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Rubric Preview (Interviewer View)</DialogTitle>
        <DialogContent>
          {previewHtml && (
            <iframe
              srcDoc={previewHtml}
              sandbox="allow-same-origin"
              style={{ width: '100%', height: '70vh', border: '1px solid #eee', borderRadius: 4, background: '#fff' }}
              title="Rubric Preview"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewHtml(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
