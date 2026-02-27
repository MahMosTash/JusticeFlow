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
            <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Gavel /> Active Trials
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
                Review case dossiers specifically assigned to you for final court verdicts.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {trials.length === 0 && !loading ? (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No trials available for review at this time.</Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {trials.map((trial) => (
                        <Grid item xs={12} md={6} key={trial.id}>
                            <Card variant="outlined" sx={{ '&:hover': { boxShadow: 3 }, transition: '0.2s' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Typography variant="h6">
                                            Case #{typeof trial.case === 'object' ? trial.case.id : trial.case} Trial
                                        </Typography>
                                        {getVerdictLabel(trial.verdict)}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        <strong>Scheduled Date:</strong> {trial.trial_date ? formatDate(trial.trial_date) : 'Unscheduled'}
                                        <br />
                                        <strong>Judge:</strong> {trial.judge?.full_name || trial.judge?.username || 'Unassigned'}
                                    </Typography>

                                    {trial.notes && (
                                        <Box bgcolor="grey.50" p={1.5} borderRadius={1} mb={2}>
                                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Notes</Typography>
                                            <Typography variant="body2">{trial.notes}</Typography>
                                        </Box>
                                    )}

                                    <Box display="flex" justifyContent="flex-end" mt={2}>
                                        <Button
                                            variant="contained"
                                            startIcon={<Visibility />}
                                            onClick={() => navigate(ROUTES.TRIAL_DETAIL(trial.id))}
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
                    />
                </Box>
            )}
        </Container>
    );
};
