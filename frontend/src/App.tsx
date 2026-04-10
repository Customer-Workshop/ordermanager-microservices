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
    primary: { main: '#6c63ff' },
    background: { default: '#f8f9fc' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
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
