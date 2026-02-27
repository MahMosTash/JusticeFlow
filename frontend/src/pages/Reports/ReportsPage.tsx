/**
 * Aggregated Reports page
 */
import { Container, Typography, Box, Paper, Grid, Card, CardContent } from '@mui/material';
import { BarChart, TrendingUp, Assessment } from '@mui/icons-material';

export const ReportsPage: React.FC = () => {
  const reportCards = [
    {
      title: 'Case Statistics',
      description: 'View case statistics by severity, status, and time period',
      icon: <BarChart />,
      gradient: 'var(--gradient-card-1)',
      gradientBg: 'var(--gradient-card-1-bg)',
    },
    {
      title: 'Performance Metrics',
      description: 'Track investigation performance and resolution rates',
      icon: <TrendingUp />,
      gradient: 'var(--gradient-card-2)',
      gradientBg: 'var(--gradient-card-2-bg)',
    },
    {
      title: 'Evidence Reports',
      description: 'Analyze evidence collection and verification statistics',
      icon: <Assessment />,
      gradient: 'var(--gradient-card-3)',
      gradientBg: 'var(--gradient-card-3-bg)',
    },
  ];

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
          Aggregated Reports
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: 'var(--body-large-size)',
            color: 'var(--text-secondary)',
            mb: 4,
          }}
        >
          View comprehensive reports and analytics
        </Typography>

        <Grid container spacing={3}>
          {reportCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                className="glass-effect"
                sx={{
                  height: '100%',
                  background: card.gradientBg,
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'var(--transition-base)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: card.gradient,
                    opacity: 0,
                    transition: 'var(--transition-base)',
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 'var(--shadow-glow-lg), var(--shadow-xl)',
                    background: 'var(--glass-bg-hover)',
                    '&::before': {
                      opacity: 1,
                    },
                    '& .report-icon': {
                      transform: 'scale(1.1)',
                      filter: 'drop-shadow(var(--shadow-glow))',
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      className="report-icon"
                      sx={{
                        display: 'inline-flex',
                        p: 1.5,
                        borderRadius: 'var(--radius-md)',
                        background: card.gradient,
                        color: 'var(--text-primary)',
                        fontSize: '2rem',
                        transition: 'var(--transition-base)',
                        boxShadow: 'var(--shadow-glow)',
                        mr: 2,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: 'var(--heading-h3-size)',
                        fontWeight: 'var(--heading-h3-weight)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 'var(--body-base-size)',
                      color: 'var(--text-secondary)',
                      lineHeight: 'var(--line-height-relaxed)',
                    }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper
          className="glass-effect"
          sx={{
            mt: 4,
            p: 3,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: 'var(--heading-h3-size)',
              fontWeight: 'var(--heading-h3-weight)',
              color: 'var(--text-primary)',
              mb: 2,
            }}
          >
            Report Features
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 'var(--body-base-size)',
              color: 'var(--text-secondary)',
              mb: 2,
            }}
          >
            Comprehensive reporting features will be implemented here, including:
          </Typography>
          <Box
            component="ul"
            sx={{
              mt: 2,
              pl: 3,
              '& li': {
                fontSize: 'var(--body-base-size)',
                color: 'var(--text-primary)',
                mb: 1,
                lineHeight: 'var(--line-height-relaxed)',
              },
            }}
          >
            <li>Case resolution rates by severity</li>
            <li>Average investigation duration</li>
            <li>Evidence collection statistics</li>
            <li>Officer performance metrics</li>
            <li>Complaint approval rates</li>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

