import { useState, useEffect } from 'react';
import {
    Container, Typography, Card, CardContent, Grid, Chip,
    Box, CircularProgress, Alert, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, List, ListItem, Divider
} from '@mui/material';
import { rewardService, RewardSubmission } from '@/services/rewardService';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { formatDate } from '@/utils/dateUtils';
import { CheckCircle, Cancel, Person } from '@mui/icons-material';

export const RewardReviewPage: React.FC = () => {
    const { user } = useAuth();
    const permissions = usePermissions();

    const [submissions, setSubmissions] = useState<RewardSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog state
    const [selectedSub, setSelectedSub] = useState<RewardSubmission | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // View state based on role
    const isOfficer = permissions.isOfficer() && !permissions.isDetective();
    const isDetective = permissions.isDetective();

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const data = await rewardService.getSubmissions();
            setSubmissions(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            setError('Failed to load pending submissions.');
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (sub: RewardSubmission, action: 'approve' | 'reject') => {
        setSelectedSub(sub);
        setActionType(action);
        setComments('');
        setDialogOpen(true);
    };

    const handleReview = async () => {
        if (!selectedSub) return;
        setSubmitting(true);
        try {
            if (isDetective) {
                await rewardService.reviewAsDetective(selectedSub.id, { action: actionType, comments });
            } else if (isOfficer) {
                await rewardService.reviewAsOfficer(selectedSub.id, { action: actionType, comments });
            }
            setDialogOpen(false);
            fetchSubmissions(); // refresh list
        } catch (err: any) {
            console.error('Approval Error:', err?.response?.data || err);
            const errMsg = err?.response?.data?.error || err?.response?.data?.detail || JSON.stringify(err?.response?.data) || 'Failed to submit review';
            alert(`Error: ${errMsg}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--gradient-page-bg)',
            }}
        >
            <CircularProgress sx={{ color: 'var(--accent-primary)' }} />
        </Box>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Under Review': return 'info';
            default: return 'warning';
        }
    };

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
                <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                        fontSize: 'var(--heading-h1-size)',
                        fontWeight: 'var(--heading-h1-weight)',
                        lineHeight: 'var(--heading-h1-line-height)',
                        letterSpacing: 'var(--heading-h1-letter-spacing)',
                        background: 'var(--gradient-accent)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Person /> Reward Submissions Review
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        fontSize: 'var(--body-large-size)',
                        color: 'var(--text-secondary)',
                        mb: 4,
                        lineHeight: 'var(--line-height-relaxed)',
                    }}
                >
                    {isDetective
                        ? 'Review submissions approved by officers to finalize them and generate a Reward Code.'
                        : 'Review civilian informations to filter out spam before forwarding them to detectives.'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {submissions.length === 0 ? (
                    <Card
                        className="glass-effect"
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <Typography
                            sx={{
                                color: 'var(--text-secondary)',
                                fontSize: 'var(--body-base-size)',
                            }}
                        >
                            No pending submissions to review at this time.
                        </Typography>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {submissions.map((sub) => (
                            <Grid item xs={12} key={sub.id}>
                                <Card
                                    className="glass-effect"
                                    variant="outlined"
                                    sx={{
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'var(--radius-lg)',
                                        boxShadow: 'var(--shadow-lg)',
                                        transition: 'var(--transition-base)',
                                        '&:hover': {
                                            boxShadow: 'var(--shadow-glow-lg), var(--shadow-xl)',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Box>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontSize: 'var(--heading-h4-size)',
                                                        fontWeight: 'var(--heading-h4-weight)',
                                                        color: 'var(--text-primary)',
                                                        mb: 1,
                                                    }}
                                                >
                                                    Submission #{sub.id}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'var(--text-secondary)',
                                                        fontSize: 'var(--body-base-size)',
                                                    }}
                                                >
                                                    Submitted By: {sub.submitted_by?.full_name || sub.submitted_by?.username} ({sub.submitted_by?.national_id})
                                                    <br />
                                                    Date: {formatDate(sub.submitted_date)}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={sub.status}
                                                color={getStatusColor(sub.status)}
                                                sx={{
                                                    fontWeight: 'var(--font-weight-medium)',
                                                    fontSize: 'var(--label-base-size)',
                                                }}
                                            />
                                        </Box>

                                        {sub.case && (
                                            <Alert severity="info" sx={{ mb: 2 }} icon={false}>
                                                Linked Case: #{sub.case.id} - {sub.case.title}
                                            </Alert>
                                        )}

                                        <Box
                                            sx={{
                                                background: 'var(--bg-elevated)',
                                                p: 2,
                                                borderRadius: 'var(--radius-md)',
                                                mb: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    whiteSpace: 'pre-wrap',
                                                    fontSize: 'var(--body-base-size)',
                                                    color: 'var(--text-primary)',
                                                    lineHeight: 'var(--line-height-relaxed)',
                                                }}
                                            >
                                                "{sub.information}"
                                            </Typography>
                                        </Box>

                                        {sub.reviewed_by_officer && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'var(--text-secondary)',
                                                    mb: 2,
                                                    fontSize: 'var(--body-base-size)',
                                                }}
                                            >
                                                <strong>Officer Comments ({sub.reviewed_by_officer.username}):</strong> {sub.review_comments || 'No comments'}
                                            </Typography>
                                        )}

                                        {/* Actions based on role and status */}
                                        <Box display="flex" gap={2} mt={3}>
                                            {(
                                                (isOfficer && sub.status === 'Pending') ||
                                                (isDetective && sub.status === 'Under Review')
                                            ) && (
                                                    <>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            startIcon={<CheckCircle />}
                                                            onClick={() => openDialog(sub, 'approve')}
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
                                                            Approve {isOfficer ? '& Forward' : '& Create Reward'}
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<Cancel />}
                                                            onClick={() => openDialog(sub, 'reject')}
                                                            sx={{
                                                                borderColor: 'var(--accent-error)',
                                                                color: 'var(--accent-error)',
                                                                '&:hover': {
                                                                    borderColor: 'var(--accent-error)',
                                                                    background: 'var(--error-bg)',
                                                                },
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

            {/* Review Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => !submitting && setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
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
                    {actionType === 'approve' ? 'Approve Submission' : 'Reject Submission'}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 2,
                            fontSize: 'var(--body-base-size)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {actionType === 'approve'
                            ? (isDetective ? 'Approving this will instantly generate a unique Reward Code for the user.' : 'Approving will send this submission to the Detective division for final verification.')
                            : 'Rejecting will mark this info as invalid/spam.'}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Internal Comments (Optional)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
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
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid var(--glass-border)' }}>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        disabled={submitting}
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
                        onClick={handleReview}
                        color={actionType === 'approve' ? 'success' : 'error'}
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            background: actionType === 'approve' ? 'var(--gradient-accent)' : 'var(--accent-error)',
                            color: 'var(--text-primary)',
                            boxShadow: 'var(--button-shadow)',
                            '&:hover': {
                                background: actionType === 'approve' ? 'var(--gradient-accent-hover)' : 'var(--accent-error)',
                                boxShadow: 'var(--button-shadow-hover)',
                            },
                            '&:disabled': {
                                opacity: 0.6,
                            },
                        }}
                    >
                        {submitting ? 'Saving...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
            </Container>
        </Box>
    );
};
