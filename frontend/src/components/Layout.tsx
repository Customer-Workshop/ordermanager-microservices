import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Box, IconButton, Badge, Avatar, Menu, MenuItem, Divider, Chip,
} from '@mui/material';
import {
  Event as EventIcon, Dashboard, Campaign, Notifications, Settings,
  People, CalendarMonth, Mic, Menu as MenuIcon, Logout, Person,
  AdminPanelSettings, Groups,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DRAWER_WIDTH = 260;

const roleColors: Record<string, string> = {
  ADMIN: '#d32f2f',
  ORGANIZER: '#1976d2',
  GOVERNANCE: '#7b1fa2',
  SPEAKER: '#388e3c',
  AUDIENCE: '#f57c00',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications/unread-count').then(r => setUnreadCount(r.data.count)).catch(() => {});
    const interval = setInterval(() => {
      api.get('/notifications/unread-count').then(r => setUnreadCount(r.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { text: 'Events', icon: <EventIcon />, path: '/events', roles: ['ADMIN', 'ORGANIZER', 'GOVERNANCE', 'SPEAKER', 'AUDIENCE'] },
    { text: 'My Events', icon: <CalendarMonth />, path: '/my-events', roles: ['ADMIN', 'ORGANIZER', 'GOVERNANCE', 'SPEAKER', 'AUDIENCE'] },
    { text: 'Propose Event', icon: <Mic />, path: '/propose', roles: ['ADMIN', 'ORGANIZER', 'SPEAKER'] },
    { text: 'Pending Approvals', icon: <Dashboard />, path: '/pending', roles: ['ADMIN', 'ORGANIZER', 'GOVERNANCE'] },
    { text: 'Campaigns', icon: <Campaign />, path: '/campaigns', roles: ['ADMIN', 'ORGANIZER', 'GOVERNANCE'] },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications', roles: ['ADMIN', 'ORGANIZER', 'GOVERNANCE', 'SPEAKER', 'AUDIENCE'] },
    { text: 'Groups', icon: <Groups />, path: '/groups', roles: ['ADMIN', 'ORGANIZER'] },
    { text: 'Users', icon: <People />, path: '/users', roles: ['ADMIN'] },
    { text: 'Access Matrix', icon: <AdminPanelSettings />, path: '/access', roles: ['ADMIN'] },
    { text: 'App Config', icon: <Settings />, path: '/config', roles: ['ADMIN'] },
    { text: 'Audit Logs', icon: <Dashboard />, path: '/logs', roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EventIcon sx={{ color: '#1976d2', fontSize: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>EventHub</Typography>
      </Box>
      <Divider />
      <List>
        {filteredMenu.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{ mx: 1, borderRadius: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'white', color: 'text.primary' }} elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <EventIcon sx={{ color: '#1976d2', mr: 1, display: { xs: 'none', md: 'block' } }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
            EventHub
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }} />
          <Chip label={user?.role} size="small" sx={{ mr: 2, bgcolor: roleColors[user?.role || 'AUDIENCE'], color: 'white', fontWeight: 'bold' }} />
          <IconButton onClick={() => navigate('/notifications')}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: roleColors[user?.role || 'AUDIENCE'] }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Box>
                <Typography sx={{ fontWeight: 'bold' }}>{user?.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/preferences'); }}>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              Preferences
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate('/login'); }}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', mt: '64px' } }}
      >
        {drawer}
      </Drawer>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px', minHeight: 'calc(100vh - 64px)', bgcolor: '#f5f5f5' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
