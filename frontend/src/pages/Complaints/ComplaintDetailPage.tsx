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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { complaintService } from '@/services/complaintService';
import { Complaint } from '@/types/api';
import { CardSkeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/dateUtils';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = usePermissions();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Action Dialog State
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'return' | 'forward' | 'approve' | 'reject' | 'resubmit' | ''>('');
  const [actionComments, setActionComments] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseSeverity, setCaseSeverity] = useState('Level 3');
  const [caseIncidentDate, setCaseIncidentDate] = useState('');
  const [caseIncidentTime, setCaseIncidentTime] = useState('');
  const [caseIncidentLocation, setCaseIncidentLocation] = useState('');

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

  const handleActionSubmit = async () => {
    if (!complaint || !actionType) return;

    try {
      setIsSubmittingAction(true);
      if (actionType === 'resubmit') {
        await complaintService.resubmitComplaint(complaint.id, { title: editTitle, description: editDescription });
      } else if (actionType === 'forward' || actionType === 'return') {
        await complaintService.reviewAsIntern(complaint.id, actionType, actionComments);
      } else if (actionType === 'approve') {
        await complaintService.reviewAsOfficer(complaint.id, actionType, actionComments, {
          case_title: caseTitle,
          case_description: caseDescription,
          case_severity: caseSeverity,
          case_incident_date: caseIncidentDate || undefined,
          case_incident_time: caseIncidentTime || undefined,
          case_incident_location: caseIncidentLocation || undefined,
        });
      } else if (actionType === 'reject') {
        await complaintService.reviewAsOfficer(complaint.id, actionType, actionComments);
      }
      setActionDialogOpen(false);
      setActionComments('');
      await loadComplaint(); // Refresh data
    } catch (err: any) {
      console.error('Failed to submit action:', err);
      // Ideally show an error toast here
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const openActionDialog = (type: 'return' | 'forward' | 'approve' | 'reject' | 'resubmit') => {
    setActionType(type);
    setActionComments('');
    if (type === 'resubmit' && complaint) {
      setEditTitle(complaint.title);
      setEditDescription(complaint.description);
    } else if (type === 'approve' && complaint) {
      setCaseTitle(complaint.title);
      setCaseDescription(complaint.description);
      setCaseSeverity('Level 3');
      setCaseIncidentDate('');
      setCaseIncidentTime('');
      setCaseIncidentLocation('');
    }
    setActionDialogOpen(true);
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
      case 'Returned':
        return 'warning';
      case 'Rejected':
      case 'Permanently Rejected':
        return 'error';
      case 'Under Review':
        return 'info';
      default:
        return 'default';
    }
  };

  const isAwaitingUser = complaint.status === 'Returned';

  const isAwaitingIntern = complaint.status === 'Pending' || complaint.status === 'Rejected';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(ROUTES.COMPLAINTS)}>
          Back to Complaints
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {user?.id === complaint.submitted_by?.id && isAwaitingUser && complaint.review_comments && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Action Required: Complaint Returned</AlertTitle>
              {complaint.review_comments}
            </Alert>
          )}

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

            {/* Workflow Action Buttons */}
            <Box display="flex" gap={1}>
              {permissions.isIntern() && isAwaitingIntern && (
                <>
                  <Button variant="outlined" color="error" onClick={() => openActionDialog('return')}>
                    Return to Complainant
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => openActionDialog('forward')}>
                    Forward to Officer
                  </Button>
                </>
              )}
              {permissions.isPoliceOfficer() && complaint.status === 'Under Review' && (
                <>
                  <Button variant="outlined" color="error" onClick={() => openActionDialog('reject')}>
                    Reject back to Intern
                  </Button>
                  <Button variant="contained" color="success" onClick={() => openActionDialog('approve')}>
                    Approve & Create Case
                  </Button>
                </>
              )}
              {user?.id === complaint.submitted_by?.id && isAwaitingUser && (
                <Button variant="contained" color="primary" onClick={() => openActionDialog('resubmit')}>
                  Edit & Resubmit
                </Button>
              )}
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
      <Dialog open={actionDialogOpen} onClose={() => !isSubmittingAction && setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'return' ? 'Return Complaint to User' : ''}
          {actionType === 'forward' ? 'Forward Complaint to Officer' : ''}
          {actionType === 'approve' ? 'Approve & Verify Case Creation' : ''}
          {actionType === 'reject' ? 'Reject Complaint back to Intern' : ''}
          {actionType === 'resubmit' ? 'Edit & Resubmit Complaint' : ''}
        </DialogTitle>
        <DialogContent>
          {actionType === 'resubmit' ? (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                type="text"
                fullWidth
                variant="outlined"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                sx={{ mb: 2, mt: 1 }}
              />
              <TextField
                margin="dense"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
            </>
          ) : actionType === 'approve' ? (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Case Title"
                type="text"
                fullWidth
                variant="outlined"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                required
                sx={{ mb: 2, mt: 1 }}
              />
              <TextField
                margin="dense"
                label="Case Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="severity-label">Case Severity</InputLabel>
                <Select
                  labelId="severity-label"
                  value={caseSeverity}
                  label="Case Severity"
                  onChange={(e) => setCaseSeverity(e.target.value as string)}
                >
                  <MenuItem value="Level 3">Level 3 - Minor crimes</MenuItem>
                  <MenuItem value="Level 2">Level 2 - Major crimes</MenuItem>
                  <MenuItem value="Level 1">Level 1 - Severe crimes</MenuItem>
                  <MenuItem value="Critical">Critical - Terrorism, etc.</MenuItem>
                </Select>
              </FormControl>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Incident Date"
                    InputLabelProps={{ shrink: true }}
                    value={caseIncidentDate}
                    onChange={(e) => setCaseIncidentDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Incident Time"
                    InputLabelProps={{ shrink: true }}
                    value={caseIncidentTime}
                    onChange={(e) => setCaseIncidentTime(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Incident Location"
                    value={caseIncidentLocation}
                    onChange={(e) => setCaseIncidentLocation(e.target.value)}
                  />
                </Grid>
              </Grid>
              <TextField
                margin="dense"
                id="comments"
                label="Review Comments (Optional)"
                type="text"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
              />
            </>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              id="comments"
              label="Review Comments (Required for Rejections)"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={actionComments}
              onChange={(e) => setActionComments(e.target.value)}
              required={actionType === 'return' || actionType === 'reject'}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)} disabled={isSubmittingAction}>
            Cancel
          </Button>
          <Button
            onClick={handleActionSubmit}
            color="primary"
            variant="contained"
            disabled={
              isSubmittingAction ||
              (actionType === 'return' && !actionComments.trim()) ||
              (actionType === 'reject' && !actionComments.trim()) ||
              (actionType === 'resubmit' && (!editTitle.trim() || !editDescription.trim())) ||
              (actionType === 'approve' && (!caseTitle.trim() || !caseDescription.trim()))
            }
          >
            {isSubmittingAction ? 'Submitting...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

