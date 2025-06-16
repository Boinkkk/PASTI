import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, LinearProgress, Grid, Alert } from '@mui/joy';
import Sidebar from '../components/Sidebar';
import { fetchSiswaProfile } from '../services/api/siswaApi';
import { useNavigate } from 'react-router-dom';

interface Tugas {
  tugas_id: number;
  judul_tugas: string;
  deskripsi_tugas: string;
  deadline_pengumpulan: string;
  poin_maksimal: number;
  tipe_tugas: string;
  mata_pelajaran: string;
  nama_guru: string;
  status_pengumpulan: string;
  poin_didapat: number;
  days_left: number;
}

interface StatistikKehadiran {
  total_pertemuan: number;
  hadir: number;
  tidak_hadir: number;
  izin: number;
  sakit: number;
  persentase_kehadiran: number;
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [siswa, setSiswa] = useState<any>(null);
  const [tugasMendekatiDeadline, setTugasMendekatiDeadline] = useState<Tugas[]>([]);
  const [statistikKehadiran, setStatistikKehadiran] = useState<StatistikKehadiran | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  // Fetch tugas yang mendekati deadline
  const fetchTugasMendekatiDeadline = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:8080/api/users/tugas/mendekati-deadline', {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTugasMendekatiDeadline(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tugas mendekati deadline:', error);
    }
  };

  // Fetch statistik kehadiran
  const fetchStatistikKehadiran = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:8080/api/users/statistik-kehadiran', {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistikKehadiran(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistik kehadiran:', error);
    }
  };

  // Format waktu tersisa
  const formatTimeLeft = (daysLeft: number) => {
    if (daysLeft < 0) return 'Terlambat';
    if (daysLeft === 0) return 'Hari ini';
    if (daysLeft === 1) return '1 hari lagi';
    return `${daysLeft} hari lagi`;
  };

  // Get status color
  const getStatusColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'danger';
    if (daysLeft <= 1) return 'warning';
    if (daysLeft <= 3) return 'primary';
    return 'success';
  };
  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("token", token)
  
      // Kalau token tidak ada, langsung redirect ke login
      if (!token) {
        navigate("/login");
        return;
      }
  
      try {
        setLoading(true);
        
        // Fetch data siswa
        const data = await fetchSiswaProfile();
        setSiswa(data);

        // Fetch tugas mendekati deadline
        await fetchTugasMendekatiDeadline();

        // Fetch statistik kehadiran
        await fetchStatistikKehadiran();

      } catch (error: any) {
        console.error("Failed to retrieve data", error);
  
        // Jika error karena token invalid/expired, redirect ke login
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token"); // hapus token lama
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
  
    getProfile();
  }, [navigate]);
  console.log("siswa", siswa)

  if (loading || !siswa) {
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
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography level="h3">Memuat data dashboard...</Typography>
        </Box>
      </Box>
    );
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
      >        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Dashboard
          </Typography>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            Selamat datang di sistem PASTI, {siswa.data.nama_lengkap}
          </Typography>
        </Box>

        {/* Grid Layout untuk Cards */}
        <Grid container spacing={3}>
          {/* Statistik Kehadiran */}
          <Grid xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography level="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  📊 Statistik Kehadiran
                </Typography>
                
                {statistikKehadiran ? (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography level="body-sm" sx={{ mb: 1, color: 'text.secondary' }}>
                        Persentase Kehadiran
                      </Typography>
                      <LinearProgress
                        determinate
                        value={statistikKehadiran.persentase_kehadiran}
                        sx={{ mb: 1, height: 8 }}
                        color={
                          statistikKehadiran.persentase_kehadiran >= 80 ? 'success' :
                          statistikKehadiran.persentase_kehadiran >= 60 ? 'warning' : 'danger'
                        }
                      />
                      <Typography level="h3" sx={{ fontWeight: 'bold', color: 'success.500' }}>
                        {statistikKehadiran.persentase_kehadiran.toFixed(1)}%
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 'md' }}>
                          <Typography level="h4" sx={{ color: 'success.600', fontWeight: 'bold' }}>
                            {statistikKehadiran.hadir}
                          </Typography>
                          <Typography level="body-sm" sx={{ color: 'success.600' }}>
                            Hadir
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 'md' }}>
                          <Typography level="h4" sx={{ color: 'warning.600', fontWeight: 'bold' }}>
                            {statistikKehadiran.izin + statistikKehadiran.sakit}
                          </Typography>
                          <Typography level="body-sm" sx={{ color: 'warning.600' }}>
                            Izin/Sakit
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Typography level="body-sm" sx={{ mt: 2, color: 'text.secondary', textAlign: 'center' }}>
                      Total: {statistikKehadiran.total_pertemuan} pertemuan
                    </Typography>
                  </Box>
                ) : (
                  <Typography level="body-md" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                    Data kehadiran belum tersedia
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Info Siswa */}
          <Grid xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography level="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  👤 Informasi Siswa
                </Typography>
                
                <Box sx={{ space: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>NIS</Typography>
                    <Typography level="title-md" sx={{ fontWeight: 'bold' }}>{siswa.data.nis}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Kelas</Typography>
                    <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                      {siswa.data.kelas?.nama_kelas} - {siswa.data.kelas?.jurusan?.nama_jurusan}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Email</Typography>
                    <Typography level="title-md">{siswa.data.email}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Poin Motivasi</Typography>
                    <Chip 
                      color="primary" 
                      size="lg"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {siswa.data.poin_motivasi} Poin
                    </Chip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Tugas Mendekati Deadline */}
          <Grid xs={12}>
            <Card>
              <CardContent>
                <Typography level="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  ⏰ Tugas Mendekati Deadline
                </Typography>
                
                {tugasMendekatiDeadline.length > 0 ? (
                  <Grid container spacing={2}>
                    {tugasMendekatiDeadline.slice(0, 6).map((tugas) => (
                      <Grid xs={12} md={6} lg={4} key={tugas.tugas_id}>
                        <Card variant="soft" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography level="title-md" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                {tugas.judul_tugas}
                              </Typography>
                              <Chip 
                                color={getStatusColor(tugas.days_left)}
                                size="sm"
                                sx={{ ml: 1, flexShrink: 0 }}
                              >
                                {formatTimeLeft(tugas.days_left)}
                              </Chip>
                            </Box>
                            
                            <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                              📚 {tugas.mata_pelajaran}
                            </Typography>
                            
                            <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
                              👨‍🏫 {tugas.nama_guru}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                📅 {new Date(tugas.deadline_pengumpulan).toLocaleDateString('id-ID')}
                              </Typography>
                              <Chip 
                                color={tugas.status_pengumpulan === 'Dinilai' ? 'success' : 'neutral'}
                                size="sm"
                              >
                                {tugas.status_pengumpulan}
                              </Chip>
                            </Box>
                            
                            {tugas.status_pengumpulan === 'Dinilai' && (
                              <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Nilai</Typography>
                                <Typography level="title-lg" sx={{ fontWeight: 'bold', color: 'success.600' }}>
                                  {tugas.poin_didapat}/{tugas.poin_maksimal}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert color="neutral" sx={{ textAlign: 'center' }}>
                    <Typography level="body-md">
                      🎉 Tidak ada tugas yang mendekati deadline saat ini
                    </Typography>
                  </Alert>
                )}
                
                {tugasMendekatiDeadline.length > 6 && (
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      Dan {tugasMendekatiDeadline.length - 6} tugas lainnya...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid></Box>
    </Box>
  );
}

export default Dashboard