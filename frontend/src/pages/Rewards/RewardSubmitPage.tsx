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

    const commonTextFieldSx = {
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
    };

    if (success) {
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
                <Container maxWidth="md" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Your information has been submitted successfully. It will be reviewed by an officer. You will be redirected shortly...
                    </Alert>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(ROUTES.HOME)}
                        sx={{
                            borderColor: 'var(--glass-border)',
                            color: 'var(--text-secondary)',
                            '&:hover': {
                                borderColor: 'var(--accent-primary)',
                                color: 'var(--accent-primary)',
                                background: 'var(--accent-primary-light)',
                            },
                        }}
                    >
                        Back to Dashboard
                    </Button>
                </Container>
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
            <Container maxWidth="md" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
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
                    }}
                >
                    Submit Information
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
                    If you have reliable information regarding a case or criminal activity, please submit it below.
                    If your information leads to an arrest or case resolution, you may be eligible for a reward.
                </Typography>

                <Card
                    className="glass-effect"
                    variant="outlined"
                    sx={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
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
                                    endAdornment: loadingCases ? <CircularProgress size={20} sx={{ color: 'var(--accent-primary)' }} /> : null
                                }}
                                sx={commonTextFieldSx}
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
                                sx={commonTextFieldSx}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    background: 'var(--gradient-accent)',
                                    color: 'var(--text-primary)',
                                    boxShadow: 'var(--button-shadow)',
                                    borderRadius: 'var(--radius-md)',
                                    py: 1.5,
                                    fontWeight: 'var(--font-weight-semibold)',
                                    textTransform: 'none',
                                    fontSize: 'var(--button-large-size)',
                                    '&:hover': {
                                        background: 'var(--gradient-accent-hover)',
                                        boxShadow: 'var(--button-shadow-hover)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:disabled': {
                                        opacity: 0.6,
                                    },
                                    transition: 'var(--transition-base)',
                                }}
                                disabled={submitting || !information.trim()}
                            >
                                {submitting ? 'Submitting...' : 'Submit Information'}
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => navigate(-1)}
                                sx={{
                                    borderColor: 'var(--glass-border)',
                                    color: 'var(--text-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    py: 1.5,
                                    fontWeight: 'var(--font-weight-medium)',
                                    textTransform: 'none',
                                    fontSize: 'var(--button-base-size)',
                                    '&:hover': {
                                        borderColor: 'var(--accent-primary)',
                                        color: 'var(--accent-primary)',
                                        background: 'var(--accent-primary-light)',
                                    },
                                    transition: 'var(--transition-base)',
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};
