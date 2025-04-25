import React, { useState, useEffect, useContext } from 'react';
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import config from '../../config';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/api/projects`);
        setProjects(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terminé':
        return 'success';
      case 'En cours':
        return 'primary';
      case 'En attente':
        return 'warning';
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
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Projets
        </Typography>
        {user && user.role === 'admin' && (
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
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

      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} key={project._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  {project.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ 
                    mb: 1.5,
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
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  Voir les détails
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProjectList; 