import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Autocomplete,
  Chip,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Snackbar,
  Divider,
  Tooltip
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircleOutline as CheckCircleIcon,
  PersonSearch as PersonSearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

// Translation mapping for status labels
const statusTranslations = {
  'Completed': 'Terminé',
  'In Progress': 'En cours',
  'On Hold': 'En attente',
  'Not Started': 'Non démarré',
};

// Helper to translate status
const translateStatus = (status) => {
  return statusTranslations[status] || status;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'In Progress': return 'primary';
    case 'On Hold': return 'warning';
    default: return 'default';
  }
};

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

const ProjectAssignment = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get projects
        const projectsResponse = await axios.get(`${config.API_URL}/api/projects`);
        setProjects(projectsResponse.data);
        
        // Get users
        const usersResponse = await axios.get(`${config.API_URL}/api/users`);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors du chargement des données',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedUsers(project.assignedTo || []);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProject(null);
    setSelectedUsers([]);
  };

  const handleSaveAssignments = async () => {
    try {
      setLoading(true);
      const updatedProject = {
        ...selectedProject,
        assignedTo: selectedUsers.map(user => user._id)
      };
      
      await axios.put(`${config.API_URL}/api/projects/${selectedProject._id}`, updatedProject);
      
      // Update the projects list with the updated project
      setProjects(projects.map(p => p._id === selectedProject._id ? {
        ...p,
        assignedTo: selectedUsers
      } : p));
      
      setSnackbar({
        open: true,
        message: 'Assignations mises à jour avec succès',
        severity: 'success'
      });
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating project assignments:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour des assignations',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const projectsResponse = await axios.get(`${config.API_URL}/api/projects`);
      setProjects(projectsResponse.data);
      setSnackbar({
        open: true,
        message: 'Données actualisées',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'actualisation',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter users who are not already assigned to this project
  const availableUsers = users.filter(user => 
    !selectedUsers.some(selected => selected._id === user._id)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des Assignations
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refreshData}
          disabled={loading}
        >
          Actualiser
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project._id}>
              <Card 
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {project.title}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2
                    }}
                  >
                    <Chip 
                      label={translateStatus(project.status)} 
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {project.progress}% Terminé
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    color={getStatusColor(project.status)}
                    sx={{ mb: 3, height: 6, borderRadius: 3 }}
                  />
                  
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Employés assignés:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {project.assignedTo && project.assignedTo.length > 0 ? (
                      project.assignedTo.map((user) => (
                        <Tooltip key={user._id} title={user.email || ''}>
                          <Chip
                            avatar={
                              <Avatar 
                                alt={user.name}
                                sx={{ bgcolor: stringToColor(user.name || '') }}
                              >
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </Avatar>
                            }
                            label={user.name}
                            size="small"
                            variant="outlined"
                            sx={{ m: 0.5 }}
                          />
                        </Tooltip>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Aucun employé assigné
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<PersonAddIcon />}
                    variant="contained"
                    fullWidth
                    onClick={() => handleProjectSelect(project)}
                  >
                    Gérer les assignations
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Assignment Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Typography variant="h6">
            Assignation d'employés au projet
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {selectedProject?.title}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Ajouter des employés
              </Typography>
              
              <Autocomplete
                options={availableUsers}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setSelectedUsers([...selectedUsers, newValue]);
                    setSearchValue('');
                  }
                }}
                inputValue={searchValue}
                onInputChange={(event, newInputValue) => {
                  setSearchValue(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rechercher un employé"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <PersonSearchIcon color="action" sx={{ mr: 1 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Avatar 
                        alt={option.name}
                        sx={{ bgcolor: stringToColor(option.name || '') }}
                      >
                        {option.name ? option.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                )}
              />
              
              {availableUsers.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Tous les employés disponibles ont déjà été assignés à ce projet.
                </Alert>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">
                  Employés sélectionnés
                </Typography>
                {selectedUsers.length > 0 && (
                  <Chip 
                    label={`${selectedUsers.length} employé${selectedUsers.length > 1 ? 's' : ''}`} 
                    color="primary" 
                    size="small" 
                  />
                )}
              </Box>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  minHeight: 200, 
                  maxHeight: 300, 
                  overflow: 'auto',
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }}
              >
                {selectedUsers.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedUsers.map((user) => (
                      <Card key={user._id} variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                        <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                alt={user.name}
                                sx={{ bgcolor: stringToColor(user.name || '') }}
                              >
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="body1">{user.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.7 }}>
                    <PersonAddIcon sx={{ fontSize: 48, mb: 1, color: 'text.secondary' }} />
                    <Typography color="text.secondary" align="center">
                      Aucun employé sélectionné
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Utilisez la recherche pour ajouter des employés au projet
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined" 
            startIcon={<CancelIcon />}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSaveAssignments} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectAssignment; 