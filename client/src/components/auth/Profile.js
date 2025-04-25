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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  useEffect(() => {
    // Initialize form with current user data
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update user profile with just the name
      const response = await axios.put(`${config.API_URL}/api/users/profile`, { name }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Update local state with the response data
      setName(response.data.name);
      
      // Update the user data in the AuthContext
      updateUserProfile({
        name: response.data.name,
        _id: response.data._id || response.data.id
      });
      
      setMessage({
        type: 'success',
        text: 'Profil mis à jour avec succès',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour du profil',
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

      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
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
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: user?.name ? stringToColor(user.name) : 'primary.main',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: theme => `4px solid ${theme.palette.background.paper}`,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : ''}
              </Avatar>
              <Typography variant="h6" align="center" gutterBottom>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
                {user?.email}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  display: 'inline-block',
                  px: 2,
                  py: 0.5,
                  borderRadius: 5,
                  backgroundColor: theme =>
                    user?.role === 'admin'
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(255, 153, 51, 0.5)'
                        : 'rgba(0, 150, 136, 0.5)'
                      : theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(0, 0, 0, 0.08)',
                  color: theme =>
                    user?.role === 'admin'
                      ? theme.palette.mode === 'dark'
                        ? '#FFFFFF'
                        : '#FFFFFF'
                      : theme.palette.mode === 'dark'
                        ? '#FFFFFF'
                        : 'rgba(0, 0, 0, 0.7)',
                  fontWeight: 600,
                  mt: 1,
                  boxShadow: theme => user?.role === 'admin' 
                    ? theme.palette.mode === 'dark'
                      ? '0 3px 5px rgba(255, 153, 51, 0.3)'
                      : '0 3px 5px rgba(0, 150, 136, 0.3)'
                    : 'none',
                  border: theme => user?.role === 'admin'
                    ? theme.palette.mode === 'dark'
                      ? '1px solid rgba(255, 153, 51, 0.5)'
                      : '1px solid rgba(0, 150, 136, 0.5)'
                    : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme => user?.role === 'admin'
                      ? theme.palette.mode === 'dark'
                        ? '0 5px 8px rgba(255, 153, 51, 0.4)'
                        : '0 5px 8px rgba(0, 150, 136, 0.4)'
                      : 'none'
                  }
                }}
              >
                {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
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
                  sx={{ mb: 3 }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 2,
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
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default Profile; 