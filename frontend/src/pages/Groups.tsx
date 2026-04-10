import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, Stack, Grid,
  TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Add, Groups as GroupsIcon } from '@mui/icons-material';
import api from '../services/api';
import type { OrgGroup } from '../types';

const GROUP_TYPES = ['UNIT', 'LOCATION', 'INTEREST', 'SUBUNIT', 'ORG', 'GEO'];

export default function Groups() {
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('UNIT');

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try { const res = await api.get('/groups'); setGroups(res.data); } catch { /* ignore */ }
  };

  const handleCreate = async () => {
    try { await api.post('/groups', { name, type }); setOpen(false); setName(''); fetchGroups(); } catch { /* ignore */ }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Organization Groups</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>New Group</Button>
      </Stack>
      <Grid container spacing={3}>
        {groups.map(g => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={g.id}>
            <Card>
              <CardContent>
                <Stack direction="row" sx={{ gap: 1, mb: 1 }}>
                  <GroupsIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{g.name}</Typography>
                </Stack>
                <Chip label={g.type} size="small" sx={{ mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {g._count?.members || 0} members | {g._count?.events || 0} events
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Group</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 2, mt: 1 }}>
            <TextField fullWidth label="Group Name" value={name} onChange={e => setName(e.target.value)} required />
            <TextField select fullWidth label="Type" value={type} onChange={e => setType(e.target.value)}>
              {GROUP_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
