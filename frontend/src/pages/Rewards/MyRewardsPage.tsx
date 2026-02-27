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
    }

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
                        mb: 4,
                    }}
                >
                    My Rewards & Submissions
                </Typography>

                {error ? (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                ) : (
                    <Grid container spacing={4}>

                    {/* Active Rewards Section */}
                    <Grid item xs={12}>
                        <Typography
                            variant="h5"
                            sx={{
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                fontSize: 'var(--heading-h2-size)',
                                fontWeight: 'var(--heading-h2-weight)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <LocalAtm sx={{ color: 'var(--accent-primary)' }} /> Approved Rewards
                        </Typography>
                        {rewards.length === 0 ? (
                            <Paper
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
                                    You do not have any approved rewards yet.
                                </Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={2}>
                                {rewards.map((reward) => (
                                    <Grid item xs={12} md={6} key={reward.id}>
                                        <Card
                                            className="glass-effect"
                                            variant="outlined"
                                            sx={{
                                                borderLeft: 6,
                                                borderColor: reward.status === 'Claimed' ? 'var(--accent-success)' : 'var(--accent-warning)',
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
                                                                letterSpacing: 2,
                                                                fontWeight: 'var(--font-weight-bold)',
                                                                color: 'var(--accent-primary)',
                                                                fontSize: 'var(--heading-h4-size)',
                                                            }}
                                                        >
                                                            {reward.reward_code}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'var(--text-secondary)',
                                                                fontSize: 'var(--caption-size)',
                                                            }}
                                                        >
                                                            Code required to claim your reward at the station
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        icon={getStatusIcon(reward.status)}
                                                        label={reward.status}
                                                        color={getStatusColor(reward.status)}
                                                        sx={{
                                                            fontWeight: 'var(--font-weight-medium)',
                                                            fontSize: 'var(--label-small-size)',
                                                        }}
                                                    />
                                                </Box>

                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'var(--text-secondary)',
                                                            fontSize: 'var(--body-base-size)',
                                                        }}
                                                    >
                                                        Granted: {formatDate(reward.created_date)}
                                                    </Typography>
                                                    {reward.status === 'Pending' && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 'var(--font-weight-bold)',
                                                                color: 'var(--accent-warning)',
                                                                fontSize: 'var(--body-base-size)',
                                                            }}
                                                        >
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
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                mt: 2,
                                fontSize: 'var(--heading-h3-size)',
                                fontWeight: 'var(--heading-h3-weight)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            Submission History
                        </Typography>
                        {submissions.length === 0 ? (
                            <Typography
                                sx={{
                                    color: 'var(--text-secondary)',
                                    fontSize: 'var(--body-base-size)',
                                }}
                            >
                                No information submissions found.
                            </Typography>
                        ) : (
                            <Grid container spacing={2}>
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
                                                <Box display="flex" justifyContent="space-between" mb={1}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 'var(--font-weight-semibold)',
                                                            fontSize: 'var(--heading-h4-size)',
                                                            color: 'var(--text-primary)',
                                                        }}
                                                    >
                                                        Submission #{sub.id} {sub.case && ` - Case #${sub.case.id}`}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        icon={getStatusIcon(sub.status)}
                                                        label={sub.status}
                                                        color={getStatusColor(sub.status)}
                                                        sx={{
                                                            fontWeight: 'var(--font-weight-medium)',
                                                            fontSize: 'var(--label-small-size)',
                                                        }}
                                                    />
                                                </Box>

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'var(--text-secondary)',
                                                        fontSize: 'var(--body-base-size)',
                                                        mb: 2,
                                                    }}
                                                >
                                                    Submitted: {formatDate(sub.submitted_date)}
                                                </Typography>

                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        background: 'var(--bg-elevated)',
                                                        p: 2,
                                                        borderRadius: 'var(--radius-md)',
                                                        fontSize: 'var(--body-base-size)',
                                                        color: 'var(--text-primary)',
                                                        lineHeight: 'var(--line-height-relaxed)',
                                                    }}
                                                >
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
        </Box>
    );
};
