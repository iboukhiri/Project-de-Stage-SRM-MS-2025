import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Grid,
  Link,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Info as InfoIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Web as WebIcon,
  Email as EmailIcon,
  SupervisorAccount as SupervisorAccountIcon
} from '@mui/icons-material';

const AboutDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: {
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 1,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #ff9933 0%, #ffbb66 100%)'
            : 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)', 
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <InfoIcon /> À Propos de SRM-MS
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WebIcon /> À Propos du Projet
              </Typography>
              <Typography variant="body1" paragraph>
                SRM-MS (Supplier Relationship Management - Management System) est une application moderne de gestion de projets conçue pour optimiser le suivi et la gestion des projets d'infrastructure. 
              </Typography>
              <Typography variant="body1" paragraph>
                Cette plateforme permet de suivre l'avancement des projets, de gérer les équipes, et d'analyser les performances via un tableau de bord intuitif.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon /> Technologies Utilisées
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li><strong>Frontend:</strong> React, Material-UI, Chart.js</li>
                  <li><strong>Backend:</strong> Node.js, Express</li>
                  <li><strong>Base de données:</strong> MongoDB</li>
                  <li><strong>Authentification:</strong> JWT</li>
                </ul>
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box 
              sx={{
                p: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <SupervisorAccountIcon /> Développeur
              </Typography>
              
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`
                }}
                alt="Iliass Boukhiri"
                src="/images/iliassboukhiri.jpg"
              >
                IB
              </Avatar>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Iliass Boukhiri
              </Typography>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                Développeur Full Stack
                <br />
                Projet de Stage SRM-MS 2025
              </Typography>
              
              <Button 
                startIcon={<EmailIcon />}
                variant="outlined" 
                color="primary"
                component={Link}
                href="mailto:iliassboukhiri@gmail.com"
                sx={{ borderRadius: 8, px: 2 }}
              >
                Contacter le développeur
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            SRM-MS © {currentYear} | Tous droits réservés
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Version 1.0.0
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AboutDialog; 