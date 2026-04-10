import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, Stack, Grid,
  TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import { Add, Send, Campaign as CampaignIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import type { Campaign, Event } from '../types';

const CHANNELS = [
  { value: 'MS_TEAMS', label: 'MS Teams Channel' },
  { value: 'VIVA_ENGAGE', label: 'Viva Engage Group' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState('');
  const [channel, setChannel] = useState('MS_TEAMS');
  const [targetGroup, setTargetGroup] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [alert, setAlert] = useState('');

  useEffect(() => {
    fetchCampaigns();
    api.get('/events', { params: { status: 'APPROVED' } }).then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const fetchCampaigns = async () => {
    try { const res = await api.get('/campaigns'); setCampaigns(res.data); } catch { /* ignore */ }
  };

  const handleCreate = async () => {
    try {
      await api.post('/campaigns', { eventId, channel, targetGroup, message, scheduledAt });
      setOpen(false); setAlert('Campaign created successfully'); fetchCampaigns(); resetForm();
    } catch { /* ignore */ }
  };

  const handleSend = async (id: string) => {
    try { await api.patch(`/campaigns/${id}/send`); setAlert('Campaign sent!'); fetchCampaigns(); } catch { /* ignore */ }
  };

  const resetForm = () => { setEventId(''); setChannel('MS_TEAMS'); setTargetGroup(''); setMessage(''); setScheduledAt(''); };

  const statusColors: Record<string, 'warning' | 'success' | 'default'> = { SCHEDULED: 'warning', SENT: 'success' };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Campaigns</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>New Campaign</Button>
      </Stack>
      {alert && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlert('')}>{alert}</Alert>}
      {campaigns.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CampaignIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography sx={{ color: 'text.secondary' }}>No campaigns yet. Create one to promote an event!</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {campaigns.map(c => (
            <Grid size={{ xs: 12, md: 6 }} key={c.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
                    <Chip label={c.channel} size="small" color="primary" />
                    <Chip label={c.status} size="small" color={statusColors[c.status] || 'default'} />
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{c.event.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Target: {c.targetGroup}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{c.message}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Scheduled: {format(new Date(c.scheduledAt), 'MMM dd, yyyy h:mm a')}
                    {c.sentAt && ` | Sent: ${format(new Date(c.sentAt), 'MMM dd, yyyy h:mm a')}`}
                  </Typography>
                  {c.status === 'SCHEDULED' && (
                    <Box sx={{ mt: 2 }}>
                      <Button size="small" variant="contained" startIcon={<Send />} onClick={() => handleSend(c.id)}>Send Now</Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Campaign</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 2, mt: 1 }}>
            <TextField select fullWidth label="Event" value={eventId} onChange={e => setEventId(e.target.value)} required>
              {events.map(ev => <MenuItem key={ev.id} value={ev.id}>{ev.title}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Channel" value={channel} onChange={e => setChannel(e.target.value)}>
              {CHANNELS.map(ch => <MenuItem key={ch.value} value={ch.value}>{ch.label}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Target Group/Channel Name" value={targetGroup} onChange={e => setTargetGroup(e.target.value)} required />
            <TextField fullWidth label="Campaign Message" value={message} onChange={e => setMessage(e.target.value)} multiline rows={3} required />
            <TextField fullWidth type="datetime-local" label="Schedule At" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Campaign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
