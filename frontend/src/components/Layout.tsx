import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Divider, InputBase, Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, People, Work, Business, Assignment,
  Description, Assessment, Search, Security,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <Dashboard /> },
  { label: 'Staffing Requests', path: '/requests', icon: <Assignment /> },
  { label: 'Candidates', path: '/candidates', icon: <People /> },
  { label: 'Roles', path: '/roles', icon: <Work /> },
  { label: 'Practice Units', path: '/practice-units', icon: <Business /> },
  { label: 'Rubrics', path: '/rubrics', icon: <Assessment /> },
  { label: 'SLA Management', path: '/sla', icon: <Description /> },
  { label: 'Semantic Search', path: '/search', icon: <Search /> },
];

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1a1f36',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security sx={{ color: '#6c63ff', fontSize: 28 }} />
          <Typography variant="h6" noWrap sx={{ fontWeight: 700, fontSize: 16 }}>
            Staffing AI Portal
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List sx={{ px: 1, pt: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1.5, mb: 0.5,
                '&.Mui-selected': { bgcolor: 'rgba(108,99,255,0.2)', color: '#6c63ff' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', color: '#333', borderBottom: '1px solid #eee' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, px: 2, py: 0.5, display: 'flex', alignItems: 'center', width: 400 }}>
                <Search sx={{ color: '#999', mr: 1 }} />
                <InputBase placeholder="Search candidates, roles, requests..." sx={{ flex: 1, fontSize: 14 }} />
              </Box>
            </Box>
            <Avatar sx={{ bgcolor: '#6c63ff', width: 32, height: 32, fontSize: 14 }}>U</Avatar>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#f8f9fc' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
