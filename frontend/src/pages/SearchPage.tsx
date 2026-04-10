import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  List, ListItem, ListItemText, CircularProgress, InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { semanticSearch } from '../services/api';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  score: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await semanticSearch(query);
      setResults(res.data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>AI Semantic Search</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Use natural language to search across candidates, roles, staffing requests, and more.
        Powered by Claude AI with vector embeddings.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="e.g. Find candidates with OpenShift experience near Richardson TX..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><Search /></InputAdornment>
                  ),
                },
              }}
            />
            <Button variant="contained" onClick={handleSearch} disabled={loading}
              sx={{ bgcolor: '#6c63ff', '&:hover': { bgcolor: '#5a52e0' }, px: 4, whiteSpace: 'nowrap' }}>
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>
      )}

      {!loading && searched && (
        <Card>
          <CardContent>
            {results.length === 0 ? (
              <Typography color="text.secondary" align="center">
                No results found. Try a different query or ensure the AI service is configured.
              </Typography>
            ) : (
              <List>
                {results.map((r) => (
                  <ListItem key={r.id} divider>
                    <ListItemText
                      primary={`[${r.type}] ${r.title}`}
                      secondary={r.snippet}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
