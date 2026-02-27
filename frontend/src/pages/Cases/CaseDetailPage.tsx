/**
 * Case detail page
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Paper,
  Alert,
  Slider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  LinearProgress,
  Avatar,
} from '@mui/material';
import { ArrowBack, CheckCircle, Gavel, HowToVote, PersonSearch, RecordVoiceOver } from '@mui/icons-material';
import { caseService } from '@/services/caseService';
import { evidenceService } from '@/services/evidenceService';
import { suspectService } from '@/services/suspectService';
import { investigationService } from '@/services/investigationService';
import { Case, Evidence, Suspect, GuiltScore, CaptainDecision } from '@/types/api';
import { CardSkeleton } from '@/components/common/Skeleton';
import { SuspectFormDialog } from '@/components/suspects/SuspectFormDialog';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { useAuth } from '@/hooks/useAuth';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [suspectsList, setSuspectsList] = useState<Suspect[]>([]);
  const [suspectsLoading, setSuspectsLoading] = useState(false);
  const [suspectDialogOpen, setSuspectDialogOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);

  // ── Interrogation tab state ──────────────────────────────────────────
  const [guiltScores, setGuiltScores] = useState<GuiltScore[]>([]);
  const [captainDecisions, setCaptainDecisions] = useState<CaptainDecision[]>([]);
  const [interrogationLoading, setInterrogationLoading] = useState(false);
  // Guilt score form (sergeant / detective)
  const [selectedSuspectId, setSelectedSuspectId] = useState<number | ''>('');
  const [guiltScoreValue, setGuiltScoreValue] = useState<number>(5);
  const [guiltJustification, setGuiltJustification] = useState('');
  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [scoreSuccess, setScoreSuccess] = useState(false);
  // Captain decision form
  const [captainSuspectId, setCaptainSuspectId] = useState<number | ''>('');
  const [captainDecision, setCaptainDecision] = useState<'Approve Arrest' | 'Reject' | 'Request More Evidence'>('Approve Arrest');
  const [captainComments, setCaptainComments] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [decisionSuccess, setDecisionSuccess] = useState(false);
  // Chief approval
  const [chiefApproving, setChiefApproving] = useState<number | null>(null);
  const [chiefError, setChiefError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCase();
    }
  }, [id]);

  const loadCase = async () => {
    try {
      setIsLoading(true);
      const data = await caseService.getCase(parseInt(id!));
      setCaseData(data);
    } catch (err: any) {
      console.error('Failed to load case:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvidence = async () => {
    try {
      setEvidenceLoading(true);
      const response = await evidenceService.getEvidence({ case: parseInt(id!) });
      setEvidenceList(response.results);
    } catch (err: any) {
      console.error('Failed to load evidence:', err);
    } finally {
      setEvidenceLoading(false);
    }
  };

  const loadSuspects = async () => {
    try {
      setSuspectsLoading(true);
      const response = await suspectService.getSuspects({ case: parseInt(id!) });
      setSuspectsList(response.results);
    } catch (err: any) {
      console.error('Failed to load suspects:', err);
    } finally {
      setSuspectsLoading(false);
    }
  };

  const loadInterrogationData = async () => {
    try {
      setInterrogationLoading(true);
      const caseIdNum = parseInt(id!);
      const [scoresRes, decisionsRes, suspectsRes] = await Promise.all([
        investigationService.getGuiltScores({ case: caseIdNum }),
        investigationService.getCaptainDecisions({ case: caseIdNum }),
        suspectService.getSuspects({ case: caseIdNum }),
      ]);
      setGuiltScores(scoresRes.results);
      setCaptainDecisions(decisionsRes.results);
      setSuspectsList(suspectsRes.results);
    } catch (err: any) {
      console.error('Failed to load interrogation data:', err);
    } finally {
      setInterrogationLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      if (activeTab === 0) loadEvidence();
      if (activeTab === 1) loadSuspects();
      if (activeTab === 4) loadInterrogationData();
    }
  }, [activeTab, id]);

  const handleSubmitGuiltScore = async () => {
    if (!selectedSuspectId) return;
    setScoreError(null);
    setScoreSuccess(false);
    setScoreSubmitting(true);
    try {
      const newScore = await investigationService.createGuiltScore({
        suspect: selectedSuspectId as number,
        case: parseInt(id!),
        score: guiltScoreValue,
        justification: guiltJustification,
      });
      setGuiltScores((prev) => [newScore, ...prev]);
      setScoreSuccess(true);
      setGuiltJustification('');
      setGuiltScoreValue(5);
      setSelectedSuspectId('');
    } catch (err: any) {
      const msg = err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.score?.[0] ||
        'Failed to submit guilt score.';
      setScoreError(msg);
    } finally {
      setScoreSubmitting(false);
    }
  };

  const handleSubmitCaptainDecision = async () => {
    if (!captainSuspectId) return;
    setDecisionError(null);
    setDecisionSuccess(false);
    setDecisionSubmitting(true);
    try {
      const newDecision = await investigationService.createCaptainDecision({
        case: parseInt(id!),
        suspect: captainSuspectId as number,
        decision: captainDecision,
        comments: captainComments,
      });
      setCaptainDecisions((prev) => [newDecision, ...prev]);
      setDecisionSuccess(true);
      setCaptainComments('');
      setCaptainSuspectId('');
    } catch (err: any) {
      setDecisionError('Failed to submit decision.');
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const handleChiefApproval = async (decisionId: number, approval: boolean) => {
    setChiefApproving(decisionId);
    setChiefError(null);
    try {
      const updated = await investigationService.approveChiefDecision(decisionId, approval);
      setCaptainDecisions((prev) => prev.map((d) => d.id === decisionId ? updated : d));
    } catch (err: any) {
      setChiefError('Failed to submit approval.');
    } finally {
      setChiefApproving(null);
    }
  };

  const handleSuspectAdded = (suspect: Suspect) => {
    setSuspectsList((prev) => [suspect, ...prev]);
    if (caseData) {
      setCaseData({ ...caseData, suspects_count: (caseData.suspects_count || 0) + 1 });
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CardSkeleton />
      </Container>
    );
  }

  if (!caseData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Case not found</Typography>
      </Container>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'error';
      case 'Level 1':
        return 'warning';
      case 'Level 2':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (caseStatus: string) => {
    switch (caseStatus) {
      case 'Pending':
        return 'warning';
      case 'Resolved':
        return 'success';
      case 'Closed':
        return 'default';
      case 'Under Investigation':
        return 'info';
      default:
        return 'primary';
    }
  };

  const handleApprove = async () => {
    if (!caseData) return;
    try {
      setApproving(true);
      const updated = await caseService.approveCase(caseData.id);
      setCaseData(updated);
      setApproveSuccess(true);
    } catch (err: any) {
      console.error('Failed to approve case:', err);
    } finally {
      setApproving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(ROUTES.CASES)}>
          Back to Cases
        </Button>
        {caseData.status === 'Pending' && hasRole('Police Chief') && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={handleApprove}
            disabled={approving}
          >
            {approving ? 'Approving...' : 'Approve Case'}
          </Button>
        )}
      </Box>

      {approveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setApproveSuccess(false)}>
          Case approved successfully!
        </Alert>
      )}

      {caseData.status === 'Pending' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This case is pending approval by the Police Chief.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {caseData.title}
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={caseData.severity}
                  color={getSeverityColor(caseData.severity)}
                />
                <Chip label={caseData.status} color={getStatusColor(caseData.status)} />
              </Box>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {caseData.description}
          </Typography>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Created By
              </Typography>
              <Typography variant="body1">
                {caseData.created_by?.full_name || caseData.created_by?.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Created Date
              </Typography>
              <Typography variant="body1">{formatDateTime(caseData.created_date)}</Typography>
            </Grid>
            {caseData.assigned_detective && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Assigned Detective
                </Typography>
                <Typography variant="body1">
                  {caseData.assigned_detective.full_name || caseData.assigned_detective.username}
                </Typography>
              </Grid>
            )}
            {caseData.assigned_sergeant && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Assigned Sergeant
                </Typography>
                <Typography variant="body1">
                  {caseData.assigned_sergeant.full_name || caseData.assigned_sergeant.username}
                </Typography>
              </Grid>
            )}
            {caseData.incident_date && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Incident Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(caseData.incident_date)}
                  {caseData.incident_time && ` at ${caseData.incident_time}`}
                </Typography>
              </Grid>
            )}
            {caseData.incident_location && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Incident Location
                </Typography>
                <Typography variant="body1">{caseData.incident_location}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Paper>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label="Evidence" />
          <Tab label="Suspects" />
          <Tab label="Complainants" />
          <Tab label="Witnesses" />
          <Tab label="Interrogation" icon={<PersonSearch fontSize="small" />} iconPosition="start" />
        </Tabs>

        <Box p={3}>
          {activeTab === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Evidence ({caseData.evidence_count || 0})
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`${ROUTES.EVIDENCE}?case=${caseData.id}`)}
                  >
                    View All Evidence
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/evidence/create?case=${caseData.id}`)}
                  >
                    Add Evidence
                  </Button>
                </Box>
              </Box>
              {evidenceLoading ? (
                <CardSkeleton />
              ) : evidenceList.length === 0 ? (
                <Typography color="text.secondary">No evidence recorded yet.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {evidenceList.map((item) => (
                    <Grid item xs={12} sm={6} key={item.id}>
                      <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                        onClick={() => navigate(ROUTES.EVIDENCE_DETAIL(item.id))}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {item.title}
                            </Typography>
                            <Chip
                              label={item.evidence_type.replace('_', ' ')}
                              size="small"
                              color={
                                item.evidence_type === 'witness_statement' ? 'info' :
                                  item.evidence_type === 'biological' ? 'error' :
                                    item.evidence_type === 'vehicle' ? 'warning' :
                                      item.evidence_type === 'identification' ? 'primary' : 'default'
                              }
                            />
                          </Box>
                          {item.description && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {item.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Recorded: {formatDate(item.created_date)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
          {activeTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Suspects ({caseData.suspects_count || 0})
                </Typography>
                {(hasRole('Detective') || hasRole('Sergeant')) && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setSuspectDialogOpen(true)}
                  >
                    Add Suspect
                  </Button>
                )}
              </Box>

              {suspectsLoading ? (
                <CardSkeleton />
              ) : suspectsList.length === 0 ? (
                <Typography color="text.secondary">No suspects recorded yet.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {suspectsList.map((suspect) => (
                    <Grid item xs={12} sm={6} key={suspect.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {suspect.name}
                            </Typography>
                            <Chip
                              label={suspect.status}
                              size="small"
                              color={
                                suspect.status === 'Arrested' ? 'error' :
                                  suspect.status === 'Cleared' ? 'success' :
                                    suspect.status === 'Under Severe Surveillance' ? 'warning' : 'info'
                              }
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            National ID: {suspect.national_id}
                          </Typography>
                          {suspect.phone_number && (
                            <Typography variant="body2" color="text.secondary">
                              Phone: {suspect.phone_number}
                            </Typography>
                          )}
                          {suspect.notes && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {suspect.notes}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Added: {formatDate(suspect.created_date)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              <SuspectFormDialog
                open={suspectDialogOpen}
                onClose={() => setSuspectDialogOpen(false)}
                caseId={caseData.id}
                onSuspectAdded={handleSuspectAdded}
              />
            </Box>
          )}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Complainants ({caseData.complainants?.length || 0})
              </Typography>
            </Box>
          )}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Witnesses ({caseData.witnesses?.length || 0})
              </Typography>

              {!caseData.witnesses || caseData.witnesses.length === 0 ? (
                <Alert severity="info">No witnesses registered for this case yet. Submit a 'Witness Statement' evidence to add a witness.</Alert>
              ) : (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {caseData.witnesses.map((w) => (
                    <Grid item xs={12} sm={6} md={4} key={w.id}>
                      <Card variant="outlined" sx={{ height: '100%', position: 'relative' }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                <RecordVoiceOver fontSize="small" />
                              </Avatar>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {w.witness_name || w.witness?.full_name || 'Anonymous Witness'}
                              </Typography>
                            </Box>
                            {w.witness && (
                              <Chip label="User" size="small" color="primary" variant="outlined" />
                            )}
                          </Box>

                          <Typography variant="body2" color="text.secondary">
                            National ID: {w.witness_national_id || w.witness?.national_id || 'N/A'}
                          </Typography>

                          {(w.witness_phone || w.witness?.phone_number) && (
                            <Typography variant="body2" color="text.secondary">
                              Phone: {w.witness_phone || w.witness?.phone_number}
                            </Typography>
                          )}

                          {w.notes && (
                            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                              {w.notes}
                            </Typography>
                          )}

                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Added: {formatDate(w.added_date)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* ═══════════════════════════════════════════════════════════
              INTERROGATION TAB (tab index 4)
              Role-based panels:
                • Sergeant / Detective → Submit guilt score
                • Captain             → Make a decision
                • Police Chief        → Approve critical decisions
                • Everyone            → Read-only scores & decisions
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 4 && (
            <Box>
              {interrogationLoading && <LinearProgress sx={{ mb: 2 }} />}

              {/* ── 1. Guilt Score Form (Sergeant / Detective) ─────── */}
              {(hasRole('Sergeant') || hasRole('Detective')) && (
                <Card variant="outlined" sx={{ mb: 3, border: '1px solid', borderColor: 'warning.main' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PersonSearch color="warning" />
                      <Typography variant="h6">Submit Guilt Score</Typography>
                    </Box>

                    {scoreSuccess && (
                      <Alert severity="success" sx={{ mb: 2 }} onClose={() => setScoreSuccess(false)}>
                        Guilt score submitted successfully!
                      </Alert>
                    )}
                    {scoreError && (
                      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setScoreError(null)}>
                        {scoreError}
                      </Alert>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Arrested Suspect</InputLabel>
                          <Select
                            id="guilt-score-suspect"
                            value={selectedSuspectId}
                            label="Arrested Suspect"
                            onChange={(e) => setSelectedSuspectId(e.target.value as number)}
                          >
                            {suspectsList.length === 0 && (
                              <MenuItem disabled>No suspects in this case yet</MenuItem>
                            )}
                            {suspectsList.map((s) => (
                              <MenuItem key={s.id} value={s.id}>
                                {s.name || `Suspect #${s.id}`}
                                <Chip label={s.status} size="small" sx={{ ml: 1 }}
                                  color={s.status === 'Arrested' ? 'error' : s.status === 'Cleared' ? 'success' : 'default'}
                                />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={8}>
                        <Typography variant="body2" gutterBottom>
                          Guilt Score: <strong>{guiltScoreValue} / 10</strong>
                        </Typography>
                        <Slider
                          id="guilt-score-slider"
                          value={guiltScoreValue}
                          min={1}
                          max={10}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                          onChange={(_, v) => setGuiltScoreValue(v as number)}
                          color="warning"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          id="guilt-score-justification"
                          label="Justification"
                          multiline
                          rows={3}
                          fullWidth
                          value={guiltJustification}
                          onChange={(e) => setGuiltJustification(e.target.value)}
                          placeholder="Describe the observations and evidence supporting this score..."
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="warning"
                          disabled={!selectedSuspectId || !guiltJustification.trim() || scoreSubmitting}
                          onClick={handleSubmitGuiltScore}
                        >
                          {scoreSubmitting ? 'Submitting...' : 'Submit Score'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* ── 2. All Submitted Guilt Scores (read-only) ─────── */}
              <Typography variant="h6" gutterBottom>
                Guilt Scores ({guiltScores.length})
              </Typography>
              {guiltScores.length === 0 ? (
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  No guilt scores submitted yet.
                </Typography>
              ) : (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {guiltScores.map((gs) => (
                    <Grid item xs={12} sm={6} key={gs.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2">
                              {(gs.assigned_by as any)?.full_name || (gs.assigned_by as any)?.username}
                            </Typography>
                            <Chip
                              label={`${gs.score} / 10`}
                              color={gs.score >= 7 ? 'error' : gs.score >= 4 ? 'warning' : 'success'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">{gs.justification}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {formatDateTime(gs.assigned_date)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              <Divider sx={{ my: 2 }} />

              {/* ── 3. Captain Decision Form ───────────────────────── */}
              {hasRole('Captain') && (
                <Card variant="outlined" sx={{ mb: 3, border: '1px solid', borderColor: 'primary.main' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Gavel color="primary" />
                      <Typography variant="h6">Make Captain Decision</Typography>
                    </Box>

                    {decisionSuccess && (
                      <Alert severity="success" sx={{ mb: 2 }} onClose={() => setDecisionSuccess(false)}>
                        Decision recorded successfully!
                      </Alert>
                    )}
                    {decisionError && (
                      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDecisionError(null)}>
                        {decisionError}
                      </Alert>
                    )}

                    {guiltScores.length < 2 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Waiting for scores from both Sergeant and Detective before making a decision.
                      </Alert>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Suspect</InputLabel>
                          <Select
                            id="captain-decision-suspect"
                            value={captainSuspectId}
                            label="Suspect"
                            onChange={(e) => setCaptainSuspectId(e.target.value as number)}
                          >
                            {suspectsList.length === 0 && (
                              <MenuItem disabled>No suspects in this case yet</MenuItem>
                            )}
                            {suspectsList.map((s) => (
                              <MenuItem key={s.id} value={s.id}>
                                {s.name || `Suspect #${s.id}`}
                                <Chip label={s.status} size="small" sx={{ ml: 1 }}
                                  color={s.status === 'Arrested' ? 'error' : s.status === 'Cleared' ? 'success' : 'default'}
                                />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Decision</InputLabel>
                          <Select
                            id="captain-decision-type"
                            value={captainDecision}
                            label="Decision"
                            onChange={(e) => setCaptainDecision(e.target.value as any)}
                          >
                            <MenuItem value="Approve Arrest">Approve Arrest</MenuItem>
                            <MenuItem value="Reject">Reject</MenuItem>
                            <MenuItem value="Request More Evidence">Request More Evidence</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          id="captain-decision-comments"
                          label="Comments"
                          multiline
                          rows={3}
                          fullWidth
                          value={captainComments}
                          onChange={(e) => setCaptainComments(e.target.value)}
                          placeholder="Summarise the evidence, statements, and guilt scores that inform this decision..."
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Gavel />}
                          disabled={!captainSuspectId || !captainComments.trim() || decisionSubmitting}
                          onClick={handleSubmitCaptainDecision}
                        >
                          {decisionSubmitting ? 'Submitting...' : 'Record Decision'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* ── 4. Captain Decisions List ─────────────────────── */}
              <Typography variant="h6" gutterBottom>
                Captain Decisions ({captainDecisions.length})
              </Typography>
              {captainDecisions.length === 0 ? (
                <Typography color="text.secondary" sx={{ mb: 3 }}>No decisions recorded yet.</Typography>
              ) : (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {captainDecisions.map((dec) => (
                    <Grid item xs={12} key={dec.id}>
                      <Card variant="outlined" sx={{
                        borderColor: dec.decision === 'Approve Arrest' ? 'success.main' :
                          dec.decision === 'Reject' ? 'error.main' : 'warning.main'
                      }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box>
                              <Chip
                                label={dec.decision}
                                color={dec.decision === 'Approve Arrest' ? 'success' : dec.decision === 'Reject' ? 'error' : 'warning'}
                                sx={{ mr: 1 }}
                              />
                              {dec.requires_chief_approval && (
                                <Chip
                                  label={dec.chief_approval === null ? '⏳ Awaiting Chief' : dec.chief_approval ? '✅ Chief Approved' : '❌ Chief Rejected'}
                                  color={dec.chief_approval === null ? 'default' : dec.chief_approval ? 'success' : 'error'}
                                  size="small"
                                />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(dec.decided_at)}
                            </Typography>
                          </Box>
                          {dec.comments && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{dec.comments}</Typography>
                          )}

                          {/* Police Chief approval buttons */}
                          {hasRole('Police Chief') && dec.requires_chief_approval && dec.chief_approval === null && (
                            <Box display="flex" gap={1} mt={1}>
                              <Button
                                id={`chief-approve-${dec.id}`}
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<HowToVote />}
                                disabled={chiefApproving === dec.id}
                                onClick={() => handleChiefApproval(dec.id, true)}
                              >
                                Approve
                              </Button>
                              <Button
                                id={`chief-reject-${dec.id}`}
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={chiefApproving === dec.id}
                                onClick={() => handleChiefApproval(dec.id, false)}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              {chiefError && <Alert severity="error">{chiefError}</Alert>}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

