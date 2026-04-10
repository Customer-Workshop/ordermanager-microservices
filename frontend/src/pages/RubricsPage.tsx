import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import { Upload, Visibility, Close } from '@mui/icons-material';

const OCP_RUBRIC_HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Source Sans Pro',sans-serif;font-size:13px;color:#00263e;padding:16px}
h2{font-size:18px;font-weight:600;padding:1rem 0 .25rem;color:#00263e}
.sub{font-size:12px;color:#5a6872;margin-bottom:1rem}
.comp{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:1.25rem}
.comp-card{border:1px solid #e0e3e6;border-radius:8px;padding:10px 12px;background:#f5f6f7}
.comp-card .role-label{font-size:11px;color:#5a6872;margin-bottom:2px}
.comp-card .count{font-size:22px;font-weight:600;line-height:1;color:#00263e}
.comp-card .count-label{font-size:11px;color:#5a6872}
.tabs{display:flex;gap:4px;border-bottom:1px solid #e0e3e6;margin-bottom:0}
.tab{padding:8px 14px;font-size:12px;cursor:pointer;border:1px solid transparent;border-bottom:none;border-radius:6px 6px 0 0;color:#5a6872;background:transparent;white-space:nowrap}
.tab:hover:not(.active){background:#f5f6f7}
.tab.active{border-color:#e0e3e6;background:#fff;color:#00263e;font-weight:600;margin-bottom:-1px}
.role-brief{display:flex;gap:8px;padding:.75rem;background:#f5f6f7;border-radius:0 8px 8px 8px;margin-bottom:1rem;flex-wrap:wrap;border:1px solid #e0e3e6}
.brief-item{flex:1;min-width:170px}
.brief-item .label{font-size:11px;color:#5a6872;margin-bottom:2px}
.brief-item .val{font-size:13px;font-weight:600}
table{width:100%;border-collapse:collapse}
th{font-size:11px;font-weight:600;padding:7px 9px;border-bottom:1px solid #e0e3e6;background:#f5f6f7;color:#5a6872;text-align:left}
td{padding:7px 9px;border-bottom:1px solid #e0e3e6;font-size:12px;color:#5a6872;vertical-align:top}
td.skill-name{font-weight:600;color:#00263e}
.group-row td{font-weight:600;color:#00838f;background:#e0f7fa;font-size:11px;padding:5px 9px}
.min-tag{display:inline-block;font-size:9px;font-weight:700;color:#fff;background:#e87722;border-radius:3px;padding:1px 4px;margin-bottom:2px}
</style></head>
<body>
<h2>Virtual & OCP Hosting \u2013 Interview Rubric</h2>
<p class="sub">Team composition: 10 members across 4 roles. Weighted scoring with pass-band thresholds and auto-reject rules.</p>
<div class="comp">
<div class="comp-card"><div class="role-label">Platform Engineer</div><div class="count">4</div><div class="count-label">hires</div></div>
<div class="comp-card"><div class="role-label">Junior Platform Engineer</div><div class="count">2</div><div class="count-label">hires</div></div>
<div class="comp-card"><div class="role-label">Senior Product Engineer</div><div class="count">3</div><div class="count-label">hires</div></div>
<div class="comp-card"><div class="role-label">Product Owner</div><div class="count">1</div><div class="count-label">hires</div></div>
</div>
<table>
<thead><tr><th>Skill</th><th>Category</th><th>Weight</th><th>1 - Awareness</th><th>2 - Foundational</th><th>3 - Intermediate</th><th>4 - Advanced</th><th>5 - Expert</th></tr></thead>
<tbody>
<tr class="group-row"><td colspan="8">Core Platform</td></tr>
<tr><td class="skill-name">OpenShift Operations</td><td>Core Platform</td><td>1.20x</td><td>Aware of container orchestration concepts</td><td>Can deploy basic apps on OCP</td><td>Manages routes, builds, image streams confidently</td><td>Designs HA topologies; troubleshoots CRI-O / etcd</td><td>Architects multi-cluster with ACM; contributes operators</td></tr>
<tr><td class="skill-name">VMware vSphere</td><td>Core Platform</td><td>0.90x</td><td>Aware of vSphere UI</td><td>Creates VMs, snapshots, basic networking</td><td>Manages DRS, vMotion, storage policies</td><td>Designs multi-site; automates with PowerCLI / Terraform</td><td>Performance-tunes large fleets; deep integration with NSX-T</td></tr>
<tr class="group-row"><td colspan="8">Automation & Observability</td></tr>
<tr><td class="skill-name">Ansible / Automation</td><td>Automation</td><td>0.80x</td><td>Knows YAML basics</td><td>Writes simple playbooks with loops/conditionals</td><td>Creates roles; integrates with CI/CD pipelines</td><td>Designs Execution Environments; scales with AAP</td><td>Builds custom modules; designs org-wide framework</td></tr>
<tr><td class="skill-name">Monitoring & Observability</td><td>Observability</td><td>0.65x</td><td>Uses pre-built dashboards</td><td>Creates alerts; queries Prometheus</td><td>Builds Grafana dashboards; correlates metrics+logs</td><td>Designs SLO framework; custom exporters</td><td>Architects full-stack observability across hybrid</td></tr>
<tr class="group-row"><td colspan="8">Process & Ownership</td></tr>
<tr><td class="skill-name">Incident Mgmt & RCA</td><td>Process</td><td>1.10x</td><td>Follows runbooks</td><td>Triages Sev-2/3 with guidance</td><td>Leads Sev-2 bridges; writes blameless RCAs</td><td>Owns Sev-1 E2E; designs prevention patterns</td><td>Shapes org incident culture; mentors ICs</td></tr>
<tr><td class="skill-name">Product Mindset</td><td>Ownership</td><td>0.70x</td><td>Understands team goals</td><td>Prioritises own backlog</td><td>Writes user stories; balances tech-debt vs features</td><td>Defines roadmap milestones; stakeholder mgmt</td><td>Owns full P&L; drives SLO/SLA outcomes</td></tr>
</tbody>
</table>
</body></html>`;

const DEMO_RUBRICS = [
  { id: 1, name: 'Virtual & OCP Hosting Rubric', role: 'Platform Engineer', format: 'HTML', skills: 10, created: '2025-01-15', hasHtml: true },
  { id: 2, name: 'Data Analytics Rubric', role: 'Data Analyst', format: 'HTML', skills: 8, created: '2025-02-01', hasHtml: false },
  { id: 3, name: 'Cyber Security Rubric', role: 'Security Architect', format: 'HTML', skills: 12, created: '2025-02-10', hasHtml: false },
];

export default function RubricsPage() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<typeof DEMO_RUBRICS[0] | null>(null);

  const openPreview = (rubric: typeof DEMO_RUBRICS[0]) => {
    setSelectedRubric(rubric);
    setPreviewOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h4">Role Rubrics</Typography>
          <Typography sx={{ fontSize: 13, color: '#5a6872' }}>Upload HTML rubrics for interview scoring with weighted criteria</Typography>
        </Box>
        <Button variant="contained" component="label" startIcon={<Upload />}
          sx={{ bgcolor: '#00838f', '&:hover': { bgcolor: '#006b77' } }}>
          Upload Rubric
          <input type="file" hidden accept=".html,.htm" />
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rubric Name</TableCell><TableCell>Role</TableCell>
                  <TableCell>Format</TableCell><TableCell align="center">Skills</TableCell>
                  <TableCell>Created</TableCell><TableCell align="center">Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_RUBRICS.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{r.name}</TableCell>
                    <TableCell>{r.role}</TableCell>
                    <TableCell><Chip label={r.format} size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f', fontSize: 10 }} /></TableCell>
                    <TableCell align="center">{r.skills}</TableCell>
                    <TableCell sx={{ fontSize: 12, color: '#5a6872' }}>{r.created}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => openPreview(r)} sx={{ color: '#00838f' }}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, color: '#00263e' }}>
          {selectedRubric?.name || 'Rubric Preview'}
          <IconButton onClick={() => setPreviewOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRubric?.hasHtml ? (
            <Box sx={{ border: '1px solid #e0e3e6', borderRadius: 1, overflow: 'hidden' }}>
              <iframe
                srcDoc={OCP_RUBRIC_HTML}
                title="Rubric Preview"
                style={{ width: '100%', height: '600px', border: 'none' }}
                sandbox="allow-scripts"
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, color: '#5a6872' }}>
              <Typography>Rubric HTML not yet uploaded for this role.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
