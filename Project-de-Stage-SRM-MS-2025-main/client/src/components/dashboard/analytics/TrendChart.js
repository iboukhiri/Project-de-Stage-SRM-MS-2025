import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import Chart from 'chart.js/auto';
import { fr } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

const TrendChart = ({ projects }) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projects && projects.length > 0) {
      setIsLoading(false);
      
      // Group projects by month
      const projectsByMonth = {};
      
      // Process each project's creation date and completion status
      projects.forEach(project => {
        if (project.createdAt) {
          try {
            const date = parseISO(project.createdAt);
            const monthKey = format(date, 'yyyy-MM');
            
            if (!projectsByMonth[monthKey]) {
              projectsByMonth[monthKey] = {
                total: 0,
                completed: 0,
                month: format(date, 'MMM yyyy', { locale: fr })
              };
            }
            
            projectsByMonth[monthKey].total += 1;
            
            // Count completed projects
            if (project.status === 'Completed' || project.status === 'Terminé') {
              projectsByMonth[monthKey].completed += 1;
            }
          } catch (error) {
            console.error("Date parsing error:", error);
          }
        }
      });
      
      // Sort by date and prepare chart data
      const sortedMonths = Object.keys(projectsByMonth).sort();
      const labels = sortedMonths.map(key => projectsByMonth[key].month);
      
      // Calculate cumulative totals
      let cumulativeTotal = 0;
      let cumulativeCompleted = 0;
      
      const totalData = sortedMonths.map(key => {
        cumulativeTotal += projectsByMonth[key].total;
        return cumulativeTotal;
      });
      
      const completedData = sortedMonths.map(key => {
        cumulativeCompleted += projectsByMonth[key].completed;
        return cumulativeCompleted;
      });
      
      // Calculate completion percentages (for trend line)
      const completionRates = sortedMonths.map((key, index) => {
        if (totalData[index] === 0) return 0;
        return (completedData[index] / totalData[index]) * 100;
      });
      
      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      
      // Create new chart
      const ctx = canvasRef.current.getContext('2d');
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Projets Totaux',
              data: totalData,
              backgroundColor: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: theme.palette.primary.main,
            },
            {
              label: 'Projets Complétés',
              data: completedData,
              backgroundColor: theme.palette.success.main,
              borderColor: theme.palette.success.main,
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: theme.palette.success.main,
            },
            {
              label: 'Tendance de Completion (%)',
              data: completionRates,
              backgroundColor: theme.palette.warning.main,
              borderColor: theme.palette.warning.main,
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.4,
              pointRadius: 3,
              yAxisID: 'y1',
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                font: {
                  size: 12,
                },
                color: theme.palette.text.secondary,
              },
            },
            y: {
              grid: {
                color: theme.palette.divider,
              },
              ticks: {
                font: {
                  size: 12,
                },
                color: theme.palette.text.secondary,
                stepSize: 5,
              },
              title: {
                display: true,
                text: 'Nombre de Projets',
                color: theme.palette.text.primary,
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
            },
            y1: {
              position: 'right',
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                font: {
                  size: 12,
                },
                color: theme.palette.warning.main,
                callback: function(value) {
                  return value + '%';
                },
                stepSize: 20,
              },
              title: {
                display: true,
                text: 'Taux de Completion',
                color: theme.palette.warning.main,
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
              min: 0,
              max: 100,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                boxWidth: 8,
                font: {
                  size: 12,
                },
                color: theme.palette.text.primary,
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: theme.palette.background.paper,
              titleColor: theme.palette.text.primary,
              bodyColor: theme.palette.text.secondary,
              borderColor: theme.palette.divider,
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.dataset.yAxisID === 'y1') {
                    label += Math.round(context.parsed.y) + '%';
                  } else {
                    label += context.parsed.y;
                  }
                  return label;
                }
              }
            },
          },
        },
      });
    }
  }, [projects, theme]);

  return (
    <Box sx={{ height: 360, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Planification et Tendances
      </Typography>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
          <Typography>Chargement des données...</Typography>
        </Box>
      ) : (
        <Box sx={{ height: '90%', position: 'relative' }}>
          <canvas ref={canvasRef} />
        </Box>
      )}
    </Box>
  );
};

export default TrendChart; 