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
            console.error(err);
            alert(err?.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Container>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Under Review': return 'info';
            default: return 'warning';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Reward Submissions Review
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
                {isDetective
                    ? 'Review submissions approved by officers to finalize them and generate a Reward Code.'
                    : 'Review civilian informations to filter out spam before forwarding them to detectives.'}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {submissions.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No pending submissions to review at this time.</Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {submissions.map((sub) => (
                        <Grid item xs={12} key={sub.id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Box>
                                            <Typography variant="h6">Submission #{sub.id}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Submitted By: {sub.submitted_by?.full_name || sub.submitted_by?.username} ({sub.submitted_by?.national_id})
                                                <br />
                                                Date: {formatDate(sub.submitted_date)}
                                            </Typography>
                                        </Box>
                                        <Chip label={sub.status} color={getStatusColor(sub.status)} />
                                    </Box>

                                    {sub.case && (
                                        <Alert severity="info" sx={{ mb: 2 }} icon={false}>
                                            Linked Case: #{sub.case.id} - {sub.case.title}
                                        </Alert>
                                    )}

                                    <Box bgcolor="grey.50" p={2} borderRadius={1} mb={2}>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            "{sub.information}"
                                        </Typography>
                                    </Box>

                                    {sub.reviewed_by_officer && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                                                    >
                                                        Approve {isOfficer ? '& Forward' : '& Create Reward'}
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<Cancel />}
                                                        onClick={() => openDialog(sub, 'reject')}
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
            <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    {actionType === 'approve' ? 'Approve Submission' : 'Reject Submission'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
                    <Button
                        onClick={handleReview}
                        color={actionType === 'approve' ? 'success' : 'error'}
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};
