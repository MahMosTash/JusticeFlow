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
      color: '#1976d2',
    },
    {
      title: 'My Cases',
      description: 'View assigned cases',
      icon: <Assignment />,
      action: () => navigate(ROUTES.CASES),
      color: '#2e7d32',
    },
    {
      title: 'Suspects',
      description: 'Manage suspects and investigations',
      icon: <PersonSearch />,
      action: () => navigate('/investigations/suspects'),
      color: '#ed6c02',
    },
  ];

  return (
    <Grid container spacing={3}>
      {quickActions.map((action, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={action.action}>
            <CardContent>
              <Box sx={{ color: action.color, mb: 2 }}>{action.icon}</Box>
              <Typography variant="h6" gutterBottom>
                {action.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {action.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

