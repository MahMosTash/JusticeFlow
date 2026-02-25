/**
 * Evidence detail page
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
  Button,
  Chip,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { evidenceService } from '@/services/evidenceService';
import { Evidence } from '@/types/api';
import { CardSkeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/dateUtils';

export const EvidenceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEvidence();
    }
  }, [id]);

  const loadEvidence = async () => {
    try {
      setIsLoading(true);
      const data = await evidenceService.getEvidenceById(parseInt(id!));
      setEvidence(data);
    } catch (err: any) {
      console.error('Failed to load evidence:', err);
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

  if (!evidence) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Evidence not found</Typography>
      </Container>
    );
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      witness_statement: 'info',
      biological: 'error',
      vehicle: 'warning',
      identification: 'primary',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(ROUTES.EVIDENCE)}>
          Back to Evidence
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {evidence.title}
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={evidence.evidence_type.replace('_', ' ')}
                  color={getTypeColor(evidence.evidence_type)}
                />
              </Box>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {evidence.description}
          </Typography>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Recorded By
              </Typography>
              <Typography variant="body1">
                {evidence.recorded_by?.full_name || evidence.recorded_by?.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Created Date
              </Typography>
              <Typography variant="body1">{formatDateTime(evidence.created_date)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Case
              </Typography>
              <Button
                variant="text"
                onClick={() => navigate(ROUTES.CASE_DETAIL(evidence.case))}
              >
                View Case #{evidence.case}
              </Button>
            </Grid>
          </Grid>

          {evidence.evidence_type === 'witness_statement' && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Witness Statement Details
              </Typography>
              {evidence.transcript && (
                <Typography variant="body2" paragraph>
                  <strong>Transcript:</strong> {evidence.transcript}
                </Typography>
              )}
              {evidence.witness_name && (
                <Typography variant="body2">
                  <strong>Witness:</strong> {evidence.witness_name}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

