import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip, CircularProgress,
} from '@mui/material';
import { Search } from '@mui/icons-material';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ type: string; title: string; snippet: string; score: number }>>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setTimeout(() => {
      setResults([
        { type: 'candidate', title: 'Search results will appear here', snippet: 'AI-powered semantic search across candidates, roles, requests, and knowledge base using Claude embeddings.', score: 0.95 },
      ]);
      setLoading(false);
    }, 800);
  };

  const TYPE_COLORS: Record<string, string> = {
    candidate: '#00838f', role: '#00263e', request: '#e87722', rubric: '#2e8540',
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>AI Semantic Search</Typography>
      <Typography sx={{ fontSize: 13, color: '#5a6872', mb: 2.5 }}>
        Search across candidates, roles, requests, and rubrics using natural language
      </Typography>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              fullWidth size="small" placeholder="e.g. 'Senior Java developer with AWS experience in Richardson'"
              value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
            />
            <Button variant="contained" startIcon={<Search />} onClick={handleSearch}
              sx={{ bgcolor: '#00838f', '&:hover': { bgcolor: '#006b77' }, whiteSpace: 'nowrap' }}>
              Search
            </Button>
          </Box>
          <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 11, color: '#5a6872', mr: 0.5 }}>Try:</Typography>
            {['OpenShift engineer', 'Data analyst Plano TX', 'Cyber security architect', 'Testing lead with automation'].map((s) => (
              <Chip key={s} label={s} size="small" variant="outlined" onClick={() => { setQuery(s); }}
                sx={{ fontSize: 10, cursor: 'pointer', '&:hover': { bgcolor: '#e0f7fa' } }} />
            ))}
          </Box>
        </CardContent>
      </Card>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: '#00838f' }} /></Box>}

      {!loading && searched && results.map((r, i) => (
        <Card key={i} sx={{ mb: 1.5 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip label={r.type} size="small" sx={{ bgcolor: `${TYPE_COLORS[r.type] || '#5a6872'}18`, color: TYPE_COLORS[r.type] || '#5a6872', fontWeight: 600, fontSize: 10 }} />
              <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{r.title}</Typography>
              <Typography sx={{ ml: 'auto', fontSize: 11, color: '#5a6872' }}>Score: {(r.score * 100).toFixed(0)}%</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: '#5a6872' }}>{r.snippet}</Typography>
          </CardContent>
        </Card>
      ))}

      {!loading && !searched && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Search sx={{ fontSize: 48, color: '#e0e3e6', mb: 1 }} />
            <Typography sx={{ color: '#5a6872', fontSize: 13 }}>Enter a search query to find candidates, roles, and more</Typography>
            <Typography sx={{ color: '#90a4ae', fontSize: 11, mt: 0.5 }}>Powered by Claude AI via Amazon Bedrock</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
