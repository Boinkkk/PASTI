import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent,
  Typography,
  Sheet,
  Avatar,
  Chip
} from '@mui/joy';
import { 
  EventNote as AbsensiIcon,
  Schedule as JadwalIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  School as SchoolIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from './Middleware';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  // {
  //   id: 'dashboard',
  //   label: 'Dashboard',
  //   icon: <DashboardIcon />,
  //   path: '/guru/dashboard'
  // },
  {
    id: 'tugas-siswa',
    label: 'Tugas Siswa',
    icon: <JadwalIcon />,
    path: '/guru/jadwal'
  },
  {
    id: 'absensi',
    label: 'Kelola Absensi',
    icon: <AbsensiIcon />,
    path: '/guru/absensi'
  },
  // {
  //   id: 'qr-generator',
  //   label: 'QR Generator',
  //   icon: <QrCodeIcon />,
  //   path: '/guru/qr-generator'
  // },  // {
  //   id: 'siswa',
  //   label: 'Data Siswa',
  //   icon: <SiswaIcon />,
  //   path: '/guru/siswa'
  // },
  // {
  //   id: 'laporan',
  //   label: 'Laporan',
  //   icon: <LaporanIcon />,
  //   path: '/guru/laporan'
  // },
  {
    id: 'profile',
    label: 'Profil',
    icon: <SettingsIcon />,
    path: '/guru/profile'
  }
];

interface SidebarGuruProps {
  open?: boolean;
  onToggle?: (open: boolean) => void;
}

const SidebarGuru: React.FC<SidebarGuruProps> = ({ open = true, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!open);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login-guru');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sheet
      variant="outlined"
      sx={{
        width: open ? 280 : 70,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        transition: 'width 0.3s ease',
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.surface',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
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
          onClick={handleToggle}
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
        
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon sx={{ fontSize: 28, color: 'primary.600' }} />
            <Typography 
              level="title-lg" 
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.600',
                letterSpacing: '0.1em'
              }}
            >
              PASTI
            </Typography>
            <Chip 
              size="sm" 
              variant="soft" 
              color="success"
              sx={{ ml: 1 }}
            >
              Guru
            </Chip>
          </Box>
        )}
      </Box>

      {/* User Profile */}
      {open && user && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'primary.50'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              size="sm"
              sx={{ 
                bgcolor: 'primary.600',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              {user.nama_lengkap?.charAt(0) || 'G'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography 
                level="body-sm" 
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user.nama_lengkap}
              </Typography>
              <Typography 
                level="body-xs" 
                sx={{ 
                  color: 'primary.500',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                NIP: {user.nip}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation List */}
      <Box sx={{ p: 1, flex: 1, overflowY: 'auto' }}>
        <List
          sx={{
            '--List-gap': '4px',
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
                    px: open ? 2 : 1,
                    borderRadius: 'sm',
                    backgroundColor: active ? 'primary.100' : 'transparent',
                    color: active ? 'primary.700' : 'text.primary',
                    fontWeight: active ? 600 : 400,
                    border: active ? '1px solid' : '1px solid transparent',
                    borderColor: active ? 'primary.300' : 'transparent',
                    '&:hover': {
                      backgroundColor: active ? 'primary.200' : 'background.level1',
                    },
                    transition: 'all 0.2s ease',
                    justifyContent: open ? 'flex-start' : 'center',
                    minHeight: 44
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
                  
                  {open && (
                    <ListItemContent sx={{ ml: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography 
                          level="body-md"
                          sx={{ 
                            fontWeight: active ? 600 : 400,
                            color: 'inherit'
                          }}
                        >
                          {item.label}
                        </Typography>
                        {item.badge && (
                          <Chip
                            size="sm"
                            variant="solid"
                            color="primary"
                            sx={{ fontSize: '10px', height: '16px' }}
                          >
                            {item.badge}
                          </Chip>
                        )}
                      </Box>
                    </ListItemContent>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Logout Button */}
      <Box
        sx={{
          p: 1,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ListItemButton
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: open ? 2 : 1,
            borderRadius: 'sm',
            color: 'danger.600',
            '&:hover': {
              backgroundColor: 'danger.50',
            },
            transition: 'all 0.2s ease',
            justifyContent: open ? 'flex-start' : 'center',
            minHeight: 44
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
          
          {open && (
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
      </Box>

      {/* Footer */}
      {open && (
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography 
            level="body-xs" 
            sx={{ 
              color: 'text.tertiary',
              textAlign: 'center'
            }}
          >
            © 2025 PASTI System v2.0
          </Typography>
        </Box>
      )}
    </Sheet>
  );
};

export default SidebarGuru;
