import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  LinearProgress,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Create headers with authorization token
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const res = await axios.get(`${config.API_URL}/api/projects`, getAuthHeaders());
        console.log('Projects data:', res.data); // Debug: Log projects data
        setProjects(res.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
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
      default:
        return 'default';
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;
    
    // Filter by user assignment if in "my projects" mode
    const matchesAssignment = 
      viewMode === 'all' || 
      (viewMode === 'my' && project.assignedTo && 
       project.assignedTo.some(assignedUser => 
         assignedUser._id === user._id || assignedUser._id === user.id
       )
      );
    
    return matchesSearch && matchesStatus && matchesAssignment;
  });

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
          onClick={() => navigate('/dashboard')} 
          sx={{ mt: 2 }}
        >
          Retour au tableau de bord
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 0, pb: 0, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Projets
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="project view mode"
            size="small"
          >
            <ToggleButton value="all" aria-label="all projects">
              Tous les projets
            </ToggleButton>
            <ToggleButton value="my" aria-label="my projects">
              Mes projets
            </ToggleButton>
          </ToggleButtonGroup>
          
          {user && (user.role === 'manager' || user.role === 'admin') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-project')}
            >
              Nouveau Projet
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Rechercher des Projets"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Filtrer par Statut"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Tous les Statuts</MenuItem>
            <MenuItem value="Non démarré">Non démarré</MenuItem>
            <MenuItem value="En cours">En cours</MenuItem>
            <MenuItem value="En attente">En attente</MenuItem>
            <MenuItem value="Terminé">Terminé</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ pb: 0 }}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Grid item xs={12} md={6} key={project._id} sx={{ mb: 0, pb: 1 }}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
              className="project-card">
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ 
                      mb: 1,
                      height: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {project.description}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={project.status}
                        color={getStatusColor(project.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {project.progress}% Terminé
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Créé par: {project.createdBy?.name}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 1.5, pt: 0 }}>
                  <Button
                    size="small"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    Voir les détails
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography align="center" color="textSecondary">
              {viewMode === 'my' ? "Vous n'avez aucun projet assigné." : "Aucun projet trouvé."}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ProjectList; 