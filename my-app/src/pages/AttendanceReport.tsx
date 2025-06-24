import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Input,
  Button,
  Select,
  Option,
  FormControl,
  FormLabel,
  Table,
  Sheet,
  Chip,
  CircularProgress,
  Alert,
  Modal,
  ModalDialog,
  ModalClose
} from '@mui/joy';
import {
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TableChart as TableIcon
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';

// Types
interface AttendanceReportItem {
  student_id: number;
  student_name: string;
  class_name: string;
  subject_name: string;
  teacher_name: string;
  attendance_date: string;
  status: string;
  created_at: string;
}

interface AttendanceReportResponse {
  data: AttendanceReportItem[];
  next_cursor: string;
  has_more: boolean;
  total: number;
}

interface KelasData {
  kelas_id: number;
  nama_kelas: string;
}

const AttendanceReport: React.FC = () => {
  const [reportData, setReportData] = useState<AttendanceReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [kelasOptions, setKelasOptions] = useState<KelasData[]>([]);
  
  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [cursor, setCursor] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  
  // Modal state
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  useEffect(() => {
    // Get admin username
    const username = localStorage.getItem('adminUsername');
    if (username) {
      setAdminUsername(username);
    }

    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    // Load initial data and options
    fetchKelasOptions();
    fetchReportData(true);
  }, []);

  const fetchKelasOptions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/admin/kelas', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setKelasOptions(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching kelas options:', err);
    }
  };

  const fetchReportData = async (reset: boolean = false, loadMore: boolean = false) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token admin tidak ditemukan');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (selectedClass && selectedClass !== '0') params.append('class_id', selectedClass);
      if (loadMore && cursor) params.append('cursor', cursor);
      params.append('limit', '50');

      const response = await fetch(`http://localhost:8080/api/admin/analytics/attendance-report?${params}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data laporan');
      }      const result = await response.json();
      
      // 🔥 DEBUG: Log response untuk debugging
      console.log('API Response:', result);
      console.log('Response Status:', result.status);
      console.log('Response Data:', result.data);
      
      // Handle both "success" dan "succes" (typo)
      if (result.status === 'success' || result.status === 'succes') {
        const responseData: AttendanceReportResponse = result.data;
        
        console.log('Processed Response Data:', responseData);
        console.log('Attendance Items:', responseData.data);
        
        if (reset) {
          setReportData(responseData.data);
        } else {
          setReportData(prev => [...prev, ...responseData.data]);
        }
        
        setCursor(responseData.next_cursor);
        setHasMore(responseData.has_more);
        setTotal(responseData.total);
        
        console.log('State Updated - Total:', responseData.total, 'Items:', responseData.data.length);
      } else {
        setError(result.message || 'Gagal mengambil data laporan');
      }
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setCursor('');
    fetchReportData(true);
    setFilterModalOpen(false);
  };

  const handleLoadMore = () => {
    fetchReportData(false, true);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Build export parameters
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (selectedClass && selectedClass !== '0') params.append('class_id', selectedClass);
      params.append('format', 'csv');

      const response = await fetch(`http://localhost:8080/api/admin/analytics/attendance-report?${params}`, {
        headers: {
          'Authorization': token,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-kehadiran-${startDate}-${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hadir':
        return 'success';
      case 'alpha':
      case 'tidak hadir':
        return 'danger';
      case 'izin':
        return 'warning';
      case 'sakit':
        return 'neutral';
      default:
        return 'neutral';
    }
  };
  const formatDate = (dateString: string) => {
    try {
      // Handle ISO datetime format (2025-06-22T00:00:00Z)
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString; // Fallback to original string
    }
  };
  return (
    <AdminLayout adminUsername={adminUsername}>
      <Box sx={{ p: 3 }}>
        
        {/* Breadcrumb Analytics Navigation */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 'sm', color: 'text.secondary', mb: 2 }}>
            <Typography level="body-sm">Analytics</Typography>
            <Typography level="body-sm">/</Typography>
            <Typography level="body-sm" sx={{ fontWeight: 'md', color: 'primary.600' }}>Attendance Report</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              size="sm" 
              variant="outlined"
              onClick={() => window.location.href = '/admin/analytics/dashboard'}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'background.level1' } }}
            >
              📊 Dashboard
            </Chip>
            <Chip 
              size="sm" 
              variant="solid" 
              color="primary"
            >
              📈 Attendance Report
            </Chip>
            <Chip 
              size="sm" 
              variant="outlined"
              onClick={() => window.location.href = '/admin/analytics/bulk-grade-calculation'}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'background.level1' } }}
            >
              🧮 Bulk Grade Calculation
            </Chip>
          </Box>
        </Card>
        
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableIcon />
            Laporan Kehadiran Detail
          </Typography>
          <Typography level="body-md" color="neutral">
            Laporan kehadiran siswa dengan filter dan pagination
          </Typography>
        </Box>

        {/* Action Bar */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startDecorator={<FilterIcon />}
            onClick={() => setFilterModalOpen(true)}
          >
            Filter Data
          </Button>
          
          <Button
            variant="outlined"
            startDecorator={<RefreshIcon />}
            onClick={() => fetchReportData(true)}
            loading={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            startDecorator={<DownloadIcon />}
            onClick={handleExport}
            disabled={reportData.length === 0}
          >
            Export CSV
          </Button>
        </Box>

        {/* Debug Info - Remove in production */}
        <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography level="body-sm" sx={{ fontFamily: 'monospace' }}>
              Debug Info: 
              reportData.length = {reportData.length}, 
              total = {total}, 
              hasMore = {hasMore.toString()}, 
              loading = {loading.toString()},
              error = {error || 'none'}
            </Typography>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3">{total}</Typography>
                  <Typography level="body-sm" color="neutral">Total Records</Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3">{reportData.length}</Typography>
                  <Typography level="body-sm" color="neutral">Loaded Records</Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3">
                    {startDate && endDate ? formatDate(startDate) : '-'}
                  </Typography>
                  <Typography level="body-sm" color="neutral">Start Date</Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="h3">
                    {startDate && endDate ? formatDate(endDate) : '-'}
                  </Typography>
                  <Typography level="body-sm" color="neutral">End Date</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert color="danger" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Data Table */}
        <Card>
          <CardContent>
            <Sheet sx={{ overflow: 'auto', maxHeight: '600px' }}>
              <Table stickyHeader size="sm">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Nama Siswa</th>
                    <th>Kelas</th>
                    <th>Mata Pelajaran</th>
                    <th>Guru</th>
                    <th>Status</th>
                  </tr>
                </thead>                <tbody>
                  {reportData.map((item, index) => {
                    try {
                      return (
                        <tr key={`${item.student_id}-${item.attendance_date}-${index}`}>
                          <td>{formatDate(item.attendance_date)}</td>
                          <td>{item.student_name}</td>
                          <td>{item.class_name}</td>
                          <td>{item.subject_name}</td>
                          <td>{item.teacher_name}</td>
                          <td>
                            <Chip color={getStatusColor(item.status)} size="sm">
                              {item.status}
                            </Chip>
                          </td>
                        </tr>
                      );
                    } catch (error) {
                      console.error('Error rendering row:', error, item);
                      return null;
                    }
                  })}
                </tbody>
              </Table>
              
              {reportData.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography level="body-md" color="neutral">
                    Tidak ada data kehadiran ditemukan
                  </Typography>
                </Box>
              )}
            </Sheet>
            
            {/* Load More Button */}
            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  loading={loading}
                >
                  Load More Data
                </Button>
              </Box>
            )}
            
            {loading && reportData.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Filter Modal */}
        <Modal open={filterModalOpen} onClose={() => setFilterModalOpen(false)}>
          <ModalDialog sx={{ minWidth: 400 }}>
            <ModalClose />
            <Typography level="h4" sx={{ mb: 3 }}>
              Filter Laporan Kehadiran
            </Typography>
            
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Tanggal Mulai</FormLabel>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Tanggal Akhir</FormLabel>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Kelas</FormLabel>
                  <Select
                    value={selectedClass}
                    onChange={(_, value) => setSelectedClass(value as string)}
                  >
                    <Option value="">Semua Kelas</Option>
                    {kelasOptions.map((kelas) => (
                      <Option key={kelas.kelas_id} value={kelas.kelas_id.toString()}>
                        {kelas.nama_kelas}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="solid"
                onClick={handleFilter}
                sx={{ flexGrow: 1 }}
              >
                Terapkan Filter
              </Button>
              <Button
                variant="outlined"
                onClick={() => setFilterModalOpen(false)}
              >
                Batal
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </Box>
    </AdminLayout>
  );
};

export default AttendanceReport;
