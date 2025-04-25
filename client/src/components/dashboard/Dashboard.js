import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Skeleton,
  Tabs,
  Tab,
  Fade,
  Badge,
  Grow,
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as FolderIcon,
  QueryBuilder as QueryBuilderIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Visibility as VisibilityIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
  DoNotDisturbOn as DoNotDisturbOnIcon,
  NotificationImportant as NotificationIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import config from '../../config';
import ProjectAnalytics from './analytics/ProjectAnalytics';
import ProjectTimeline from './analytics/ProjectTimeline';
import { alpha } from '@mui/material/styles';

// Translation mapping for status labels
const statusTranslations = {
  'Terminé': 'Terminé',
  'En cours': 'En cours',
  'En attente': 'En attente',
  'Non démarré': 'Non démarré',
  // For backward compatibility with existing data
  'Completed': 'Terminé',
  'In Progress': 'En cours',
  'On Hold': 'En attente',
  'Not Started': 'Non démarré',
};

// Helper to translate status
const translateStatus = (status) => {
  return statusTranslations[status] || status;
};

const getStatusChipColor = (status) => {
  switch (status) {
    case 'Terminé':
    case 'Completed': return 'success';
    case 'En cours':
    case 'In Progress': return 'primary';
    case 'En attente':
    case 'On Hold': return 'warning';
    case 'Non démarré':
    case 'Not Started': return 'error';
    default: return 'info';
  }
};

// Helper to safely access theme colors with fallbacks
const safeColorAccess = (theme, colorName, variant = 'main') => {
  try {
    return theme.palette[colorName]?.[variant] || theme.palette.grey[500];
  } catch (error) {
    // Fallback to a safe color if the specified one doesn't exist
    return theme.palette.grey[500];
  }
};

