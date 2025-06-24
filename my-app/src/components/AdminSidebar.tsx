import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, List, ListItem, ListItemButton, ListItemContent, 
  Typography, Divider, Avatar
} from '@mui/joy';
import { 
  People as PeopleIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Upload as UploadIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';

interface AdminSidebarProps {
  adminUsername: string;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminUsername, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = [    {
      category: "Analytics",
      items: [
        {
          label: "Dashboard Analytics",
          path: "/admin/analytics/dashboard",
          icon: <DashboardIcon />,
        },
        {
          label: "Laporan Kehadiran",
          path: "/admin/analytics/attendance-report",
          icon: <AssessmentIcon />,
        },
        {
          label: "Bulk Grade Calculation",
          path: "/admin/analytics/bulk-grade-calculation",
          icon: <CalculateIcon />,
        }
      ]
    },
    {
      category: "Upload Data",
      items: [
        {
          label: "Upload Siswa",
          path: "/admin/upload-siswa",
          icon: <UploadIcon />,
        },
        {
          label: "Upload Guru", 
          path: "/admin/upload-guru",
          icon: <UploadIcon />,
        },
        {
          label: "Upload Jadwal",
          path: "/admin/upload-jadwal", 
          icon: <ScheduleIcon />,
        }
      ]
    },
    {
      category: "View Data",
      items: [
        {
          label: "Data Siswa",
          path: "/admin/siswa",
          icon: <PeopleIcon />,
        },
        {
          label: "Data Guru",
          path: "/admin/guru", 
          icon: <SchoolIcon />,
        }
      ]
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: 'background.surface',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.500' }}>
        <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'primary.700' }}>
          <SettingsIcon />
        </Avatar>
        <Typography level="title-md" sx={{ color: 'white', fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
        <Typography level="body-sm" sx={{ color: 'primary.100' }}>
          {adminUsername}
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {menuItems.map((category, categoryIndex) => (
          <Box key={category.category} sx={{ mb: 3 }}>
            <Typography 
              level="body-xs" 
              sx={{ 
                px: 2, 
                py: 1, 
                textTransform: 'uppercase', 
                fontWeight: 'bold',
                color: 'text.tertiary'
              }}
            >
              {category.category}
            </Typography>
            
            <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
              {category.items.map((item) => (
                <ListItem key={item.path}>
                  <ListItemButton
                    selected={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: '8px',
                      '&.Mui-selected': {
                        bgcolor: 'primary.100',
                        color: 'primary.700',
                        '&:hover': {
                          bgcolor: 'primary.200',
                        }
                      }
                    }}
                  >
                    <Box sx={{ mr: 2, color: isActive(item.path) ? 'primary.500' : 'text.primary' }}>
                      {item.icon}
                    </Box>
                    <ListItemContent>
                      <Typography level="body-md">
                        {item.label}
                      </Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            
            {categoryIndex < menuItems.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: '8px',
            color: 'danger.500',
            '&:hover': {
              bgcolor: 'danger.50',
            }
          }}
        >
          <Box sx={{ mr: 2 }}>
            <LogoutIcon />
          </Box>
          <ListItemContent>
            <Typography level="body-md">
              Logout
            </Typography>
          </ListItemContent>
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default AdminSidebar;
