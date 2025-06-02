import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Middleware'; // Import AuthContext
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  Sheet,
  CircularProgress,
  Alert,
  Chip,
  Button
} from '@mui/joy';

// Interface untuk data siswa sesuai dengan API
interface Siswa {
  siswa_id: number;
  nis: string;
  nama_lengkap: string;
  kelas_id: number;
  email?: string;
  poin_motivasi?: number;
  tingkat_disiplin?: string;
  foto_profil?: string;
}

const SiswaList: React.FC = () => {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, token } = useAuth(); // Ambil token juga

  // Redirect ke login jika tidak terautentikasi
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fungsi untuk logout menggunakan AuthContext
  const handleLogout = () => {
    logout(); // Ini akan membersihkan state dan localStorage
    navigate('/login');
  };  // Fungsi untuk mengambil data siswa dari API
  const fetchSiswa = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Gunakan token dari AuthContext
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:8080/api/v1/siswa', {
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired atau invalid, logout otomatis
          logout();
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Siswa[] = await response.json();
      setSiswaList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      console.error('Error fetching siswa:', err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect untuk mengambil data saat komponen dimount
  useEffect(() => {
    fetchSiswa();
  }, []);

  // Fungsi untuk mendapatkan warna chip berdasarkan tingkat disiplin
  const getDisiplinColor = (tingkat: string | undefined) => {
    switch (tingkat) {
      case 'Sangat Baik':
        return 'success';
      case 'Baik':
        return 'primary';
      case 'Cukup':
        return 'warning';
      case 'Kurang':
        return 'danger';
      case 'Sangat Kurang':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
      >
        <CircularProgress />
        <Typography level="body-md" sx={{ ml: 2 }}>
          Memuat data siswa...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert color="danger" variant="soft">
          <Typography level="title-md">Error:</Typography>
          <Typography level="body-md">{error}</Typography>
        </Alert>
        <Box sx={{ mt: 2 }}>
          <button 
            onClick={fetchSiswa}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Coba Lagi
          </button>
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with user info and logout */}
      {user && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.level1', borderRadius: 'sm' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography level="title-md">
                Selamat datang, {user.nama_lengkap}
              </Typography>
              <Typography level="body-sm" color="neutral">
                {user.email} • NIS: {user.nis}
              </Typography>
            </Box>
            <Button variant="outlined" color="neutral" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography level="title-lg" sx={{ mb: 2 }}>
            Data Siswa
          </Typography>
          
          <Typography level="body-sm" sx={{ mb: 3, color: 'text.secondary' }}>
            Total: {siswaList.length} siswa
          </Typography>

          {siswaList.length === 0 ? (
            <Alert color="neutral" variant="soft">
              <Typography level="body-md">
                Tidak ada data siswa yang ditemukan.
              </Typography>
            </Alert>
          ) : (
            <Sheet variant="outlined" sx={{ borderRadius: 'sm' }}>
              <Table 
                hoverRow 
                size="md"
                sx={{
                  '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
                  '--Table-headerUnderlineThickness': '1px',
                  '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>ID</th>
                    <th style={{ width: '15%' }}>NIS</th>
                    <th style={{ width: '25%' }}>Nama Lengkap</th>
                    <th style={{ width: '10%' }}>Kelas ID</th>
                    <th style={{ width: '20%' }}>Email</th>
                    <th style={{ width: '10%' }}>Poin</th>
                    <th style={{ width: '10%' }}>Disiplin</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaList.map((siswa) => (
                    <tr key={siswa.siswa_id}>
                      <td>
                        <Typography level="body-sm">
                          {siswa.siswa_id}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm" fontWeight="md">
                          {siswa.nis}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {siswa.nama_lengkap}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {siswa.kelas_id}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {siswa.email || '-'}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {siswa.poin_motivasi || 0}
                        </Typography>
                      </td>
                      <td>
                        {siswa.tingkat_disiplin ? (
                          <Chip 
                            color={getDisiplinColor(siswa.tingkat_disiplin)}
                            size="sm"
                            variant="soft"
                          >
                            {siswa.tingkat_disiplin}
                          </Chip>
                        ) : (
                          <Typography level="body-sm" color="neutral">
                            -
                          </Typography>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SiswaList;
