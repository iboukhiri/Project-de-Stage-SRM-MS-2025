import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Stack, LinearProgress, Tooltip, alpha, Grow, useTheme, Button } from '@mui/material';
import { 
  Chart as ChartJS, 
  ArcElement, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend, 
  Tooltip as ChartTooltip
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  ChartTooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Company theme colors
const themeColors = {
  water: {
    light: 'rgba(25, 118, 210, 0.6)',
    main: 'rgba(25, 118, 210, 1)',
  },
  electricity: {
    light: 'rgba(255, 152, 0, 0.6)',
    main: 'rgba(255, 152, 0, 1)',
  },
  sanitation: {
    light: 'rgba(46, 125, 50, 0.6)', 
    main: 'rgba(46, 125, 50, 1)',
  },
  waiting: {
    light: 'rgba(158, 158, 158, 0.6)',
    main: 'rgba(158, 158, 158, 1)',
  },
};

// Status mapping for colors
const statusColors = {
  'Completed': themeColors.sanitation,
  'In Progress': themeColors.water,
  'On Hold': themeColors.electricity,
  'Not Started': themeColors.waiting,
  // Adding French translations to ensure proper color mapping
  'Terminé': themeColors.sanitation,
  'En cours': themeColors.water,
  'En attente': themeColors.electricity,
  'Non démarré': themeColors.waiting,
};

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

const ProjectAnalytics = ({ projects }) => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState({
    labels: [],
    datasets: []
  });
  
  const [topProjects, setTopProjects] = useState([]);
  const [animatedProgress, setAnimatedProgress] = useState({});

  // Define chart options outside of render to avoid recreation
  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: 500,
          },
          color: theme.palette.mode === 'dark' 
            ? theme.palette.grey[300] 
            : theme.palette.text.primary,
          boxWidth: 10,
          boxHeight: 10,
          useBorderRadius: true,
          borderRadius: 2,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(42, 42, 42, 0.9)'
          : 'rgba(255, 255, 255, 0.95)',
        titleColor: theme.palette.mode === 'dark' 
          ? theme.palette.grey[300]
          : theme.palette.text.primary,
        bodyColor: theme.palette.mode === 'dark' 
          ? theme.palette.grey[300]
          : theme.palette.text.primary,
        padding: 12,
        cornerRadius: 8,
        boxPadding: 4,
        titleFont: {
          weight: 'bold',
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        displayColors: true,
        caretSize: 6,
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 800,
    },
    layout: {
      padding: {
        top: 15,
        bottom: 15,
        left: 15,
        right: 15
      }
    },
  };

  // Clean up chart instance when component unmounts
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (projects && projects.length > 0) {
      // Normalize status values - convert English status values to French
      const normalizedProjects = projects.map(project => ({
        ...project,
        normalizedStatus: statusTranslations[project.status] || project.status
      }));
      
      // Prepare status chart data using normalized status
      const statusCounts = normalizedProjects.reduce((acc, project) => {
        acc[project.normalizedStatus] = (acc[project.normalizedStatus] || 0) + 1;
        return acc;
      }, {});
      
      // Get unique status values in French only
      const uniqueStatuses = Object.values(statusTranslations);
      
      // Filter out any non-French statuses from the counts
      // This ensures only the French translations are used in the chart
      const filteredStatusCounts = {};
      Object.keys(statusCounts).forEach(status => {
        // Only keep statuses that are in our French translations list
        if (uniqueStatuses.includes(status)) {
          filteredStatusCounts[status] = statusCounts[status];
        }
      });

      // Ensure all French statuses exist in the counts, even if 0
      uniqueStatuses.forEach(status => {
        if (!filteredStatusCounts[status]) {
          filteredStatusCounts[status] = 0;
        }
      });

      // Create arrays for chart data
      const statusLabels = Object.keys(filteredStatusCounts);
      const backgroundColors = statusLabels.map(status => statusColors[status]?.light || 'rgba(200, 200, 200, 0.6)');
      const borderColors = statusLabels.map(status => statusColors[status]?.main || 'rgba(200, 200, 200, 1)');

      // If chart already exists, destroy it before creating a new one
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      setStatusData({
        labels: statusLabels,
        datasets: [
          {
            label: 'Projets par statut',
            data: Object.values(filteredStatusCounts),
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      });

      // Prepare top projects by progress
      const sortedProjects = [...normalizedProjects]
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 5)
        .map(project => {
          // Determine color based on title for demo purposes
          let color;
          if (project.title.toLowerCase().includes('eau')) {
            color = themeColors.water.main;
          } else if (project.title.toLowerCase().includes('électr')) {
            color = themeColors.electricity.main;
          } else {
            color = themeColors.sanitation.main;
          }
          
          return {
            id: project._id,
            title: project.title,
            progress: project.progress,
            color
          };
        });
      
      setTopProjects(sortedProjects);
      
      // Initialize animated progress for each project
      const initialProgress = {};
      sortedProjects.forEach(project => {
        initialProgress[project.id] = 0;
      });
      setAnimatedProgress(initialProgress);
      
      // Gradually animate the progress values
      setTimeout(() => {
        sortedProjects.forEach(project => {
          setAnimatedProgress(prev => ({
            ...prev,
            [project.id]: project.progress
          }));
        });
      }, 100);
    }
  }, [projects]);

  // Custom progress bar component for better visualization
  const ProgressBar = ({ project, index }) => {
    const [hover, setHover] = useState(false);
    const currentProgress = animatedProgress[project.id] || 0;
    
    return (
      <Grow 
        in={true} 
        timeout={800}
        style={{ transformOrigin: '0 0 0', transitionDelay: `${index * 100}ms` }}
      >
        <Box 
          sx={{ 
            mb: 2.5,
            width: '100%',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? alpha('#2a2a2a', 0.9)
              : alpha('#1e1e1e', 0.05),
            transform: hover ? 'translateX(5px)' : 'translateX(0)',
            '&:hover': {
              boxShadow: theme => theme.palette.mode === 'dark'
                ? `0 4px 12px -2px ${alpha(project.color, 0.4)}`
                : `0 4px 12px -2px ${alpha(project.color, 0.25)}`
            },
            borderLeft: `4px solid ${project.color}`,
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Box sx={{ p: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1.1rem',
                fontWeight: 500,
                mb: 0.5,
                color: theme => theme.palette.mode === 'dark' 
                  ? theme.palette.grey[100]
                  : theme.palette.text.primary
              }}
            >
              {project.title}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.875rem',
                color: theme => theme.palette.mode === 'dark'
                  ? theme.palette.grey[400]
                  : theme.palette.text.secondary,
                mb: 2
              }}
            >
              {project.description?.length > 120 
                ? `${project.description.substring(0, 120)}...` 
                : project.description}
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1
            }}>
              <Box 
                sx={{
                  backgroundColor: alpha(project.color, 0.15),
                  color: project.color,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {translateStatus(project.status)}
              </Box>
              <Typography 
                variant="body2" 
                sx={{
                  color: theme => theme.palette.text.secondary,
                  fontWeight: 'medium'
                }}
              >
                {currentProgress}%
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={currentProgress} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? `${project.color}30`
                  : `${project.color}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: project.color,
                  borderRadius: 5,
                  transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }
              }}
            />
          </Box>
          
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
            opacity: hover ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}>
            <Button
              size="small"
              sx={{
                color: project.color,
                fontSize: '0.75rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: alpha(project.color, 0.1)
                }
              }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              Voir les détails
            </Button>
          </Box>
        </Box>
      </Grow>
    );
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 900, mb: 3 }}>
        Analyse des Projets
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              overflow: 'hidden',
              background: theme => theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)',
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 8px 16px rgba(0, 0, 0, 0.4)'
                : '0 8px 16px rgba(160, 200, 255, 0.1)',
              border: theme => theme.palette.mode === 'dark'
                ? 'none'
                : '1px solid rgba(200, 220, 255, 0.3)',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                color: theme => theme.palette.mode === 'dark'
                  ? theme.palette.grey[200]
                  : theme.palette.primary.main,
                fontWeight: 600,
              }}
            >
              Distribution par Statut
            </Typography>
            <Box sx={{ 
              height: 380, 
              width: '100%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {statusData.labels.length > 0 && (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    maxWidth: 480,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    '& canvas': {
                      filter: theme => theme.palette.mode === 'dark' 
                        ? 'drop-shadow(0px 8px 16px rgba(255, 255, 255, 0.25))' 
                        : 'drop-shadow(0px 8px 20px rgba(140, 180, 250, 0.3))',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      }
                    }
                  }}
                >
                  <Pie 
                    data={statusData} 
                    options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: 'bottom',
                          align: 'center',
                          labels: {
                            ...chartOptions.plugins.legend.labels,
                            padding: 25,
                            font: {
                              size: 14,
                              weight: 600,
                            },
                            boxWidth: 15,
                            boxHeight: 15,
                          },
                        },
                      },
                      cutout: '35%', // Smaller hole = bigger pie
                      radius: '90%', // Larger radius = bigger pie
                      animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 1000,
                      },
                      layout: {
                        padding: {
                          top: 5,
                          bottom: 0,
                          left: 5,
                          right: 5
                        }
                      },
                    }}
                    id="project-status-chart"
                    key={`pie-chart-${statusData.labels.join('-')}`}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              background: theme => theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)',
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 8px 16px rgba(0, 0, 0, 0.4)'
                : '0 8px 16px rgba(160, 200, 255, 0.1)',
              border: theme => theme.palette.mode === 'dark'
                ? 'none'
                : '1px solid rgba(200, 220, 255, 0.3)',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                color: theme => theme.palette.mode === 'dark'
                  ? theme.palette.grey[200]
                  : theme.palette.primary.main,
                fontWeight: 600,
              }}
            >
              Progression des Projets
            </Typography>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%', 
              pt: 1, 
              px: 1 
            }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2, 
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 2,
                  background: theme => theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.light, 0.15),
                  boxShadow: theme => theme.palette.mode === 'dark'
                    ? 'inset 0 0 10px rgba(255,255,255,0.05)'
                    : 'inset 0 0 10px rgba(100,150,255,0.08)',
                  color: theme => theme.palette.mode === 'dark'
                    ? theme.palette.grey[300]
                    : theme.palette.primary.dark,
                  fontWeight: 500,
                }}
              >
                Top 5 Projets par Progression
              </Typography>
              
              <Stack spacing={0.5} sx={{ mt: 2 }}>
                {topProjects.map((project, index) => (
                  <ProgressBar key={project.id} project={project} index={index} />
                ))}
                {topProjects.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Aucun projet disponible
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectAnalytics; 