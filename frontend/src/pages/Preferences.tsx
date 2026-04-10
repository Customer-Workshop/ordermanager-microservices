import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, MenuItem, Stack, Alert,
  Chip, FormControl, InputLabel, Select, OutlinedInput,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EVENT_TYPES = ['TECHNOLOGY', 'DOMAIN', 'HEALTH', 'FUN', 'PRODUCTS', 'OTHER'];
const FREQUENCIES = ['REALTIME', 'HOURLY', 'DAILY', 'WEEKLY'];
const MECHANISMS = ['EMAIL', 'SMS', 'PUSH', 'NONE'];

export default function Preferences() {
  const { user, updateUser } = useAuth();
  const [notifFrequency, setNotifFrequency] = useState(user?.notifFrequency || 'DAILY');
  const [notifMechanism, setNotifMechanism] = useState(user?.notifMechanism || 'EMAIL');
  const [preferredTypes, setPreferredTypes] = useState<string[]>(
    user?.preferredTypes ? user.preferredTypes.split(',').filter(Boolean) : []
  );
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [linkedIn, setLinkedIn] = useState(user?.linkedIn || '');
  const [message, setMessage] = useState('');

  const handleSavePreferences = async () => {
    try {
      const res = await api.patch('/users/preferences', { notifFrequency, notifMechanism, preferredTypes: preferredTypes.join(',') });
      updateUser({ ...user!, ...res.data });
      setMessage('Preferences saved!');
    } catch { /* ignore */ }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.patch('/users/profile', { name, title, phone, linkedIn });
      updateUser({ ...user!, ...res.data });
      setMessage('Profile updated!');
    } catch { /* ignore */ }
  };

  const handleTypeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setPreferredTypes(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Preferences & Profile</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Profile</Typography>
          <Stack sx={{ gap: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
              <TextField fullWidth label="Name" value={name} onChange={e => setName(e.target.value)} />
              <TextField fullWidth label="Title" value={title} onChange={e => setTitle(e.target.value)} />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
              <TextField fullWidth label="Phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" />
              <TextField fullWidth label="LinkedIn URL" value={linkedIn} onChange={e => setLinkedIn(e.target.value)} />
            </Stack>
            <Button variant="contained" onClick={handleSaveProfile} sx={{ alignSelf: 'flex-start' }}>Save Profile</Button>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Notification Preferences</Typography>
          <Stack sx={{ gap: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
              <TextField select fullWidth label="Notification Frequency" value={notifFrequency} onChange={e => setNotifFrequency(e.target.value)}>
                {FREQUENCIES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Notification Mechanism" value={notifMechanism} onChange={e => setNotifMechanism(e.target.value)}>
                {MECHANISMS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Preferred Event Types</InputLabel>
              <Select multiple value={preferredTypes} onChange={handleTypeChange} input={<OutlinedInput label="Preferred Event Types" />}
                renderValue={(selected) => (
                  <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                    {selected.map(v => <Chip key={v} label={v} size="small" />)}
                  </Stack>
                )}>
                {EVENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSavePreferences} sx={{ alignSelf: 'flex-start' }}>Save Preferences</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
