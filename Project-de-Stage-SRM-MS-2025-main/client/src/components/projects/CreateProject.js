import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
  Alert,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  FormHelperText,
  Divider,
  ListSubheader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Autocomplete,
  Slider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import config from '../../config';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Status translations for display and internal values
const STATUS_OPTIONS = [
  { value: 'Non démarré', label: 'Non démarré' },
  { value: 'En cours', label: 'En cours' },
  { value: 'En attente', label: 'En attente' },
  { value: 'En garantie', label: 'En garantie' },
  { value: 'Terminé', label: 'Terminé' },
];

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

const CreateProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Non démarré',
    progress: 0,
    startDate: null,
    endDate: null,
    assignedTo: [],
    guaranteeDays: 0
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/api/users`);
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleUserSelect = (event, value) => {
    setSelectedUsers(value);
    setFormData({
      ...formData,
      assignedTo: value.map(user => user._id)
    });
  };

  const handleSliderChange = (event, newValue) => {
    const newStatus = newValue === 0 ? 'Non démarré' : 
                     newValue === 100 ? 'Terminé' : 
                     formData.status;
    
    setFormData({ 
      ...formData, 
      progress: newValue,
      status: newStatus
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await axios.post(`${config.API_URL}/api/projects`, formData);
      navigate('/projects');
    } catch (error) {
      setError('Erreur lors de la création du projet');
      console.error('Error creating project:', error);
    }
  };

  // Find the display label for the current status
  const getStatusLabel = (statusValue) => {
    const status = STATUS_OPTIONS.find(option => option.value === statusValue);
    return status ? status.label : statusValue;
  };

  useEffect(() => {
    if (formData.status === 'Terminé' && formData.progress !== 100) {
      setFormData(prev => ({ ...prev, progress: 100 }));
    } else if (formData.status === 'Non démarré' && formData.progress !== 0) {
      setFormData(prev => ({ ...prev, progress: 0 }));
    }
  }, [formData.status]);

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 5 },
          borderRadius: 2,
          background: theme => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#fafafa'})`,
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
            color: 'primary.main',
          }}
        >
          Créer un Nouveau Projet
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Titre du Projet"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Entrez le titre du projet"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                <InputLabel id="status-label">Statut</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Statut"
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography id="progress-slider-label" gutterBottom>
                Progression: {formData.progress}%
              </Typography>
              <Slider
                aria-labelledby="progress-slider-label"
                value={formData.progress}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
                sx={{
                  '& .MuiSlider-thumb': {
                    height: 24,
                    width: 24,
                  },
                  '& .MuiSlider-track': {
                    height: 8,
                    borderRadius: 4,
                  },
                  '& .MuiSlider-rail': {
                    height: 8,
                    borderRadius: 4,
                  },
                  color: theme => {
                    if (formData.progress === 100) return 'success.main';
                    if (formData.progress >= 50) return 'primary.main';
                    if (formData.progress >= 25) return 'warning.main';
                    return 'grey.500';
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={6}
                required
                variant="outlined"
                placeholder="Décrivez le projet en détail"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date de début"
                value={formData.startDate}
                onChange={handleDateChange('startDate')}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    required: true,
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 1 } }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date de fin"
                value={formData.endDate}
                onChange={handleDateChange('endDate')}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    required: true,
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 1 } }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phase de garantie (en jours)"
                name="guaranteeDays"
                type="number"
                value={formData.guaranteeDays}
                onChange={handleChange}
                InputProps={{ 
                  inputProps: { min: 0 },
                }}
                helperText="Nombre de jours de garantie après lesquels le projet passera au statut 'Terminé'"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                id="assignedTo"
                options={users}
                value={selectedUsers}
                onChange={handleUserSelect}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Assigner à"
                    placeholder="Sélectionnez des employés"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          width: 36, 
                          height: 36,
                          bgcolor: `${stringToColor(option.name)}40`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        {option.name.charAt(0).toUpperCase()}
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
                          sx={{ bgcolor: `${stringToColor(option.name)}40` }}
                        >
                          {option.name.charAt(0).toUpperCase()}
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

            <Grid item xs={12}>
              <Divider sx={{ mt: 2, mb: 4 }} />
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end',
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                  size="large"
                  sx={{ 
                    minWidth: '120px',
                    py: 1,
                    borderRadius: 1,
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ 
                    minWidth: '120px',
                    py: 1,
                    borderRadius: 1,
                    boxShadow: 2
                  }}
                >
                  Ajouter
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateProject; 