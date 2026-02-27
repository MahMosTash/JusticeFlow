import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Card, CardContent, Grid, Chip,
    Box, CircularProgress, Alert, Button, Pagination
} from '@mui/material';
import { Gavel, Visibility } from '@mui/icons-material';
import { trialService } from '@/services/trialService';
import { Trial } from '@/types/api';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/dateUtils';

export const TrialsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [trials, setTrials] = useState<Trial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchTrials(page);
    }, [page]);

    const fetchTrials = async (pageNumber: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await trialService.getTrials({ page: pageNumber });
            // Depending on API paginated response wrapping, assume standard format
            setTrials(data.results || []);
            setTotalPages(Math.ceil((data.count || 1) / 10)); // Assume 10 per page
        } catch (err) {
            setError('Failed to load trials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getVerdictLabel = (verdict: string | null) => {
        if (!verdict) return <Chip label="Pending Review" color="warning" size="small" />;
        return <Chip label={verdict} color={verdict === 'Guilty' ? 'error' : 'success'} size="small" />;
    };

    if (loading && trials.length === 0) {
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
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Gavel /> Active Trials
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
                    Review case dossiers specifically assigned to you for final court verdicts.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {trials.length === 0 && !loading ? (
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
                            No trials available for review at this time.
                        </Typography>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {trials.map((trial) => (
                            <Grid item xs={12} md={6} key={trial.id}>
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
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontSize: 'var(--heading-h4-size)',
                                                    fontWeight: 'var(--heading-h4-weight)',
                                                    color: 'var(--text-primary)',
                                                }}
                                            >
                                                Case #{typeof trial.case === 'object' ? trial.case.id : trial.case} Trial
                                            </Typography>
                                            {getVerdictLabel(trial.verdict)}
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'var(--text-secondary)',
                                                fontSize: 'var(--body-base-size)',
                                                mb: 2,
                                                lineHeight: 'var(--line-height-relaxed)',
                                            }}
                                        >
                                            <strong>Scheduled Date:</strong> {trial.trial_date ? formatDate(trial.trial_date) : 'Unscheduled'}
                                            <br />
                                            <strong>Judge:</strong> {trial.judge?.full_name || trial.judge?.username || 'Unassigned'}
                                        </Typography>

                                        {trial.notes && (
                                            <Box
                                                sx={{
                                                    background: 'var(--bg-elevated)',
                                                    p: 1.5,
                                                    borderRadius: 'var(--radius-md)',
                                                    mb: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'var(--text-secondary)',
                                                        fontSize: 'var(--caption-size)',
                                                        display: 'block',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    Notes
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontSize: 'var(--body-base-size)',
                                                        color: 'var(--text-primary)',
                                                    }}
                                                >
                                                    {trial.notes}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Box display="flex" justifyContent="flex-end" mt={2}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Visibility />}
                                                onClick={() => navigate(ROUTES.TRIAL_DETAIL(trial.id))}
                                                sx={{
                                                    background: 'var(--gradient-accent)',
                                                    color: 'var(--text-primary)',
                                                    boxShadow: 'var(--button-shadow)',
                                                    borderRadius: 'var(--radius-md)',
                                                    '&:hover': {
                                                        background: 'var(--gradient-accent-hover)',
                                                        boxShadow: 'var(--button-shadow-hover)',
                                                    },
                                                }}
                                            >
                                                View Dossier
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {totalPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, val) => setPage(val)}
                            color="primary"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: 'var(--text-primary)',
                                    '&.Mui-selected': {
                                        background: 'var(--accent-primary)',
                                        color: 'var(--text-primary)',
                                        '&:hover': {
                                            background: 'var(--accent-primary-hover)',
                                        },
                                    },
                                    '&:hover': {
                                        background: 'var(--accent-primary-light)',
                                    },
                                },
                            }}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    );
};
