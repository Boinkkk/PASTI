import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent,
  Typography,
  Sheet
} from '@mui/joy';
import { 
  Dashboard as DashboardIcon,
  EventNote as AbsensiIcon,
  Assignment as AssignmentIcon,
  Person as ProfileIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard'
  },
  {
    id: 'absensi',
    label: 'Absensi',
    icon: <AbsensiIcon />,
    path: '/absensi'
  },
  {
    id: 'tugas',
    label: 'Tugas',
    icon: <AssignmentIcon />,
    path: '/tugas'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: <ProfileIcon />,
    path: '/profile'
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sheet
      variant="outlined"
      sx={{
        width: isOpen ? 280 : 60,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        transition: 'width 0.3s ease',
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.surface',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minHeight: 64
        }}
      >
        <Box
          onClick={onToggle}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: 'sm',
            '&:hover': {
              backgroundColor: 'background.level1'
            }
          }}
        >
          <MenuIcon sx={{ fontSize: 24, color: 'text.primary' }} />
        </Box>
        
        {isOpen && (
          <Typography 
            level="title-lg" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.500',
              letterSpacing: '0.1em'
            }}
          >
            PASTI
          </Typography>
        )}
      </Box>

      {/* Navigation List */}
      <Box sx={{ p: 1, flex: 1 }}>
        <List
          sx={{
            '--List-gap': '8px',
            '--ListItem-radius': '8px',
          }}
        >
          {sidebarItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <ListItem key={item.id}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 'sm',
                    backgroundColor: active ? 'primary.50' : 'transparent',
                    color: active ? 'primary.600' : 'text.primary',
                    fontWeight: active ? 600 : 400,
                    border: active ? '1px solid' : '1px solid transparent',
                    borderColor: active ? 'primary.200' : 'transparent',
                    '&:hover': {
                      backgroundColor: active ? 'primary.100' : 'background.level1',
                    },
                    transition: 'all 0.2s ease',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    minHeight: 48
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 20,
                      minWidth: 24,
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </Box>
                  
                  {isOpen && (
                    <ListItemContent sx={{ ml: 2 }}>
                      <Typography 
                        level="body-md"
                        sx={{ 
                          fontWeight: active ? 600 : 400,
                          color: 'inherit'
                        }}
                      >
                        {item.label}
                      </Typography>
                    </ListItemContent>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>      {/* Footer/User Info (Optional) */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 'auto'
        }}
      >
        {/* Logout Button */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 'sm',
            backgroundColor: 'transparent',
            color: 'danger.600',
            fontWeight: 500,
            border: '1px solid transparent',
            '&:hover': {
              backgroundColor: 'danger.50',
              borderColor: 'danger.200',
            },
            transition: 'all 0.2s ease',
            justifyContent: isOpen ? 'flex-start' : 'center',
            minHeight: 48,
            mb: 1
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 20,
              minWidth: 24,
              justifyContent: 'center'
            }}
          >
            <LogoutIcon />
          </Box>
          
          {isOpen && (
            <ListItemContent sx={{ ml: 2 }}>
              <Typography 
                level="body-md"
                sx={{ 
                  fontWeight: 500,
                  color: 'inherit'
                }}
              >
                Logout
              </Typography>
            </ListItemContent>
          )}
        </ListItemButton>

        {isOpen && (
          <Typography 
            level="body-xs" 
            sx={{ 
              color: 'text.tertiary',
              textAlign: 'center'
            }}
          >
            © 2025 PASTI System
          </Typography>
        )}
      </Box>
    </Sheet>
  );
};

export default Sidebar;