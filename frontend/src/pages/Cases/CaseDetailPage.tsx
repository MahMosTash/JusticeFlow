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
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { caseService } from '@/services/caseService';
import { Case } from '@/types/api';
import { Loading } from '@/components/common/Loading';
import { CardSkeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatDateTime } from '@/utils/dateUtils';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(ROUTES.CASES)}>
          Back to Cases
        </Button>
      </Box>

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
                <Chip label={caseData.status} />
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
              <Typography variant="h6" gutterBottom>
                Evidence ({caseData.evidence_count || 0})
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate(`/evidence/create?case=${caseData.id}`)}
              >
                Add Evidence
              </Button>
            </Box>
          )}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Suspects ({caseData.suspects_count || 0})
              </Typography>
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

