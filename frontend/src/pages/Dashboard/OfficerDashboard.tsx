/**
 * Officer Dashboard (Police Chief, Captain, Sergeant)
 */
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Assignment, AddCircle, List } from '@mui/icons-material';

export const OfficerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Create Case',
      description: 'Create a new case from crime scene',
      icon: <AddCircle />,
      action: () => navigate(ROUTES.CASE_CREATE),
      color: '#1976d2',
    },
    {
      title: 'View Cases',
      description: 'View and manage cases',
      icon: <List />,
      action: () => navigate(ROUTES.CASES),
      color: '#2e7d32',
    },
    {
      title: 'Review Complaints',
      description: 'Review pending complaints',
      icon: <Assignment />,
      action: () => navigate(ROUTES.COMPLAINTS),
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

