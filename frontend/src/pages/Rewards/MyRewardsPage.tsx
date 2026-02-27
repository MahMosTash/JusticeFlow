import { useState, useEffect } from 'react';
import {
    Container, Typography, Card, CardContent, Grid, Chip,
    Box, CircularProgress, Alert, Paper
} from '@mui/material';
import { rewardService, RewardSubmission, RewardList } from '@/services/rewardService';
import { formatDate } from '@/utils/dateUtils';
import { CheckCircle, Pending, Cancel, LocalAtm } from '@mui/icons-material';

export const MyRewardsPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<RewardSubmission[]>([]);
    const [rewards, setRewards] = useState<RewardList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subsData, rewardsData] = await Promise.all([
                rewardService.getSubmissions(),
                rewardService.getRewards()
            ]);
            setSubmissions(Array.isArray(subsData) ? subsData : subsData.results || []);
            setRewards(Array.isArray(rewardsData) ? rewardsData : rewardsData.results || []);
        } catch (err) {
            setError('Failed to load your rewards and submissions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
            case 'Claimed':
                return 'success';
            case 'Rejected':
                return 'error';
            case 'Under Review':
                return 'info';
            default:
                return 'warning';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle fontSize="small" />;
            case 'Rejected':
                return <Cancel fontSize="small" />;
            case 'Claimed':
                return <LocalAtm fontSize="small" />;
            default:
                return <Pending fontSize="small" />;
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                My Rewards & Submissions
            </Typography>

            {error ? (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : (
                <Grid container spacing={4}>

                    {/* Active Rewards Section */}
                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalAtm color="success" /> Approved Rewards
                        </Typography>
                        {rewards.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
                                <Typography color="text.secondary">
                                    You do not have any approved rewards yet.
                                </Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={2}>
                                {rewards.map((reward) => (
                                    <Grid item xs={12} md={6} key={reward.id}>
                                        <Card variant="outlined" sx={{ borderLeft: 6, borderColor: reward.status === 'Claimed' ? 'success.main' : 'warning.main' }}>
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                    <Box>
                                                        <Typography variant="h6" color="primary" sx={{ letterSpacing: 2, fontWeight: 'bold' }}>
                                                            {reward.reward_code}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Code required to claim your reward at the station
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        icon={getStatusIcon(reward.status)}
                                                        label={reward.status}
                                                        color={getStatusColor(reward.status)}
                                                    />
                                                </Box>

                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" color="text.secondary">
                                                        Granted: {formatDate(reward.created_date)}
                                                    </Typography>
                                                    {reward.status === 'Pending' && (
                                                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                                                            Go to Police Station to Claim
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>

                    {/* Submission History Section */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                            Submission History
                        </Typography>
                        {submissions.length === 0 ? (
                            <Typography color="text.secondary">No information submissions found.</Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {submissions.map((sub) => (
                                    <Grid item xs={12} key={sub.id}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" mb={1}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        Submission #{sub.id} {sub.case && ` - Case #${sub.case.id}`}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        icon={getStatusIcon(sub.status)}
                                                        label={sub.status}
                                                        color={getStatusColor(sub.status)}
                                                    />
                                                </Box>

                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    Submitted: {formatDate(sub.submitted_date)}
                                                </Typography>

                                                <Typography variant="body1" sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                                                    "{sub.information}"
                                                </Typography>

                                                {sub.review_comments && sub.status === 'Rejected' && (
                                                    <Alert severity="info" sx={{ mt: 2 }} icon={false}>
                                                        <strong>Feedback:</strong> {sub.review_comments}
                                                    </Alert>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>

                </Grid>
            )}
        </Container>
    );
};
