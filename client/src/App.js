import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import NotificationProvider from './context/NotificationContext';
import { Box, Typography } from '@mui/material';

// Styles
import './styles/auth.css';
import './styles/custom.css';

// Components
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import ProjectDetails from './components/projects/ProjectDetails';
import CreateProject from './components/projects/CreateProject';
import ProjectAssignment from './components/admin/ProjectAssignment';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import SuperAdminDashboard from './components/dashboard/SuperAdminDashboard';
import SuperAdminRoute from './components/routing/SuperAdminRoute';
import UserManagement from './components/admin/UserManagement';
import AboutPage from './components/common/AboutPage';
import Footer from './components/layout/Footer';

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Router>
              <AppRoutes />
            </Router>
          </LocalizationProvider>
        </NotificationProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const authPaths = ['/login', '/register', '/profile'];
  const isAuthPage = authPaths.includes(location.pathname);
  
  // Style for the wrapper box that will apply the scaling
  const scaledContentStyle = {
    width: '125%', // Compensate for the 80% scale to maintain full width
    height: 'auto', // Let height adjust naturally 
    transform: 'scale(0.8)',
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'visible',
    paddingBottom: '0.5rem', // Reduced padding at bottom
    margin: 0,
    '& .MuiContainer-root': {
      paddingBottom: '1rem !important',
      marginBottom: 0
    },
    '& .MuiTabs-root, & .MuiTab-root': {
      // Override Tab-specific styles when scaled
      transformOrigin: 'top left',
      marginBottom: 0
    },
    // Ensure tab content is properly clickable and visible
    '& [role="tabpanel"]': {
      pointerEvents: 'auto',
      minHeight: '400px', // Reduced minimum height
      '& canvas': {
        pointerEvents: 'auto'
      }
    }
  };

  return (
    <>
      {!isAuthPage && <Navbar />}
      
      {/* Apply scaling to non-auth pages */}
      <Box
        sx={isAuthPage ? {} : { ...scaledContentStyle, display: 'flex', flexDirection: 'column' }}
        className={isAuthPage ? '' : 'scaled-container container-fix'}
      >
        <Box component="main" sx={{ flex: 1 }}>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard route now at /dashboard */}
            <Route
              path="/superadmin"
              element={
                <SuperAdminRoute>
                  <Dashboard />
                </SuperAdminRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <ProjectList />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <PrivateRoute>
                  <ProjectDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-project"
              element={
                <AdminRoute>
                  <CreateProject />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/assign-projects"
              element={
                <AdminRoute>
                  <ProjectAssignment />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/user-management"
              element={
                <SuperAdminRoute>
                  <UserManagement />
                </SuperAdminRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/about"
              element={
                <AboutPage />
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Box>
        {!isAuthPage && <Footer />}
      </Box>
    </>
  );
}

export default App;
