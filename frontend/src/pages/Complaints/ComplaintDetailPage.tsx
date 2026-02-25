/**
 * Complaint detail page
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
  Paper,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { complaintService } from '@/services/complaintService';
import { Complaint } from '@/types/api';
import { Loading } from '@/components/common/Loading';
import { CardSkeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = usePermissions();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadComplaint();
    }
  }, [id]);

  const loadComplaint = async () => {
    try {
      setIsLoading(true);
      const data = await complaintService.getComplaint(parseInt(id!));
      setComplaint(data);
    } catch (err: any) {
      console.error('Failed to load complaint:', err);
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

  if (!complaint) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Complaint not found</Typography>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
      case 'Permanently Rejected':
        return 'error';
      case 'Under Review':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(ROUTES.COMPLAINTS)}>
          Back to Complaints
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {complaint.title}
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={complaint.status}
                  color={getStatusColor(complaint.status)}
                />
                <Chip label={`Submission #${complaint.submission_count}`} />
              </Box>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {complaint.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Submitted By
              </Typography>
              <Typography variant="body1">
                {complaint.submitted_by?.full_name || complaint.submitted_by?.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Created Date
              </Typography>
              <Typography variant="body1">{formatDateTime(complaint.created_date)}</Typography>
            </Grid>
            {complaint.reviewed_by_intern && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Reviewed by Intern
                </Typography>
                <Typography variant="body1">
                  {complaint.reviewed_by_intern.full_name || complaint.reviewed_by_intern.username}
                </Typography>
              </Grid>
            )}
            {complaint.reviewed_by_officer && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Reviewed by Officer
                </Typography>
                <Typography variant="body1">
                  {complaint.reviewed_by_officer.full_name || complaint.reviewed_by_officer.username}
                </Typography>
              </Grid>
            )}
            {complaint.review_comments && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Review Comments
                </Typography>
                <Typography variant="body1">{complaint.review_comments}</Typography>
              </Grid>
            )}
            {complaint.case && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Related Case
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate(ROUTES.CASE_DETAIL(complaint.case!.id))}
                >
                  Case #{complaint.case.id}: {complaint.case.title}
                </Button>
              </Grid>
            )}
          </Grid>

          {complaint.reviews && complaint.reviews.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Review History
              </Typography>
              {complaint.reviews.map((review) => (
                <Paper key={review.id} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2">
                    {review.reviewer.full_name || review.reviewer.username} - {review.action}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(review.reviewed_at)}
                  </Typography>
                  {review.comments && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {review.comments}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

