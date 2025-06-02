import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  IconButton,
  Input,
  Breadcrumbs,
  Link,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/joy';
import { 
  Search as SearchIcon, 
  ArrowBackIos as ArrowBackIcon,
  Book as BookIcon,
  Quiz as QuizIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../components/Middleware';
import { getDetailAbsensiByJadwalID, getCourseInfoByJadwalID, type DetailAbsensiData, type CourseInfo } from '../services/api';

const Kelas: React.FC = () => {
  const { mata_pelajaran } = useParams<{ mata_pelajaran: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [absensiData, setAbsensiData] = useState<DetailAbsensiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      if (!mata_pelajaran) {
        setError('ID mata pelajaran tidak ditemukan');
        setLoading(false);
        return;
      }

      if (!user?.siswa_id) {
        setError('User tidak terautentikasi atau siswa ID tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Parse the jadwal_id from the mata_pelajaran parameter
        const jadwalId = parseInt(mata_pelajaran);
        
        if (isNaN(jadwalId)) {
          throw new Error('ID mata pelajaran tidak valid');
        }

        // Fetch course info and attendance data in parallel
        const [courseResponse, absensiResponse] = await Promise.all([
          getCourseInfoByJadwalID(jadwalId),
          getDetailAbsensiByJadwalID(jadwalId, user.siswa_id)
        ]);

        setCourseInfo(courseResponse);
        setAbsensiData(absensiResponse);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mata_pelajaran, user?.siswa_id]);
  // Filter data based on search term (searching by meeting details)
  const filteredData = absensiData.filter(item =>
    item.materi_pertemuan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pertemuan_ke?.toString().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const handleBack = () => {
    navigate('/absensi');
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const getStatusChip = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'hadir':
        return <Chip color="success" startDecorator={<CheckCircleIcon />}>Hadir</Chip>;
      case 'alpha':
        return <Chip color="danger" startDecorator={<CancelIcon />}>Alpha</Chip>;
      case 'izin':
        return <Chip color="warning" startDecorator={<ScheduleIcon />}>Izin</Chip>;
      case 'sakit':
        return <Chip color="warning" startDecorator={<LocalHospitalIcon />}>Sakit</Chip>;
      case 'tidak hadir':
        return <Chip color="danger" startDecorator={<CancelIcon />}>Tidak Hadir</Chip>;
      default:
        return <Chip color="neutral" startDecorator={<ScheduleIcon />}>Belum Absen</Chip>;
    }
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress size="lg" />
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            Memuat data pertemuan...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={handleBack} startDecorator={<ArrowBackIcon />}>
            Kembali ke Absensi
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onToggle={handleToggleSidebar}  />
      <Box component="main" 
      sx={{
        flexGrow: 1,
        ml: sidebarOpen ? '280px' : '60px',
        transition: 'margin-left 0.3s ease',
        p: 3,
        backgroundColor: 'background.body',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              color="neutral"
              onClick={handleBack}
              sx={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              Absensi
            </Link>            <Typography>Detail Pertemuan</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <IconButton onClick={handleBack} variant="soft" color="neutral">
              <ArrowBackIcon />
            </IconButton>
            <Typography level="h2">Detail Pertemuan Mata Pelajaran</Typography>
          </Box>
        </Box>        {/* Course Info Card */}
        {courseInfo && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography level="h3" sx={{ mb: 1 }}>
                    {courseInfo.nama_mapel}
                  </Typography>
                  <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
                    Kelas {courseInfo.nama_kelas}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar size="sm">
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography level="body-sm" fontWeight="bold">
                        {courseInfo.guru_pengampu}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        NIP: {courseInfo.nip_guru}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Statistics */}
                  <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                    <Box>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>Total Pertemuan</Typography>
                      <Typography level="h4" sx={{ color: 'primary.500' }}>{absensiData.length}</Typography>
                    </Box>
                    <Box>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>Hadir</Typography>
                      <Typography level="h4" sx={{ color: 'success.500' }}>
                        {absensiData.filter(item => item.status_kehadiran?.toLowerCase() === 'hadir').length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>Tidak Hadir</Typography>
                      <Typography level="h4" sx={{ color: 'danger.500' }}>
                        {absensiData.filter(item => 
                          item.status_kehadiran?.toLowerCase() === 'alpha' || 
                          item.status_kehadiran?.toLowerCase() === 'tidak hadir'
                        ).length}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="soft" 
                    color="primary" 
                    startDecorator={<BookIcon />}
                    size="sm"
                  >
                    Materi
                  </Button>
                  <Button 
                    variant="soft" 
                    color="success" 
                    startDecorator={<QuizIcon />}
                    size="sm"
                  >
                    Quiz
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}{/* Search and Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Input
            placeholder="Cari materi pertemuan..."
            startDecorator={<SearchIcon />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            {filteredData.length} dari {absensiData.length} pertemuan
          </Typography>
        </Box>

        {/* Attendance Table */}
        <Card>
          <Table hoverRow>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>No</th>
                <th style={{ width: '15%' }}>Pertemuan</th>
                <th style={{ width: '15%' }}>Tanggal</th>
                <th style={{ width: '35%' }}>Materi</th>
                <th style={{ width: '15%' }}>Status Kehadiran</th>
                <th style={{ width: '15%' }}>Token Absen</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={`${item.id_pertemuan}`}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      <Typography level="body-sm" fontWeight="bold">
                        Pertemuan {item.pertemuan_ke}
                      </Typography>
                    </td>                    <td>
                      <Typography level="body-sm">
                        {item.tanggal_pertemuan ? 
                          new Date(item.tanggal_pertemuan).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '-'}
                      </Typography>
                    </td>                    <td>
                      <Typography 
                        level="body-sm" 
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '300px'
                        }}
                        title={item.materi_pertemuan || '-'}
                      >
                        {item.materi_pertemuan || '-'}
                      </Typography>
                    </td>
                    <td>
                      {getStatusChip(item.status_kehadiran)}
                    </td>
                    <td>
                      <Typography level="body-sm" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        {item.token_absen || '-'}
                      </Typography>
                    </td>
                  </tr>
                ))
              ) : (                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <BookIcon sx={{ fontSize: 48, color: 'text.tertiary' }} />
                      <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                        {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data pertemuan'}
                      </Typography>
                      {searchTerm && (
                        <Button 
                          variant="soft" 
                          size="sm" 
                          onClick={() => {
                            setSearchTerm('');
                            setCurrentPage(1);
                          }}
                        >
                          Hapus Filter
                        </Button>
                      )}
                    </Box>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
            <Button
              variant="outlined"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Sebelumnya
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "solid" : "outlined"}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outlined"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Selanjutnya
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Kelas;