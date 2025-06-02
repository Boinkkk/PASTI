import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Table,
  Sheet,
  Chip,
  Alert
} from '@mui/joy';
import { 
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import SidebarGuru from '../components/SidebarGuru';
import { useAuth } from '../components/Middleware';

const GuruJadwal: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <SidebarGuru open={sidebarOpen} onToggle={setSidebarOpen} />
      
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '280px' : '70px',
          transition: 'margin 0.3s ease',
          bgcolor: '#f8f9fa',
          minHeight: '100vh',
          p: 3
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <ScheduleIcon sx={{ fontSize: 32, color: 'primary.600' }} />
            Jadwal Mengajar
          </Typography>
          <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
            Kelola dan lihat jadwal mengajar Anda
          </Typography>
        </Box>

        {/* Content */}
        <Alert
          startDecorator={<TimeIcon />}
          variant="soft"
          color="primary"
          sx={{ mb: 3 }}
        >
          Fitur jadwal mengajar sedang dalam pengembangan. Akan segera tersedia!
        </Alert>

        <Card>
          <CardContent>
            <Typography level="title-md" sx={{ mb: 2 }}>
              Jadwal Mengajar Minggu Ini
            </Typography>
            
            <Sheet sx={{ borderRadius: 'md', overflow: 'auto' }}>
              <Table hoverRow>
                <thead>
                  <tr>
                    <th>Hari</th>
                    <th>Waktu</th>
                    <th>Mata Pelajaran</th>
                    <th>Kelas</th>
                    <th>Ruang</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                        Data jadwal akan ditampilkan di sini
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Sheet>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default GuruJadwal;
