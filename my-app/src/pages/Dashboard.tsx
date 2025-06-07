import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/joy';
import Sidebar from '../components/Sidebar';
import { fetchSiswaProfile } from '../services/api';
import { Navigate, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [siswa, setSiswa] = useState<any>(null)
  const navigate = useNavigate()

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("token",token)
  
      // Kalau token tidak ada, langsung redirect ke login
      if (!token) {
        navigate("/login");
        return;
      }
  
      try {
        const data = await fetchSiswaProfile();
        setSiswa(data);
      } catch (error: any) {
        console.error("Failed to retrieve data", error);
  
        // Jika error karena token invalid/expired, redirect ke login
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token"); // hapus token lama
          navigate("/login");
        }
      }
    };
  
    getProfile();
  }, [navigate]);

  console.log("siswa", siswa)

  if (!siswa) {
    return <Typography>Memuat data siswa...</Typography>;
  }

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
            Selamat datang di sistem PASTI {siswa.data.nama_lengkap}
          </Typography>
        </Box>

        
      </Box>
    </Box>
  );
}

export default Dashboard