// TabPanel component for the tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      sx={{ marginBottom: 0 }}
      {...other}
    >
      {value === index && (
        <Fade 
          in={value === index} 
          timeout={400}
          mountOnEnter
          unmountOnExit={false}
        >
          <Box sx={{ pt: 3, pb: 3 }}>
            {children}
          </Box>
        </Fade>
      )}
    </Box>
  );
}

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${config.API_URL}/api/projects`);
        setProjects(res.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Inject pulse animation keyframes
  useEffect(() => {
    // Add the keyframes animation for the pulse effect
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes pulse {
        0% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7);
        }
        
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 5px rgba(46, 125, 50, 0);
        }
        
        100% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(46, 125, 50, 0);
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // SummaryCard component with fixed animation
  const SummaryCard = ({ title, value, icon, color, delay = 0 }) => {
    const [hovered, setHovered] = useState(false);
    
    return (
      <Grow 
        in={true} 
        timeout={800}
        style={{ transitionDelay: `${delay}ms`, transformOrigin: 'center bottom' }}
        mountOnEnter
        appear
      >
        <Paper 
          elevation={hovered ? 8 : 4}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            p: 3, 
            height: '100%',
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 4,
            background: theme => theme.palette.mode === 'dark' 
              ? `linear-gradient(135deg, ${alpha(safeColorAccess(theme, color, 'light'), 0.4)} 0%, ${alpha(safeColorAccess(theme, color), 0.65)} 100%)`
              : `linear-gradient(135deg, ${alpha(safeColorAccess(theme, color, 'light'), 0.5)} 0%, ${alpha(safeColorAccess(theme, color), 0.75)} 100%)`,
            backdropFilter: 'blur(10px)',
            color: 'white',
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: theme => theme.palette.mode === 'dark'
                ? `radial-gradient(circle at top right, ${alpha(safeColorAccess(theme, color, 'light'), 0.4)} 0%, transparent 70%)`
                : `radial-gradient(circle at top right, ${alpha(safeColorAccess(theme, color, 'light'), 0.5)} 0%, transparent 70%)`,
              zIndex: 1,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              right: -10,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: theme => alpha(safeColorAccess(theme, color, 'dark'), 0.2),
              zIndex: 0,
              transition: 'all 0.3s ease',
              transform: hovered ? 'scale(1.5)' : 'scale(1)',
            },
            border: theme => theme.palette.mode === 'dark' 
              ? `1px solid ${alpha(safeColorAccess(theme, color, 'light'), 0.2)}`
              : `1px solid ${alpha(safeColorAccess(theme, color, 'light'), 0.4)}`,
            boxShadow: theme => theme.palette.mode === 'dark'
              ? hovered ? '0 12px 24px rgba(0, 0, 0, 0.3)' : '0 8px 16px rgba(0, 0, 0, 0.2)'
              : hovered ? '0 12px 24px rgba(0, 0, 0, 0.1)' : '0 8px 16px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, flex: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 'medium', 
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mb: 1,
                transition: 'all 0.3s ease',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 'bold', 
                textShadow: '0 2px 5px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                transform: hovered ? 'scale(1.1)' : 'scale(1)',
                transformOrigin: 'left'
              }}
            >
              {value}
            </Typography>
          </Box>
          <Badge
            color={color}
            overlap="circular"
            badgeContent=" "
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                width: 16,
                height: 16,
                borderRadius: '50%',
                boxShadow: '0 0 0 2px white',
                animation: hovered ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(.8)', opacity: 1 },
                  '50%': { transform: 'scale(1.2)', opacity: 0.8 },
                  '100%': { transform: 'scale(.8)', opacity: 1 },
                },
              }
            }}
          >
            <Box 
              className="icon-wrapper"
              sx={{ 
                color: 'white', 
                position: 'relative', 
                zIndex: 2,
                transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: hovered ? 'scale(1.15) rotate(10deg)' : 'scale(1) rotate(0deg)',
                padding: 1.5,
                borderRadius: '50%',
                backgroundColor: theme => alpha(safeColorAccess(theme, color, 'dark'), 0.3),
                backdropFilter: 'blur(8px)',
                boxShadow: hovered ? '0 10px 20px rgba(0,0,0,0.2)' : '0 5px 10px rgba(0,0,0,0.1)',
                width: 70,
                height: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 2
              }}
            >
              {React.cloneElement(icon, { 
                sx: { 
                  fontSize: 36,
                  transition: 'all 0.3s ease',
                  transform: hovered ? 'scale(1.2)' : 'scale(1)'
                } 
              })}
            </Box>
          </Badge>
        </Paper>
      </Grow>
    );
  };

  const ProjectCard = ({ project, index }) => {
    const [hovered, setHovered] = useState(false);
    const statusColor = getStatusChipColor(project.status);
    
    return (
      <Grow 
        in={true} 
        timeout={800} 
        style={{ 
          transformOrigin: '0 0 0',
          transitionDelay: `${index * 100}ms`,
          width: '100%',
          height: '100%'
        }}
      >
        <Card 
          elevation={hovered ? 4 : 2}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            width: '100%',
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
            boxShadow: hovered ? theme => `0 12px 20px -10px ${alpha(theme.palette.primary.main, 0.3)}` : '',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: '4px',
              backgroundColor: theme => safeColorAccess(theme, statusColor),
              transition: 'all 0.3s ease',
              opacity: hovered ? 1 : 0.7,
            }
          }}
        >
          <CardContent sx={{ 
            p: 3, 
            pb: 1,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            background: theme => hovered ? 
              `linear-gradient(to bottom right, ${alpha(safeColorAccess(theme, statusColor, 'light'), 0.08)}, transparent)` : 
              'none',
            transition: 'background 0.3s ease',
            width: '100%'
          }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'medium',
                transition: 'all 0.3s ease',
                transform: hovered ? 'translateX(5px)' : 'translateX(0)',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                height: '32px',
                width: '100%',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {project.title}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2, 
                height: '60px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                transition: 'all 0.3s ease',
                opacity: hovered ? 0.9 : 0.7,
                width: '100%'
              }}
            >
              {project.description || "Aucune description disponible."}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              mb: 1,
              justifyContent: 'space-between',
              mt: 'auto',
              width: '100%'
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: theme => safeColorAccess(theme, statusColor),
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  bgcolor: theme => alpha(safeColorAccess(theme, statusColor, 'light'), 0.2),
                  whiteSpace: 'nowrap'
                }}
              >
                {translateStatus(project.status)}
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 0.5,
                px: 1,
                borderRadius: 1,
                bgcolor: theme => alpha(theme.palette.background.default, 0.5),
                transition: 'all 0.3s ease',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                minWidth: '40px'
              }}>
                <Typography 
                  variant="caption" 
                  fontWeight="medium"
                  color={project.progress >= 70 ? 'success.main' : (project.progress >= 30 ? 'primary.main' : 'text.secondary')}
                >
                  {project.progress}%
                </Typography>
              </Box>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={project.progress} 
              color={statusColor} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 1.5,
                width: '100%',
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 1.2s cubic-bezier(0.165, 0.84, 0.44, 1)',
                },
                bgcolor: theme => alpha(safeColorAccess(theme, statusColor, 'light'), 0.2)
              }}
            />
          </CardContent>
          
          <CardActions sx={{ 
            justifyContent: 'flex-end', 
            p: 2, 
            pt: 0,
            opacity: hovered ? 1 : 0.9,
            transition: 'opacity 0.3s ease',
            width: '100%'
          }}>
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => navigate(`/projects/${project._id}`)}
              color={statusColor}
              sx={{
                borderRadius: 2,
                '&:hover': {
                  bgcolor: theme => alpha(safeColorAccess(theme, statusColor, 'light'), 0.1),
                }
              }}
            >
              Voir les détails
            </Button>
          </CardActions>
        </Card>
      </Grow>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome skeleton */}
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4, mb: 4 }} />

        {/* Section title skeleton */}
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} />
        
        {/* Status cards skeleton */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={12/5} key={i}>
              <Skeleton 
                variant="rounded" 
                height={120} 
                sx={{ 
                  borderRadius: 4,
                  opacity: 0.9 - (i * 0.1),
                }} 
                animation="wave"
              />
            </Grid>
          ))}
        </Grid>

        {/* Tabs skeleton */}
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2, mb: 4 }} />
        
        {/* Card header skeleton */}
        <Skeleton variant="rounded" height={60} width="40%" sx={{ mb: 3, borderRadius: 2 }} />
        
        {/* Project cards skeleton */}
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton 
                variant="rounded" 
                height={200} 
                sx={{ 
                  borderRadius: 3,
                  opacity: 0.9 - (i * 0.05),
                }} 
                animation="wave"
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome message card */}
      <Grow in={true} timeout={800} style={{ transformOrigin: 'center top' }} mountOnEnter appear>
        <Paper 
          elevation={4} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backdropFilter: 'blur(10px)',
            boxShadow: theme => `0px 10px 30px -5px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: theme => `0px 14px 40px -5px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.4 : 0.15)}`,
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            position: 'relative', 
            zIndex: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 3, sm: 0 }
          }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 900, 
                  mb: 1,
                  display: 'inline-block',
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  letterSpacing: '-0.02em'
                }}
              >
                Bienvenue, {user?.name} ! <span style={{ marginLeft: '4px' }}>👋</span>
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1
                }}
              >
                <Box 
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%',
                    background: theme => alpha(theme.palette.success.main, 0.9),
                    boxShadow: theme => `0 0 10px ${alpha(theme.palette.success.main, 0.7)}`,
                    animation: 'pulse 2s infinite'
                  }} 
                />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'medium',
                    fontSize: '0.95rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  Connecté • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{
                  maxWidth: '600px',
                  lineHeight: 1.8,
                  fontSize: '1.05rem',
                  letterSpacing: '0.01em',
                  mt: 1.5
                }}
              >
                Consultez l'état de vos projets et suivez leur progression en temps réel. 
                Votre tableau de bord personnel vous attend avec des informations actualisées.
              </Typography>
              
              {user && user.role === 'admin' && (
                <Box
                  sx={{
                    mt: 2.5,
                    mb: 1,
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    maxWidth: '600px',
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      alignSelf: 'stretch',
                      bgcolor: 'primary.main',
                      borderRadius: 4,
                    }}
                  />
                  <NotificationIcon 
                    fontSize="small" 
                    color="primary"
                    sx={{
                      animation: 'pulse 2s infinite',
                      mr: 0.5,
                      borderRadius: '50%',
                      padding: '4px',
                      bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                      boxShadow: theme => `0 0 0 rgba(25, 118, 210, 0.4)`,
                      animationName: 'pulseRing',
                      '@keyframes pulseRing': {
                        '0%': {
                          boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)'
                        },
                        '70%': {
                          boxShadow: '0 0 0 8px rgba(25, 118, 210, 0)'
                        },
                        '100%': {
                          boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)'
                        }
                      }
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      lineHeight: 1.5,
                      py: 0.75,
                    }}
                  >
                    En tant qu'administrateur, vous pouvez ajouter et modifier des projets à tout moment via le bouton "Nouveau Projet" ou depuis la liste des projets.
                  </Typography>
                </Box>
              )}
            </Box>
            
            {user && user.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-project')}
                sx={{ 
                  borderRadius: '12px', 
                  py: 1.5, 
                  px: 3.5,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  minWidth: '220px',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(4px)',
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(0.98)',
                  }
                }}
              >
                Nouveau Projet
              </Button>
            )}
          </Box>
        </Paper>
      </Grow>

      {/* Projects States Section */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 3, 
            pl: 1,
            borderLeft: theme => `4px solid ${safeColorAccess(theme, 'primary')}`,
            paddingLeft: 2
          }}
        >
          États des Projets
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={4} lg={12/5}>
            <SummaryCard 
              title="Total des Projets"
              value={projects.length}
              icon={<FolderIcon />}
              color="info"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={12/5}>
            <SummaryCard 
              title="En cours"
              value={projects.filter(p => p.status === 'In Progress' || p.status === 'En cours').length}
              icon={<QueryBuilderIcon />}
              color="primary"
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={12/5}>
            <SummaryCard 
              title="En attente"
              value={projects.filter(p => p.status === 'On Hold' || p.status === 'En attente').length}
              icon={<PauseCircleOutlineIcon />}
              color="warning"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={12/5}>
            <SummaryCard 
              title="Non démarré"
              value={projects.filter(p => p.status === 'Not Started' || p.status === 'Non démarré').length}
              icon={<DoNotDisturbOnIcon />}
              color="error"
              delay={300}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={12/5}>
            <SummaryCard 
              title="Terminé"
              value={projects.filter(p => p.status === 'Completed' || p.status === 'Terminé').length}
              icon={<CheckCircleOutlineIcon />}
              color="success"
              delay={400}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Tabs Navigation */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2, 
          mb: 4, 
          overflow: 'hidden',
          background: theme => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(safeColorAccess(theme, 'primary', 'light'), 0.05)})`,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', overflow: 'visible' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs" 
            centered
            TabIndicatorProps={{
              style: { 
                display: 'none'  // Completely hide the default indicator
              }
            }}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'medium',
                py: 2,
                position: 'relative',
                transition: 'all 0.3s ease',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  width: '0%',
                  height: '3px',
                  backgroundColor: 'primary.main',
                  borderRadius: '1.5px',
                  transition: 'all 0.3s ease',
                  transform: 'translateX(-50%)',
                  opacity: 0
                },
                '&.Mui-selected::after': {
                  width: '80%',
                  opacity: 1
                },
                '&:hover::after': {
                  width: '60%',
                  opacity: 0.7
                }
              },
              '& .Mui-selected': {
                fontWeight: 'bold',
                color: 'primary.main'
              },
              mb: 0
            }}
          >
            <Tab icon={<DashboardIcon />} label="APERÇU" />
            <Tab icon={<AssessmentIcon />} label="ANALYTIQUE" />
            <Tab icon={<TimelineIcon />} label="TENDANCES" />
          </Tabs>
        </Box>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            mb: 4,
            background: theme => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(safeColorAccess(theme, 'primary', 'light'), 0.05)})`
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    bgcolor: theme => safeColorAccess(theme, 'primary'),
                    borderRadius: '50%',
                    mr: 2
                  }
                }}
              >
                Projets Récents
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid 
                container 
                spacing={3} 
                sx={{ 
                  height: '100%', 
                  alignItems: 'stretch',
                  '& .MuiGrid-item': {
                    display: 'flex'
                  }
                }}
              >
                {projects.length > 0 ? (
                  projects.slice(0, 6).map((project, index) => (
                    <Grid 
                      item 
                      xs={12} 
                      md={6} 
                      lg={4} 
                      key={project._id} 
                      sx={{ 
                        display: 'flex', 
                        height: '100%', 
                        minHeight: '280px',
                        '& > *': { 
                          width: '100%',
                          flex: '1 1 0%'
                        }
                      }}
                    >
                      <ProjectCard project={project} index={index} />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8, 
                      px: 2,
                      borderRadius: 2,
                      border: theme => `1px dashed ${theme.palette.primary.light}`,
                      bgcolor: alpha('#f5f5f5', 0.3)
                    }}>
                      <Typography color="text.secondary" variant="h6">
                        Aucun projet trouvé.
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Créez votre premier projet pour commencer.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            mb: 4
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    bgcolor: theme => safeColorAccess(theme, 'primary'),
                    borderRadius: '50%',
                    mr: 2
                  }
                }}
              >
                Analytique
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <ProjectAnalytics projects={projects} />
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            mb: 4,
            maxWidth: '1200px',
            mx: 'auto',
            background: theme => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(safeColorAccess(theme, 'primary', 'light'), 0.05)})`,
            boxShadow: theme => `0 8px 32px -8px ${
              theme.palette.mode === 'light' 
              ? 'rgba(0,0,0,0.15)' 
              : 'rgba(0,0,0,0.4)'
            }`
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    bgcolor: theme => safeColorAccess(theme, 'primary'),
                    borderRadius: '50%',
                    mr: 2
                  }
                }}
              >
                Tendances
              </Typography>
            </Box>
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <ProjectTimeline projects={projects} />
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </Container>
  );
};

export default Dashboard; 