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
} from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { caseService } from '@/services/caseService';
import { evidenceService } from '@/services/evidenceService';
import { suspectService } from '@/services/suspectService';
import { Case, Evidence, Suspect } from '@/types/api';
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

  useEffect(() => {
    if (id) {
      if (activeTab === 0) loadEvidence();
      if (activeTab === 1) loadSuspects();
    }
  }, [activeTab, id]);

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
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Evidence" />
          <Tab label="Suspects" />
          <Tab label="Complainants" />
          <Tab label="Witnesses" />
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
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

