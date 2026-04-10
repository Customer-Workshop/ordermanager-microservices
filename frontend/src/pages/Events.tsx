import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Chip, Stack, Grid,
  TextField, MenuItem, InputAdornment,
} from '@mui/material';
import { Search, CalendarMonth, LocationOn, Person, Download } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import type { Event } from '../types';

const typeColors: Record<string, string> = {
  TECHNOLOGY: '#1976d2', DOMAIN: '#7b1fa2', HEALTH: '#388e3c',
  FUN: '#f57c00', PRODUCTS: '#d32f2f', OTHER: '#616161',
};
const EVENT_TYPES = ['ALL', 'TECHNOLOGY', 'DOMAIN', 'HEALTH', 'FUN', 'PRODUCTS', 'OTHER'];

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [view, setView] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (typeFilter !== 'ALL') params.type = typeFilter;
    if (view !== 'all') params.view = view;
    api.get('/events', { params }).then(r => setEvents(r.data)).catch(() => {});
  }, [search, typeFilter, view]);

  const handleRegister = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post(`/events/${eventId}/register`);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (view !== 'all') params.view = view;
      const r = await api.get('/events', { params });
      setEvents(r.data);
    } catch { /* ignore */ }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Discover Events</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2, mb: 3 }}>
        <TextField size="small" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
        <TextField select size="small" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} sx={{ minWidth: 150 }}>
          {EVENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField select size="small" value={view} onChange={e => setView(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">All Events</MenuItem>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week">This Week</MenuItem>
        </TextField>
      </Stack>
      <Grid container spacing={3}>
        {events.map(event => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s', height: '100%' }}
              onClick={() => navigate(`/events/${event.id}`)}>
              <CardContent>
                <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
                  <Chip label={event.eventType} size="small" sx={{ bgcolor: typeColors[event.eventType] || '#616161', color: 'white' }} />
                  <Chip label={`${event._count?.registrations || 0} registered`} size="small" variant="outlined" />
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{event.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {event.description}
                </Typography>
                <Stack sx={{ gap: 0.5 }}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2">{format(new Date(event.startDate), 'MMM dd, yyyy h:mm a')}</Typography>
                  </Stack>
                  {event.venue && (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">{event.venue}</Typography>
                    </Stack>
                  )}
                  {event.speaker && (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">{event.speaker.name}</Typography>
                    </Stack>
                  )}
                </Stack>
                <Stack direction="row" sx={{ gap: 1, mt: 2 }}>
                  <Button size="small" variant="contained" onClick={(e) => handleRegister(event.id, e)}>Register</Button>
                  <Button size="small" variant="outlined" startIcon={<Download />}
                    onClick={(e) => { e.stopPropagation(); window.open(`http://localhost:4000/api/calendar/event/${event.id}/ical`, '_blank'); }}>
                    iCal
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {events.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary' }}>No events found matching your criteria</Typography>
        </Card>
      )}
    </Box>
  );
}
