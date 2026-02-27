import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Card, CardContent, TextField,
    Button, Box, Alert, MenuItem, CircularProgress
} from '@mui/material';
import { rewardService } from '@/services/rewardService';
import { caseService } from '@/services/caseService';
import { Case } from '@/types/api';
import { ROUTES } from '@/constants/routes';

export const RewardSubmitPage: React.FC = () => {
    const navigate = useNavigate();
    const [information, setInformation] = useState('');
    const [selectedCase, setSelectedCase] = useState<number | ''>('');
    const [cases, setCases] = useState<Case[]>([]);
    const [loadingCases, setLoadingCases] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const data = await caseService.getCases({ status: 'Open' });
                // Assume API format { results: [...] } or array based on previous patterns
                setCases(Array.isArray(data) ? data : data.results || []);
            } catch (err) {
                console.error('Failed to load open cases', err);
            } finally {
                setLoadingCases(false);
            }
        };
        fetchCases();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!information.trim()) {
            setError('Please provide information before submitting.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await rewardService.submitInformation({
                case: selectedCase ? selectedCase : undefined,
                information
            });
            setSuccess(true);
            setTimeout(() => navigate(ROUTES.HOME), 3000); // Redirect to Home/Dashboard or My Rewards
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to submit information. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                    Your information has been submitted successfully. It will be reviewed by an officer. You will be redirected shortly...
                </Alert>
                <Button variant="outlined" onClick={() => navigate(ROUTES.HOME)}>
                    Back to Dashboard
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Submit Information
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                If you have reliable information regarding a case or criminal activity, please submit it below.
                If your information leads to an arrest or case resolution, you may be eligible for a reward.
            </Typography>

            <Card variant="outlined">
                <CardContent>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            select
                            margin="normal"
                            fullWidth
                            id="case"
                            label="Related Case (Optional)"
                            value={selectedCase}
                            onChange={(e) => setSelectedCase(e.target.value as number)}
                            disabled={loadingCases}
                            InputProps={{
                                endAdornment: loadingCases ? <CircularProgress size={20} /> : null
                            }}
                        >
                            <MenuItem value="">
                                <em>None / General Information</em>
                            </MenuItem>
                            {cases.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    #{c.id} - {c.title}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="information"
                            label="Detailed Information"
                            name="information"
                            multiline
                            rows={6}
                            value={information}
                            onChange={(e) => setInformation(e.target.value)}
                            placeholder="Please provide as much specific detail as possible (locations, descriptions, times, etc.)"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={submitting || !information.trim()}
                        >
                            {submitting ? 'Submitting...' : 'Submit Information'}
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};
