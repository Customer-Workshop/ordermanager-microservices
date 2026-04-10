import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, MenuItem,
  Stack, IconButton, Alert, Divider, Autocomplete, Checkbox,
} from '@mui/material';
import { Add, Delete, CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import api from '../services/api';
import type { OrgGroup } from '../types';

interface SessionForm {
  topic: string; topicBrief: string; startTime: string; endTime: string;
  speakerName: string; speakerTitle: string; speakerLinkedIn: string;
}

const EVENT_TYPES = ['TECHNOLOGY', 'DOMAIN', 'HEALTH', 'FUN', 'PRODUCTS', 'OTHER'];

export default function ProposeEvent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('TECHNOLOGY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [bridgeLink, setBridgeLink] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<OrgGroup[]>([]);
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [sessions, setSessions] = useState<SessionForm[]>([{
    topic: '', topicBrief: '', startTime: '', endTime: '', speakerName: '', speakerTitle: '', speakerLinkedIn: '',
  }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/groups').then(r => setGroups(r.data)).catch(() => {}); }, []);

  const addSession = () => {
    setSessions([...sessions, { topic: '', topicBrief: '', startTime: '', endTime: '', speakerName: '', speakerTitle: '', speakerLinkedIn: '' }]);
  };

  const removeSession = (idx: number) => { setSessions(sessions.filter((_, i) => i !== idx)); };

  const updateSession = (idx: number, field: keyof SessionForm, value: string) => {
    const updated = [...sessions];
    updated[idx] = { ...updated[idx], [field]: value };
    setSessions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/events', {
        title, description, eventType, startDate, endDate, venue, bridgeLink,
        groupIds: selectedGroups.map(g => g.id),
        sessions: sessions.filter(s => s.topic).map(s => ({
          ...s, startTime: s.startTime || startDate, endTime: s.endTime || endDate,
        })),
      });
      navigate('/events');
    } catch {
      setError('Failed to create event. Please check all required fields.');
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Propose Event</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Event Details</Typography>
            <Stack sx={{ gap: 2 }}>
              <TextField fullWidth label="Event Title" value={title} onChange={e => setTitle(e.target.value)} required />
              <TextField fullWidth label="Description" value={description} onChange={e => setDescription(e.target.value)} required multiline rows={3} />
              <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
                <TextField select fullWidth label="Event Type" value={eventType} onChange={e => setEventType(e.target.value)}>
                  {EVENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField fullWidth label="Venue" value={venue} onChange={e => setVenue(e.target.value)} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
                <TextField fullWidth type="datetime-local" label="Start Date & Time" value={startDate} onChange={e => setStartDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
                <TextField fullWidth type="datetime-local" label="End Date & Time" value={endDate} onChange={e => setEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
              </Stack>
              <TextField fullWidth label="Bridge/Meeting Link" value={bridgeLink} onChange={e => setBridgeLink(e.target.value)} placeholder="https://teams.microsoft.com/..." />
              <Autocomplete
                multiple options={groups} getOptionLabel={(o) => `${o.name} (${o.type})`}
                value={selectedGroups} onChange={(_, v) => setSelectedGroups(v)} disableCloseOnSelect
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox icon={<CheckBoxOutlineBlank fontSize="small" />} checkedIcon={<CheckBox fontSize="small" />} checked={selected} sx={{ mr: 1 }} />
                    {option.name} ({option.type})
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="Target Groups" placeholder="Select groups..." />}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Sessions</Typography>
              <Button startIcon={<Add />} onClick={addSession}>Add Session</Button>
            </Stack>
            {sessions.map((session, idx) => (
              <Box key={idx}>
                {idx > 0 && <Divider sx={{ my: 2 }} />}
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>Session {idx + 1}</Typography>
                  {sessions.length > 1 && <IconButton size="small" color="error" onClick={() => removeSession(idx)}><Delete /></IconButton>}
                </Stack>
                <Stack sx={{ gap: 2 }}>
                  <TextField fullWidth label="Topic" value={session.topic} onChange={e => updateSession(idx, 'topic', e.target.value)} required />
                  <TextField fullWidth label="Topic Brief" value={session.topicBrief} onChange={e => updateSession(idx, 'topicBrief', e.target.value)} multiline rows={2} required />
                  <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
                    <TextField fullWidth type="datetime-local" label="Start Time" value={session.startTime} onChange={e => updateSession(idx, 'startTime', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                    <TextField fullWidth type="datetime-local" label="End Time" value={session.endTime} onChange={e => updateSession(idx, 'endTime', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
                    <TextField fullWidth label="Speaker Name" value={session.speakerName} onChange={e => updateSession(idx, 'speakerName', e.target.value)} required />
                    <TextField fullWidth label="Speaker Title" value={session.speakerTitle} onChange={e => updateSession(idx, 'speakerTitle', e.target.value)} />
                  </Stack>
                  <TextField fullWidth label="Speaker LinkedIn" value={session.speakerLinkedIn} onChange={e => updateSession(idx, 'speakerLinkedIn', e.target.value)} />
                </Stack>
              </Box>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ px: 4 }}>
          {loading ? 'Submitting...' : 'Submit Event Proposal'}
        </Button>
      </form>
    </Box>
  );
}
