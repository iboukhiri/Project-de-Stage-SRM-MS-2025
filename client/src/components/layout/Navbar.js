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
  useMediaQuery
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
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import { ThemeContext } from '../../context/ThemeContext';
import config from '../../config';
import { darken, lighten } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

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
  const { themeMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
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
  const isAdmin = user && user.role === 'admin';

  // Admin-specific function defined outside conditional code
  const fetchNotifications = () => {
    // Implementation of fetchNotifications
    console.log("Fetching notifications for admin");
  };

  // useEffect hooks go here, before any conditional returns
  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
    }
    
    // Add click outside listeners
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target) && 
          notificationIconRef.current && !notificationIconRef.current.contains(event.target)) {
        // Handle notification close
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
  }, [isAdmin]);
  
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
            
            {isAdmin && (
              <>
                <Button 
                  color="inherit" 
                  startIcon={<AdminIcon />} 
                  sx={navButtonStyles}
                  onClick={handleOpenAdminMenu}
                  aria-haspopup="true"
                >
                  Admin
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
                      width: 200,
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
                  width: 200,
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