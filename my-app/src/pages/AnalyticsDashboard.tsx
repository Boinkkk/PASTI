import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Table,
  Sheet,
  CircularProgress,
  Alert,
  Button
} from '@mui/joy';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  TableChart as TableIcon
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

// Types for analytics data
interface AnalyticsDashboard {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_subjects: number;
  attendance_overview: AttendanceOverview;
  recent_activities: RecentActivity[];
  student_performance: StudentPerformance[];
  attendance_by_class: AttendanceByClass[];
}

interface AttendanceOverview {
  total_sessions: number;
  present_count: number;
  absent_count: number;
  permission_count: number;
  sick_count: number;
  attendance_rate: number;
}

interface RecentActivity {
  activity_id: number;
  activity_type: string;
  description: string;
  user_name: string;
  created_at: string;
}

interface StudentPerformance {
  student_id: number;
  student_name: string;
  class_name: string;
  total_tasks: number;
  completed_tasks: number;
  average_score: number;
  attendance_rate: number;
}

interface AttendanceByClass {
  class_id: number;
  class_name: string;
  total_students: number;
  present_count: number;
  attendance_rate: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get admin username from localStorage
    const username = localStorage.getItem('adminUsername');
    if (username) {
      setAdminUsername(username);
    }
    
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token admin tidak ditemukan');
        return;
      }

      const response = await fetch('http://localhost:8080/api/admin/analytics/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data analytics');
      }      const result = await response.json();
      
      // 🔥 DEBUG: Log response untuk debugging
      console.log('Analytics API Response:', result);
      console.log('Response Status:', result.status);
      console.log('Response Data:', result.data);
      
      // Handle both "success" dan "succes" (typo)
      if (result.status === 'success' || result.status === 'succes') {
        console.log('Setting dashboard data:', result.data);
        setDashboardData(result.data);
      } else {
        setError(result.message || 'Gagal mengambil data analytics');
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    try {
      // Handle ISO datetime format (2025-06-22T12:50:12Z)
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString; // Fallback to original string
    }
  };
  if (loading) {
    return (
      <AdminLayout adminUsername={adminUsername}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress size="lg" />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout adminUsername={adminUsername}>
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  if (!dashboardData) {
    return (
      <AdminLayout adminUsername={adminUsername}>
        <Alert color="warning">
          Data analytics tidak tersedia
        </Alert>
      </AdminLayout>
    );
  }
  return (    <AdminLayout adminUsername={adminUsername}>
      <Box sx={{ p: 3 }}>
        
        {/* Breadcrumb Analytics Navigation */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 'sm', color: 'text.secondary', mb: 2 }}>
            <Typography level="body-sm">Analytics</Typography>
            <Typography level="body-sm">/</Typography>
            <Typography level="body-sm" sx={{ fontWeight: 'md', color: 'primary.600' }}>Dashboard</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              size="sm" 
              variant="solid" 
              color="primary"
            >
              📊 Dashboard
            </Chip>
            <Chip 
              size="sm" 
              variant="outlined"
              onClick={() => navigate('/admin/analytics/attendance-report')}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'background.level1' } }}
            >
              📈 Attendance Report
            </Chip>
            <Chip 
              size="sm" 
              variant="outlined"
              onClick={() => navigate('/admin/analytics/bulk-grade-calculation')}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'background.level1' } }}
            >
              🧮 Bulk Grade Calculation
            </Chip>
          </Box>
        </Card>
        {/* Debug Info - Remove in production */}
        <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography level="body-sm" sx={{ fontFamily: 'monospace' }}>
              Debug Info: 
              dashboardData = {dashboardData ? 'loaded' : 'null'}, 
              loading = {loading.toString()}, 
              error = {error || 'none'},
              total_students = {dashboardData?.total_students || 'N/A'}
            </Typography>
          </CardContent>
        </Card>

        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography level="h2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon />
              Analytics Dashboard
            </Typography>
            <Typography level="body-md" color="neutral">
              Ringkasan statistik dan aktivitas sistem PASTI
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startDecorator={<TableIcon />}
            onClick={() => navigate('/admin/analytics/attendance-report')}
          >
            Lihat Laporan Detail
          </Button>
        </Box>

        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography level="h3">{dashboardData.total_students}</Typography>
                    <Typography level="body-sm" color="neutral">Total Siswa</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography level="h3">{dashboardData.total_teachers}</Typography>
                    <Typography level="body-sm" color="neutral">Total Guru</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ClassIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography level="h3">{dashboardData.total_classes}</Typography>
                    <Typography level="body-sm" color="neutral">Total Kelas</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SubjectIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography level="h3">{dashboardData.total_subjects}</Typography>
                    <Typography level="body-sm" color="neutral">Total Mata Pelajaran</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Attendance Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography level="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon />
                  Ringkasan Kehadiran (30 hari terakhir)
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>
                    Tingkat Kehadiran: {dashboardData.attendance_overview.attendance_rate.toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    determinate
                    value={dashboardData.attendance_overview.attendance_rate}
                    color={dashboardData.attendance_overview.attendance_rate >= 80 ? 'success' : 
                           dashboardData.attendance_overview.attendance_rate >= 60 ? 'warning' : 'danger'}
                    sx={{ height: 8 }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 'sm' }}>
                      <Typography level="h4" color="success">{dashboardData.attendance_overview.present_count}</Typography>
                      <Typography level="body-sm">Hadir</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'danger.50', borderRadius: 'sm' }}>
                      <Typography level="h4" color="danger">{dashboardData.attendance_overview.absent_count}</Typography>
                      <Typography level="body-sm">Alpha</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 'sm' }}>
                      <Typography level="h4" color="warning">{dashboardData.attendance_overview.permission_count}</Typography>
                      <Typography level="body-sm">Izin</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'neutral.50', borderRadius: 'sm' }}>
                      <Typography level="h4">{dashboardData.attendance_overview.sick_count}</Typography>
                      <Typography level="body-sm">Sakit</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography level="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon />
                  Aktivitas Terbaru
                </Typography>
                
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {dashboardData.recent_activities.length > 0 ? (
                    dashboardData.recent_activities.map((activity, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.level1', borderRadius: 'sm' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Chip color="primary" size="sm">{activity.activity_type}</Chip>
                          <Typography level="body-xs" color="neutral">
                            {formatDate(activity.created_at)}
                          </Typography>
                        </Box>
                        <Typography level="body-sm" sx={{ mb: 1 }}>
                          {activity.description}
                        </Typography>
                        <Typography level="body-xs" color="neutral">
                          oleh {activity.user_name}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography level="body-sm" color="neutral">
                      Tidak ada aktivitas terbaru
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Student Performance and Class Attendance */}
        <Grid container spacing={3}>
          {/* Top Student Performance */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography level="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon />
                  Performa Siswa Terbaik
                </Typography>
                
                <Sheet sx={{ overflow: 'auto' }}>
                  <Table size="sm" stickyHeader>
                    <thead>
                      <tr>
                        <th>Nama Siswa</th>
                        <th>Kelas</th>
                        <th>Nilai Rata-rata</th>
                        <th>Kehadiran</th>
                      </tr>
                    </thead>                    <tbody>
                      {dashboardData.student_performance.map((student) => {
                        try {
                          return (
                            <tr key={student.student_id}>
                              <td>{student.student_name}</td>
                              <td>{student.class_name}</td>
                              <td>{student.average_score.toFixed(1)}</td>
                              <td>
                                <Chip 
                                  color={student.attendance_rate >= 80 ? 'success' : 
                                         student.attendance_rate >= 60 ? 'warning' : 'danger'}
                                  size="sm"
                                >
                                  {student.attendance_rate.toFixed(1)}%
                                </Chip>
                              </td>
                            </tr>
                          );
                        } catch (error) {
                          console.error('Error rendering student row:', error, student);
                          return null;
                        }
                      })}
                    </tbody>
                  </Table>
                </Sheet>
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance by Class */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography level="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ClassIcon />
                  Kehadiran per Kelas
                </Typography>
                
                <Sheet sx={{ overflow: 'auto' }}>
                  <Table size="sm" stickyHeader>
                    <thead>
                      <tr>
                        <th>Kelas</th>
                        <th>Total Siswa</th>
                        <th>Tingkat Kehadiran</th>
                      </tr>
                    </thead>                    <tbody>
                      {dashboardData.attendance_by_class.map((classData) => {
                        try {
                          return (
                            <tr key={classData.class_id}>
                              <td>{classData.class_name}</td>
                              <td>{classData.total_students}</td>
                              <td>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress
                                    determinate
                                    value={classData.attendance_rate}
                                    color={classData.attendance_rate >= 80 ? 'success' : 
                                           classData.attendance_rate >= 60 ? 'warning' : 'danger'}
                                    sx={{ flexGrow: 1, height: 6 }}
                                  />
                                  <Typography level="body-xs">
                                    {classData.attendance_rate.toFixed(1)}%
                                  </Typography>
                                </Box>
                              </td>
                            </tr>
                          );
                        } catch (error) {
                          console.error('Error rendering class row:', error, classData);
                          return null;
                        }
                      })}
                    </tbody>
                  </Table>
                </Sheet>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;
