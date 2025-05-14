import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SuperAdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) return null;

  return isAuthenticated && user.role === 'superadmin'
    ? children
    : <Navigate to="/dashboard" />;
};

export default SuperAdminRoute; 