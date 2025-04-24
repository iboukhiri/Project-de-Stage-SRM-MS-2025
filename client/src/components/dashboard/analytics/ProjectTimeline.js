import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { format, isAfter, isBefore } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
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
  completed: {
    light: 'rgba(76, 175, 80, 0.2)', 
    main: 'rgba(76, 175, 80, 1)',
  },
  monthly: {
    light: 'rgba(233, 30, 99, 0.5)',
    main: 'rgba(233, 30, 99, 1)',
  }
};

const ProjectTimeline = ({ projects }) => {
  const [completionTrendData, setCompletionTrendData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    if (projects && projects.length > 0) {
      // Calculate monthly completion trend
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthLabels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 6 + i);
        return format(date, 'MMM yyyy');
      });
      
      const completedCountByMonth = monthLabels.map(monthLabel => {
        return projects.filter(project => {
          if (project.status !== 'Completed') return false;
          const completedDate = new Date(project.updatedAt);
          return format(completedDate, 'MMM yyyy') === monthLabel;
        }).length;
      });

      const cumulativeCompletedCount = completedCountByMonth.reduce(
        (acc, count, i) => {
          const prevValue = i > 0 ? acc[i - 1] : 0;
          acc.push(prevValue + count);
          return acc;
        },
        []
      );

      setCompletionTrendData({
        labels: monthLabels,
        datasets: [
          {
            label: 'Projets terminés (cumul)',
            data: cumulativeCompletedCount,
            borderColor: themeColors.completed.main,
            backgroundColor: themeColors.completed.light,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Projets terminés par mois',
            data: completedCountByMonth,
            borderColor: themeColors.monthly.main,
            backgroundColor: themeColors.monthly.light,
            type: 'bar'
          }
        ]
      });
    }
  }, [projects]);

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tendance de Completion des Projets',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Box sx={{ mt: 5, mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 900, mb: 3 }}>
        Planification et Tendances
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>Tendance de Completion</Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              {completionTrendData.labels.length > 0 && (
                <Line options={trendOptions} data={completionTrendData} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectTimeline; 