import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Select,
  Option,
  FormControl,
  FormLabel,
  Table,
  Sheet,
  Chip,
  Alert
} from '@mui/joy';
import {
  Calculate as CalculateIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';

interface StudentGradeDetail {
  student_id: number;
  student_name: string;
  class_name: string;
  total_assignments: number;
  completed_assignments: number;
  total_points: number;
  earned_points: number;
  average_grade: number;
  status: string;
}

interface BulkGradeCalculationResult {
  log_id: number;
  calculated_at: string;
  total_students: number;
  total_assignments: number;
  calculation_summary: string;
  students_processed: StudentGradeDetail[];
}

interface HistoryItem {
  id: number;
  calculated_at: string;
  total_students_processed: number;
  total_assignments_processed: number;
  calculation_summary: string;
  parameters_used: string;
}

const BulkGradeCalculation: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<BulkGradeCalculationResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');

  useEffect(() => {
    // Get admin username
    const username = localStorage.getItem('adminUsername');
    if (username) {
      setAdminUsername(username);
    }

    fetchClasses();
    fetchSubjects();
    fetchHistory();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token admin tidak ditemukan');
        return;
      }

      const response = await fetch('http://localhost:8080/api/admin/kelas', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setClasses(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Gagal mengambil data kelas');
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token admin tidak ditemukan');
        return;
      }

      const response = await fetch('http://localhost:8080/api/admin/mapel', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setSubjects(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Gagal mengambil data mata pelajaran');
    }
  };

  const fetchHistory = async (page: number = 1) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token admin tidak ditemukan');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/analytics/bulk-grade-history?page=${page}&limit=10`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setHistory(data.data?.history || []);
          setTotalPages(data.data?.pagination?.total_pages || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Gagal mengambil riwayat kalkulasi');
    }
  };

  const handleCalculateBulkGrades = async () => {
    if (!selectedClass && !selectedSubject) {
      setError('Pilih minimal kelas atau mata pelajaran');
      return;
    }

    setIsCalculating(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token admin tidak ditemukan');
        return;
      }

      const params = new URLSearchParams();
      
      if (selectedClass) params.append('class_id', selectedClass);
      if (selectedSubject) params.append('subject_id', selectedSubject);

      const response = await fetch(`http://localhost:8080/api/admin/analytics/bulk-grade-calculation?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'succes') {
        setCalculationResult(data.data);
        setSuccess(data.message || 'Bulk grade calculation berhasil dijalankan');
        fetchHistory(); // Refresh history
      } else {
        setError(data.message || 'Terjadi kesalahan saat melakukan bulk grade calculation');
      }
    } catch (error) {
      setError('Terjadi kesalahan koneksi');
      console.error('Error calculating bulk grades:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      'excellent': { color: 'success', label: 'Excellent' },
      'good': { color: 'primary', label: 'Good' },
      'average': { color: 'warning', label: 'Average' },
      'needs_improvement': { color: 'danger', label: 'Needs Improvement' }
    };

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || { color: 'neutral', label: status };
    
    return (
      <Chip size="sm" color={config.color as any}>
        {config.label}
      </Chip>
    );
  };

  return (
    <AdminLayout adminUsername={adminUsername || 'Admin'}>
      <Box sx={{ p: 3 }}>
        
        {/* Breadcrumb Analytics Navigation */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Analytics / <Typography component="span" sx={{ color: 'primary.500', fontWeight: 'md' }}>Bulk Grade Calculation</Typography>
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <Button
                component="a"
                href="/admin/analytics/dashboard"
                size="sm"
                variant="outlined"
                color="neutral"
                startDecorator="📊"
              >
                Dashboard
              </Button>
              <Button
                component="a"
                href="/admin/analytics/attendance-report"
                size="sm"
                variant="outlined"
                color="neutral"
                startDecorator="📈"
              >
                Attendance Report
              </Button>
              <Button
                size="sm"
                variant="solid"
                color="primary"
                startDecorator="🧮"
              >
                Bulk Grade Calculation
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Box>
            <Typography level="h2" sx={{ mb: 1 }}>
              Bulk Grade Calculation
            </Typography>
            <Typography level="body-md" sx={{ color: 'text.secondary' }}>
              Kalkulasi nilai siswa secara bulk menggunakan SQL cursor
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startDecorator={<HistoryIcon />}
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert color="danger" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Calculation Form */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalculateIcon /> Run Bulk Grade Calculation
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid xs={12} md={6}>
                <FormControl>
                  <FormLabel>Kelas (Opsional)</FormLabel>
                  <Select
                    placeholder="Semua Kelas"
                    value={selectedClass}
                    onChange={(_, value) => setSelectedClass(value || '')}
                  >
                    <Option value="">Semua Kelas</Option>
                    {classes.map((kelas) => (
                      <Option key={kelas.kelas_id} value={kelas.kelas_id.toString()}>
                        {kelas.nama_kelas}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} md={6}>
                <FormControl>
                  <FormLabel>Mata Pelajaran (Opsional)</FormLabel>
                  <Select
                    placeholder="Semua Mata Pelajaran"
                    value={selectedSubject}
                    onChange={(_, value) => setSelectedSubject(value || '')}
                  >
                    <Option value="">Semua Mata Pelajaran</Option>
                    {subjects.map((mapel) => (
                      <Option key={mapel.mapel_id} value={mapel.mapel_id.toString()}>
                        {mapel.nama_mapel}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              fullWidth
              size="lg"
              onClick={handleCalculateBulkGrades}
              loading={isCalculating}
              startDecorator={!isCalculating && <CalculateIcon />}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Bulk Grades'}
            </Button>
          </CardContent>
        </Card>

        {/* Calculation Results */}
        {calculationResult && (
          <Box sx={{ mb: 3 }}>
            {/* Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography level="h4" sx={{ mb: 3 }}>
                  📈 Calculation Summary
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography level="h2" color="primary">
                        {calculationResult.total_students}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        👥 Students Processed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography level="h2" color="success">
                        {calculationResult.total_assignments}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        📚 Total Assignments
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography level="h2" color="warning">
                        {calculationResult.log_id}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        📄 Log ID
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography level="h2" color="neutral">
                        {new Date(calculationResult.calculated_at).toLocaleDateString()}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        📅 Calculated At
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Student Details */}
            <Card>
              <CardContent>
                <Typography level="h4" sx={{ mb: 3 }}>
                  Student Grade Details
                </Typography>
                
                <Sheet variant="outlined" sx={{ borderRadius: 'sm', overflow: 'auto' }}>
                  <Table hoverRow>
                    <thead>
                      <tr>
                        <th style={{ width: '200px' }}>Student</th>
                        <th style={{ width: '120px' }}>Mata Pelajaran</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>Assignments</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>Completed</th>
                        <th style={{ width: '140px', textAlign: 'center' }}>Points</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>Average</th>
                        <th style={{ width: '140px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculationResult.students_processed.map((student) => (
                        <tr key={student.student_id}>
                          <td>
                            <Typography level="title-sm">
                              {student.student_name}
                            </Typography>
                          </td>
                          <td>
                            <Typography level="body-sm">
                              {student.class_name}
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Typography level="body-sm">
                              {student.total_assignments}
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Typography level="body-sm">
                              {student.completed_assignments}
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Typography level="body-sm">
                              {student.earned_points}/{student.total_points}
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Typography level="body-sm">
                              {student.average_grade.toFixed(2)}%
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {getStatusChip(student.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Sheet>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* History */}
        {showHistory && (
          <Card>
            <CardContent>
              <Typography level="h4" sx={{ mb: 3 }}>
                📊 Calculation History
              </Typography>
              
              <Sheet variant="outlined" sx={{ borderRadius: 'sm', overflow: 'auto' }}>
                <Table hoverRow>
                  <thead>
                    <tr>
                      <th style={{ width: '180px' }}>Date</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Students</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Assignments</th>
                      <th style={{ width: '200px' }}>Parameters</th>
                      <th>Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Typography level="body-sm">
                            {new Date(item.calculated_at).toLocaleString()}
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Typography level="body-sm">
                            {item.total_students_processed}
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Typography level="body-sm">
                            {item.total_assignments_processed}
                          </Typography>
                        </td>
                        <td>
                          <Typography level="body-sm">
                            {item.parameters_used}
                          </Typography>
                        </td>
                        <td>
                          <Typography level="body-sm">
                            {item.calculation_summary}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Sheet>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
                  <Button
                    size="sm"
                    variant="outlined"
                    disabled={currentPage === 1}
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      fetchHistory(newPage);
                    }}
                  >
                    Previous
                  </Button>
                  <Typography level="body-sm">
                    Page {currentPage} of {totalPages}
                  </Typography>
                  <Button
                    size="sm"
                    variant="outlined"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      fetchHistory(newPage);
                    }}
                  >
                    Next
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </AdminLayout>
  );
};

export default BulkGradeCalculation;
