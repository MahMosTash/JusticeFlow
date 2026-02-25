/**
 * Aggregated Reports page
 */
import { Container, Typography, Box, Paper, Grid, Card, CardContent } from '@mui/material';
import { BarChart, TrendingUp, Assessment } from '@mui/icons-material';

export const ReportsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Aggregated Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        View comprehensive reports and analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BarChart sx={{ mr: 2, color: '#1976d2' }} />
                <Typography variant="h6">Case Statistics</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View case statistics by severity, status, and time period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp sx={{ mr: 2, color: '#2e7d32' }} />
                <Typography variant="h6">Performance Metrics</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Track investigation performance and resolution rates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assessment sx={{ mr: 2, color: '#ed6c02' }} />
                <Typography variant="h6">Evidence Reports</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Analyze evidence collection and verification statistics
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Features
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive reporting features will be implemented here, including:
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <li>Case resolution rates by severity</li>
          <li>Average investigation duration</li>
          <li>Evidence collection statistics</li>
          <li>Officer performance metrics</li>
          <li>Complaint approval rates</li>
        </Box>
      </Paper>
    </Container>
  );
};

