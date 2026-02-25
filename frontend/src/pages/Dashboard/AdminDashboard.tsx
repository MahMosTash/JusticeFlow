/**
 * System Administrator Dashboard
 */
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AdminPanelSettings, People, Assignment } from '@mui/icons-material';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all system users',
      icon: <People />,
      action: () => navigate('/admin/users'),
      color: '#1976d2',
    },
    {
      title: 'Manage Roles',
      description: 'Create and edit roles',
      icon: <AdminPanelSettings />,
      action: () => navigate('/admin/roles'),
      color: '#2e7d32',
    },
    {
      title: 'View All Cases',
      description: 'Monitor all cases in the system',
      icon: <Assignment />,
      action: () => navigate(ROUTES.CASES),
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

