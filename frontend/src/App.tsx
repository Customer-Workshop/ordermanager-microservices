import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import StaffingRequestsPage from './pages/StaffingRequestsPage';
import CandidatesPage from './pages/CandidatesPage';
import RolesPage from './pages/RolesPage';
import PracticeUnitsPage from './pages/PracticeUnitsPage';
import RubricsPage from './pages/RubricsPage';
import SLAPage from './pages/SLAPage';
import SearchPage from './pages/SearchPage';

const theme = createTheme({
  palette: {
    primary: { main: '#00263e' },
    secondary: { main: '#00838f' },
    background: { default: '#f5f6f7', paper: '#ffffff' },
    text: { primary: '#00263e', secondary: '#5a6872' },
    success: { main: '#2e8540' },
    warning: { main: '#e87722' },
    error: { main: '#d63e04' },
    info: { main: '#00838f' },
  },
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, fontSize: '1.5rem', color: '#00263e' },
    h5: { fontWeight: 700, fontSize: '1.2rem', color: '#00263e' },
    h6: { fontWeight: 600, fontSize: '1rem', color: '#00263e' },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e0e3e6',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 6, fontSize: '0.8125rem' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 2px 6px rgba(0,38,62,0.2)' } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: '0.75rem' },
        sizeSmall: { height: 22, fontSize: '0.7rem' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: '0.8125rem', padding: '8px 12px', borderColor: '#e0e3e6' },
        head: { fontWeight: 600, color: '#5a6872', backgroundColor: '#f5f6f7', fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/requests" element={<StaffingRequestsPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/practice-units" element={<PracticeUnitsPage />} />
            <Route path="/rubrics" element={<RubricsPage />} />
            <Route path="/sla" element={<SLAPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
