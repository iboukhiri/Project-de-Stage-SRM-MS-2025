import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  const { user, isAuthenticated, updateUserProfile } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Alert severity="warning">Vous devez être connecté pour accéder à cette page.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
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
                      ? 'rgba(255,153,51,0.15)'
                      : 'rgba(0,150,136,0.15)'
                    : 'rgba(0,0,0,0.05)',
                color: theme =>
                  user?.role === 'admin'
                    ? theme.palette.mode === 'dark'
                      ? '#FF9933'
                      : '#009688'
                    : 'inherit',
                fontWeight: 500,
                mt: 1,
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
  );
};

export default Profile; 