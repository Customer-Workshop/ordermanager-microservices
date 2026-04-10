import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Chip, Stack, Grid, Divider, List,
  ListItem, ListItemText, ListItemAvatar, Avatar,
} from '@mui/material';
import { CalendarMonth, LocationOn, Link as LinkIcon, Person, Download, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import type { Event } from '../types';
import { useAuth } from '../context/AuthContext';

const typeColors: Record<string, string> = {
  TECHNOLOGY: '#1976d2', DOMAIN: '#7b1fa2', HEALTH: '#388e3c',
  FUN: '#f57c00', PRODUCTS: '#d32f2f', OTHER: '#616161',
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/events/${id}`).then(r => {
      setEvent(r.data);
      setIsRegistered(r.data.registrations?.some((reg: { userId: string }) => reg.userId === user?.id) || false);
    }).catch(() => navigate('/events'));
  }, [id, user, navigate]);

  const handleRegister = async () => {
    if (!id) return;
    try {
      await api.post(`/events/${id}/register`);
      setIsRegistered(true);
      const r = await api.get(`/events/${id}`);
      setEvent(r.data);
    } catch { /* ignore */ }
  };

  const handleUnregister = async () => {
    if (!id) return;
    try {
      await api.delete(`/events/${id}/register`);
      setIsRegistered(false);
      const r = await api.get(`/events/${id}`);
      setEvent(r.data);
    } catch { /* ignore */ }
  };

  if (!event) return null;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/events')} sx={{ mb: 2 }}>Back to Events</Button>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
                <Chip label={event.eventType} sx={{ bgcolor: typeColors[event.eventType] || '#616161', color: 'white' }} />
                <Chip label={event.status} color={event.status === 'APPROVED' ? 'success' : 'warning'} />
                <Chip label={`${event._count?.registrations || event.registrations?.length || 0} registered`} variant="outlined" />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>{event.title}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>{event.description}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack sx={{ gap: 1.5 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                  <CalendarMonth color="action" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date & Time</Typography>
                    <Typography variant="body2">{format(new Date(event.startDate), 'MMMM dd, yyyy h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}</Typography>
                  </Box>
                </Stack>
                {event.venue && (
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Venue</Typography>
                      <Typography variant="body2">{event.venue}</Typography>
                    </Box>
                  </Stack>
                )}
                {event.bridgeLink && (
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                    <LinkIcon color="action" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Meeting Link</Typography>
                      <a href={event.bridgeLink} target="_blank" rel="noopener noreferrer">{event.bridgeLink}</a>
                    </Box>
                  </Stack>
                )}
                {event.speaker && (
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                    <Person color="action" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Speaker</Typography>
                      <Typography variant="body2">{event.speaker.name} - {event.speaker.title || event.speaker.email}</Typography>
                    </Box>
                  </Stack>
                )}
              </Stack>
              <Stack direction="row" sx={{ gap: 2, mt: 3 }}>
                {isRegistered ? (
                  <Button variant="outlined" color="error" onClick={handleUnregister}>Unregister</Button>
                ) : (
                  <Button variant="contained" onClick={handleRegister}>Register</Button>
                )}
                <Button variant="outlined" startIcon={<Download />}
                  onClick={() => window.open(`http://localhost:4000/api/calendar/event/${event.id}/ical`, '_blank')}>
                  Add to Calendar
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {event.sessions && event.sessions.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Sessions</Typography>
                <List>
                  {event.sessions.map((session, idx) => (
                    <ListItem key={session.id} divider={idx < event.sessions.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: typeColors[event.eventType] || '#616161' }}>{idx + 1}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 'bold' }}>{session.topic}</Typography>}
                        secondary={
                          <Stack>
                            <Typography variant="body2">{session.topicBrief}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')} | Speaker: {session.speakerName}
                              {session.speakerTitle && ` (${session.speakerTitle})`}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {event.groups && event.groups.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Target Groups</Typography>
                <Stack sx={{ gap: 1 }}>
                  {event.groups.map(eg => (
                    <Chip key={eg.id} label={eg.group.name} variant="outlined" />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
          {event.registrations && event.registrations.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Registered ({event.registrations.length})</Typography>
                <List dense>
                  {event.registrations.map(reg => (
                    <ListItem key={reg.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>{reg.user?.name?.charAt(0) || '?'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={reg.user?.name || 'Unknown'} secondary={reg.user?.email || ''} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
