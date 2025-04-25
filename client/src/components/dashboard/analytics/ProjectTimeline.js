import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, useTheme, useMediaQuery, alpha } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const ProjectTimeline = ({ projects }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    if (projects && projects.length > 0) {
      // Focus on current month only for simplified view
      const currentDate = new Date();
      const currentMonth = format(currentDate, 'MMM yyyy');
      
      // Count completed projects
      const completedProjects = projects.filter(project => 
        project.status === 'Completed' || project.status === 'Terminé'
      ).length;
      
      // Calculate completion percentage
      const totalProjects = projects.length;
      const completionRate = totalProjects > 0 
        ? Math.round((completedProjects / totalProjects) * 100) 
        : 0;
      
      // Get completed projects this month
      const completedThisMonth = projects.filter(project => {
        if (project.status !== 'Completed' && project.status !== 'Terminé') return false;
        const completedDate = new Date(project.updatedAt);
        return format(completedDate, 'MMM yyyy') === currentMonth;
      }).length;
      
      setChartData({
        labels: [currentMonth],
        datasets: [
          {
            type: 'bar',
            label: 'Projets terminés (cumul)',
            data: [completedProjects],
            backgroundColor: theme.palette.success.main,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
            borderRadius: 6,
            order: 2
          },
          {
            type: 'bar',
            label: 'Projets terminés par mois',
            data: [completedThisMonth],
            backgroundColor: theme.palette.primary.main,
            barPercentage: 0.5,
            categoryPercentage: 0.5,
            borderRadius: 6,
            order: 1
          },
          {
            type: 'line',
            label: 'Taux de complétion (%)',
            data: [completionRate],
            borderColor: theme.palette.warning.main,
            backgroundColor: alpha(theme.palette.warning.main, 0.6),
            borderWidth: 0,
            tension: 0.1,
            pointRadius: 22,
            pointBackgroundColor: theme.palette.warning.main,
            pointBorderColor: isDarkMode ? '#2d2d2d' : '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 25,
            pointHoverBackgroundColor: theme.palette.warning.main,
            pointHoverBorderWidth: 3,
            yAxisID: 'percentage',
            order: 0,
            datalabels: {
              color: '#fff',
              font: {
                weight: 'bold',
                size: 13
              },
              anchor: 'center',
              align: 'center',
              formatter: value => `${value}%`
            }
          }
        ]
      });
    }
  }, [projects, theme]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: {
            size: 13,
            weight: 'bold',
          },
          color: theme.palette.text.primary
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#424242' : 'white',
        titleColor: isDarkMode ? 'white' : '#424242',
        bodyColor: isDarkMode ? 'white' : '#424242',
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.yAxisID === 'percentage') {
              label += context.parsed.y + '%';
            } else {
              label += context.parsed.y + ' projets';
            }
            return label;
          }
        }
      },
      datalabels: {
        display: function(context) {
          // Only show datalabels for percentage by default
          return context.datasetIndex === 2;
        },
        color: function(context) {
          return context.datasetIndex === 2 ? 
            (isDarkMode ? '#fff' : '#fff') : 
            (isDarkMode ? '#fff' : '#000');
        },
        font: {
          weight: 'bold',
          size: function(context) {
            return context.datasetIndex === 2 ? 13 : 11;
          }
        },
        formatter: (value, context) => {
          if (context.datasetIndex === 2) { // Completion rate
            return value + '%';
          }
          return value;
        },
        // Special styling for percentage point
        textStrokeColor: context => context.datasetIndex === 2 ? 
          (isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)') : 'transparent',
        textStrokeWidth: 3,
        textShadowBlur: 5,
        textShadowColor: 'rgba(0,0,0,0.3)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: isDarkMode 
            ? alpha(theme.palette.divider, 0.2) 
            : alpha(theme.palette.divider, 0.5)
        },
        ticks: {
          font: {
            size: 12,
            weight: 'medium'
          },
          color: theme.palette.text.secondary,
          stepSize: 5
        },
        title: {
          display: true,
          text: 'Nombre de projets',
          color: theme.palette.text.primary,
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {
            bottom: 10
          }
        }
      },
      percentage: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          color: theme.palette.warning.main,
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        title: {
          display: true,
          text: 'Taux de complétion',
          color: theme.palette.warning.main,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            weight: 'medium'
          },
          color: theme.palette.text.secondary
        }
      }
    },
    layout: {
      padding: {
        top: 30,
        right: 30,
        bottom: 10,
        left: 10
      }
    },
    elements: {
      bar: {
        borderWidth: 1,
        borderColor: isDarkMode 
          ? alpha(theme.palette.background.paper, 0.3) 
          : alpha(theme.palette.background.paper, 0.8)
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuad'
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', maxWidth: '900px' }}>
        <Grid container justifyContent="center">
          <Grid item xs={12}>
            <Paper 
              elevation={4} 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 3,
                bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                boxShadow: isDarkMode 
                  ? '0 10px 30px rgba(0, 0, 0, 0.5)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Typography 
                variant="h5" 
                align="center" 
                sx={{ 
                  mb: 3,
                  pb: 1,
                  fontWeight: 700,
                  fontSize: { xs: '1.3rem', sm: '1.5rem' },
                  color: theme.palette.warning.main,
                  borderBottom: isDarkMode 
                    ? `1px solid ${alpha(theme.palette.warning.main, 0.3)}` 
                    : `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                }}
              >
                Tendance de Completion
              </Typography>
              
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                height: { xs: 350, sm: 400, md: 430 }, 
                width: '100%',
                position: 'relative'
              }}>
                {chartData.labels.length > 0 ? (
                  <>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1, borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Taux de complétion
                          </Typography>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              color: theme.palette.warning.main,
                              fontWeight: 'bold' 
                            }}
                          >
                            {chartData.datasets[2].data[0]}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1, borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Projets terminés
                          </Typography>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              color: theme.palette.success.main,
                              fontWeight: 'bold' 
                            }}
                          >
                            {chartData.datasets[0].data[0]}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1, borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Terminés ce mois
                          </Typography>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              color: theme.palette.primary.main,
                              fontWeight: 'bold' 
                            }}
                          >
                            {chartData.datasets[1].data[0]}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ flexGrow: 1, position: 'relative' }}>
                      <Bar options={chartOptions} data={chartData} />
                      
                      {/* Custom percentage overlay for better visibility */}
                      {chartData.labels.length > 0 && (
                        <Box 
                          sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '55%', 
                            transform: 'translate(-50%, -50%)',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 0,
                            boxShadow: theme => `0 0 15px ${alpha(theme.palette.warning.main, 0.5)}`,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': {
                                boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0.7)}`
                              },
                              '70%': {
                                boxShadow: `0 0 0 10px ${alpha(theme.palette.warning.main, 0)}`
                              },
                              '100%': {
                                boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0)}`
                              }
                            }
                          }}
                        />
                      )}
                    </Box>
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="text.secondary">
                      Aucune donnée disponible
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProjectTimeline; 