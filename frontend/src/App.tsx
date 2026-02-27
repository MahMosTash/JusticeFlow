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
import { RewardSubmitPage } from './pages/Rewards/RewardSubmitPage';
import { MyRewardsPage } from './pages/Rewards/MyRewardsPage';
import { RewardReviewPage } from './pages/Rewards/RewardReviewPage';
import { RewardVerificationPage } from './pages/Rewards/RewardVerificationPage';
import { ROUTES } from './constants/routes';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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
        <Route path={ROUTES.TRIAL_DETAIL(':id')} element={<TrialPage />} />
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
