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
            b.suspect.suspect_name.toLowerCase().includes(query) ||
            (b.case && b.case.title.toLowerCase().includes(query))
        );
    });

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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
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
                        }}
                    >
                        Pay Bills & Fines
                    </Typography>
                </Box>

                <Typography
                    variant="body1"
                    sx={{
                        fontSize: 'var(--body-large-size)',
                        color: 'var(--text-secondary)',
                        mb: 4,
                        lineHeight: 'var(--line-height-relaxed)',
                    }}
                >
                    Use this portal to search for an arrested suspect and pay their pending Bail or Court Fines to authorize their release.
                </Typography>

                <TextField
                    fullWidth
                    placeholder="Search by Suspect Name, National ID, or Case Title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        mb: 4,
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
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: 'var(--text-secondary)' }} />
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
                    <Card
                        className="glass-effect"
                        variant="outlined"
                        sx={{
                            textAlign: 'center',
                            py: 5,
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
                            {bills.length === 0 ? 'No pending bills or fines in the entire system.' : 'No bills match your search criteria.'}
                        </Typography>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {filteredBills.map((bill) => (
                            <Grid item xs={12} md={6} key={bill.id}>
                                <Card
                                    className="glass-effect"
                                    variant="outlined"
                                    sx={{
                                        border: '2px solid',
                                        borderColor: bill.type === 'Fine' ? 'var(--accent-error)' : 'var(--accent-warning)',
                                        background: 'var(--glass-bg)',
                                        borderRadius: 'var(--radius-lg)',
                                        boxShadow: 'var(--shadow-lg)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        transition: 'var(--transition-base)',
                                        '&:hover': {
                                            boxShadow: 'var(--shadow-glow-lg), var(--shadow-xl)',
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box display="flex" justifyContent="space-between" mb={2}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: bill.type === 'Fine' ? 'var(--accent-error)' : 'var(--accent-warning)',
                                                    fontSize: 'var(--heading-h4-size)',
                                                    fontWeight: 'var(--heading-h4-weight)',
                                                }}
                                            >
                                                {bill.type} Payment
                                            </Typography>
                                            <Chip
                                                label={`${Number(bill.amount).toLocaleString()} IRR`}
                                                sx={{
                                                    fontWeight: 'var(--font-weight-bold)',
                                                    fontSize: 'var(--label-base-size)',
                                                    background: 'var(--gradient-accent)',
                                                    color: 'var(--text-primary)',
                                                }}
                                            />
                                        </Box>

                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                color: 'var(--text-secondary)',
                                                fontSize: 'var(--label-base-size)',
                                                display: 'block',
                                                mb: 0.5,
                                            }}
                                        >
                                            Suspect
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 'var(--font-weight-medium)',
                                                fontSize: 'var(--body-base-size)',
                                                color: 'var(--text-primary)',
                                                mb: 2,
                                            }}
                                        >
                                            {bill.suspect.suspect_name}
                                        </Typography>

                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                color: 'var(--text-secondary)',
                                                fontSize: 'var(--label-base-size)',
                                                mt: 1,
                                                display: 'block',
                                                mb: 0.5,
                                            }}
                                        >
                                            Case
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontSize: 'var(--body-base-size)',
                                                color: 'var(--text-primary)',
                                                mb: 2,
                                            }}
                                        >
                                            #{bill.case.id} — {bill.case.title}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'var(--text-secondary)',
                                                fontSize: 'var(--caption-size)',
                                                display: 'block',
                                                mt: 2,
                                            }}
                                        >
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
                                            sx={{
                                                background: bill.type === 'Fine' ? 'var(--accent-error)' : 'var(--gradient-accent)',
                                                color: 'var(--text-primary)',
                                                boxShadow: 'var(--button-shadow)',
                                                borderRadius: 'var(--radius-md)',
                                                py: 1.5,
                                                fontWeight: 'var(--font-weight-semibold)',
                                                textTransform: 'none',
                                                fontSize: 'var(--button-base-size)',
                                                '&:hover': {
                                                    background: bill.type === 'Fine' ? 'var(--accent-error)' : 'var(--gradient-accent-hover)',
                                                    boxShadow: 'var(--button-shadow-hover)',
                                                },
                                                '&:disabled': {
                                                    opacity: 0.6,
                                                },
                                                transition: 'var(--transition-base)',
                                            }}
                                        >
                                            {processingId === bill.id ? 'Connecting to Gateway...' : `Pay ${bill.type} via Zibal`}
                                        </Button>
                                        {processingId === bill.id && <LinearProgress sx={{ mt: 1, color: 'var(--accent-primary)' }} />}
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};
