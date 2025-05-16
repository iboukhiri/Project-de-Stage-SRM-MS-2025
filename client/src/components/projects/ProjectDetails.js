import React, { useState, useEffect } from 'react';
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
  EditNote as EditCommentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Forum as ForumIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
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

// Add a helper function to normalize MongoDB IDs for comparison
const isSameId = (id1, id2) => {
  if (!id1 || !id2) return false;
  return String(id1) === String(id2);
};

// Helper to generate consistent colors based on name
const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#3f51b5', // Indigo
    '#2196f3', // Blue
    '#009688', // Teal
    '#4caf50', // Green
    '#8bc34a', // Light Green
    '#cddc39', // Lime
    '#ffc107', // Amber
    '#ff9800', // Orange
    '#ff5722', // Deep Orange
    '#f44336', // Red
    '#e91e63', // Pink
    '#9c27b0'  // Purple
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Date formatting helpers
const formatDateFull = (dateString) => {
  if (!dateString) return 'Date inconnue';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDateRelative = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'aujourd\'hui';
  } else if (diffDays === 1) {
    return 'hier';
  } else if (diffDays < 7) {
    return `il y a ${diffDays} jours`;
  } else {
    return formatDateFull(dateString);
  }
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
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
  // New state for comment editing
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  // Create headers with authorization token
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch project and users in parallel for efficiency
        const [projectRes, usersRes] = await Promise.all([
          axios.get(`${config.API_URL}/api/projects/${id}`, getAuthHeaders()),
          axios.get(`${config.API_URL}/api/users`, getAuthHeaders())
        ]);
        
        const projectData = projectRes.data;
        const usersData = usersRes.data;
        
        // --- FIXED: Use isSameId for robust comparison and remove noisy logs ---
        // If you want to keep a minimal debug, use the following and comment out in production:
        /*
        if (projectData.comments && projectData.comments.length > 0) {
          console.log('Current user ID:', user?.id);
          console.log('Current user _id:', user?._id);
          console.log('Comment user IDs:', projectData.comments.map(c => ({ 
            commentId: c._id,
            userId: c.user._id, 
            userName: c.user.name,
            isOwner: isSameId(c.user._id, user?.id) || isSameId(c.user._id, user?._id)
          })));
        }
        */
        // --- END FIX ---

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
  }, [id, token]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${config.API_URL}/api/projects/${id}/comments`,
        { content: comment },
        getAuthHeaders()
      );
      setProject(res.data);
      setComment('');
      setError(null); // Réinitialise l'erreur si succès
    } catch (error) {
      console.error('Error adding comment:', error);
      // Affiche le message d'erreur du backend s'il existe
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Erreur lors de l\'ajout du commentaire');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${config.API_URL}/api/projects/${id}`, 
        editData,
        getAuthHeaders()
      );
      setProject(res.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Erreur lors de la mise à jour du projet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      await axios.delete(
        `${config.API_URL}/api/projects/${id}`,
        getAuthHeaders()
      );
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
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      setLoading(true);
      // Ensure commentId is a string 
      const commentIdStr = typeof commentId === 'object' ? commentId.toString() : commentId;
      
      console.log('Deleting comment with ID:', commentIdStr);
      
      const res = await axios.delete(
        `${config.API_URL}/api/projects/${id}/comments/${commentIdStr}`,
        getAuthHeaders()
      );
      
      // Update the project state with the full updated project data
      if (res.data && res.data._id) {
        setProject(res.data);
        setCommentDeleteConfirmOpen(false);
        setCommentToDelete(null);
      } else {
        throw new Error('Invalid response data from server');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        setError(error.response.data.message || 'Erreur lors de la suppression du commentaire');
      } else {
        setError('Erreur lors de la suppression du commentaire. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const openCommentDeleteDialog = (comment) => {
    console.log('Comment to delete:', comment);
    setCommentToDelete(comment);
    setCommentDeleteConfirmOpen(true);
  };

  const handleCommentEdit = async (commentId, content) => {
    try {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      setLoading(true);
      const res = await axios.put(
        `${config.API_URL}/api/projects/${id}/comments/${commentId}`,
        { content },
        getAuthHeaders()
      );
      
      setProject(res.data);
      setEditingCommentId(null);
      setEditingCommentContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        setError(error.response.data.message || 'Erreur lors de la modification du commentaire');
      } else {
        setError('Erreur lors de la modification du commentaire');
      }
    } finally {
      setLoading(false);
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentContent(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  // Helper functions for permission checking
  const isCommentOwner = (comment) => {
    if (!user || !comment || !comment.user) return false;
    return isSameId(comment.user._id, user.id) || isSameId(comment.user._id, user._id);
  };

  const isProjectOwner = (project) => {
    if (!user || !project || !project.createdBy) return false;
    return isSameId(project.createdBy._id, user.id) || isSameId(project.createdBy._id, user._id);
  };

  const hasRole = (user, roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  if (loading && !project) {
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

  // Check if user can edit (based on role and project ownership)
  const canEdit = user && (
    // Own project - anyone can edit their own project
    (project.createdBy && (isSameId(user.id, project.createdBy._id) || isSameId(user._id, project.createdBy._id))) ||
    // Superadmin can edit any project
    user.role === 'superadmin' ||
    // Admin can only edit regular users' projects, not other admins'
    (user.role === 'admin' && project.createdBy && 
     project.createdBy.role !== 'admin' && project.createdBy.role !== 'superadmin')
  );

  return (
    <Container maxWidth="lg" sx={{ 
      mt: { xs: 2, sm: 3, md: 4 }, // Adjusted margin for mobile
      mb: { xs: 2, sm: 3, md: 4 },
      px: { xs: 1, sm: 2, md: 3 } // Adjusted padding for mobile
    }}>
      <Paper elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, // Adjusted padding for mobile
        borderRadius: { xs: '12px', sm: '16px' } // Softer corners on mobile
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on mobile
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: { xs: 2, sm: 3 }
        }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, // Smaller font on mobile
              mb: { xs: 1, sm: 0 } // Add margin bottom only on mobile
            }}
          >
            {project.title}
          </Typography>
          {canEdit && (
            <Box sx={{ 
              display: 'flex',
              gap: { xs: 1, sm: 2 }, // Increased touch targets spacing on mobile
              mt: { xs: 1, sm: 0 } // Add margin top only on mobile
            }}>
              <IconButton 
                onClick={() => setEditMode(true)}
                sx={{ 
                  padding: { xs: '12px', sm: '8px' }, // Larger touch target on mobile
                  '& svg': { fontSize: { xs: '1.5rem', sm: '1.25rem' } } // Larger icons on mobile
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ 
                  padding: { xs: '12px', sm: '8px' },
                  '& svg': { fontSize: { xs: '1.5rem', sm: '1.25rem' } }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12} md={8}>
            <Typography 
              variant="body1" 
              paragraph
              sx={{
                fontSize: { xs: '1rem', sm: '1rem' },
                lineHeight: { xs: 1.6, sm: 1.75 }
              }}
            >
              {project.description}
            </Typography>

            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
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

            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
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
              <List sx={{ 
                mb: { xs: 2, sm: 4 },
                '& .MuiListItem-root': {
                  px: { xs: 1.5, sm: 2.5 }, // Adjusted padding for mobile
                  py: { xs: 2, sm: 2.5 }
                }
              }}>
                {project.comments && project.comments.length > 0 ? (
                  project.comments.map((comment, index) => (
                    <ListItem 
                      key={index} 
                      alignItems="flex-start" 
                      sx={{
                        border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 3,
                        mb: { xs: 1.5, sm: 2 }, // Adjusted margin for mobile
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
                        },
                        '& .MuiListItemAvatar-root': {
                          minWidth: { xs: '40px', sm: '56px' } // Smaller avatar area on mobile
                        },
                        '& .MuiAvatar-root': {
                          width: { xs: 35, sm: 45 }, // Smaller avatar on mobile
                          height: { xs: 35, sm: 45 }
                        },
                        '& .MuiListItemText-root': {
                          mt: { xs: 0, sm: 0.5 } // Adjusted top margin for mobile
                        },
                        '& .MuiIconButton-root': {
                          padding: { xs: '8px', sm: '6px' }, // Larger touch targets on mobile
                          '& svg': {
                            fontSize: { xs: '1.25rem', sm: '1rem' } // Larger icons on mobile
                          }
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          alt={comment.user.name}
                          sx={{ 
                            width: 45,
                            height: 45,
                            bgcolor: getAvatarColor(comment.user.name || ''),
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
                                {formatDateRelative(comment.createdAt)}
                                {comment.updatedAt && (
                                  <span> (modifié)</span>
                                )}
                              </Typography>
                              {/* Show edit button if user is the comment owner */}
                              {(isSameId(comment.user._id, user?.id) || isSameId(comment.user._id, user?._id)) && 
                                editingCommentId !== comment._id && (
                                <IconButton 
                                  size="small" 
                                  onClick={() => startEditingComment(comment)}
                                  color="primary"
                                  sx={{
                                    opacity: 0.7,
                                    '&:hover': { opacity: 1 },
                                  }}
                                >
                                  <EditCommentIcon fontSize="small" />
                                </IconButton>
                              )}
                              {/* Show delete button if user is admin or the comment owner */}
                              {(user?.role === 'admin' || isSameId(comment.user._id, user?.id) || 
                                isSameId(comment.user._id, user?._id)) && (
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
                          editingCommentId === comment._id ? (
                            <Box sx={{ mt: 2 }}>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                sx={{ 
                                  mb: 2,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                                  }
                                }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button 
                                  variant="outlined" 
                                  size="small" 
                                  onClick={cancelEditingComment}
                                  startIcon={<CancelIcon />}
                                >
                                  Annuler
                                </Button>
                                <Button 
                                  variant="contained" 
                                  size="small" 
                                  onClick={() => handleCommentEdit(comment._id, editingCommentContent)}
                                  startIcon={<SaveIcon />}
                                  disabled={!editingCommentContent.trim()}
                                >
                                  Enregistrer
                                </Button>
                              </Box>
                            </Box>
                          ) : (
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
                          )
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

              {/* Comment Form */}
              <Box
                component="form" 
                onSubmit={handleCommentSubmit} 
                sx={{ 
                  mt: { xs: 2, sm: 3 },
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  background: theme => theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.4)
                    : alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  '& .MuiTextField-root': {
                    mb: { xs: 1.5, sm: 2 }
                  },
                  '& .MuiButton-root': {
                    py: { xs: 1.5, sm: 1 }, // Taller button on mobile
                    width: { xs: '100%', sm: 'auto' } // Full width on mobile
                  }
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
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: { xs: '0.9rem', sm: '0.875rem' }
                  }}
                >
                  Envoyer
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, sm: 3 },
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
                },
                '& .MuiTypography-subtitle2': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                },
                '& .MuiAvatar-root': {
                  width: { xs: 35, sm: 40 },
                  height: { xs: 35, sm: 40 }
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
                        bgcolor: getAvatarColor(project.createdBy.name || ''),
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
                            bgcolor: getAvatarColor(assignedUser.name || ''),
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
      <Dialog 
        open={editMode} 
        onClose={() => setEditMode(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={window.innerWidth < 600} // Full screen on mobile
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            borderRadius: { xs: 0, sm: 2 }
          }
        }}
      >
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
                          bgcolor: getAvatarColor(option.name || '') 
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
                          sx={{ bgcolor: getAvatarColor(option.name || '') }}
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
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '90%', sm: 'auto' },
            m: { xs: 2, sm: 'auto' },
            p: { xs: 2, sm: 1 }
          }
        }}
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
            borderRadius: { xs: 1, sm: 2 },
            width: { xs: '90%', sm: 'auto' },
            m: { xs: 2, sm: 'auto' },
            p: { xs: 2, sm: 1 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
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

export default ProjectDetails;