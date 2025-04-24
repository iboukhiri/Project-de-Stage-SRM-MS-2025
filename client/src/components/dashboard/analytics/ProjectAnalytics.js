import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, Grid, Stack, LinearProgress, Tooltip, alpha, Grow, useTheme } from '@mui/material';
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

const ProjectAnalytics = ({ projects }) => {
  const theme = useTheme();
  const chartRef = useRef(null);
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
            p: 1.5,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            backgroundColor: theme => hover 
              ? theme.palette.mode === 'dark' 
                ? `${project.color}20` 
                : `${project.color}10`
              : theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.03)' 
                : 'transparent',
            transform: hover ? 'translateX(5px)' : 'translateX(0)',
            '&:hover': {
              boxShadow: theme => theme.palette.mode === 'dark'
                ? `0 4px 12px -2px ${alpha(project.color, 0.4)}`
                : `0 4px 12px -2px ${alpha(project.color, 0.25)}`,
            }
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Tooltip 
            title={`${project.title} - ${project.progress}%`} 
            placement="top"
            arrow
          >
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: 0.8,
                alignItems: 'center'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    width: '70%', 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 500,
                    transition: 'transform 0.3s ease',
                    transform: hover ? 'translateX(2px)' : 'translateX(0)',
                    color: theme => theme.palette.mode === 'dark' 
                      ? theme.palette.grey[300] 
                      : theme.palette.text.primary,
                  }}
                >
                  {project.title}
                </Typography>
                <Box
                  sx={{ 
                    backgroundColor: theme => hover 
                      ? project.color 
                      : theme.palette.mode === 'dark'
                        ? `${project.color}50`
                        : `${project.color}30`, 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 10,
                    minWidth: '50px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    transform: hover ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: hover ? `0 2px 8px ${alpha(project.color, 0.4)}` : 'none',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    fontWeight="bold" 
                    color={hover ? 'white' : theme => theme.palette.mode === 'dark' ? 'white' : 'inherit'}
                    sx={{
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {project.progress}%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ position: 'relative', height: 16, mb: 0.5 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={currentProgress} 
                  sx={{ 
                    height: 16, 
                    borderRadius: 2,
                    backgroundColor: theme => theme.palette.mode === 'dark' 
                      ? `${project.color}30`
                      : `${project.color}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme => theme.palette.mode === 'dark'
                        ? alpha(project.color, 0.9)
                        : project.color,
                      borderRadius: 2,
                      transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }
                  }}
                />
                {hover && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: '100%',
                      borderRadius: 2,
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? `0 0 8px ${alpha(project.color, 0.8)}`
                        : `0 0 8px ${alpha(project.color, 0.6)}`,
                      pointerEvents: 'none',
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                )}
              </Box>
            </Box>
          </Tooltip>
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
              height: 300, 
              width: '100%',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {statusData.labels.length > 0 && (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 340,
                    mx: 'auto',
                    '& canvas': {
                      filter: theme => theme.palette.mode === 'dark' 
                        ? 'drop-shadow(0px 4px 8px rgba(255, 255, 255, 0.15))' 
                        : 'drop-shadow(0px 5px 10px rgba(140, 180, 250, 0.2))',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      }
                    }
                  }}
                >
                  <Pie 
                    data={statusData} 
                    options={chartOptions}
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