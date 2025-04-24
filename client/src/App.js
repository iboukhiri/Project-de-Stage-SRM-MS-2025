import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CustomThemeProvider } from './context/ThemeContext';

// Styles
import './styles/auth.css';

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

function App() {
  return (
    <CustomThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <AppRoutes />
        </Router>
      </LocalizationProvider>
    </CustomThemeProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'];
  return (
    <>
      {!hideNavbar.includes(location.pathname) && <Navbar />}
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard route now at /dashboard */}
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
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
