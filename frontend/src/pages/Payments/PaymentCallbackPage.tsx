import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Button, Box, CircularProgress } from '@mui/material';
import { CheckCircle, Cancel, Home } from '@mui/icons-material';
import { ROUTES } from '@/constants/routes';

export const PaymentCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

    // The backend /payment_callback/ redirects here appending ?success=1 or ?success=0
    useEffect(() => {
        const isSuccess = searchParams.get('success');
        if (isSuccess === '1') {
            setStatus('success');
        } else if (isSuccess === '0') {
            setStatus('failed');
        } else {
            // Default failure if param missing
            setStatus('failed');
        }
    }, [searchParams]);

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Card variant="outlined" sx={{ textAlign: 'center', py: 5 }}>
                <CardContent>
                    {status === 'loading' && (
                        <Box py={5}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2 }}>Verifying your transaction...</Typography>
                        </Box>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
                            <Typography variant="h4" gutterBottom>Payment Successful</Typography>
                            <Typography color="text.secondary" paragraph>
                                Your payment has been successfully processed and the Bail/Fine has been marked as Paid.
                            </Typography>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <Cancel color="error" sx={{ fontSize: 80, mb: 2 }} />
                            <Typography variant="h4" gutterBottom>Payment Failed</Typography>
                            <Typography color="text.secondary" paragraph>
                                The transaction could not be completed or was cancelled. Please try again later.
                            </Typography>
                        </>
                    )}

                    {status !== 'loading' && (
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Home />}
                            onClick={() => navigate(ROUTES.PAY_BILLS)}
                            sx={{ mt: 3 }}
                        >
                            Return to Payments
                        </Button>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};
