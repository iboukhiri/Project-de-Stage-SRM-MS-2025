import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Slider,
  Autocomplete,
  FormHelperText,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteOutline as DeleteCommentIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import config from '../../config';
import { alpha } from '@mui/material/styles';

// Translation mapping for status labels - now for both display and internal values
const statusTranslations = {
  'Terminé': 'Terminé',
  'En cours': 'En cours',
  'En attente': 'En attente',
  'Non démarré': 'Non démarré',
  // Keep these for backward compatibility with existing data
  'Completed': 'Terminé',
  'In Progress': 'En cours',
  'On Hold': 'En attente',
  'Not Started': 'Non démarré',
};

// Helper to translate status
const translateStatus = (status) => {
  return statusTranslations[status] || status;
};

// Helper to get profile photo URL
// const getAvatarSrc = (userId) => {
//   if (!userId) return '';
//   return `${config.API_URL}/uploads/profile-photos/${userId}.jpg`;
// };

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [commentDeleteConfirmOpen, setCommentDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project and users in parallel for efficiency
        const [projectRes, usersRes] = await Promise.all([
          axios.get(`${config.API_URL}/api/projects/${id}`),
          axios.get(`${config.API_URL}/api/users`)
        ]);
        
        const projectData = projectRes.data;
        const usersData = usersRes.data;
        
        setProject(projectData);
        setEditData(projectData);
        setUsers(usersData);
        
        // Initialize selectedUsers with complete user objects from the users array
        if (projectData.assignedTo && projectData.assignedTo.length > 0 && usersData.length > 0) {
          const assignedUserObjects = projectData.assignedTo.map(assignedUser => {
            // If assignedUser is already an object with all properties, use it
            if (assignedUser._id && assignedUser.name) {
              return assignedUser;
            }
            // Otherwise, find the complete user object from the users array
            const userId = typeof assignedUser === 'object' ? assignedUser._id : assignedUser;
            return usersData.find(user => user._id === userId) || null;
          }).filter(Boolean); // Remove null entries
          
          setSelectedUsers(assignedUserObjects);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const res = await axios.post(`${config.API_URL}/api/projects/${id}/comments`, {
        content: comment,
      });
      setProject(res.data);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const res = await axios.put(`${config.API_URL}/api/projects/${id}`, editData);
      setProject(res.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDelete = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      // Configure the request with the token in headers
      const axiosConfig = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.delete(`${config.API_URL}/api/projects/${id}`, axiosConfig);
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      if (error.response) {
        // Server responded with an error status
        setError(`Error: ${error.response.data.message || 'Failed to delete project'}`);
      } else if (error.request) {
        // Request was made but no response
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened while setting up the request
        setError('An error occurred while trying to delete the project.');
      }
      setDeleteDialogOpen(false); // Close the dialog to show the error
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terminé':
      case 'Completed':
        return 'success';
      case 'En cours':
      case 'In Progress':
        return 'primary';
      case 'En attente':
      case 'On Hold':
        return 'warning';
      case 'Non démarré':
      case 'Not Started':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get color in hex/rgb format for styling
  const getStatusColorValue = (status) => {
    switch (status) {
      case 'Terminé':
      case 'Completed':
        return '#2e7d32'; // success.dark
      case 'En cours':
      case 'In Progress':
        return '#1976d2'; // primary.main
      case 'En attente':
      case 'On Hold':
        return '#ed6c02'; // warning.main
      case 'Non démarré':
      case 'Not Started':
      default:
        return '#757575'; // grey.600
    }
  };

  const handleUserSelect = (event, value) => {
    setSelectedUsers(value);
    setEditData({
      ...editData,
      assignedTo: value.map(user => user._id)
    });
  };

  // Find a user by ID in the users array
  const findUserById = (userId) => {
    return users.find(user => user._id === userId);
  };

  const handleCommentDelete = async (commentId) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      // Ensure commentId is a string 
      const commentIdStr = typeof commentId === 'object' ? commentId.toString() : commentId;
      
      console.log('Deleting comment with ID:', commentIdStr);
      
      // Configure the request with the token in headers
      const axiosConfig = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const res = await axios.delete(`${config.API_URL}/api/projects/${id}/comments/${commentIdStr}`, axiosConfig);
      console.log('Delete comment response:', res.data);
      setProject(res.data);
      setCommentDeleteConfirmOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        setError(error.response.data.message || 'Error deleting comment');
      }
    }
  };
  
  const openCommentDeleteDialog = (comment) => {
    console.log('Comment to delete:', comment);
    setCommentToDelete(comment);
    setCommentDeleteConfirmOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/projects')} 
          sx={{ mt: 2 }}
        >
          Retour aux projets
        </Button>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Projet non trouvé</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/projects')} 
          sx={{ mt: 2 }}
        >
          Retour aux projets
        </Button>
      </Container>
    );
  }

  // Check if user can edit (is admin or creator)
  const canEdit = user && (
    user.role === 'admin' || 
    (project.createdBy && user.id === project.createdBy._id)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {project.title}
          </Typography>
          {canEdit && (
            <Box>
              <IconButton onClick={() => setEditMode(true)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => setDeleteDialogOpen(true)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Progression
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: 0.5,
                alignItems: 'center' 
              }}>
                <Chip
                  label={translateStatus(project.status)}
                  color={getStatusColor(project.status)}
                  sx={{ mr: 1 }}
                />
                <Typography 
                  variant="body2" 
                  fontWeight="bold" 
                  sx={{ 
                    backgroundColor: `${getStatusColorValue(project.status)}20`, 
                    px: 1.5, 
                    py: 0.75, 
                    borderRadius: 1,
                    minWidth: '55px',
                    textAlign: 'center'
                  }}
                >
                  {project.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={project.progress}
                sx={{ 
                  height: 16, 
                  borderRadius: 2,
                  my: 1.5,
                  backgroundColor: `${getStatusColorValue(project.status)}20`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatusColorValue(project.status),
                    borderRadius: 2,
                    transition: 'transform 0.8s ease'
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme => theme.palette.mode === 'dark' 
                    ? theme.palette.grey[100]
                    : theme.palette.primary.main,
                  borderBottom: theme => `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  pb: 1,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                Commentaires
                {project.comments && project.comments.length > 0 && (
                  <Chip
                    label={project.comments.length}
                    size="small"
                    color="primary"
                    sx={{ 
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      background: theme => alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main'
                    }}
                  />
                )}
              </Typography>
              <List sx={{ mb: 4 }}>
                {project.comments && project.comments.length > 0 ? (
                  project.comments.map((comment, index) => (
                    <ListItem 
                      key={index} 
                      alignItems="flex-start" 
                      sx={{
                        border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 3,
                        mb: 2,
                        p: 2.5,
                        background: theme => theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.paper, 0.6)
                          : alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme => `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                          borderColor: theme => alpha(theme.palette.primary.main, 0.2),
                          background: theme => theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.paper, 0.8)
                            : alpha(theme.palette.background.paper, 0.95)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          alt={comment.user.name}
                          sx={{ 
                            width: 45,
                            height: 45,
                            bgcolor: stringToColor(comment.user.name || ''),
                            border: theme => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }
                          }}
                        >
                          {comment.user.name ? comment.user.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1
                          }}>
                            <Typography 
                              variant="subtitle1" 
                              component="span"
                              sx={{
                                fontWeight: 600,
                                color: theme => theme.palette.mode === 'dark'
                                  ? theme.palette.grey[100]
                                  : theme.palette.text.primary
                              }}
                            >
                              {comment.user ? comment.user.name : 'Utilisateur'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                variant="caption"
                                sx={{ 
                                  color: 'text.secondary',
                                  fontStyle: 'italic',
                                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 10,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {new Date(comment.createdAt).toLocaleString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                              {(user?.role === 'admin' || comment.user._id === user?._id) && (
                                <IconButton 
                                  size="small" 
                                  onClick={() => openCommentDeleteDialog(comment)}
                                  color="error"
                                  sx={{
                                    opacity: 0.7,
                                    '&:hover': { opacity: 1 },
                                    ml: 1
                                  }}
                                >
                                  <DeleteCommentIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme => theme.palette.mode === 'dark'
                                ? theme.palette.grey[300]
                                : theme.palette.text.primary,
                              mt: 1,
                              lineHeight: 1.6,
                              whiteSpace: 'pre-wrap'
                            }}
                          >
                            {comment.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      py: 4,
                      px: 2,
                      borderRadius: 3,
                      border: theme => `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                      bgcolor: theme => alpha(theme.palette.background.paper, 0.4),
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Aucun commentaire pour le moment
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mt: 1, opacity: 0.8 }}
                    >
                      Soyez le premier à commenter ce projet
                    </Typography>
                  </Box>
                )}
              </List>

              <Box 
                component="form" 
                onSubmit={handleCommentSubmit} 
                sx={{ 
                  mt: 3,
                  p: 3,
                  borderRadius: 3,
                  border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  background: theme => theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.4)
                    : alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)'
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Ajouter un commentaire..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                      '&:hover': {
                        backgroundColor: theme => alpha(theme.palette.background.paper, 0.8)
                      },
                      '&.Mui-focused': {
                        backgroundColor: theme => alpha(theme.palette.background.paper, 0.9)
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!comment.trim()}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&:hover': {
                      boxShadow: theme => `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                >
                  Ajouter Commentaire
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                borderRadius: 2,
                background: theme => theme.palette.mode === 'dark' 
                  ? `linear-gradient(145deg, ${alpha('#2a2a2a', 0.9)}, ${alpha('#1a1a1a', 0.9)})`
                  : `linear-gradient(145deg, #ffffff, ${alpha(theme.palette.primary.light, 0.1)})`,
                boxShadow: theme => theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme => theme.palette.mode === 'dark'
                    ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                    : '0 12px 40px rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme => theme.palette.mode === 'dark' 
                    ? theme.palette.grey[100]
                    : theme.palette.primary.main,
                  borderBottom: theme => `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  pb: 1,
                  mb: 3
                }}
              >
                Détails du Projet
              </Typography>
              
              {project.createdBy && (
                <Box 
                  sx={{ 
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    background: theme => alpha(theme.palette.background.default, 0.5),
                    backdropFilter: 'blur(5px)',
                    border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 600
                    }}
                  >
                    Créé par
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Avatar 
                      alt={project.createdBy.name}
                      sx={{ 
                        bgcolor: stringToColor(project.createdBy.name || ''),
                        width: 40,
                        height: 40,
                        border: theme => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }}
                    >
                      {project.createdBy.name ? project.createdBy.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Typography 
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: theme => theme.palette.mode === 'dark' 
                          ? theme.palette.grey[100]
                          : theme.palette.text.primary
                      }}
                    >
                      {project.createdBy.name}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              <Grid container spacing={3}>
                {project.startDate && (
                  <Grid item xs={6}>
                    <Box 
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        background: theme => alpha(theme.palette.background.default, 0.5),
                        backdropFilter: 'blur(5px)',
                        border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        height: '100%'
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 1,
                          fontWeight: 600
                        }}
                      >
                        Date de début
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: theme => theme.palette.mode === 'dark' 
                            ? theme.palette.grey[100]
                            : theme.palette.text.primary
                        }}
                      >
                        {new Date(project.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {project.endDate && (
                  <Grid item xs={6}>
                    <Box 
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        background: theme => alpha(theme.palette.background.default, 0.5),
                        backdropFilter: 'blur(5px)',
                        border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        height: '100%'
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 1,
                          fontWeight: 600
                        }}
                      >
                        Date de fin
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: theme => theme.palette.mode === 'dark' 
                            ? theme.palette.grey[100]
                            : theme.palette.text.primary
                        }}
                      >
                        {new Date(project.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              {project.assignedTo && project.assignedTo.length > 0 && (
                <Box 
                  sx={{ 
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    background: theme => alpha(theme.palette.background.default, 0.5),
                    backdropFilter: 'blur(5px)',
                    border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 600
                    }}
                  >
                    Assigné à
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1
                    }}
                  >
                    {project.assignedTo.map((assignedUser) => (
                      <Tooltip 
                        key={assignedUser._id}
                        title={assignedUser.name || "Utilisateur"}
                        arrow
                        placement="top"
                      >
                        <Avatar 
                          alt={assignedUser.name}
                          sx={{ 
                            bgcolor: stringToColor(assignedUser.name || ''),
                            width: 35,
                            height: 35,
                            border: theme => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          {assignedUser.name ? assignedUser.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="md" fullWidth>
        <DialogTitle>Modifier le Projet</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre"
                value={editData?.title || ''}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={editData?.description || ''}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Statut"
                value={editData?.status || ''}
                onChange={(e) =>
                  setEditData({ ...editData, status: e.target.value })
                }
              >
                <MenuItem value="Non démarré">Non démarré</MenuItem>
                <MenuItem value="En cours">En cours</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Terminé">Terminé</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="subtitle2" color="text.secondary">
                Progression: {editData?.progress || 0}%
              </Typography>
              <Slider
                value={editData?.progress || 0}
                onChange={(event, newValue) => {
                  const newStatus = newValue === 0 ? 'Non démarré' : 
                                   newValue === 100 ? 'Terminé' : 
                                   editData?.status;
                  
                  setEditData({ 
                    ...editData, 
                    progress: newValue,
                    status: newStatus
                  });
                }}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
                sx={{
                  mt: 1,
                  mb: 2,
                  '& .MuiSlider-thumb': {
                    height: 24,
                    width: 24,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    },
                    '&::before': {
                      boxShadow: '0 0 1px 8px rgba(0,0,0,0.05)',
                    }
                  },
                  '& .MuiSlider-track': {
                    height: 10,
                    borderRadius: 5,
                    transition: 'all 0.3s ease',
                  },
                  '& .MuiSlider-rail': {
                    height: 10,
                    borderRadius: 5,
                    opacity: 0.2,
                  },
                  '& .MuiSlider-mark': {
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                  },
                  color: () => {
                    const progress = editData?.progress || 0;
                    if (progress === 100) return 'success.main';
                    if (progress >= 70) return 'success.main';
                    if (progress >= 40) return 'primary.main';
                    if (progress >= 20) return 'warning.main';
                    return 'grey.500';
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                mb: 2,
                background: theme => alpha(theme.palette.background.default, 0.5),
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                position: 'relative',
              }}>
                <Typography gutterBottom variant="subtitle2" sx={{ 
                  color: 'text.secondary',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Progression visuelle</span>
                  <Box component="span" sx={{ 
                    py: 0.5, 
                    px: 1.5, 
                    borderRadius: 10, 
                    backgroundColor: getStatusColorValue(editData?.status || 'Not Started'),
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    minWidth: '52px',
                    textAlign: 'center',
                  }}>
                    {editData?.progress || 0}%
                  </Box>
                </Typography>
                <Box sx={{ position: 'relative', mt: 1.5, height: 20 }}>
                  <LinearProgress
                    variant="determinate"
                    value={editData?.progress || 0}
                    sx={{ 
                      height: 20, 
                      borderRadius: 10,
                      backgroundColor: `${getStatusColorValue(editData?.status || 'Not Started')}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStatusColorValue(editData?.status || 'Not Started'),
                        borderRadius: 10,
                        transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }
                    }}
                  />
                  {/* Milestone markers */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '25%',
                    transform: 'translate(-50%, -50%)',
                    width: 2,
                    height: editData?.progress >= 25 ? 12 : 20,
                    backgroundColor: editData?.progress >= 25 ? 'white' : alpha(getStatusColorValue(editData?.status || 'Not Started'), 0.5),
                    zIndex: editData?.progress >= 25 ? 1 : 0,
                  }} />
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 2,
                    height: editData?.progress >= 50 ? 12 : 20,
                    backgroundColor: editData?.progress >= 50 ? 'white' : alpha(getStatusColorValue(editData?.status || 'Not Started'), 0.5),
                    zIndex: editData?.progress >= 50 ? 1 : 0,
                  }} />
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '75%',
                    transform: 'translate(-50%, -50%)',
                    width: 2,
                    height: editData?.progress >= 75 ? 12 : 20,
                    backgroundColor: editData?.progress >= 75 ? 'white' : alpha(getStatusColorValue(editData?.status || 'Not Started'), 0.5),
                    zIndex: editData?.progress >= 75 ? 1 : 0,
                  }} />
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mt: 1, 
                  fontWeight: 'medium', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary' 
                }}>
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={users}
                value={selectedUsers}
                onChange={handleUserSelect}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Assigné à"
                    placeholder="Sélectionnez des employés"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                      <Avatar 
                        // src={getAvatarSrc(option._id)}
                        alt={option.name}
                        // imgProps={{ 
                        //   onError: (e) => {
                        //     e.target.src = '';
                        //   }
                        // }}
                        sx={{ 
                          bgcolor: stringToColor(option.name || '') 
                        }}
                      >
                        {option.name ? option.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                      </Box>
                    </Box>
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      avatar={
                        <Avatar 
                          // src={getAvatarSrc(option._id)}
                          alt={option.name}
                          // imgProps={{ 
                          //   onError: (e) => {
                          //     e.target.src = '';
                          //   }
                          // }}
                          sx={{ bgcolor: stringToColor(option.name || '') }}
                        >
                          {option.name ? option.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                      }
                      label={option.name}
                      {...getTagProps({ index })}
                      size="medium"
                      sx={{ 
                        marginRight: 0.8,
                        marginBottom: 0.5,
                        borderRadius: '16px', 
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                    />
                  ))
                }
              />
              <FormHelperText>Sélectionnez un ou plusieurs employés</FormHelperText>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)}>Annuler</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Enregistrer les modifications
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Supprimer le projet ?</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Delete Confirmation Dialog */}
      <Dialog
        open={commentDeleteConfirmOpen}
        onClose={() => setCommentDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            p: 1
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Confirmer la suppression
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setCommentDeleteConfirmOpen(false)}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={() => {
              console.log('Delete button clicked, comment:', commentToDelete);
              if (commentToDelete && commentToDelete._id) {
                handleCommentDelete(commentToDelete._id);
              } else {
                console.error('No comment selected for deletion');
              }
            }}
            color="error"
            variant="contained"
            autoFocus
            sx={{ borderRadius: 2 }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Utility function to generate consistent colors from strings
function stringToColor(string) {
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

export default ProjectDetails; 