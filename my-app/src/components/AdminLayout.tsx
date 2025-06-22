import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/joy';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  adminUsername: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, adminUsername }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <AdminSidebar 
        adminUsername={adminUsername} 
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <Box 
        sx={{ 
          flex: 1, 
          marginLeft: '280px',
          bgcolor: '#f5f5f5'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
