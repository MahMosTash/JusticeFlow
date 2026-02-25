/**
 * Home page with statistics
 */
import { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button } from '@mui/material';
import { Assignment, CheckCircle, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { statsService, HomeStats } from '@/services/statsService';
import { Loading } from '@/components/common/Loading';
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <CardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Container>
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
      icon: <Assignment fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Solved Cases',
      value: stats?.solved_cases || 0,
      icon: <CheckCircle fontSize="large" />,
      color: '#2e7d32',
    },
    {
      title: 'Total Police Staff',
      value: stats?.total_police_staff || 0,
      icon: <People fontSize="large" />,
      color: '#ed6c02',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Police Case Management System
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to the Police Case Management System
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                  <Typography variant="h3" component="div" color="primary">
                    {card.value}
                  </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" gap={2} mt={6}>
        {isAuthenticated ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
            >
              Login to System
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

