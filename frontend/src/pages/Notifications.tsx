import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Stack, List, ListItem,
  ListItemText, ListItemIcon, Chip, IconButton,
} from '@mui/material';
import { Notifications as NotifIcon, MarkEmailRead, Circle } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import type { Notification } from '../types';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try { const res = await api.get('/notifications'); setNotifications(res.data); } catch { /* ignore */ }
  };

  const markRead = async (id: string) => { await api.patch(`/notifications/${id}/read`); fetchNotifications(); };
  const markAllRead = async () => { await api.patch('/notifications/read-all'); fetchNotifications(); };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
          {unreadCount > 0 && <Chip label={`${unreadCount} unread`} color="error" size="small" />}
        </Stack>
        {unreadCount > 0 && <Button startIcon={<MarkEmailRead />} onClick={markAllRead}>Mark All Read</Button>}
      </Stack>
      {notifications.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <NotifIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography sx={{ color: 'text.secondary' }}>No notifications yet</Typography>
        </Card>
      ) : (
        <Card>
          <List>
            {notifications.map((n, idx) => (
              <ListItem key={n.id} divider={idx < notifications.length - 1}
                sx={{ bgcolor: n.read ? 'transparent' : '#e3f2fd' }}
                secondaryAction={
                  !n.read ? <IconButton edge="end" onClick={() => markRead(n.id)} title="Mark as read"><MarkEmailRead /></IconButton> : undefined
                }>
                <ListItemIcon>
                  <Circle sx={{ fontSize: 12, color: n.read ? 'transparent' : '#1976d2' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: n.read ? 'normal' : 'bold' }}>{n.title}</Typography>}
                  secondary={
                    <Stack>
                      <Typography variant="body2">{n.message}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{format(new Date(n.createdAt), 'MMM dd, yyyy h:mm a')}</Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
