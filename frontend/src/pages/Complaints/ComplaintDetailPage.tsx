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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--gradient-page-bg)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--radial-glow-combined)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(ROUTES.COMPLAINTS)}
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--accent-primary)',
                background: 'var(--accent-primary-light)',
              },
            }}
          >
            Back to Complaints
          </Button>
        </Box>

        <Card
          className="glass-effect"
          sx={{
            mb: 3,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {user?.id === complaint.submitted_by?.id && isAwaitingUser && complaint.review_comments && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>Action Required: Complaint Returned</AlertTitle>
                {complaint.review_comments}
              </Alert>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2} flexWrap="wrap" gap={2}>
              <Box>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: 'var(--heading-h1-size)',
                    fontWeight: 'var(--heading-h1-weight)',
                    color: 'var(--text-primary)',
                    mb: 2,
                  }}
                >
                  {complaint.title}
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={complaint.status}
                    color={getStatusColor(complaint.status)}
                    sx={{
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--label-base-size)',
                    }}
                  />
                  <Chip
                    label={`Submission #${complaint.submission_count}`}
                    sx={{
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--label-base-size)',
                    }}
                  />
                </Box>
              </Box>

              {/* Workflow Action Buttons */}
              <Box display="flex" gap={1} flexWrap="wrap">
                {permissions.isIntern() && isAwaitingIntern && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => openActionDialog('return')}
                      sx={{
                        borderColor: 'var(--accent-error)',
                        color: 'var(--accent-error)',
                        '&:hover': {
                          borderColor: 'var(--accent-error)',
                          background: 'var(--error-bg)',
                        },
                      }}
                    >
                      Return to Complainant
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => openActionDialog('forward')}
                      sx={{
                        background: 'var(--gradient-accent)',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--button-shadow)',
                        '&:hover': {
                          background: 'var(--gradient-accent-hover)',
                          boxShadow: 'var(--button-shadow-hover)',
                        },
                      }}
                    >
                      Forward to Officer
                    </Button>
                  </>
                )}
                {permissions.isPoliceOfficer() && complaint.status === 'Under Review' && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => openActionDialog('reject')}
                      sx={{
                        borderColor: 'var(--accent-error)',
                        color: 'var(--accent-error)',
                        '&:hover': {
                          borderColor: 'var(--accent-error)',
                          background: 'var(--error-bg)',
                        },
                      }}
                    >
                      Reject back to Intern
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => openActionDialog('approve')}
                      sx={{
                        background: 'var(--gradient-accent)',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--button-shadow)',
                        '&:hover': {
                          background: 'var(--gradient-accent-hover)',
                          boxShadow: 'var(--button-shadow-hover)',
                        },
                      }}
                    >
                      Approve & Create Case
                    </Button>
                  </>
                )}
                {user?.id === complaint.submitted_by?.id && isAwaitingUser && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => openActionDialog('resubmit')}
                    sx={{
                      background: 'var(--gradient-accent)',
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--button-shadow)',
                      '&:hover': {
                        background: 'var(--gradient-accent-hover)',
                        boxShadow: 'var(--button-shadow-hover)',
                      },
                    }}
                  >
                    Edit & Resubmit
                  </Button>
                )}
              </Box>
            </Box>

            <Typography
              variant="body1"
              paragraph
              sx={{
                fontSize: 'var(--body-large-size)',
                color: 'var(--text-primary)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {complaint.description}
            </Typography>

            <Divider sx={{ my: 2, borderColor: 'var(--glass-border)' }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 'var(--label-base-size)',
                    color: 'var(--text-secondary)',
                    mb: 0.5,
                  }}
                >
                  Submitted By
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: 'var(--body-base-size)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {complaint.submitted_by?.full_name || complaint.submitted_by?.username}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 'var(--label-base-size)',
                    color: 'var(--text-secondary)',
                    mb: 0.5,
                  }}
                >
                  Created Date
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: 'var(--body-base-size)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {formatDateTime(complaint.created_date)}
                </Typography>
              </Grid>
              {complaint.reviewed_by_intern && (
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 'var(--label-base-size)',
                      color: 'var(--text-secondary)',
                      mb: 0.5,
                    }}
                  >
                    Reviewed by Intern
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: 'var(--body-base-size)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {complaint.reviewed_by_intern.full_name || complaint.reviewed_by_intern.username}
                  </Typography>
                </Grid>
              )}
              {complaint.reviewed_by_officer && (
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 'var(--label-base-size)',
                      color: 'var(--text-secondary)',
                      mb: 0.5,
                    }}
                  >
                    Reviewed by Officer
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: 'var(--body-base-size)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {complaint.reviewed_by_officer.full_name || complaint.reviewed_by_officer.username}
                  </Typography>
                </Grid>
              )}
              {complaint.review_comments && (
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 'var(--label-base-size)',
                      color: 'var(--text-secondary)',
                      mb: 0.5,
                    }}
                  >
                    Review Comments
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: 'var(--body-base-size)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {complaint.review_comments}
                  </Typography>
                </Grid>
              )}
              {complaint.case && (
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 'var(--label-base-size)',
                      color: 'var(--text-secondary)',
                      mb: 0.5,
                    }}
                  >
                    Related Case
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => navigate(ROUTES.CASE_DETAIL(complaint.case!.id))}
                    sx={{
                      color: 'var(--accent-primary)',
                      '&:hover': {
                        background: 'var(--accent-primary-light)',
                      },
                    }}
                  >
                    Case #{complaint.case.id}: {complaint.case.title}
                  </Button>
                </Grid>
              )}
            </Grid>

            {complaint.reviews && complaint.reviews.length > 0 && (
              <Box mt={3}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 'var(--heading-h3-size)',
                    fontWeight: 'var(--heading-h3-weight)',
                    color: 'var(--text-primary)',
                    mb: 2,
                  }}
                >
                  Review History
                </Typography>
                {complaint.reviews.map((review) => (
                  <Paper
                    key={review.id}
                    className="glass-effect"
                    sx={{
                      p: 2,
                      mb: 2,
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: 'var(--heading-h5-size)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {review.reviewer.full_name || review.reviewer.username} - {review.action}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--body-base-size)',
                        mt: 0.5,
                      }}
                    >
                      {formatDateTime(review.reviewed_at)}
                    </Typography>
                    {review.comments && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'var(--text-primary)',
                          fontSize: 'var(--body-base-size)',
                          mt: 1,
                        }}
                      >
                        {review.comments}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      <Dialog
        open={actionDialogOpen}
        onClose={() => !isSubmittingAction && setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: 'var(--heading-h3-size)',
            fontWeight: 'var(--heading-h3-weight)',
            color: 'var(--text-primary)',
            borderBottom: '1px solid var(--glass-border)',
          }}
        >
          {actionType === 'return' ? 'Return Complaint to User' : ''}
          {actionType === 'forward' ? 'Forward Complaint to Officer' : ''}
          {actionType === 'approve' ? 'Approve & Verify Case Creation' : ''}
          {actionType === 'reject' ? 'Reject Complaint back to Intern' : ''}
          {actionType === 'resubmit' ? 'Edit & Resubmit Complaint' : ''}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
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
                sx={{
                  mb: 2,
                  mt: 1,
                  '& .MuiOutlinedInput-root': {
                    background: 'var(--input-bg)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--glass-border)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--accent-primary)',
                      boxShadow: 'var(--shadow-glow)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    '&.Mui-focused': {
                      color: 'var(--accent-primary)',
                    },
                  },
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'var(--input-bg)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--glass-border)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--accent-primary)',
                      boxShadow: 'var(--shadow-glow)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    '&.Mui-focused': {
                      color: 'var(--accent-primary)',
                    },
                  },
                }}
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
                sx={{
                  mb: 2,
                  mt: 1,
                  '& .MuiOutlinedInput-root': {
                    background: 'var(--input-bg)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--glass-border)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--accent-primary)',
                      boxShadow: 'var(--shadow-glow)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    '&.Mui-focused': {
                      color: 'var(--accent-primary)',
                    },
                  },
                }}
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
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    background: 'var(--input-bg)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--glass-border)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--accent-primary)',
                      boxShadow: 'var(--shadow-glow)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    '&.Mui-focused': {
                      color: 'var(--accent-primary)',
                    },
                  },
                }}
              />
              <FormControl
                fullWidth
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    background: 'var(--input-bg)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--glass-border)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--accent-primary)',
                      boxShadow: 'var(--shadow-glow)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    '&.Mui-focused': {
                      color: 'var(--accent-primary)',
                    },
                  },
                }}
              >
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'var(--input-bg)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        '& fieldset': {
                          borderColor: 'var(--glass-border)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--accent-primary)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--accent-primary)',
                          boxShadow: 'var(--shadow-glow)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'var(--text-secondary)',
                        '&.Mui-focused': {
                          color: 'var(--accent-primary)',
                        },
                      },
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'var(--input-bg)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        '& fieldset': {
                          borderColor: 'var(--glass-border)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--accent-primary)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--accent-primary)',
                          boxShadow: 'var(--shadow-glow)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'var(--text-secondary)',
                        '&.Mui-focused': {
                          color: 'var(--accent-primary)',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Incident Location"
                    value={caseIncidentLocation}
                    onChange={(e) => setCaseIncidentLocation(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'var(--input-bg)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        '& fieldset': {
                          borderColor: 'var(--glass-border)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--accent-primary)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--accent-primary)',
                          boxShadow: 'var(--shadow-glow)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'var(--text-secondary)',
                        '&.Mui-focused': {
                          color: 'var(--accent-primary)',
                        },
                      },
                    }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'var(--input-bg)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'var(--glass-border)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--accent-primary)',
                      boxShadow: 'var(--shadow-glow)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    '&.Mui-focused': {
                      color: 'var(--accent-primary)',
                    },
                  },
                }}
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
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  background: 'var(--input-bg)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  '& fieldset': {
                    borderColor: 'var(--glass-border)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--accent-primary)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--accent-primary)',
                    boxShadow: 'var(--shadow-glow)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary)',
                  '&.Mui-focused': {
                    color: 'var(--accent-primary)',
                  },
                },
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid var(--glass-border)' }}>
          <Button
            onClick={() => setActionDialogOpen(false)}
            disabled={isSubmittingAction}
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--accent-primary)',
                background: 'var(--accent-primary-light)',
              },
            }}
          >
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
            sx={{
              background: 'var(--gradient-accent)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--button-shadow)',
              '&:hover': {
                background: 'var(--gradient-accent-hover)',
                boxShadow: 'var(--button-shadow-hover)',
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            {isSubmittingAction ? 'Submitting...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

