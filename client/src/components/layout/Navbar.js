import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as ProjectIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  AdminPanelSettings as SuperAdminIcon,
  Notifications as NotificationsIcon,
  CheckCircle as ReadIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import ThemeToggle from '../common/ThemeToggle';
import { ThemeContext } from '../../context/ThemeContext';
import config from '../../config';
import { darken, lighten } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Helper to get profile photo URL
const getProfilePhotoUrl = (userId) => {
  return `${config.API_URL}/uploads/profile-photos/${userId}.jpg`;
};

// Utility function to generate consistent colors from strings
function stringToColor(string) {
  if (!string) return '#1976d2';
  
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  
  return color;
}

// Helper function to create a shaded version of a color based on the theme mode
const getShade = (color, theme, amount = 0.2) => {
  if (typeof color === 'string') {
    return theme.palette.mode === 'dark' 
      ? lighten(color, amount) 
      : darken(color, amount);
  }
  // Use a default color if color is not a string
  const defaultColor = theme.palette.mode === 'dark' ? '#FF9933' : '#009688';
  return theme.palette.mode === 'dark' 
    ? lighten(defaultColor, amount) 
    : darken(defaultColor, amount);
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #FF9933 0%, #FFBB66 100%)'
    : 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
    : '0 2px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  borderRadius: 0,
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 35,
  height: 35,
  cursor: 'pointer',
  border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 0 8px rgba(255, 255, 255, 0.3)' 
      : '0 0 8px rgba(0, 0, 0, 0.2)',
  },
}));

