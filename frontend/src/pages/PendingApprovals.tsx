import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardActions, Button, Chip, Stack, Grid,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import { Check, Close, Edit, CalendarMonth } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import type { Event } from '../types';

export default function PendingApprovals() {
  const [events, setEvents] = useState<Event[]>([]);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try { const res = await api.get('/events/pending'); setEvents(res.data); } catch { /* ignore */ }
  };

  const handleApprove = async (id: string) => {
    try { await api.patch(`/events/${id}/approve`); setMessage('Event approved successfully'); fetchPending(); } catch { /* ignore */ }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    try {
      await api.patch(`/events/${rejectDialog}/reject`, { reason: rejectReason });
      setMessage('Event rejected'); setRejectDialog(null); setRejectReason(''); fetchPending();
    } catch { /* ignore */ }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Pending Approvals</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
      {events.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary' }}>No pending events to review</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {events.map(event => (
            <Grid size={{ xs: 12, md: 6 }} key={event.id}>
              <Card>
                <CardContent>
                  <Chip label={event.eventType} size="small" color="primary" sx={{ mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{event.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{event.description}</Typography>
                  <Stack sx={{ gap: 0.5 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                      <CalendarMonth fontSize="small" color="action" />
                      <Typography variant="body2">{format(new Date(event.startDate), 'MMM dd, yyyy h:mm a')}</Typography>
                    </Stack>
                    <Typography variant="body2">Speaker: {event.speaker.name}{event.speaker.email ? ` (${event.speaker.email})` : ''}</Typography>
                    {event.groups && event.groups.length > 0 && (
                      <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                        {event.groups.map(eg => <Chip key={eg.id} label={eg.group.name} size="small" variant="outlined" />)}
                      </Stack>
                    )}
                  </Stack>
                  {event.sessions && event.sessions.length > 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                      {event.sessions.length} session(s)
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button variant="contained" color="success" startIcon={<Check />} onClick={() => handleApprove(event.id)}>Approve</Button>
                  <Button variant="outlined" color="error" startIcon={<Close />} onClick={() => setRejectDialog(event.id)}>Reject</Button>
                  <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/events/${event.id}`)}>View</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={!!rejectDialog} onClose={() => setRejectDialog(null)}>
        <DialogTitle>Reject Event</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Reason for rejection" value={rejectReason} onChange={e => setRejectReason(e.target.value)} multiline rows={3} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject}>Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
