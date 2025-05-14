import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';
import addCompletedProjects from '../../utils/addCompletedProjects';

const AddSampleProjects = ({ onProjectsAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { token } = useAuth();

  const handleOpen = () => {
    setOpen(true);
    setResult(null);
  };

  const handleClose = () => {
    setOpen(false);
    // If projects were added successfully, refresh the dashboard
    if (result && result.success && typeof onProjectsAdded === 'function') {
      onProjectsAdded();
    }
  };

  const handleAddProjects = async () => {
    setLoading(true);
    try {
      const response = await addCompletedProjects(token);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: error.message || 'Une erreur s\'est produite lors de l\'ajout des projets'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{ 
          mb: 2,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(0, 150, 136, 0.08)'
          }
        }}
      >
        Ajouter des projets d'exemple
      </Button>

      <Dialog
        open={open}
        onClose={loading ? undefined : handleClose}
        aria-labelledby="add-projects-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="add-projects-dialog-title">
          Ajouter des exemples de projets
        </DialogTitle>
        <DialogContent>
          {!loading && !result && (
            <DialogContentText>
              Cette action ajoutera 10 nouveaux projets complétés dans le mois courant, 
              avec au moins 3 commentaires chacun. Ces projets permettront de mieux 
              visualiser les tendances et les statistiques dans le tableau de bord.
              <br /><br />
              Voulez-vous continuer?
            </DialogContentText>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress color="primary" />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Création des projets en cours...
              </Typography>
            </Box>
          )}

          {result && (
            <Box mt={2}>
              <Alert severity={result.success ? "success" : "error"}>
                {result.message}
              </Alert>
              {result.success && (
                <Box mt={2}>
                  <Typography variant="body2">
                    {result.projects?.length} projets ont été créés avec succès. 
                    Ils apparaîtront dans les statistiques de ce mois-ci.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!loading && !result && (
            <>
              <Button onClick={handleClose} color="inherit">
                Annuler
              </Button>
              <Button onClick={handleAddProjects} color="primary" variant="contained">
                Ajouter les projets
              </Button>
            </>
          )}
          {(loading || result) && (
            <Button 
              onClick={handleClose} 
              color="primary"
              disabled={loading}
            >
              {result ? "Fermer" : "Annuler"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddSampleProjects; 