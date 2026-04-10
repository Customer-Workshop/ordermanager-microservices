import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, Avatar, Chip, Button,
} from '@mui/material';
import {
  Dashboard, People, Work, Business, Assignment,
  Description, Assessment, Search, Settings,
} from '@mui/icons-material';

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <Dashboard fontSize="small" /> },
  { label: 'Requests', path: '/requests', icon: <Assignment fontSize="small" /> },
  { label: 'Candidates', path: '/candidates', icon: <People fontSize="small" /> },
  { label: 'Roles', path: '/roles', icon: <Work fontSize="small" /> },
  { label: 'Practice Units', path: '/practice-units', icon: <Business fontSize="small" /> },
  { label: 'Rubrics', path: '/rubrics', icon: <Assessment fontSize="small" /> },
  { label: 'SLA', path: '/sla', icon: <Description fontSize="small" /> },
  { label: 'AI Search', path: '/search', icon: <Search fontSize="small" /> },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f6f7' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH, boxSizing: 'border-box',
            bgcolor: '#00263e', color: '#b0bec5', border: 'none',
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: 1,
            background: 'linear-gradient(135deg, #00838f, #00acc1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 1,
          }}>FM</Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#ffffff', lineHeight: 1.2 }}>
              FM Portal
            </Typography>
            <Typography sx={{ fontSize: 10, color: '#78909c', lineHeight: 1.2 }}>
              Staffing & Onboarding
            </Typography>
          </Box>
        </Box>

        <List sx={{ px: 1, pt: 2, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1, mb: 0.25, py: 0.75,
                  bgcolor: active ? 'rgba(0,131,143,0.2)' : 'transparent',
                  color: active ? '#4dd0e1' : '#90a4ae',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#e0f7fa' },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 30 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 600 : 400 }} />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Chip label="Phase 1" size="small" sx={{ bgcolor: 'rgba(0,131,143,0.25)', color: '#4dd0e1', fontSize: 10, fontWeight: 600 }} />
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#ffffff', color: '#00263e', borderBottom: '1px solid #e0e3e6' }}>
          <Toolbar variant="dense" sx={{ minHeight: 48 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>AI-Enabled Staffing & Onboarding</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" size="small" startIcon={<Settings />}
              sx={{ mr: 1.5, borderColor: '#e0e3e6', color: '#00263e', fontSize: 12, '&:hover': { bgcolor: '#f5f6f7', borderColor: '#00838f' } }}>
              Admin
            </Button>
            <Avatar sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 700, bgcolor: '#00838f' }}>FM</Avatar>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2.5, flexGrow: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
