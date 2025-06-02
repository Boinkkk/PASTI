import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Table,
  Sheet,
  Alert,
  Button,
  Input,
  Select,
  Option
} from '@mui/joy';
import { 
  People as PeopleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import SidebarGuru from '../components/SidebarGuru';
import { useAuth } from '../components/Middleware';

const GuruSiswa: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
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
            <PeopleIcon sx={{ fontSize: 32, color: 'primary.600' }} />
            Data Siswa
          </Typography>
          <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
            Kelola data siswa yang Anda ajar
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Input
                placeholder="Cari siswa..."
                startDecorator={<SearchIcon />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 250 }}
              />
              
              <Select
                placeholder="Filter Kelas"
                value={filterKelas}
                onChange={(_, value) => setFilterKelas(value as string)}
                startDecorator={<FilterIcon />}
                sx={{ minWidth: 150 }}
              >
                <Option value="all">Semua Kelas</Option>
                <Option value="10A">Kelas 10A</Option>
                <Option value="10B">Kelas 10B</Option>
                <Option value="11A">Kelas 11A</Option>
                <Option value="11B">Kelas 11B</Option>
              </Select>

              <Button variant="outlined" startDecorator={<FilterIcon />}>
                Export Data
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Content */}
        <Alert
          startDecorator={<PeopleIcon />}
          variant="soft"
          color="primary"
          sx={{ mb: 3 }}
        >
          Fitur data siswa sedang dalam pengembangan. Akan segera tersedia!
        </Alert>

        <Card>
          <CardContent>
            <Typography level="title-md" sx={{ mb: 2 }}>
              Daftar Siswa
            </Typography>
            
            <Sheet sx={{ borderRadius: 'md', overflow: 'auto' }}>
              <Table hoverRow>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NIS</th>
                    <th>Nama Lengkap</th>
                    <th>Kelas</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                      <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                        Data siswa akan ditampilkan di sini
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

export default GuruSiswa;
