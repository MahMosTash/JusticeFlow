/**
 * Home page with statistics - Modern Dark Mode Design
 */
import { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button, alpha } from '@mui/material';
import { Assignment, CheckCircle, People, TrendingUp, Shield, Gavel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { statsService, HomeStats } from '@/services/statsService';
import { CardSkeleton } from '@/components/common/Skeleton';
import { useAuth } from '@/hooks/useAuth';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await statsService.getHomeStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'var(--gradient-page-bg)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--radial-glow-combined)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <CardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  const statCards = [
    {
      title: 'Total Cases',
      value: stats?.total_cases || 0,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      gradient: 'var(--gradient-card-1)',
      bgGradient: 'var(--gradient-card-1-bg)',
      delay: 0,
    },
    {
      title: 'Solved Cases',
      value: stats?.solved_cases || 0,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      gradient: 'var(--gradient-card-2)',
      bgGradient: 'var(--gradient-card-2-bg)',
      delay: 100,
    },
    {
      title: 'Police Staff',
      value: stats?.total_police_staff || 0,
      icon: <People sx={{ fontSize: 40 }} />,
      gradient: 'var(--gradient-card-3)',
      bgGradient: 'var(--gradient-card-3-bg)',
      delay: 200,
    },
  ];

  const features = [
    { icon: <Shield sx={{ fontSize: 32 }} />, text: 'Secure & Reliable' },
    { icon: <TrendingUp sx={{ fontSize: 32 }} />, text: 'Real-time Updates' },
    { icon: <Gavel sx={{ fontSize: 32 }} />, text: 'Legal Compliance' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--gradient-page-bg)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--radial-glow-combined)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 8,
            animation: 'fadeIn 0.8s ease-out',
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              background: 'var(--gradient-hero)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '4rem' },
            }}
          >
            Police Case Management System
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: '600px',
              mx: 'auto',
              mb: 4,
            }}
          >
            Streamline investigations, manage cases, and ensure justice with our comprehensive platform
          </Typography>

          {/* Feature Pills */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap',
              mb: 6,
            }}
          >
            {features.map((feature, idx) => (
              <Box
                key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--glass-border)',
                  color: 'text.secondary',
                  transition: 'all 250ms ease',
                  '&:hover': {
                    background: 'var(--glass-bg-hover)',
                    transform: 'translateY(-2px)',
                    borderColor: 'var(--accent-primary)',
                  },
                }}
              >
                {feature.icon}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  background: card.bgGradient,
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 350ms ease',
                  animation: `fadeIn 0.6s ease-out ${card.delay}ms both`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: card.gradient,
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: 'var(--card-shadow)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 'var(--radius-lg)',
                        background: card.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--card-shadow-icon)',
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography
                    variant="h2"
                    component="div"
                    sx={{
                      background: card.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                    }}
                  >
                    {card.value.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                    }}
                  >
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            animation: 'fadeIn 0.8s ease-out 300ms both',
          }}
        >
          {isAuthenticated ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient-accent)',
                boxShadow: 'var(--button-shadow-lg)',
                '&:hover': {
                  background: 'var(--gradient-accent-hover)',
                  boxShadow: 'var(--button-shadow-lg-hover)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--gradient-accent)',
                  boxShadow: 'var(--button-shadow-lg)',
                  '&:hover': {
                    background: 'var(--gradient-accent-hover)',
                    boxShadow: 'var(--button-shadow-lg-hover)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Login to System
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 'var(--radius-lg)',
                  borderWidth: '2px',
                  borderColor: 'var(--accent-primary)',
                  color: 'primary.main',
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: 'primary.main',
                    background: 'var(--accent-primary-light)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Create Account
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};
