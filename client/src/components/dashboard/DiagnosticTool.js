import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import config from '../../config';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DiagnosticTool = ({ projects }) => {
  const [open, setOpen] = useState(false);
  const [projectsData, setProjectsData] = useState([]);
  const { token } = useAuth();
  
  const handleOpen = () => {
    analyzeProjects();
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const analyzeProjects = () => {
    if (!projects || projects.length === 0) {
      setProjectsData([]);
      return;
    }
    
    // Get current month boundaries
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    
    // Analyze each completed project
    const completedProjects = projects.filter(
      project => project.status === 'Completed' || project.status === 'Terminé'
    );
    
    const analyzedProjects = completedProjects.map(project => {
      // Parse dates
      const dates = {
        updatedAt: project.updatedAt ? new Date(project.updatedAt) : null,
        endDate: project.endDate ? new Date(project.endDate) : null,
        createdAt: project.createdAt ? new Date(project.createdAt) : null
      };
      
      // Check if any date is in current month
      const isUpdatedThisMonth = dates.updatedAt && 
                                dates.updatedAt >= startOfMonth && 
                                dates.updatedAt <= endOfMonth;
      
      const isEndedThisMonth = dates.endDate && 
                              dates.endDate >= startOfMonth && 
                              dates.endDate <= endOfMonth;
      
      const isCreatedThisMonth = dates.createdAt && 
                                dates.createdAt >= startOfMonth && 
                                dates.createdAt <= endOfMonth;
      
      const isCompletedThisMonth = isUpdatedThisMonth || isEndedThisMonth || isCreatedThisMonth;
      
      // Format dates for display
      const formattedDates = {
        updatedAt: dates.updatedAt ? format(dates.updatedAt, 'dd MMM yyyy', { locale: fr }) : 'N/A',
        endDate: dates.endDate ? format(dates.endDate, 'dd MMM yyyy', { locale: fr }) : 'N/A',
        createdAt: dates.createdAt ? format(dates.createdAt, 'dd MMM yyyy', { locale: fr }) : 'N/A'
      };
      
      return {
        id: project._id,
        title: project.title,
        status: project.status,
        dates: formattedDates,
        rawDates: dates,
        isCompletedThisMonth,
        matchReason: isUpdatedThisMonth ? 'updatedAt' : 
                     isEndedThisMonth ? 'endDate' : 
                     isCreatedThisMonth ? 'createdAt' : null
      };
    });
    
    setProjectsData(analyzedProjects);
  };
  
  // Count projects completed this month
  const projectsCompletedThisMonth = projectsData.filter(p => p.isCompletedThisMonth).length;
  
  return (
    <>
      <Button 
        startIcon={<BugReportIcon />}
        size="small"
        onClick={handleOpen}
        sx={{ 
          position: 'absolute', 
          right: 16, 
          bottom: 16,
          borderRadius: 8,
          bgcolor: 'background.paper',
          boxShadow: 2,
          p: 1
        }}
      >
        Diagnostiquer
      </Button>
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Diagnostic des Projets Terminés
        </DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Informations sur le mois en cours
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <Chip 
                icon={<CalendarTodayIcon />} 
                label={`Mois actuel: ${format(new Date(), 'MMMM yyyy', { locale: fr })}`}
                color="primary"
              />
              <Chip 
                label={`Projets terminés au total: ${projectsData.length}`}
                color="success"
              />
              <Chip 
                label={`Terminés ce mois: ${projectsCompletedThisMonth}`}
                color={projectsCompletedThisMonth > 0 ? "success" : "error"}
              />
            </Box>
          </Box>
          
          {projectsData.length > 0 ? (
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Titre du projet</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date de mise à jour</TableCell>
                    <TableCell>Date de fin</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell>Terminé ce mois</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectsData.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.title}</TableCell>
                      <TableCell>{project.status}</TableCell>
                      <TableCell>{project.dates.updatedAt}</TableCell>
                      <TableCell>{project.dates.endDate}</TableCell>
                      <TableCell>{project.dates.createdAt}</TableCell>
                      <TableCell>
                        <Chip 
                          label={project.isCompletedThisMonth ? "Oui" : "Non"}
                          color={project.isCompletedThisMonth ? "success" : "error"}
                          size="small"
                        />
                        {project.isCompletedThisMonth && (
                          <Typography variant="caption" display="block">
                            via {project.matchReason}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1">
              Aucun projet terminé trouvé.
            </Typography>
          )}
          
          {projectsData.length > 0 && projectsCompletedThisMonth === 0 && (
            <Box mt={3} p={2} bgcolor="error.light" borderRadius={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                Problème détecté:
              </Typography>
              <Typography variant="body2">
                Il existe des projets terminés, mais aucun n'a été terminé dans le mois en cours 
                selon les dates (mise à jour, fin ou création). Pour qu'un projet soit compté dans 
                "Terminés ce mois", une de ces dates doit être dans le mois actuel.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DiagnosticTool; 