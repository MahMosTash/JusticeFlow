/**
 * Main layout component with navigation
 */
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  Report,
  PersonSearch,
  AccountTree,
  Logout,
  Home,
  Gavel,
  LocalAtm,
  Person,
  VerifiedUser,
  Payment,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES } from '@/constants/routes';

const drawerWidth = 240;

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: ROUTES.HOME, show: true },
    { text: 'Dashboard', icon: <Dashboard />, path: ROUTES.DASHBOARD, show: true },
    {
      text: 'Cases',
      icon: <Assignment />,
      path: ROUTES.CASES,
      show: permissions.canCreateCase() || permissions.isInvestigator(),
    },
    {
      text: 'Detective Board',
      icon: <AccountTree />,
      path: ROUTES.DETECTIVE_BOARD,
      show: permissions.canUseDetectiveBoard(),
    },
    {
      text: 'Most Wanted',
      icon: <PersonSearch />,
      path: ROUTES.MOST_WANTED,
      show: permissions.canViewMostWanted(),
    },
    {
      text: 'Reports',
      icon: <Report />,
      path: ROUTES.REPORTS,
      show: permissions.isOfficer() || permissions.isInvestigator(),
    },
    {
      text: 'Trials',
      icon: <Gavel />,
      path: ROUTES.TRIALS,
      show: permissions.isJudge(),
    },
    {
      text: 'My Rewards',
      icon: <LocalAtm />,
      path: ROUTES.REWARDS_MY,
      show: permissions.isBasicUser(),
    },
    {
      text: 'Pay Bills & Fines',
      icon: <Payment />,
      path: ROUTES.PAY_BILLS,
      show: permissions.isBasicUser(),
    },
    {
      text: 'Review Submissions',
      icon: <Person />,
      path: ROUTES.REWARDS_REVIEW,
      show: permissions.isOfficer() || permissions.isInvestigator() || permissions.isPoliceChief(),
    },
    {
      text: 'Verify Rewards',
      icon: <VerifiedUser />,
      path: ROUTES.REWARD_VERIFY,
      show: permissions.isOfficer() || permissions.isInvestigator() || permissions.isCaptain() || permissions.isPoliceChief(),
    },
  ].filter((item) => item.show);

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Police CMS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Police Case Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.full_name || user?.username}
            </Typography>
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

