/**
 * Role-based Dashboard page
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES } from '@/constants/routes';
import { AdminDashboard } from './AdminDashboard';
import { OfficerDashboard } from './OfficerDashboard';
import { DetectiveDashboard } from './DetectiveDashboard';
import { InternDashboard } from './InternDashboard';
import { UserDashboard } from './UserDashboard';
import { ForensicDoctorDashboard } from './ForensicDoctorDashboard';
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
    if (permissions.isForensicDoctor()) {         // ← new branch
      return <ForensicDoctorDashboard />;
    }
    return <UserDashboard />;
  };

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
        <Box sx={{ mb: 4 }}>
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
            Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 'var(--body-large-size)',
              color: 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-normal)',
            }}
          >
            Welcome back, {user.full_name || user.username}
          </Typography>
        </Box>
        {renderDashboard()}
      </Container>
    </Box>
  );
};
