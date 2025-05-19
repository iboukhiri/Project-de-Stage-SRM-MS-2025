import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  InputAdornment,
  Snackbar,
  SnackbarContent,
  Card
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import UndoIcon from '@mui/icons-material/Undo';
import ThemeToggle from '../common/ThemeToggle';
import axios from 'axios';
import config from '../../config';

// Utility function to generate consistent colors from strings
function stringToColor(string) {
  if (!string) return '#1976d2';
  
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  
  return color;
}

const Profile = () => {
  const { user, isAuthenticated, logout, updateUserProfile } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [previousData, setPreviousData] = useState(null);
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Determine if user is super admin
  const isSuperAdmin = user && user.role === 'superadmin';

  useEffect(() => {
    // Initialize form with current user data
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
  };
  
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };
  
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
  
  const toggleShowCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };
  
  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePasswordForm = () => {
    if (newPassword && !currentPassword) {
      setMessage({
        type: 'error',
        text: 'Veuillez entrer votre mot de passe actuel',
      });
      return false;
    }
    
    if (newPassword && newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
      });
      return false;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Les mots de passe ne correspondent pas',
      });
      return false;
    }
    
    return true;
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleUndoChanges = async () => {
    if (!previousData) return;
    
    setLoading(true);
    try {
      // Save current data temporarily in case undo fails
      const tempCurrentData = {
        name,
        email
      };

      // Prepare data for the revert
      const revertData = {
        name: previousData.name
      };

      // Only include email if it's different
      if (previousData.email !== user.email) {
        revertData.email = previousData.email;
      }

      // Store token for the API call
      const token = localStorage.getItem('token');
      
      // Revert the changes
      const response = await axios.put(
        `${config.API_URL}/api/users/${user._id}`, 
        revertData, 
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
        }
      );

      // Update form fields
      setName(response.data.name);
      setEmail(response.data.email);
      
      // Update the user data in the AuthContext
      updateUserProfile({
        name: response.data.name,
        email: response.data.email,
        _id: response.data._id || response.data.id
      });

      setMessage({
        type: 'success',
        text: 'Changements annulés avec succès',
      });
    } catch (error) {
      console.error('Error reverting changes:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'annulation des changements',
      });
    } finally {
      setLoading(false);
      setSnackbarOpen(false);
      setPreviousData(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    if (newPassword && !validatePasswordForm()) {
      setLoading(false);
      return;
    }

    try {
      if (isSuperAdmin) {
        // Store previous data for possible revert
        setPreviousData({
          name: user.name,
          email: user.email
        });
        
        // For superadmin: update name, email, and password
        const updateData = { name };
        
        // Only include email if it's different
        if (email !== user.email) {
          updateData.email = email;
        }
        
        // Only include password if a new one is provided
        if (newPassword) {
          updateData.currentPassword = currentPassword;
          updateData.password = newPassword;
        }
        
        // Update using the more privileged route
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${config.API_URL}/api/users/${user._id}`, 
          updateData, 
          {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
          }
        );

        // Update local state with the response data
        setName(response.data.name);
        setEmail(response.data.email);
        
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Update the user data in the AuthContext
        updateUserProfile({
          name: response.data.name,
          email: response.data.email,
          _id: response.data._id || response.data.id
        });

        // Show undo notification for super admin
        setSnackbarOpen(true);
        // Auto close the undo option after 15 seconds
        setTimeout(() => {
          setSnackbarOpen(false);
        }, 15000);
      } else {
        // For regular users: update only the name
        const response = await axios.put(
          `${config.API_URL}/api/users/profile`, 
          { name }, 
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Update local state with the response data
        setName(response.data.name);
        
        // Update the user data in the AuthContext
        updateUserProfile({
          name: response.data.name,
          _id: response.data._id || response.data.id
        });
      }
      
      setMessage({
        type: 'success',
        text: 'Profil mis à jour avec succès',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Erreur lors de la mise à jour du profil';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.status === 401) {
        errorMessage = 'Mot de passe actuel incorrect';
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Alert severity="warning">Vous devez être connecté pour accéder à cette page.</Alert>
      </Container>
    );
  }

  // Define a reusable function for the TextField styling
  const getTextFieldStyle = () => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      transition: 'all 0.3s',
      '&:hover': {
        boxShadow: '0 3px 8px rgba(0,0,0,0.08)'
      },
      '&.Mui-focused': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
      }
    },
    mb: 3
  });

  return (
    <>
      {/* SRM Navigation Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          background: theme => theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right, #ff9933, #ffb366)' 
            : 'linear-gradient(to right, #009688, #26a69a)',
          mb: 4,
          borderRadius: 0,
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 3px 10px rgba(255, 153, 51, 0.3)'
            : '0 3px 10px rgba(0, 150, 136, 0.2)'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* SRM Logo */}
            <Box 
              component={Link} 
              to="/dashboard"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'white'
              }}
            >
              <Box
                component="img"
                src={`${process.env.PUBLIC_URL}/images/srm-marrakech-safi-seeklogo.svg`} 
                alt="SRM Logo" 
                sx={{
                  height: '120px',
                  width: 'auto',
                  mr: 2,
                  filter: theme => theme.palette.mode === 'dark' 
                    ? 'brightness(0) drop-shadow(3px 3px 5px rgba(0,0,0,0.3))'
                    : 'brightness(0) invert(1) drop-shadow(3px 3px 5px rgba(255,255,255,0.3))',
                  alignSelf: 'center',
                  display: 'block',
                  transition: 'all 0.3s ease'
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* User Avatar/Menu */}
            <Tooltip title="Options du profil">
              <IconButton 
                onClick={handleProfileMenuOpen}
                sx={{ 
                  ml: 1,
                  p: 0.5,
                  border: '2px solid rgba(255,255,255,0.7)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    border: theme => theme.palette.mode === 'dark' 
                      ? '2px solid #ffcc80'
                      : '2px solid #80cbc4',
                    boxShadow: theme => theme.palette.mode === 'dark'
                      ? '0 3px 12px rgba(255,153,51,0.3)'
                      : '0 3px 12px rgba(0,150,136,0.3)'
                  }
                }}
              >
                <Avatar
                  alt={user?.name || "User"}
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: user?.name ? stringToColor(user.name) : 'primary.light',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleCloseUserMenu}
              MenuListProps={{
                'aria-labelledby': 'user-menu',
              }}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  width: 200,
                  borderRadius: 2,
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                  '& .MuiMenuItem-root': {
                    py: 1.5,
                    '&:hover': {
                      bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255, 153, 51, 0.08)' 
                        : 'rgba(0, 150, 136, 0.08)',
                    }
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {user && (
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="subtitle1" fontWeight="medium">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    {user.email}
                  </Typography>
                </Box>
              )}
              
              <MenuItem onClick={() => navigate('/dashboard')}>
                <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
                <Typography variant="body2" fontWeight={600}>Tableau de bord</Typography>
              </MenuItem>
              
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                <Typography variant="body2" fontWeight={600}>Déconnexion</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container 
        maxWidth="md" 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 4, 
          mb: 8 
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%',
            maxWidth: '800px',
            mx: 'auto',
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            background: theme => theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, #2A2A2A, ${theme.palette.grey[900]})`
              : `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
            boxShadow: theme => theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              mb: 4,
              textAlign: 'center',
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #FF9933, #FFBB66)'
                : theme.palette.primary.main,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              textShadow: theme => theme.palette.mode === 'dark'
                ? '0px 2px 5px rgba(255,153,51,0.3)'
                : '0px 2px 5px rgba(0,0,0,0.1)',
              fontSize: { xs: '1.8rem', md: '2.2rem' },
            }}
          >
            Mon Profil
          </Typography>

          {message.text && (
            <Alert 
              severity={message.type} 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              {message.text}
            </Alert>
          )}

          <Grid container spacing={4} alignItems="flex-start" justifyContent="center">
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 4, 
                  p: 3, 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(48, 48, 48, 0.7)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: theme => theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Avatar
                  sx={{
                    width: 110,
                    height: 110,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '2.5rem',
                    bgcolor: user?.name ? stringToColor(user.name) : 'primary.main',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: theme => `4px solid ${theme.palette.background.paper}`,
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : ''}
                </Avatar>
                <Typography variant="h6" align="center" gutterBottom fontWeight="bold">
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
                  {user?.email}
                </Typography>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 5,
                      backgroundColor: theme =>
                        user?.role === 'superadmin'
                          ? theme.palette.mode === 'dark'
                            ? 'rgba(233, 30, 99, 0.5)'  // Pink for superadmin in dark mode
                            : 'rgba(233, 30, 99, 0.5)'  // Pink for superadmin in light mode
                          : user?.role === 'admin'
                            ? theme.palette.mode === 'dark'
                              ? 'rgba(255, 153, 51, 0.5)'
                              : 'rgba(0, 150, 136, 0.5)'
                            : theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.15)'
                              : 'rgba(0, 0, 0, 0.08)',
                      color: theme =>
                        user?.role === 'superadmin' || user?.role === 'admin'
                          ? '#FFFFFF'
                          : theme.palette.mode === 'dark'
                            ? '#FFFFFF'
                            : 'rgba(0, 0, 0, 0.7)',
                      fontWeight: 600,
                      boxShadow: theme => 
                        user?.role === 'superadmin'
                          ? '0 3px 5px rgba(233, 30, 99, 0.3)'
                          : user?.role === 'admin' 
                            ? theme.palette.mode === 'dark'
                              ? '0 3px 5px rgba(255, 153, 51, 0.3)'
                              : '0 3px 5px rgba(0, 150, 136, 0.3)'
                            : 'none',
                      border: theme => 
                        user?.role === 'superadmin'
                          ? '1px solid rgba(233, 30, 99, 0.5)'
                          : user?.role === 'admin'
                            ? theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 153, 51, 0.5)'
                              : '1px solid rgba(0, 150, 136, 0.5)'
                            : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme => 
                          user?.role === 'superadmin'
                            ? '0 5px 8px rgba(233, 30, 99, 0.4)'
                            : user?.role === 'admin'
                              ? theme.palette.mode === 'dark'
                                ? '0 5px 8px rgba(255, 153, 51, 0.4)'
                                : '0 5px 8px rgba(0, 150, 136, 0.4)'
                              : 'none'
                      }
                    }}
                  >
                    {user?.role === 'superadmin' 
                      ? 'Super Administrateur' 
                      : user?.role === 'admin' 
                        ? 'Administrateur' 
                        : 'Utilisateur'}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 4, 
                  p: 3, 
                  background: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(48, 48, 48, 0.7)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: theme => theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Nom"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={handleNameChange}
                    variant="outlined"
                    sx={getTextFieldStyle()}
                  />
                  
                  {isSuperAdmin && (
                    <>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={handleEmailChange}
                        variant="outlined"
                        sx={getTextFieldStyle()}
                      />
                      
                      <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          Changer le mot de passe
                        </Typography>
                      </Divider>
                      
                      <TextField
                        margin="normal"
                        fullWidth
                        id="currentPassword"
                        label="Mot de passe actuel"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={handleCurrentPasswordChange}
                        variant="outlined"
                        sx={getTextFieldStyle()}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={toggleShowCurrentPassword}
                                edge="end"
                              >
                                {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        margin="normal"
                        fullWidth
                        id="newPassword"
                        label="Nouveau mot de passe"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        variant="outlined"
                        helperText="Laissez vide pour ne pas changer le mot de passe"
                        sx={getTextFieldStyle()}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={toggleShowNewPassword}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        margin="normal"
                        fullWidth
                        id="confirmPassword"
                        label="Confirmer le nouveau mot de passe"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        variant="outlined"
                        sx={getTextFieldStyle()}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={toggleShowConfirmPassword}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        minWidth: '200px',
                        py: 1.2,
                        fontWeight: 'bold',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 2,
                        boxShadow: theme => theme.palette.mode === 'dark'
                          ? '0 4px 15px rgba(255,153,51,0.3)'
                          : '0 4px 15px rgba(0,150,136,0.2)',
                        background: theme => theme.palette.mode === 'dark'
                          ? 'linear-gradient(45deg, #FF9933, #FFBB66)'
                          : 'linear-gradient(45deg, #009688, #4DB6AC)',
                        '&:hover': {
                          background: theme => theme.palette.mode === 'dark'
                            ? 'linear-gradient(45deg, #FF8033, #FFA94D)'
                            : 'linear-gradient(45deg, #00897B, #26A69A)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <>
                          <CheckCircleIcon sx={{ mr: 1 }} />
                          Sauvegarder
                        </>
                      )}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Undo Notification */}
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={15000}
      >
        <SnackbarContent
          sx={{
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? '#333333' 
              : '#444444',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            borderRadius: 2,
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme => theme.spacing(1, 2),
          }}
          message={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2">
                Vos informations ont été mises à jour
              </Typography>
            </Box>
          }
          action={
            <Button 
              color="secondary" 
              size="small" 
              onClick={handleUndoChanges}
              startIcon={<UndoIcon />}
              sx={{
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Annuler
            </Button>
          }
        />
      </Snackbar>
    </>
  );
};

export default Profile; 