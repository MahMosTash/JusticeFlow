/**
 * Main App component with routing
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from './store';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/Home/HomePage';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { CaseListPage } from './pages/Cases/CaseListPage';
import { CaseDetailPage } from './pages/Cases/CaseDetailPage';
import { CaseCreatePage } from './pages/Cases/CaseCreatePage';
import { ComplaintListPage } from './pages/Complaints/ComplaintListPage';
import { ComplaintSubmitPage } from './pages/Complaints/ComplaintSubmitPage';
import { ComplaintDetailPage } from './pages/Complaints/ComplaintDetailPage';
import { DetectiveBoardPage } from './pages/DetectiveBoard/DetectiveBoardPage';
import { MostWantedPage } from './pages/MostWanted/MostWantedPage';
import { EvidenceListPage } from './pages/Evidence/EvidenceListPage';
import { EvidenceCreatePage } from './pages/Evidence/EvidenceCreatePage';
import { EvidenceDetailPage } from './pages/Evidence/EvidenceDetailPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { UserManagementPage } from './pages/Admin/UserManagementPage';
import { RoleManagementPage } from './pages/Admin/RoleManagementPage';
import { TrialPage } from './pages/Trials/TrialPage';
import { TrialsListPage } from './pages/Trials/TrialsListPage';
import { RewardSubmitPage } from './pages/Rewards/RewardSubmitPage';
import { MyRewardsPage } from './pages/Rewards/MyRewardsPage';
import { RewardReviewPage } from './pages/Rewards/RewardReviewPage';
import { RewardVerificationPage } from './pages/Rewards/RewardVerificationPage';
import { PayBillsPage } from './pages/Payments/PayBillsPage';
import { PaymentCallbackPage } from './pages/Payments/PaymentCallbackPage';
import { ROUTES } from './constants/routes';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#b8860b',
      light: '#daa520',
      dark: '#8b6914',
      contrastText: '#f5f1ed',
    },
    secondary: {
      main: '#cd853f',
      light: '#deb887',
      dark: '#a0826d',
      contrastText: '#f5f1ed',
    },
    background: {
      default: '#0d0a0a',
      paper: '#1a1515',
    },
    text: {
      primary: '#f5f1ed',
      secondary: '#c9b8a8',
    },
    error: {
      main: '#c97d60',
    },
    warning: {
      main: '#d4a574',
    },
    info: {
      main: '#9d7f5f',
    },
    success: {
      main: '#8b7355',
    },
  },
  typography: {
    fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    // Headings - Match CSS variables
    h1: {
      fontSize: '3rem', // --heading-h1-size
      fontWeight: 800, // --heading-h1-weight
      lineHeight: 1.2, // --heading-h1-line-height
      letterSpacing: '-0.025em', // --heading-h1-spacing
    },
    h2: {
      fontSize: '2.25rem', // --heading-h2-size
      fontWeight: 700, // --heading-h2-weight
      lineHeight: 1.2, // --heading-h2-line-height
      letterSpacing: '-0.025em', // --heading-h2-spacing
    },
    h3: {
      fontSize: '1.875rem', // --heading-h3-size
      fontWeight: 700, // --heading-h3-weight
      lineHeight: 1.375, // --heading-h3-line-height
      letterSpacing: '0', // --heading-h3-spacing
    },
    h4: {
      fontSize: '1.5rem', // --heading-h4-size
      fontWeight: 600, // --heading-h4-weight
      lineHeight: 1.375, // --heading-h4-line-height
      letterSpacing: '0', // --heading-h4-spacing
    },
    h5: {
      fontSize: '1.25rem', // --heading-h5-size
      fontWeight: 600, // --heading-h5-weight
      lineHeight: 1.5, // --heading-h5-line-height
      letterSpacing: '0', // --heading-h5-spacing
    },
    h6: {
      fontSize: '1rem', // --heading-h6-size
      fontWeight: 600, // --heading-h6-weight
      lineHeight: 1.5, // --heading-h6-line-height
      letterSpacing: '0', // --heading-h6-spacing
    },
    // Body text
    body1: {
      fontSize: '1rem', // --body-base-size
      fontWeight: 400, // --body-base-weight
      lineHeight: 1.5, // --body-base-line-height
    },
    body2: {
      fontSize: '0.875rem', // --body-small-size
      fontWeight: 400, // --body-small-weight
      lineHeight: 1.5, // --body-small-line-height
    },
    // Button text
    button: {
      fontSize: '1rem', // --button-base-size
      fontWeight: 600, // --button-base-weight
      textTransform: 'none',
    },
    // Caption
    caption: {
      fontSize: '0.75rem', // --caption-size
      fontWeight: 400, // --caption-weight
      lineHeight: 1.5, // --caption-line-height
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#241f1f',
          border: '1px solid rgba(184, 134, 11, 0.2)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
          transition: 'all 250ms ease',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
            transform: 'translateY(-2px)',
            borderColor: 'rgba(184, 134, 11, 0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(184, 134, 11, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #b8860b 0%, #8b6914 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(36, 31, 31, 0.6)',
            borderRadius: 8,
            '&:hover': {
              backgroundColor: 'rgba(36, 31, 31, 0.8)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(36, 31, 31, 0.9)',
              boxShadow: '0 0 0 3px rgba(184, 134, 11, 0.12)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#241f1f',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a1515',
          borderBottom: '1px solid rgba(184, 134, 11, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1515',
          borderRight: '1px solid rgba(184, 134, 11, 0.2)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0d0a0a !important',
          background: '#0d0a0a !important',
        },
        html: {
          backgroundColor: '#0d0a0a !important',
          background: '#0d0a0a !important',
        },
        '#root': {
          backgroundColor: '#0d0a0a !important',
          background: '#0d0a0a !important',
        },
        },
    },
  },
});

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.CASES} element={<CaseListPage />} />
        <Route path={ROUTES.CASE_DETAIL(':id')} element={<CaseDetailPage />} />
        <Route path={ROUTES.CASE_CREATE} element={<CaseCreatePage />} />
        <Route path={ROUTES.COMPLAINTS} element={<ComplaintListPage />} />
        <Route path={ROUTES.COMPLAINT_SUBMIT} element={<ComplaintSubmitPage />} />
        <Route path={ROUTES.COMPLAINT_DETAIL(':id')} element={<ComplaintDetailPage />} />
        <Route path={ROUTES.DETECTIVE_BOARD} element={<DetectiveBoardPage />} />
        <Route path="/detective-board/:caseId" element={<DetectiveBoardPage />} />
        <Route path={ROUTES.MOST_WANTED} element={<MostWantedPage />} />
        <Route path={ROUTES.EVIDENCE} element={<EvidenceListPage />} />
        <Route path={ROUTES.EVIDENCE_CREATE} element={<EvidenceCreatePage />} />
        <Route path={ROUTES.EVIDENCE_DETAIL(':id')} element={<EvidenceDetailPage />} />
        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        <Route path={ROUTES.REWARD_SUBMIT} element={<RewardSubmitPage />} />
        <Route path={ROUTES.REWARDS_MY} element={<MyRewardsPage />} />
        <Route path={ROUTES.REWARDS_REVIEW} element={<RewardReviewPage />} />
        <Route path={ROUTES.REWARD_VERIFY} element={<RewardVerificationPage />} />
        <Route path={ROUTES.TRIALS} element={<TrialsListPage />} />
        <Route path={ROUTES.TRIAL_DETAIL(':id')} element={<TrialPage />} />
        <Route path={ROUTES.PAY_BILLS} element={<PayBillsPage />} />
        <Route path={ROUTES.PAY_CALLBACK} element={<PaymentCallbackPage />} />
        <Route path={ROUTES.ADMIN_USERS} element={<UserManagementPage />} />
        <Route path={ROUTES.ADMIN_ROLES} element={<RoleManagementPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
