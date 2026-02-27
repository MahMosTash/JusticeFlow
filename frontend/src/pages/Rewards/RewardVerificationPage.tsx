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

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUser /> Verify Reward Code
            </Typography>

            <Card variant="outlined" sx={{ mb: 4, bgcolor: 'background.paper' }}>
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
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                            disabled={loading || !rewardCode.trim() || !nationalId.trim()}
                            sx={{ minWidth: 120, height: 40 }}
                        >
                            Verify
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {reward && (
                <Card variant="outlined" sx={{ border: '2px solid', borderColor: reward.status === 'Claimed' ? 'grey.300' : 'success.main' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h5" color={reward.status === 'Claimed' ? 'text.secondary' : 'success.main'} fontWeight="bold">
                                VALID REWARD MATCH
                            </Typography>
                            <Chip
                                label={reward.status}
                                color={reward.status === 'Claimed' ? 'default' : 'success'}
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary" display="block">Granted to</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {reward.submission.submitted_by.full_name || reward.submission.submitted_by.username}
                                </Typography>
                                <Typography variant="body2">{reward.submission.submitted_by.national_id}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary" display="block">Reward Amount Issued</Typography>
                                <Typography variant="h4" color="primary">
                                    {reward.amount.toLocaleString()}
                                    <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>IRR</Typography>
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" display="block">Approved By</Typography>
                                <Typography variant="body2">
                                    Detective {reward.created_by.full_name || reward.created_by.username} on {formatDate(reward.created_date)}
                                </Typography>
                                {reward.case && (
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        Linked Case: #{reward.case.id} - {reward.case.title}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>

                        {reward.status === 'Pending' && (
                            <Box bgcolor="grey.50" p={2} borderRadius={1} border="1px dashed" borderColor="grey.400">
                                <Typography variant="subtitle2" gutterBottom>Process Payout</Typography>
                                <Box display="flex" gap={2} alignItems="center">
                                    <TextField
                                        size="small"
                                        label="Station / Location Name"
                                        value={claimLocation}
                                        onChange={(e) => setClaimLocation(e.target.value)}
                                        fullWidth
                                        placeholder="e.g. Central HQ Desk 12"
                                    />
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleClaim}
                                        disabled={claiming}
                                        sx={{ minWidth: 150 }}
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
    );
};
