import { useState } from 'react';
import { Box, Typography } from '@mui/joy';
import SiswaList from '../components/SiswaList';
import Sidebar from '../components/Sidebar';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onToggle={handleToggleSidebar} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '280px' : '60px',
          transition: 'margin-left 0.3s ease',
          p: 3,
          backgroundColor: 'background.body',
          minHeight: '100vh'
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Dashboard
          </Typography>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            Selamat datang di sistem PASTI
          </Typography>
        </Box>

        {/* Main content */}
        <SiswaList />
      </Box>
    </Box>
  );
}

export default Dashboard