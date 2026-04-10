import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Chip, Stack, Grid } from '@mui/material';
import { CalendarMonth, LocationOn, Download } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import type { Event } from '../types';

const typeColors: Record<string, string> = {
  TECHNOLOGY: '#1976d2', DOMAIN: '#7b1fa2', HEALTH: '#388e3c',
  FUN: '#f57c00', PRODUCTS: '#d32f2f', OTHER: '#616161',
};

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events/my-events').then(r => setEvents(r.data)).catch(() => {});
  }, []);

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>My Events</Typography>
        <Button variant="outlined" startIcon={<Download />}
          onClick={() => window.open('http://localhost:4000/api/calendar/my-events/ical', '_blank')}>
          Export All to Calendar
        </Button>
      </Stack>
      {events.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary' }}>No events yet. Browse events to register!</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/events')}>Browse Events</Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {events.map(event => (
            <Grid size={{ xs: 12, md: 6 }} key={event.id}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}
                onClick={() => navigate(`/events/${event.id}`)}>
                <CardContent>
                  <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
                    <Chip label={event.eventType} size="small" sx={{ bgcolor: typeColors[event.eventType] || '#616161', color: 'white' }} />
                    <Chip label={event.status} size="small" variant="outlined" color={event.status === 'APPROVED' ? 'success' : 'warning'} />
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{event.title}</Typography>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2">{format(new Date(event.startDate), 'MMM dd, yyyy h:mm a')}</Typography>
                  </Stack>
                  {event.venue && (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">{event.venue}</Typography>
                    </Stack>
                  )}
                  {event.sessions && event.sessions.length > 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                      {event.sessions.length} session{event.sessions.length > 1 ? 's' : ''}
                      {event.speaker ? ` | Speaker: ${event.speaker.name}` : ''}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
