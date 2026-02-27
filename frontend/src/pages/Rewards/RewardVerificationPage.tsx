import { useState } from 'react';
import {
    Container, Typography, Card, CardContent, Grid,
    Box, CircularProgress, Alert, Button, TextField, Divider
} from '@mui/material';
import { rewardService, Reward } from '@/services/rewardService';
import { formatDate } from '@/utils/dateUtils';
import { VerifiedUser, Search } from '@mui/icons-material';

export const RewardVerificationPage: React.FC = () => {
    const [rewardCode, setRewardCode] = useState('');
    const [nationalId, setNationalId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reward, setReward] = useState<Reward | null>(null);

    const [claiming, setClaiming] = useState(false);
    const [claimLocation, setClaimLocation] = useState('');
    const [claimSuccess, setClaimSuccess] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rewardCode.trim() || !nationalId.trim()) return;

        setLoading(true);
        setError(null);
        setReward(null);
        setClaimSuccess(false);

        try {
            const data = await rewardService.verifyRewardCode({
                reward_code: rewardCode.trim(),
                national_id: nationalId.trim()
            });
            setReward(data);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Verification failed. Code or National ID is invalid.');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!reward) return;
        setClaiming(true);
        setError(null);

        try {
            await rewardService.claimReward(reward.id, {
                reward_code: reward.reward_code,
                location: claimLocation || 'HQ Station'
            });
            setClaimSuccess(true);
            setReward(prev => prev ? { ...prev, status: 'Claimed' } : null);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to claim reward.');
        } finally {
            setClaiming(false);
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
                        mb: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <VerifiedUser /> Verify Reward Code
                </Typography>

                <Card
                    className="glass-effect"
                    variant="outlined"
                    sx={{
                        mb: 4,
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    <CardContent>
                        <Box component="form" onSubmit={handleVerify} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                            <TextField
                                label="Reward Code"
                                variant="outlined"
                                size="small"
                                fullWidth
                                required
                                value={rewardCode}
                                onChange={(e) => setRewardCode(e.target.value)}
                                placeholder="e.g. RWD-ABC123XYZ"
                                sx={commonTextFieldSx}
                            />
                            <TextField
                                label="User's National ID"
                                variant="outlined"
                                size="small"
                                fullWidth
                                required
                                value={nationalId}
                                onChange={(e) => setNationalId(e.target.value)}
                                placeholder="10-digit ID"
                                sx={commonTextFieldSx}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                                disabled={loading || !rewardCode.trim() || !nationalId.trim()}
                                sx={{
                                    minWidth: 120,
                                    height: 40,
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
                                Verify
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {reward && (
                    <Card
                        className="glass-effect"
                        variant="outlined"
                        sx={{
                            border: '2px solid',
                            borderColor: reward.status === 'Claimed' ? 'var(--glass-border)' : 'var(--accent-success)',
                            background: 'var(--glass-bg)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: reward.status === 'Claimed' ? 'var(--text-secondary)' : 'var(--accent-success)',
                                        fontWeight: 'var(--font-weight-bold)',
                                        fontSize: 'var(--heading-h2-size)',
                                    }}
                                >
                                    VALID REWARD MATCH
                                </Typography>
                                <Chip
                                    label={reward.status}
                                    color={reward.status === 'Claimed' ? 'default' : 'success'}
                                    sx={{
                                        fontWeight: 'var(--font-weight-bold)',
                                        fontSize: 'var(--label-base-size)',
                                    }}
                                />
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--caption-size)',
                                            display: 'block',
                                            mb: 0.5,
                                        }}
                                    >
                                        Granted to
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 'var(--font-weight-bold)',
                                            fontSize: 'var(--body-base-size)',
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        {reward.submission.submitted_by.full_name || reward.submission.submitted_by.username}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: 'var(--body-base-size)',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        {reward.submission.submitted_by.national_id}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--caption-size)',
                                            display: 'block',
                                            mb: 0.5,
                                        }}
                                    >
                                        Reward Amount Issued
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: 'var(--accent-primary)',
                                            fontSize: 'var(--heading-h1-size)',
                                            fontWeight: 'var(--font-weight-bold)',
                                        }}
                                    >
                                        {reward.amount.toLocaleString()}
                                        <Typography
                                            component="span"
                                            variant="body1"
                                            sx={{
                                                ml: 1,
                                                color: 'var(--text-secondary)',
                                                fontSize: 'var(--body-base-size)',
                                            }}
                                        >
                                            IRR
                                        </Typography>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1, borderColor: 'var(--glass-border)' }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--caption-size)',
                                            display: 'block',
                                            mb: 0.5,
                                        }}
                                    >
                                        Approved By
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: 'var(--body-base-size)',
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        Detective {reward.created_by.full_name || reward.created_by.username} on {formatDate(reward.created_date)}
                                    </Typography>
                                    {reward.case && (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'var(--text-secondary)',
                                                mt: 1,
                                                fontSize: 'var(--body-base-size)',
                                            }}
                                        >
                                            Linked Case: #{reward.case.id} - {reward.case.title}
                                        </Typography>
                                    )}
                                </Grid>
                            </Grid>

                            {reward.status === 'Pending' && (
                                <Box
                                    sx={{
                                        background: 'var(--bg-elevated)',
                                        p: 2,
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px dashed',
                                        borderColor: 'var(--glass-border)',
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontSize: 'var(--heading-h5-size)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            color: 'var(--text-primary)',
                                            mb: 1,
                                        }}
                                    >
                                        Process Payout
                                    </Typography>
                                    <Box display="flex" gap={2} alignItems="center">
                                        <TextField
                                            size="small"
                                            label="Station / Location Name"
                                            value={claimLocation}
                                            onChange={(e) => setClaimLocation(e.target.value)}
                                            fullWidth
                                            placeholder="e.g. Central HQ Desk 12"
                                            sx={commonTextFieldSx}
                                        />
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={handleClaim}
                                            disabled={claiming}
                                            sx={{
                                                minWidth: 150,
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
                                            {claiming ? 'Processing...' : 'Mark as Claimed'}
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {claimSuccess && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    Reward successfully marked as claimed. Pay out the physical funds to the user now.
                                </Alert>
                            )}

                            {reward.status === 'Claimed' && reward.claimed_date && (
                                <Alert severity="info" sx={{ mt: 2 }} icon={false}>
                                    This reward was already claimed on <strong>{formatDate(reward.claimed_date)}</strong> at <strong>{reward.claimed_at_location}</strong>.
                                </Alert>
                            )}

                        </CardContent>
                    </Card>
                )}
            </Container>
        </Box>
    );
};
