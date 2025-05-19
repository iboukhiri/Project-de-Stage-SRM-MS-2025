import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

// You might want to import actual components you're using
import DiagnosticTool from './DiagnosticTool';
import AddSampleProjects from './AddSampleProjects';

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // You can adjust these endpoints to match your actual API
        const [usersRes, projectsRes] = await Promise.all([
          axios.get('/api/users/stats'),
          axios.get('/api/projects/stats')
        ]);
        
        setStats({
          totalUsers: usersRes.data.totalUsers || 0,
          totalProjects: projectsRes.data.totalProjects || 0,
          completedProjects: projectsRes.data.completedProjects || 0,
          inProgressProjects: projectsRes.data.inProgressProjects || 0
        });
      } catch (error) {
        console.error('Error fetching super admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Super Admin Dashboard
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Projects
                  </Typography>
                  <Typography variant="h4">{stats.totalProjects}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Completed Projects
                  </Typography>
                  <Typography variant="h4">{stats.completedProjects}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress Projects
                  </Typography>
                  <Typography variant="h4">{stats.inProgressProjects}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  System Diagnostics
                </Typography>
                <DiagnosticTool />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Sample Data Tools
                </Typography>
                <AddSampleProjects />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default SuperAdminDashboard; 