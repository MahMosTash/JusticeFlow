/**
 * Detective Dashboard
 */
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Assignment, AccountTree, PersonSearch } from '@mui/icons-material';

export const DetectiveDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Detective Board',
      description: 'Visual case analysis board',
      icon: <AccountTree />,
      action: () => navigate(ROUTES.DETECTIVE_BOARD),
      gradient: 'var(--gradient-card-1)',
      gradientBg: 'var(--gradient-card-1-bg)',
    },
    {
      title: 'My Cases',
      description: 'View assigned cases',
      icon: <Assignment />,
      action: () => navigate(ROUTES.CASES),
      gradient: 'var(--gradient-card-2)',
      gradientBg: 'var(--gradient-card-2-bg)',
    },
    {
      title: 'Suspects',
      description: 'Manage suspects and investigations',
      icon: <PersonSearch />,
      action: () => navigate('/investigations/suspects'),
      gradient: 'var(--gradient-card-3)',
      gradientBg: 'var(--gradient-card-3-bg)',
    },
  ];

  return (
    <Grid container spacing={3}>
      {quickActions.map((action, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card
            className="glass-effect"
            sx={{
              height: '100%',
              cursor: 'pointer',
              background: action.gradientBg,
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
                background: action.gradient,
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
                '& .action-icon': {
                  transform: 'scale(1.1)',
                  filter: 'drop-shadow(var(--shadow-glow))',
                },
              },
            }}
            onClick={action.action}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box
                className="action-icon"
                sx={{
                  mb: 2,
                  display: 'inline-flex',
                  p: 1.5,
                  borderRadius: 'var(--radius-md)',
                  background: action.gradient,
                  color: 'var(--text-primary)',
                  fontSize: '2rem',
                  transition: 'var(--transition-base)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {action.icon}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 'var(--heading-h3-size)',
                  fontWeight: 'var(--heading-h3-weight)',
                  color: 'var(--text-primary)',
                  mb: 1,
                }}
              >
                {action.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 'var(--body-base-size)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--line-height-relaxed)',
                }}
              >
                {action.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