const Navbar = () => {
  // Hooks
  const theme = useTheme();
  const { 
    isAuthenticated, 
    logout, 
    user
  } = useContext(AuthContext);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    formatNotificationDate, 
    fetchNotifications 
  } = useContext(NotificationContext);
  const { themeMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const notificationRef = useRef(null);
  const notificationIconRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  
  // Define the missing style variables
  const navButtonStyles = {
    color: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'inherit',
    mx: 1,
    fontWeight: 700,
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
    '&:hover': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    }
  };
  
  const connexionButtonStyle = {
    ...navButtonStyles,
    fontWeight: 800,
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'inherit',
    borderRadius: 2,
  };
  
  // Determine if user is admin
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  const isSuperAdmin = user && user.role === 'superadmin';

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navigate to related content based on notification type
    if (notification.relatedProject) {
      navigate(`/projects/${notification.relatedProject._id}`);
    } else if (notification.type === 'role_change') {
      navigate('/profile');
    }
    
    // Close notification menu
    handleCloseNotificationMenu();
  };

  // useEffect hooks go here, before any conditional returns
  useEffect(() => {
    // Add click outside listeners
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target) && 
          notificationIconRef.current && !notificationIconRef.current.contains(event.target)) {
        handleCloseNotificationMenu();
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        // Handle mobile menu close
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Close mobile menu when switching from mobile to desktop view
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Early return after all useEffect hooks
  if (!isAuthenticated && !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenAdminMenu = (event) => {
    setAdminMenuAnchor(event.currentTarget);
  };

  const handleCloseAdminMenu = () => {
    setAdminMenuAnchor(null);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleAdminMenuItemClick = (path) => {
    navigate(path);
    handleCloseAdminMenu();
  };

  const handleUserMenuItemClick = (path) => {
    navigate(path);
    handleCloseUserMenu();
  };

  // Get navbar background styles based on current theme
  const getNavbarBgStyles = () => {
    if (theme.palette.mode === 'dark') {
      return {
        bgcolor: '#262626', // Slightly lighter black
        backgroundImage: 'linear-gradient(to right, #ff9933, #ffb366)', // Light orange gradient
        boxShadow: '0 3px 10px rgba(255, 153, 51, 0.3)'
      };
    } else {
      return {
        bgcolor: '#009688', // Teal main color
        backgroundImage: 'linear-gradient(to right, #009688, #26a69a)',
        boxShadow: '0 3px 10px rgba(0, 150, 136, 0.2)'
      };
    }
  };

  // Get menu hover color based on theme
  const getMenuHoverColor = () => {
    return theme.palette.mode === 'dark' 
      ? 'rgba(255, 153, 51, 0.08)' 
      : 'rgba(0, 150, 136, 0.08)';
  };

  // Get user button styles based on theme
  const getUserButtonStyles = () => {
    const baseStyles = {
      ml: 1,
      p: 0.5,
      border: '2px solid rgba(255,255,255,0.7)',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      '&:hover': {
        transform: 'scale(1.1)',
      }
    };

    if (theme.palette.mode === 'dark') {
      return {
        ...baseStyles,
        '&:hover': {
          ...baseStyles['&:hover'],
          border: '2px solid #ffcc80',
          boxShadow: '0 3px 12px rgba(255,153,51,0.3)',
        }
      };
    } else {
      return {
        ...baseStyles,
        '&:hover': {
          ...baseStyles['&:hover'],
          border: '2px solid #80cbc4',
          boxShadow: '0 3px 12px rgba(0,150,136,0.3)',
        }
      };
    }
  };

  const handleProfileMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleOpenNotificationMenu = (event) => {
    setNotificationAnchor(event.currentTarget);
    // Refresh notifications when opening menu
    fetchNotifications();
  };

  const handleCloseNotificationMenu = () => {
    setNotificationAnchor(null);
  };

  return (
    <StyledAppBar 
      position="static" 
      sx={{
        ...getNavbarBgStyles(),
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src={`${process.env.PUBLIC_URL}/images/srm-marrakech-safi-seeklogo.svg`}
            alt="SRM Logo"
            sx={{
              height: '120px',
              width: 'auto',
              mr: 2,
              filter: theme => theme.palette.mode === 'dark' 
                ? 'brightness(0) drop-shadow(3px 3px 5px rgba(0,0,0,0.3))'
                : 'brightness(0) invert(1) drop-shadow(3px 3px 5px rgba(255,255,255,0.3))', 
              alignSelf: 'center',
              display: 'block',
              transition: 'all 0.3s ease'
            }}
          />
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {isAuthenticated ? (
          // Authenticated Buttons
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button color="inherit" component={RouterLink} to="/dashboard" startIcon={<DashboardIcon />} sx={navButtonStyles}>
              Tableau de bord
            </Button>
            <Button color="inherit" component={RouterLink} to="/projects" startIcon={<ProjectIcon />} sx={navButtonStyles}>
              Projets
            </Button>
            
            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton
                ref={notificationIconRef}
                onClick={handleOpenNotificationMenu}
                sx={{
                  color: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'white',
                  mx: 1,
                  transition: 'transform 0.2s',
                  '&:hover': { 
                    transform: 'scale(1.1)',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Badge 
                  badgeContent={unreadCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(239, 83, 80, 0.7)' },
                        '70%': { boxShadow: '0 0 0 5px rgba(239, 83, 80, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(239, 83, 80, 0)' }
                      }
                    }
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Notifications Dropdown Menu */}
            <Menu
              ref={notificationRef}
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleCloseNotificationMenu}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  width: 360,
                  maxHeight: 500,
                  borderRadius: 2,
                  overflow: 'auto',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" fontWeight="600">Notifications</Typography>
                {notifications.length > 0 && (
                  <Button 
                    size="small" 
                    onClick={markAllAsRead}
                    startIcon={<ReadIcon />}
                    disabled={unreadCount === 0}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'medium',
                      fontSize: '0.8rem'
                    }}
                  >
                    Tout marquer comme lu
                  </Button>
                )}
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : notifications.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {notifications.map((notification) => (
                    <React.Fragment key={notification._id}>
                      <ListItem 
                        alignItems="flex-start" 
                        sx={{ 
                          px: 2, 
                          py: 1.5,
                          cursor: 'pointer', 
                          bgcolor: notification.read ? 'transparent' : (theme.palette.mode === 'dark' ? 'rgba(255, 153, 51, 0.08)' : 'rgba(0, 150, 136, 0.05)'),
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 153, 51, 0.12)' : 'rgba(0, 150, 136, 0.08)',
                          }
                        }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            alt={notification.sender?.name || "Système"} 
                            src={notification.sender ? getProfilePhotoUrl(notification.sender._id) : ''}
                            sx={{ 
                              bgcolor: notification.sender?.name ? stringToColor(notification.sender.name) : 'primary.main',
                              width: 40,
                              height: 40
                            }}
                          >
                            {notification.sender?.name ? notification.sender.name.charAt(0).toUpperCase() : 'S'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body1" 
                              component="div" 
                              sx={{ 
                                fontWeight: notification.read ? 'normal' : 'bold',
                                fontSize: '0.9rem',
                                mb: 0.5
                              }}
                            >
                              {notification.content}
                            </Typography>
                          }
                          secondary={
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ display: 'block', fontSize: '0.75rem' }}
                            >
                              {formatNotificationDate(notification.date)}
                            </Typography>
                          }
                        />
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'error.main',
                              alignSelf: 'center',
                              ml: 1
                            }}
                          />
                        )}
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Pas de notifications pour le moment
                  </Typography>
                </Box>
              )}
            </Menu>
            
            {isAdmin && (
              <>
                <Button 
                  color="inherit" 
                  startIcon={<AdminIcon />} 
                  sx={{
                    ...navButtonStyles,
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 153, 51, 0.2)' : 'rgba(0, 150, 136, 0.2)',
                    '&:hover': {
                      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 153, 51, 0.3)' : 'rgba(0, 150, 136, 0.3)',
                    }
                  }}
                  onClick={handleOpenAdminMenu}
                  aria-haspopup="true"
                >
                  {isSuperAdmin ? 'Super Admin' : 'Administrateur'}
                </Button>
                <Menu
                  anchorEl={adminMenuAnchor}
                  open={Boolean(adminMenuAnchor)}
                  onClose={handleCloseAdminMenu}
                  MenuListProps={{
                    'aria-labelledby': 'admin-menu',
                  }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      width: 240,
                      borderRadius: 2,
                      overflow: 'visible',
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                      '& .MuiMenuItem-root': {
                        py: 1.5,
                        px: 2,
                        whiteSpace: 'normal',
                        '&:hover': {
                          bgcolor: getMenuHoverColor(),
                        }
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => handleAdminMenuItemClick('/create-project')}>
                    <AddIcon fontSize="small" sx={{ mr: 1.5 }} />
                    <Typography variant="body2" fontWeight={600}>Nouveau Projet</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleAdminMenuItemClick('/admin/assign-projects')}>
                    <GroupIcon fontSize="small" sx={{ mr: 1.5 }} />
                    <Typography variant="body2" fontWeight={600}>Assigner Employés</Typography>
                  </MenuItem>
                  {isSuperAdmin && (
                    <MenuItem onClick={() => handleAdminMenuItemClick('/admin/user-management')}>
                      <SuperAdminIcon fontSize="small" sx={{ mr: 1.5 }} />
                      <Typography variant="body2" fontWeight={600}>Gestion des Utilisateurs</Typography>
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
            
            <Tooltip title="Options du profil">
              <IconButton 
                onClick={handleProfileMenuOpen}
                sx={getUserButtonStyles()}
              >
                <UserAvatar
                  alt={user?.name || "User"}
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: user?.name ? stringToColor(user.name) : 'primary.light',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                </UserAvatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleCloseUserMenu}
              MenuListProps={{
                'aria-labelledby': 'user-menu',
              }}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  width: 240,
                  borderRadius: 2,
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                  '& .MuiMenuItem-root': {
                    py: 1.5,
                    px: 2,
                    whiteSpace: 'normal',
                    '&:hover': {
                      bgcolor: getMenuHoverColor(),
                    }
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {user && (
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="subtitle1" fontWeight="medium">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    {user.email}
                  </Typography>
                </Box>
              )}
              
              <MenuItem onClick={() => handleUserMenuItemClick('/profile')}>
                <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
                <Typography variant="body2" fontWeight={600}>Mon profil</Typography>
              </MenuItem>
              
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                <Typography variant="body2" fontWeight={600}>Déconnexion</Typography>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          // Unauthenticated Buttons
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" component={RouterLink} to="/login" sx={connexionButtonStyle}>
              Connexion
            </Button>
            <Button color="inherit" component={RouterLink} to="/register" sx={navButtonStyles}>
              S'inscrire
            </Button>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar; 