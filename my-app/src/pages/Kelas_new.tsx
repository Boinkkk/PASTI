import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Button,
  Table,
  Sheet,
  Chip,
  Select,
  Option,
  Input,
  CircularProgress,
  Alert
} from '@mui/joy';
import { 
  Home as HomeIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../components/Middleware';
import { getDetailAbsensiByJadwalID, getCourseInfoByJadwalID, DetailAbsensiData, CourseInfo } from '../services/api';

interface AttendanceRecord {
  id: number;
  pertemuan: number;
  tanggal: string;
  materi: string;
  statusKehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | null;
  statusPembahasan: string;
  nilai: number;
}

const Kelas: React.FC = () => {
  const { mata_pelajaran } = useParams<{ mata_pelajaran: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  // Convert mata_pelajaran param to jadwal ID
  const jadwalID = mata_pelajaran ? parseInt(mata_pelajaran) : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!jadwalID || !user?.siswa_id) {
        setError('Invalid course ID or user not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch course info and attendance data in parallel
        const [courseInfoResult, detailAbsensiResult] = await Promise.all([
          getCourseInfoByJadwalID(jadwalID),
          getDetailAbsensiByJadwalID(jadwalID, user.siswa_id)
        ]);

        setCourseInfo(courseInfoResult);

        // Transform detail absensi data to attendance records
        const transformedData: AttendanceRecord[] = detailAbsensiResult.map((item: DetailAbsensiData) => ({
          id: item.id_pertemuan,
          pertemuan: item.pertemuan_ke,
          tanggal: new Date(item.tanggal_pertemuan).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          materi: item.materi_pertemuan,
          statusKehadiran: item.status_kehadiran as ('Hadir' | 'Izin' | 'Sakit' | 'Alpha' | null),
          statusPembahasan: item.waktu_absen 
            ? new Date(item.waktu_absen).toLocaleString('id-ID', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
            : '-',
          nilai: 0 // Default value, can be updated if you have grade data
        }));

        setAttendanceData(transformedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jadwalID, user?.siswa_id]);

  const getStatusColor = (status: string | null): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'Hadir': return 'success';
      case 'Izin': return 'warning';
      case 'Sakit': return 'warning';
      case 'Alpha': return 'danger';
      default: return 'neutral';
    }
  };

  const handleBack = () => {
    navigate('/absensi');
  };

  // Filter data based on search term
  const filteredData = attendanceData.filter(record =>
    record.materi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.tanggal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPage = 1; // You can add pagination state if needed
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar open={sidebarOpen} onToggle={setSidebarOpen} />
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ml: sidebarOpen ? '250px' : '60px',
          transition: 'margin 0.3s ease'
        }}>
          <CircularProgress size="lg" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar open={sidebarOpen} onToggle={setSidebarOpen} />
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          ml: sidebarOpen ? '250px' : '60px',
          transition: 'margin 0.3s ease',
          p: 3
        }}>
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={handleBack} variant="outlined">
            Back to Absensi
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar open={sidebarOpen} onToggle={setSidebarOpen} />
      
      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '250px' : '60px',
          transition: 'margin 0.3s ease',
          bgcolor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          bgcolor: 'white', 
          p: 3, 
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <Typography level="h3" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
            Detail Absensi
          </Typography>
          
          {/* Breadcrumb */}
          <Breadcrumbs>
            <Link 
              onClick={() => navigate('/dashboard')}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                cursor: 'pointer',
                '&:hover': { color: '#1976d2' }
              }}
            >
              <HomeIcon fontSize="small" />
              Dashboard
            </Link>
            <Link
              onClick={() => navigate('/absensi')}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                cursor: 'pointer',
                '&:hover': { color: '#1976d2' }
              }}
            >
              <SchoolIcon fontSize="small" />
              Absensi
            </Link>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              {courseInfo?.nama_mapel || 'Detail Kelas'}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, flex: 1 }}>
          {/* Course Info Card */}
          {courseInfo && (
            <Card sx={{ mb: 3, boxShadow: 'sm' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography level="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {courseInfo.nama_mapel}
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 1, color: 'text.secondary' }}>
                      Kelas: {courseInfo.nama_kelas}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      Pengampu: {courseInfo.guru_pengampu} ({courseInfo.nip_guru})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startDecorator={<SchoolIcon />}
                      size="sm"
                    >
                      Materi
                    </Button>
                    <Button
                      variant="outlined"
                      startDecorator={<QuizIcon />}
                      size="sm"
                    >
                      Quiz
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Input
              placeholder="Cari berdasarkan materi atau tanggal..."
              startDecorator={<SearchIcon />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography level="body-sm">Tampilkan:</Typography>
              <Select
                value={itemsPerPage}
                onChange={(_, value) => setItemsPerPage(value as number)}
                size="sm"
                sx={{ minWidth: 80 }}
              >
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={25}>25</Option>
                <Option value={50}>50</Option>
              </Select>
              <Typography level="body-sm">entri</Typography>
            </Box>
          </Box>

          {/* Attendance Table */}
          <Sheet sx={{ borderRadius: 'md', overflow: 'auto' }}>
            <Table 
              hoverRow 
              sx={{ 
                '--TableCell-headBackground': '#f8f9fa',
                '--TableCell-selectedBackground': '#e3f2fd'
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>Pertemuan</th>
                  <th style={{ width: '12%' }}>Tanggal</th>
                  <th style={{ width: '45%' }}>Materi</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Status Kehadiran</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Status Pembahasan</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Nilai</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((record) => (
                    <tr key={record.id}>
                      <td style={{ textAlign: 'center' }}>
                        <Typography level="body-sm" sx={{ fontWeight: 'medium' }}>
                          {record.pertemuan}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {record.tanggal}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {record.materi}
                        </Typography>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Chip
                          color={getStatusColor(record.statusKehadiran)}
                          size="sm"
                          variant="soft"
                        >
                          {record.statusKehadiran || 'Belum Absen'}
                        </Chip>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                          {record.statusPembahasan}
                        </Typography>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Typography level="body-sm" sx={{ fontWeight: 'medium' }}>
                          {record.nilai}
                        </Typography>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                        {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data absensi'}
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Sheet>

          {/* Pagination Info */}
          {filteredData.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} entri
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Halaman {currentPage} dari {totalPages}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Kelas;
