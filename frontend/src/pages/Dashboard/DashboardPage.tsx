/**
 * Role-based Dashboard page
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES } from '@/constants/routes';
import { AdminDashboard } from './AdminDashboard';
import { OfficerDashboard } from './OfficerDashboard';
import { DetectiveDashboard } from './DetectiveDashboard';
import { InternDashboard } from './InternDashboard';
import { UserDashboard } from './UserDashboard';
import { Loading } from '@/components/common/Loading';

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return null;
  }

  // Determine which dashboard to show based on user roles
  const renderDashboard = () => {
    if (permissions.isSystemAdministrator()) {
      return <AdminDashboard />;
    }
    if (permissions.isPoliceChief() || permissions.isCaptain() || permissions.isSergeant()) {
      return <OfficerDashboard />;
    }
    if (permissions.isDetective()) {
      return <DetectiveDashboard />;
    }
    if (permissions.isIntern()) {
      return <InternDashboard />;
    }
    return <UserDashboard />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Welcome, {user.full_name || user.username}
      </Typography>
      {renderDashboard()}
    </Container>
  );
};

