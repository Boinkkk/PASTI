import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert
} from '@mui/joy';
import { 
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CardAbsensi from '../components/CardAbsensi';
import { fetchDaftarKelas } from '../services/api';
import type { CourseData } from '../services/api';

// Remove the local interface since we're importing it from api.ts
// interface CourseData {
//   id: string;
//   title: string;
//   class: string;
//   semester: string;
//   teacher: {
//     name: string;
//     nip: string;
//     avatar?: string;
//   };
//   absensiCount: number;
// }

const Absensi: React.FC = () => {
  const [daftarAbsensi, setDaftarAbsensi] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [coursesData, setCoursesData] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    const fetchCoursesData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const dataAbsensi = await fetchDaftarKelas()
        setDaftarAbsensi(dataAbsensi.data);

        console.log("daftarAbsensi", dataAbsensi.data)
        console.log("daftarAbsneis sudah set", daftarAbsensi)


      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Gagal memuat data mata pelajaran. Silakan coba lagi.');
        
        // Fallback to static data if API fails
        setCoursesData([
          {
            id: '1',
            title: 'Pemrosesan Bahasa Alami (IF 6B)',
            class: 'IF 6B',
            semester: '2024/2025 Genap',
            teacher: {
              name: 'Dr. FIKA HASTARITA RACHMAN ST., M.Eng',
              nip: '198309520060402',
            },
            absensiCount: 0
          },
          {
            id: '2',
            title: 'Rekayasa Perangkat Lunak (IF 4A)',
            class: 'IF 4A',
            semester: '2024/2025 Genap',
            teacher: {
              name: 'S.Kom FIFIN AYU MUFARROHA M.Kom',
              nip: '198910120201970',
            },
            absensiCount: 2
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };  const handleAbsensiClick = (courseId: string) => {
    console.log('Absensi clicked for course:', courseId);
    // Navigate to Kelas page with course ID
    navigate(`/absensi/kelas/${courseId}`);
  };

  const handleCalendarClick = (courseId: string) => {
    console.log('Calendar clicked for course:', courseId);
    // Handle calendar action here
  };

  const handleDocumentClick = (courseId: string) => {
    console.log('Document clicked for course:', courseId);
    // Handle document action here
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
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs separator="›" sx={{ fontSize: 'sm' }}>
            <Link 
              underline="none" 
              color="neutral" 
              href="/dashboard"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                color: 'text.secondary'
              }}
            >
              <HomeIcon sx={{ fontSize: 16 }} />
              Dashboard
            </Link>
            <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
              Absensi
            </Typography>
          </Breadcrumbs>
        </Box>        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Daftar Absensi
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert color="danger" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}        {/* Course Cards Grid */}
        {!loading && !error && daftarAbsensi.length > 0 && (
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3
            }}
          >   {daftarAbsensi.map((course) => (
              <CardAbsensi
                key={course.id_jadwal_pelajaran}
                id={course.id_jadwal_pelajaran.toString()}
                title={`${course.nama_mapel} (${course.kode_mapel})`}
                semester={course.nama_kelas}
                teacher={{
                  name: course.nama_guru,
                  nip: course.nip_guru || '',
                }}
                loading={loading}
                onAbsensiClick={() => handleAbsensiClick(course.id_jadwal_pelajaran.toString())}
                onCalendarClick={() => handleCalendarClick(course.id_jadwal_pelajaran.toString())}
                onDocumentClick={() => handleDocumentClick(course.id_jadwal_pelajaran.toString())}
              />
            ))}
          </Box>
        )}

        {/* Fallback data display when error occurs */}
        {!loading && error && coursesData.length > 0 && (
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3
            }}
          >
            {daftarAbsensi.map((course) => (
              <CardAbsensi
                key={course.id}
                id={course.id}
                title={course.title}
                semester={course.semester}
                teacher={course.teacher}
                absensiCount={course.absensiCount}
                onAbsensiClick={() => handleAbsensiClick(course.id)}
                onCalendarClick={() => handleCalendarClick(course.id)}
                onDocumentClick={() => handleDocumentClick(course.id)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Absensi;
