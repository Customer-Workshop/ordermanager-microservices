import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import MyEvents from './pages/MyEvents';
import ProposeEvent from './pages/ProposeEvent';
import PendingApprovals from './pages/PendingApprovals';
import Campaigns from './pages/Campaigns';
import Notifications from './pages/Notifications';
import Preferences from './pages/Preferences';
import Groups from './pages/Groups';
import Users from './pages/Users';
import AccessMatrix from './pages/AccessMatrix';
import AppConfig from './pages/AppConfig';
import AuditLogs from './pages/AuditLogs';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#7b1fa2' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/events" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/events" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/events" /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/events" />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="my-events" element={<MyEvents />} />
        <Route path="propose" element={<RoleRoute roles={['ADMIN', 'ORGANIZER', 'SPEAKER']}><ProposeEvent /></RoleRoute>} />
        <Route path="pending" element={<RoleRoute roles={['ADMIN', 'ORGANIZER', 'GOVERNANCE']}><PendingApprovals /></RoleRoute>} />
        <Route path="campaigns" element={<RoleRoute roles={['ADMIN', 'ORGANIZER', 'GOVERNANCE']}><Campaigns /></RoleRoute>} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="preferences" element={<Preferences />} />
        <Route path="groups" element={<RoleRoute roles={['ADMIN', 'ORGANIZER']}><Groups /></RoleRoute>} />
        <Route path="users" element={<RoleRoute roles={['ADMIN']}><Users /></RoleRoute>} />
        <Route path="access" element={<RoleRoute roles={['ADMIN']}><AccessMatrix /></RoleRoute>} />
        <Route path="config" element={<RoleRoute roles={['ADMIN']}><AppConfig /></RoleRoute>} />
        <Route path="logs" element={<RoleRoute roles={['ADMIN']}><AuditLogs /></RoleRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/events" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
