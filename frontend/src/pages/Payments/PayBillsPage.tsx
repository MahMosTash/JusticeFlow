import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Card, CardContent, Grid, Button,
    Alert, TextField, InputAdornment
} from '@mui/material';
import { Search, Payment } from '@mui/icons-material';
import { paymentService, BailFine } from '@/services/paymentService';
import { CardSkeleton } from '@/components/common/Skeleton';

import chavoshiImg from '@/assets/Chavoshi.png';

export const PayBillsPage: React.FC = () => {
    const [bills, setBills] = useState<BailFine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        loadBills();
    }, []);

    const loadBills = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch ALL pending bills (no linked suspect restriction for Basic Users)
            const data = await paymentService.getBailsFines({ status: 'Pending' });
            setBills(data.results || []);
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Failed to load pending bills.');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (bill: BailFine) => {
        try {
            setProcessingId(bill.id);
            setError(null);
            const { redirect_url } = await paymentService.requestPayment(bill.id);
            if (redirect_url) {
                // Redirect user to Zibal Gateway
                window.location.href = redirect_url;
            } else {
                throw new Error("No redirect URL received from payment gateway.");
            }
        } catch (e: any) {
            setError(`Payment initialization failed for bill #${bill.id}: ${e.response?.data?.error || e.message}`);
            setProcessingId(null);
        }
    };

    const filteredBills = bills.filter(b => {
        const query = searchQuery.toLowerCase();
        return (
            b.suspect.suspect_name.toLowerCase().includes(query) ||
            (b.case && b.case.title.toLowerCase().includes(query))
        );
    });

    return (
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>


            <Grid container spacing={4}>
                {/* ── LEFT COLUMN: TITLE, FILTERS, BILLS ── */}
                <Grid item xs={12} md={8}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h4" component="h1" fontWeight="bold">
                            Legal Billing & Fines
                        </Typography>
                    </Box>

                    <Typography variant="body1" color="text.secondary" paragraph>
                        Search for a suspect or defendant to pay their pending Bail or Fines.
                        Payments are processed securely via the Zibal IPG.
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder="Search by Suspect Name, National ID, or Case Title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ mb: 4, bgcolor: 'background.paper' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <CardSkeleton count={2} />
                    ) : filteredBills.length === 0 ? (
                        <Card variant="outlined" sx={{ textAlign: 'center', py: 5, bgcolor: 'background.default', borderStyle: 'dashed' }}>
                            <Typography color="text.secondary">
                                {bills.length === 0 ? 'No pending bills found in the judicial system.' : 'No bills match your search.'}
                            </Typography>
                        </Card>
                    ) : (
                        <Grid container spacing={2}>
                            {filteredBills.map((bill) => (
                                <Grid item xs={12} key={bill.id}>
                                    <Card variant="outlined" sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        overflow: 'hidden',
                                        transition: 'all 0.2s',
                                        '&:hover': { boxShadow: 2, borderColor: bill.type === 'Fine' ? 'error.main' : 'warning.main' }
                                    }}>
                                        <Box sx={{
                                            width: { xs: '100%', sm: '12px' },
                                            bgcolor: bill.type === 'Fine' ? 'error.main' : 'warning.main'
                                        }} />

                                        <CardContent sx={{ flexGrow: 1, py: 2 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Typography variant="subtitle2" color={bill.type === 'Fine' ? 'error.main' : 'warning.main'} fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                                                    {bill.type}
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {Number(bill.amount).toLocaleString()} <Typography component="span" variant="caption">IRR</Typography>
                                                </Typography>
                                            </Box>

                                            <Grid container spacing={1}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">SUSPECT</Typography>
                                                    <Typography variant="body1" fontWeight={500}>{bill.suspect.suspect_name}</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">CASE REFERENCE</Typography>
                                                    <Typography variant="body2">#{bill.case.id} — {bill.case.title}</Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>

                                        <Box p={2} display="flex" alignItems="center" bgcolor="action.hover">
                                            <Button
                                                variant="contained"
                                                color={bill.type === 'Fine' ? 'error' : 'warning'}
                                                startIcon={<Payment />}
                                                onClick={() => handlePay(bill)}
                                                disabled={processingId !== null}
                                                size="large"
                                            >
                                                {processingId === bill.id ? 'Connecting...' : 'Pay'}
                                            </Button>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Grid>

                {/* ── RIGHT COLUMN: DECORATIVE SECTION ── */}
                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        minHeight: '400px'
                    }}>
                        <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center' }}>
                            {/* Animated Settle Effect */}
                            <Box
                                component="img"
                                src={chavoshiImg}
                                alt="Chavoshi"
                                sx={{
                                    width: '100%',
                                    maxWidth: '280px',
                                    height: 'auto',
                                }}
                            />

                            <Box mt={3}>
                                <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">
                                    Judicial Support
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Helping citizens resolve legal financial obligations through modern interfaces.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                Justice Flow System — 2026
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>


        </Container>
    );
};
