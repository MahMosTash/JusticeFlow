/**
 * Intern Dashboard
 */
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Assignment, PendingActions } from '@mui/icons-material';

export const InternDashboard: React.FC = () => {
    const navigate = useNavigate();

    const quickActions = [
        {
            title: 'Pending Complaints',
            description: 'Review and triage new complaints',
            icon: <PendingActions />,
            action: () => navigate(ROUTES.COMPLAINTS, { state: { filter: 'Pending' } }),
            color: '#1976d2',
        },
        {
            title: 'All Complaints',
            description: 'View all submitted complaints',
            icon: <Assignment />,
            action: () => navigate(ROUTES.COMPLAINTS),
            color: '#2e7d32',
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
