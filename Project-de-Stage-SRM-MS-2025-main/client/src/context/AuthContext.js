import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import config from '../config';

export const AuthContext = createContext();

// Add custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Load user data from token on initial mount
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      const tokenFromStorage = localStorage.getItem('token');
      
      if (tokenFromStorage) {
        setToken(tokenFromStorage);
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
          
          // First, check if we have cached user data
          const savedUserData = localStorage.getItem('userData');
          let userData = null;
          
          if (savedUserData) {
            try {
              userData = JSON.parse(savedUserData);
              // Set initial user data from localStorage
              setUser(userData);
              setIsAuthenticated(true);
            } catch (err) {
              console.error('Error parsing saved user data:', err);
            }
          }
          
          // Always try to refresh user data from server
          try {
            const res = await axios.get(`${config.API_URL}/api/auth/user`);
            const serverUserData = res.data;
            
            // Update user with fresh data
            setUser(serverUserData);
            
            // Update the cached user data
            localStorage.setItem('userData', JSON.stringify(serverUserData));
            
            setIsAuthenticated(true);
          } catch (err) {
            // If token is invalid but we have user data, still stay logged in
            if (userData) {
              setIsAuthenticated(true);
            } else {
              // If no valid token and no user data, log out
              console.error('Failed to load user:', err);
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
              delete axios.defaults.headers.common['Authorization'];
              setIsAuthenticated(false);
              setUser(null);
              setToken(null);
            }
          }
        } catch (err) {
          console.error('Auth error:', err);
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${config.API_URL}/api/auth/login`, {
        email,
        password,
      });
      const { token: newToken, user } = res.data;
      
      // Ensure user data is complete
      console.log('User data from login:', user);
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Save full user data to localStorage
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Set axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Update application state
      setIsAuthenticated(true);
      setUser(user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      console.log('Making registration request with:', { name, email, role: role || 'user' });
      
      const res = await axios.post(`${config.API_URL}/api/auth/register`, {
        name,
        email,
        password,
        role
      });
      
      const { token: newToken, user } = res.data;
      
      // Ensure user data is complete
      console.log('User data from registration:', user);
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Save full user data to localStorage
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Set axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Update application state
      setIsAuthenticated(true);
      setUser(user);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message || error);
      // Re-throw the error so the component can handle it
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  const updateUserProfile = (updatedUser) => {
    // Update the user state with new data
    const updatedUserData = { 
      ...user, 
      ...updatedUser
    };
    
    setUser(updatedUserData);
    
    // Persist important user information to localStorage
    try {
      const userDataForStorage = {
        _id: updatedUserData._id || updatedUserData.id,
        id: updatedUserData._id || updatedUserData.id,
        name: updatedUserData.name,
        email: updatedUserData.email,
        role: updatedUserData.role
      };
      localStorage.setItem('userData', JSON.stringify(userDataForStorage));
    } catch (err) {
      console.error('Error saving user data to localStorage:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        token,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}; 