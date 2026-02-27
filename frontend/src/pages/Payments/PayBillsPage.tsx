import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Card, CardContent, Grid, Button,
    Alert, LinearProgress, Chip, TextField, InputAdornment
} from '@mui/material';
import { Search, Payment } from '@mui/icons-material';
import { paymentService, BailFine } from '@/services/paymentService';
import { formatDateTime } from '@/utils/dateUtils';
import { CardSkeleton } from '@/components/common/Skeleton';

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
            b.suspect.name.toLowerCase().includes(query) ||
            b.suspect.national_id.includes(query) ||
            b.case.title.toLowerCase().includes(query)
        );
    });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Pay Bills & Fines
                </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph>
                Use this portal to search for an arrested suspect and pay their pending Bail or Court Fines to authorize their release.
            </Typography>

            <TextField
                fullWidth
                placeholder="Search by Suspect Name, National ID, or Case Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 4 }}
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
                <CardSkeleton count={3} />
            ) : filteredBills.length === 0 ? (
                <Card variant="outlined" sx={{ textAlign: 'center', py: 5, bgcolor: 'background.default' }}>
                    <Typography color="text.secondary">
                        {bills.length === 0 ? 'No pending bills or fines in the entire system.' : 'No bills match your search criteria.'}
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {filteredBills.map((bill) => (
                        <Grid item xs={12} md={6} key={bill.id}>
                            <Card variant="outlined" sx={{
                                border: '2px solid',
                                borderColor: bill.type === 'Fine' ? 'error.light' : 'warning.light',
                                display: 'flex', flexDirection: 'column', height: '100%'
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box display="flex" justifyContent="space-between" mb={2}>
                                        <Typography variant="h6" color={bill.type === 'Fine' ? 'error.main' : 'warning.main'}>
                                            {bill.type} Payment
                                        </Typography>
                                        <Chip
                                            label={`${Number(bill.amount).toLocaleString()} IRR`}
                                            color="primary"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>

                                    <Typography variant="subtitle2" color="text.secondary">Suspect</Typography>
                                    <Typography variant="body1" fontWeight={500} gutterBottom>
                                        {bill.suspect.name} <Typography component="span" variant="caption" color="text.secondary">({bill.suspect.national_id})</Typography>
                                    </Typography>

                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Case</Typography>
                                    <Typography variant="body2" gutterBottom>
                                        #{bill.case.id} — {bill.case.title}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                                        Issued: {formatDateTime(bill.created_date)}
                                    </Typography>
                                </CardContent>
                                <Box p={2} pt={0}>
                                    <Button
                                        variant="contained"
                                        color={bill.type === 'Fine' ? 'error' : 'warning'}
                                        fullWidth
                                        startIcon={<Payment />}
                                        onClick={() => handlePay(bill)}
                                        disabled={processingId !== null}
                                    >
                                        {processingId === bill.id ? 'Connecting to Gateway...' : `Pay ${bill.type} via Zibal`}
                                    </Button>
                                    {processingId === bill.id && <LinearProgress sx={{ mt: 1 }} />}
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};
