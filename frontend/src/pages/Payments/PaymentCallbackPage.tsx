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
        <Box
            sx={{
                minHeight: '100vh',
                background: 'var(--gradient-page-bg)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
            <Container maxWidth="sm" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
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
                    <CardContent>
                        {status === 'loading' && (
                            <Box py={5}>
                                <CircularProgress sx={{ color: 'var(--accent-primary)' }} />
                                <Typography
                                    sx={{
                                        mt: 2,
                                        fontSize: 'var(--body-base-size)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    Verifying your transaction...
                                </Typography>
                            </Box>
                        )}

                        {status === 'success' && (
                            <>
                                <CheckCircle sx={{ fontSize: 80, mb: 2, color: 'var(--accent-success)' }} />
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontSize: 'var(--heading-h1-size)',
                                        fontWeight: 'var(--heading-h1-weight)',
                                        color: 'var(--text-primary)',
                                        mb: 2,
                                    }}
                                >
                                    Payment Successful
                                </Typography>
                                <Typography
                                    sx={{
                                        color: 'var(--text-secondary)',
                                        fontSize: 'var(--body-base-size)',
                                        mb: 3,
                                        lineHeight: 'var(--line-height-relaxed)',
                                    }}
                                >
                                    Your payment has been successfully processed and the Bail/Fine has been marked as Paid.
                                </Typography>
                            </>
                        )}

                        {status === 'failed' && (
                            <>
                                <Cancel sx={{ fontSize: 80, mb: 2, color: 'var(--accent-error)' }} />
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontSize: 'var(--heading-h1-size)',
                                        fontWeight: 'var(--heading-h1-weight)',
                                        color: 'var(--text-primary)',
                                        mb: 2,
                                    }}
                                >
                                    Payment Failed
                                </Typography>
                                <Typography
                                    sx={{
                                        color: 'var(--text-secondary)',
                                        fontSize: 'var(--body-base-size)',
                                        mb: 3,
                                        lineHeight: 'var(--line-height-relaxed)',
                                    }}
                                >
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
                                sx={{
                                    mt: 3,
                                    background: 'var(--gradient-accent)',
                                    color: 'var(--text-primary)',
                                    boxShadow: 'var(--button-shadow)',
                                    borderRadius: 'var(--radius-md)',
                                    py: 1.5,
                                    px: 3,
                                    fontWeight: 'var(--font-weight-semibold)',
                                    textTransform: 'none',
                                    fontSize: 'var(--button-large-size)',
                                    '&:hover': {
                                        background: 'var(--gradient-accent-hover)',
                                        boxShadow: 'var(--button-shadow-hover)',
                                    },
                                    transition: 'var(--transition-base)',
                                }}
                            >
                                Return to Payments
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};
