import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Table,
  Sheet,
  Chip,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Option,
  Modal,
  ModalDialog,
  ModalClose,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/joy';
import { 
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import SidebarGuru from '../components/SidebarGuru';
import { fetchGuruJadwal } from '../services/api/guruApi';
import { 
  fetchTugasGuru, 
  createTugas, 
  updateTugas, 
  deleteTugas,
  fetchPengumpulanByTugas,
  updateStudentPoints,
  type TugasData,
  type CreateTugasRequest,
  type PengumpulanTugas 
} from '../services/api/tugasApi';

// Types
interface JadwalKelas {
  jadwal_id: number;
  nama_mapel: string;
  nama_kelas: string;
  hari: string;
  waktu_mulai: string;
  waktu_selesai: string;
  ruang: string;
}

const GuruJadwal: React.FC = () => {  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditPointsModal, setShowEditPointsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Data states
  const [jadwalList, setJadwalList] = useState<JadwalKelas[]>([]);
  const [tugasList, setTugasList] = useState<TugasData[]>([]);
  const [selectedTugas, setSelectedTugas] = useState<TugasData | null>(null);
  const [pengumpulanList, setPengumpulanList] = useState<PengumpulanTugas[]>([]);
  const [selectedPengumpulan, setSelectedPengumpulan] = useState<PengumpulanTugas | null>(null);  // Form state
  const [formData, setFormData] = useState({
    judul_tugas: '',
    deskripsi_tugas: '',
    jadwal_id: 0,
    deadline_pengumpulan: '',
    poin_maksimal: 100,
    tipe_tugas: 'Individu' as 'Individu' | 'Kelompok'
  });

  // Points editing form state
  const [pointsFormData, setPointsFormData] = useState({
    poin_didapat: 0,
    catatan_guru: ''
  });
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    kelas: '',
    status: '',
    tipe_tugas: '',
    mata_pelajaran: ''
  });

  // Sorting states
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Load data when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load jadwal guru
      const jadwalResponse = await fetchGuruJadwal();
      if (jadwalResponse?.data) {
        setJadwalList(jadwalResponse.data);
      }

      // Load tugas guru
      const tugasResponse = await fetchTugasGuru();
      if (tugasResponse?.data) {
        setTugasList(tugasResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateTugas = async () => {
    if (!formData.judul_tugas || !formData.deskripsi_tugas || !formData.jadwal_id || 
        !formData.deadline_pengumpulan) {
      setError('Harap lengkapi semua field yang wajib diisi!');
      return;
    }

    try {
      setLoading(true);
      
      const tugasData: CreateTugasRequest = {
        jadwal_id: formData.jadwal_id,
        judul_tugas: formData.judul_tugas,
        deskripsi_tugas: formData.deskripsi_tugas,
        deadline_pengumpulan: formData.deadline_pengumpulan,
        poin_maksimal: formData.poin_maksimal,
        tipe_tugas: formData.tipe_tugas
      };

      await createTugas(tugasData);
      setSuccess('Tugas berhasil dibuat!');
      
      // Reset form
      setFormData({
        judul_tugas: '',
        deskripsi_tugas: '',
        jadwal_id: 0,
        deadline_pengumpulan: '',
        poin_maksimal: 100,
        tipe_tugas: 'Individu'
      });
      
      setShowCreateModal(false);
      
      // Reload data
      await loadInitialData();
      
    } catch (error) {
      console.error('Error creating tugas:', error);
      setError('Gagal membuat tugas. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTugas = (tugas: TugasData) => {
    setSelectedTugas(tugas);
    setFormData({
      judul_tugas: tugas.judul_tugas,
      deskripsi_tugas: tugas.deskripsi_tugas,
      jadwal_id: tugas.jadwal_id,
      deadline_pengumpulan: tugas.deadline_pengumpulan.slice(0, 16), // Format untuk datetime-local
      poin_maksimal: tugas.poin_maksimal,
      tipe_tugas: tugas.tipe_tugas
    });
    setShowEditModal(true);
  };

  const handleUpdateTugas = async () => {
    if (!selectedTugas) return;

    try {
      setLoading(true);
      
      await updateTugas(selectedTugas.tugas_id, {
        judul_tugas: formData.judul_tugas,
        deskripsi_tugas: formData.deskripsi_tugas,
        deadline_pengumpulan: formData.deadline_pengumpulan,
        poin_maksimal: formData.poin_maksimal,
        tipe_tugas: formData.tipe_tugas
      });
      
      setSuccess('Tugas berhasil diperbarui!');
      setShowEditModal(false);
      setSelectedTugas(null);
      
      // Reload data
      await loadInitialData();
      
    } catch (error) {
      console.error('Error updating tugas:', error);
      setError('Gagal memperbarui tugas. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteTugas = async (tugasId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

    try {
      setLoading(true);
      await deleteTugas(tugasId);
      setSuccess('Tugas berhasil dihapus!');
      
      // Reload data
      await loadInitialData();
      
    } catch (error) {
      console.error('Error deleting tugas:', error);
      setError('Gagal menghapus tugas. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (tugas: TugasData) => {
    try {
      setLoading(true);
      setSelectedTugas(tugas);
      
      // Fetch pengumpulan tugas
      const response = await fetchPengumpulanByTugas(tugas.tugas_id);
      setPengumpulanList(response.data || []);
      
      setShowDetailModal(true);
      
    } catch (error) {
      console.error('Error fetching tugas detail:', error);
      setError('Gagal memuat detail tugas. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (deadline: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return 'danger'; // Sudah lewat
    if (diffDays <= 3) return 'warning'; // 3 hari atau kurang
    return 'success'; // Masih lama
  };

  const getStatusText = (deadline: string): string => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return 'Sudah Lewat';
    if (diffDays === 0) return 'Hari Ini';
    if (diffDays === 1) return 'Besok';
    if (diffDays <= 7) return `${diffDays} Hari Lagi`;
    return 'Aktif';
  };
  const resetForm = () => {
    setFormData({
      judul_tugas: '',
      deskripsi_tugas: '',
      jadwal_id: 0,
      deadline_pengumpulan: '',
      poin_maksimal: 100,
      tipe_tugas: 'Individu'
    });
  };

  // Filter functions
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      kelas: '',
      status: '',
      tipe_tugas: '',
      mata_pelajaran: ''
    });
  };
  const getFilteredTugas = () => {
    let filtered = tugasList.filter(tugas => {
      // Search filter
      const searchMatch = !filters.search || 
        tugas.judul_tugas.toLowerCase().includes(filters.search.toLowerCase()) ||
        tugas.deskripsi_tugas.toLowerCase().includes(filters.search.toLowerCase());

      // Kelas filter
      const kelasMatch = !filters.kelas || 
        tugas.jadwal_pelajaran?.kelas.nama_kelas === filters.kelas;

      // Mata pelajaran filter
      const mapelMatch = !filters.mata_pelajaran || 
        tugas.jadwal_pelajaran?.mata_pelajaran.nama_mapel === filters.mata_pelajaran;

      // Tipe tugas filter
      const tipeMatch = !filters.tipe_tugas || 
        tugas.tipe_tugas === filters.tipe_tugas;

      // Status filter
      const statusMatch = !filters.status || (() => {
        const deadline = new Date(tugas.deadline_pengumpulan);
        const now = new Date();
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        switch (filters.status) {
          case 'active':
            return diffDays > 3;
          case 'soon':
            return diffDays >= 0 && diffDays <= 3;
          case 'expired':
            return diffDays < 0;
          case 'today':
            return diffDays === 0;
          default:
            return true;
        }
      })();

      return searchMatch && kelasMatch && mapelMatch && tipeMatch && statusMatch;
    });

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'judul_tugas':
            aValue = a.judul_tugas.toLowerCase();
            bValue = b.judul_tugas.toLowerCase();
            break;
          case 'kelas':
            aValue = a.jadwal_pelajaran?.kelas.nama_kelas || '';
            bValue = b.jadwal_pelajaran?.kelas.nama_kelas || '';
            break;
          case 'mata_pelajaran':
            aValue = a.jadwal_pelajaran?.mata_pelajaran.nama_mapel || '';
            bValue = b.jadwal_pelajaran?.mata_pelajaran.nama_mapel || '';
            break;
          case 'deadline':
            aValue = new Date(a.deadline_pengumpulan).getTime();
            bValue = new Date(b.deadline_pengumpulan).getTime();
            break;
          case 'poin_maksimal':
            aValue = a.poin_maksimal;
            bValue = b.poin_maksimal;
            break;
          case 'tipe_tugas':
            aValue = a.tipe_tugas;
            bValue = b.tipe_tugas;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  // Sorting function
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle edit points
  const handleEditPoints = (pengumpulan: PengumpulanTugas) => {
    setSelectedPengumpulan(pengumpulan);
    setPointsFormData({
      poin_didapat: pengumpulan.poin_didapat || 0,
      catatan_guru: pengumpulan.catatan_guru || ''
    });
    setShowEditPointsModal(true);
  };
  // Handle update points
  const handleUpdatePoints = async () => {
    if (!selectedPengumpulan || !selectedPengumpulan.pengumpulan_id) return;

    try {
      setLoading(true);

      await updateStudentPoints(
        selectedPengumpulan.pengumpulan_id, 
        pointsFormData.poin_didapat,
        pointsFormData.catatan_guru
      );

      setSuccess('Poin siswa berhasil diperbarui!');
      setShowEditPointsModal(false);
      setSelectedPengumpulan(null);
      
      // Reload pengumpulan data
      if (selectedTugas) {
        const response = await fetchPengumpulanByTugas(selectedTugas.tugas_id);
        setPengumpulanList(response.data || []);
      }
      
    } catch (error) {
      console.error('Error updating points:', error);
      setError('Gagal memperbarui poin. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Handle points form input change
  const handlePointsFormChange = (field: string, value: string | number) => {
    setPointsFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get unique values for filter options
  const getUniqueClasses = () => {
    const classes = tugasList
      .map(tugas => tugas.jadwal_pelajaran?.kelas?.nama_kelas)
      .filter((kelas, index, arr) => kelas && arr.indexOf(kelas) === index);
    return classes;
  };

  const getUniqueMapel = () => {
    const mapel = tugasList
      .map(tugas => tugas.jadwal_pelajaran?.mata_pelajaran?.nama_mapel)
      .filter((mapel, index, arr) => mapel && arr.indexOf(mapel) === index);
    return mapel;
  };
  const filteredTugas = getFilteredTugas();

  if (loading && tugasList.length === 0) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SidebarGuru open={sidebarOpen} onToggle={setSidebarOpen} />
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ml: sidebarOpen ? '280px' : '70px',
          transition: 'margin 0.3s ease'
        }}>
          <CircularProgress size="lg" />
        </Box>
      </Box>
    );
  }

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
        {/* Alerts */}
        {error && (
          <Alert color="danger" sx={{ mb: 3 }} endDecorator={
            <Button size="sm" variant="plain" color="danger" onClick={() => setError(null)}>
              Tutup
            </Button>
          }>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert color="success" sx={{ mb: 3 }} endDecorator={
            <Button size="sm" variant="plain" color="success" onClick={() => setSuccess(null)}>
              Tutup
            </Button>
          }>
            {success}
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography level="h2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssignmentIcon sx={{ fontSize: 32, color: 'primary.600' }} />
              Manajemen Tugas
            </Typography>
            <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
              Buat dan kelola tugas untuk siswa Anda
            </Typography>
          </Box>
          <Button
            startDecorator={<AddIcon />}
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            size="lg"
            variant="solid"
            disabled={jadwalList.length === 0}
          >
            Buat Tugas Baru
          </Button>
        </Box>        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Card variant="soft" color="primary">
            <CardContent>
              <Typography level="body-sm" sx={{ color: 'primary.600' }}>Total Tugas</Typography>
              <Typography level="h3">{tugasList.length}</Typography>
            </CardContent>
          </Card>
          <Card variant="soft" color="success">
            <CardContent>
              <Typography level="body-sm" sx={{ color: 'success.600' }}>Tugas Aktif</Typography>
              <Typography level="h3">
                {tugasList.filter(t => new Date(t.deadline_pengumpulan) > new Date()).length}
              </Typography>
            </CardContent>
          </Card>
          <Card variant="soft" color="warning">
            <CardContent>
              <Typography level="body-sm" sx={{ color: 'warning.600' }}>Segera Berakhir</Typography>
              <Typography level="h3">
                {tugasList.filter(t => {
                  const diffDays = Math.ceil((new Date(t.deadline_pengumpulan).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  return diffDays >= 0 && diffDays <= 3;
                }).length}
              </Typography>
            </CardContent>
          </Card>
          <Card variant="soft" color="neutral">
            <CardContent>
              <Typography level="body-sm" sx={{ color: 'neutral.600' }}>Hasil Filter</Typography>
              <Typography level="h3">{filteredTugas.length}</Typography>
            </CardContent>
          </Card>
        </Box>        {/* Tasks Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography level="title-md">
                Daftar Tugas ({filteredTugas.length} dari {tugasList.length})
              </Typography>
              <Button
                variant="outlined"
                size="sm"
                onClick={resetFilters}
                disabled={Object.values(filters).every(f => !f)}
              >
                Reset Filter
              </Button>
            </Box>            {/* Filter Controls */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 2, 
              mb: 3,
              p: 2,
              bgcolor: 'background.level1',
              borderRadius: 'md'
            }}>
              <FormControl size="sm">
                <FormLabel>Cari Tugas</FormLabel>
                <Input
                  placeholder="Cari judul atau deskripsi..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </FormControl>              <FormControl size="sm">
                <FormLabel>Kelas</FormLabel>
                <Select
                  placeholder="Semua Kelas"
                  value={filters.kelas}
                  onChange={(_, value) => handleFilterChange('kelas', value || '')}
                >
                  <Option value="">Semua Kelas ({tugasList.length})</Option>
                  {getUniqueClasses().map((kelas) => {
                    const count = tugasList.filter(t => t.jadwal_pelajaran?.kelas.nama_kelas === kelas).length;
                    return (
                      <Option key={kelas} value={kelas}>
                        {kelas} ({count})
                      </Option>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl size="sm">
                <FormLabel>Mata Pelajaran</FormLabel>
                <Select
                  placeholder="Semua Mapel"
                  value={filters.mata_pelajaran}
                  onChange={(_, value) => handleFilterChange('mata_pelajaran', value || '')}
                >
                  <Option value="">Semua Mapel ({tugasList.length})</Option>
                  {getUniqueMapel().map((mapel) => {
                    const count = tugasList.filter(t => t.jadwal_pelajaran?.mata_pelajaran.nama_mapel === mapel).length;
                    return (
                      <Option key={mapel} value={mapel}>
                        {mapel} ({count})
                      </Option>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl size="sm">
                <FormLabel>Tipe Tugas</FormLabel>
                <Select
                  placeholder="Semua Tipe"
                  value={filters.tipe_tugas}
                  onChange={(_, value) => handleFilterChange('tipe_tugas', value || '')}
                >
                  <Option value="">Semua Tipe ({tugasList.length})</Option>
                  <Option value="Individu">
                    Individu ({tugasList.filter(t => t.tipe_tugas === 'Individu').length})
                  </Option>
                  <Option value="Kelompok">
                    Kelompok ({tugasList.filter(t => t.tipe_tugas === 'Kelompok').length})
                  </Option>
                </Select>
              </FormControl>

              <FormControl size="sm">
                <FormLabel>Status Deadline</FormLabel>
                <Select
                  placeholder="Semua Status"
                  value={filters.status}
                  onChange={(_, value) => handleFilterChange('status', value || '')}
                >
                  <Option value="">Semua Status ({tugasList.length})</Option>
                  <Option value="active">
                    Aktif (&gt;3 hari) ({tugasList.filter(t => {
                      const diffDays = Math.ceil((new Date(t.deadline_pengumpulan).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                      return diffDays > 3;
                    }).length})
                  </Option>
                  <Option value="soon">
                    Segera Berakhir (&le;3 hari) ({tugasList.filter(t => {
                      const diffDays = Math.ceil((new Date(t.deadline_pengumpulan).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                      return diffDays >= 0 && diffDays <= 3;
                    }).length})
                  </Option>
                  <Option value="today">
                    Hari Ini ({tugasList.filter(t => {
                      const diffDays = Math.ceil((new Date(t.deadline_pengumpulan).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                      return diffDays === 0;
                    }).length})
                  </Option>
                  <Option value="expired">
                    Sudah Lewat ({tugasList.filter(t => {
                      const diffDays = Math.ceil((new Date(t.deadline_pengumpulan).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                      return diffDays < 0;
                    }).length})
                  </Option>
                </Select>
              </FormControl>
            </Box>

            {/* Quick Filter Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                variant={filters.status === 'today' ? 'solid' : 'outlined'}
                color="warning"
                size="sm"
                onClick={() => handleFilterChange('status', filters.status === 'today' ? '' : 'today')}
                sx={{ cursor: 'pointer' }}
              >
                Deadline Hari Ini
              </Chip>
              <Chip
                variant={filters.status === 'soon' ? 'solid' : 'outlined'}
                color="danger"
                size="sm"
                onClick={() => handleFilterChange('status', filters.status === 'soon' ? '' : 'soon')}
                sx={{ cursor: 'pointer' }}
              >
                Segera Berakhir
              </Chip>
              <Chip
                variant={filters.tipe_tugas === 'Kelompok' ? 'solid' : 'outlined'}
                color="success"
                size="sm"
                onClick={() => handleFilterChange('tipe_tugas', filters.tipe_tugas === 'Kelompok' ? '' : 'Kelompok')}
                sx={{ cursor: 'pointer' }}
              >
                Tugas Kelompok
              </Chip>
              <Chip
                variant={filters.status === 'expired' ? 'solid' : 'outlined'}
                color="neutral"
                size="sm"
                onClick={() => handleFilterChange('status', filters.status === 'expired' ? '' : 'expired')}
                sx={{ cursor: 'pointer' }}
              >
                Sudah Lewat
              </Chip>
            </Box>
              <Sheet sx={{ borderRadius: 'md', overflow: 'auto' }}>
              <Table hoverRow>
                <thead>
                  <tr>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('judul_tugas')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Judul Tugas
                        {sortConfig?.key === 'judul_tugas' && (
                          sortConfig.direction === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                        )}
                      </Box>
                    </th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('kelas')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Kelas
                        {sortConfig?.key === 'kelas' && (
                          sortConfig.direction === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                        )}
                      </Box>
                    </th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('mata_pelajaran')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Mata Pelajaran
                        {sortConfig?.key === 'mata_pelajaran' && (
                          sortConfig.direction === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                        )}
                      </Box>
                    </th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('tipe_tugas')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Tipe
                        {sortConfig?.key === 'tipe_tugas' && (
                          sortConfig.direction === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                        )}
                      </Box>
                    </th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('deadline')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Deadline
                        {sortConfig?.key === 'deadline' && (
                          sortConfig.direction === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                        )}
                      </Box>
                    </th>
                    <th>Status</th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('poin_maksimal')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Poin
                        {sortConfig?.key === 'poin_maksimal' && (
                          sortConfig.direction === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                        )}
                      </Box>
                    </th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTugas.length > 0 ? (
                    filteredTugas.map((tugas) => (
                      <tr key={tugas.tugas_id}>
                        <td>
                          <Box>
                            <Typography level="body-md" fontWeight="md">
                              {tugas.judul_tugas}
                            </Typography>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                              {tugas.deskripsi_tugas.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </td>
                        <td>
                          <Chip
                            color="primary"
                            size="sm"
                            variant="soft"
                          >
                            {tugas.jadwal_pelajaran?.kelas.nama_kelas || '-'}
                          </Chip>
                        </td>
                        <td>
                          <Typography level="body-sm" fontWeight="md">
                            {tugas.jadwal_pelajaran?.mata_pelajaran.nama_mapel || '-'}
                          </Typography>
                        </td>
                        <td>
                          <Chip
                            color={tugas.tipe_tugas === 'Kelompok' ? 'success' : 'neutral'}
                            size="sm"
                            variant="soft"
                          >
                            {tugas.tipe_tugas}
                          </Chip>
                        </td>
                        <td>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography level="body-sm">
                              {new Date(tugas.deadline_pengumpulan).toLocaleDateString('id-ID', {
                                timeZone: 'UTC',
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography level="body-sm">
                              {new Date(tugas.deadline_pengumpulan).toLocaleTimeString('id-ID', {
                                timeZone: 'UTC',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        </td>
                        <td>
                          <Chip
                            color={getStatusColor(tugas.deadline_pengumpulan) as any}
                            size="sm"
                            variant="soft"
                          >
                            {getStatusText(tugas.deadline_pengumpulan)}
                          </Chip>
                        </td>
                        <td>
                          <Typography level="body-sm" fontWeight="md">
                            {tugas.poin_maksimal} poin
                          </Typography>
                        </td>
                        <td>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Lihat Detail">
                              <IconButton 
                                size="sm" 
                                variant="soft"
                                onClick={() => handleViewDetail(tugas)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton 
                                size="sm" 
                                variant="soft" 
                                color="warning"
                                onClick={() => handleEditTugas(tugas)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hapus">
                              <IconButton 
                                size="sm" 
                                variant="soft" 
                                color="danger"
                                onClick={() => handleDeleteTugas(tugas.tugas_id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                        <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                          {tugasList.length === 0 
                            ? 'Belum ada tugas yang dibuat' 
                            : 'Tidak ada tugas yang sesuai dengan filter'
                          }
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Sheet>
          </CardContent>
        </Card>

        {/* Create Task Modal */}
        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <ModalDialog sx={{ maxWidth: '600px', width: '90vw' }}>
            <ModalClose />
            <Typography level="h4" component="h2" sx={{ mb: 2 }}>
              Buat Tugas Baru
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl>
                <FormLabel>Judul Tugas</FormLabel>
                <Input
                  placeholder="Masukkan judul tugas"
                  value={formData.judul_tugas}
                  onChange={(e) => handleInputChange('judul_tugas', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Deskripsi</FormLabel>
                <Textarea
                  placeholder="Masukkan deskripsi tugas..."
                  minRows={3}
                  value={formData.deskripsi_tugas}
                  onChange={(e) => handleInputChange('deskripsi_tugas', e.target.value)}
                />
              </FormControl>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>                <FormControl>
                  <FormLabel>Mata Pelajaran / Kelas</FormLabel>
                  <Select
                    placeholder="Pilih jadwal"
                    value={formData.jadwal_id ? formData.jadwal_id.toString() : ''}
                    onChange={(_, value) => handleInputChange('jadwal_id', value ? parseInt(value) : 0)}
                  >
                    {jadwalList.map((jadwal) => (
                      <Option key={jadwal.jadwal_id} value={jadwal.jadwal_id.toString()}>
                        {jadwal.nama_mapel} - {jadwal.nama_kelas}
                      </Option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Tipe Tugas</FormLabel>
                  <Select
                    value={formData.tipe_tugas}
                    onChange={(_, value) => handleInputChange('tipe_tugas', value || 'Individu')}
                  >
                    <Option value="Individu">Individu</Option>
                    <Option value="Kelompok">Kelompok</Option>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormControl>
                  <FormLabel>Deadline</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.deadline_pengumpulan}
                    onChange={(e) => handleInputChange('deadline_pengumpulan', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Poin Maksimal</FormLabel>
                  <Input
                    type="number"
                    value={formData.poin_maksimal}
                    onChange={(e) => handleInputChange('poin_maksimal', Number(e.target.value))}
                    slotProps={{
                      input: {
                        min: 1,
                        max: 1000
                      }
                    }}
                  />
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleCreateTugas}
                  loading={loading}
                  variant="solid"
                >
                  Buat Tugas
                </Button>
              </Box>
            </Box>
          </ModalDialog>
        </Modal>        {/* Edit Task Modal */}
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
          <ModalDialog sx={{ maxWidth: '600px', width: '90vw' }}>
            <ModalClose />
            <Typography level="h4" component="h2" sx={{ mb: 2 }}>
              Edit Tugas
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl>
                <FormLabel>Judul Tugas</FormLabel>
                <Input
                  placeholder="Masukkan judul tugas"
                  value={formData.judul_tugas}
                  onChange={(e) => handleInputChange('judul_tugas', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Deskripsi</FormLabel>
                <Textarea
                  placeholder="Masukkan deskripsi tugas..."
                  minRows={3}
                  value={formData.deskripsi_tugas}
                  onChange={(e) => handleInputChange('deskripsi_tugas', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tipe Tugas</FormLabel>
                <Select
                  value={formData.tipe_tugas}
                  onChange={(_, value) => handleInputChange('tipe_tugas', value || 'Individu')}
                >
                  <Option value="Individu">Individu</Option>
                  <Option value="Kelompok">Kelompok</Option>
                </Select>
              </FormControl>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormControl>
                  <FormLabel>Deadline</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.deadline_pengumpulan}
                    onChange={(e) => handleInputChange('deadline_pengumpulan', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Poin Maksimal</FormLabel>
                  <Input
                    type="number"
                    value={formData.poin_maksimal}
                    onChange={(e) => handleInputChange('poin_maksimal', Number(e.target.value))}
                    slotProps={{
                      input: {
                        min: 1,
                        max: 1000
                      }
                    }}
                  />
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleUpdateTugas}
                  loading={loading}
                  variant="solid"
                >
                  Simpan Perubahan
                </Button>
              </Box>
            </Box>
          </ModalDialog>
        </Modal>

        {/* Detail Task Modal with Submissions */}
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)}>
          <ModalDialog sx={{ maxWidth: '900px', width: '90vw', maxHeight: '80vh' }}>
            <ModalClose />
            <Typography level="h4" component="h2" sx={{ mb: 2 }}>
              Detail Tugas & Pengumpulan
            </Typography>
            
            {selectedTugas && (
              <Box>
                {/* Task Info */}
                <Card variant="soft" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography level="title-lg" sx={{ mb: 1 }}>
                      {selectedTugas.judul_tugas}
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 2, color: 'text.secondary' }}>
                      {selectedTugas.deskripsi_tugas}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip size="sm" variant="soft" color="primary">
                        {selectedTugas.jadwal_pelajaran?.mata_pelajaran.nama_mapel} - {selectedTugas.jadwal_pelajaran?.kelas.nama_kelas}
                      </Chip>
                      <Chip size="sm" variant="soft" color="neutral">
                        {selectedTugas.tipe_tugas}
                      </Chip>
                      <Chip size="sm" variant="soft" color="warning">
                        Deadline: {new Date(selectedTugas.deadline_pengumpulan).toLocaleDateString('id-ID')}
                      </Chip>
                      <Chip size="sm" variant="soft" color="success">
                        Poin Maksimal: {selectedTugas.poin_maksimal}
                      </Chip>
                    </Box>
                  </CardContent>
                </Card>                {/* Submissions List */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography level="title-md">
                    👥 Daftar Siswa & Status Pengumpulan ({pengumpulanList.length} siswa)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip size="sm" variant="soft" color="success">
                      Sudah mengumpulkan: {pengumpulanList.filter(p => p.has_submitted).length}
                    </Chip>
                    <Chip size="sm" variant="soft" color="neutral">
                      Belum mengumpulkan: {pengumpulanList.filter(p => !p.has_submitted).length}
                    </Chip>
                    <Chip size="sm" variant="soft" color="primary">
                      Dinilai: {pengumpulanList.filter(p => p.status_pengumpulan === 'Dinilai').length}
                    </Chip>
                  </Box>
                </Box>
                  {pengumpulanList.length === 0 ? (
                  <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Typography level="body-md" color="neutral">
                      Tidak ada siswa di kelas ini
                    </Typography>
                  </Card>
                ) : (
                  <Sheet sx={{ maxHeight: '400px', overflow: 'auto', borderRadius: 'md' }}>
                    <Table hoverRow>
                      <thead>
                        <tr>
                          <th>NIS</th>
                          <th>Nama Siswa</th>
                          <th>Status</th>
                          <th>Tanggal Pengumpulan</th>
                          <th>Poin</th>
                          <th>File & Aksi</th>
                        </tr>
                      </thead>                      <tbody>
                        {pengumpulanList.map((siswa) => (
                          <tr key={siswa.siswa_id}>
                            <td>
                              <Typography level="body-sm" fontWeight="md">
                                {siswa.nis}
                              </Typography>
                            </td>
                            <td>
                              <Box>
                                <Typography level="body-md" fontWeight="md">
                                  {siswa.nama_lengkap}
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                  {siswa.email}
                                </Typography>
                              </Box>
                            </td>
                            <td>
                              <Chip
                                size="sm"
                                color={
                                  siswa.status_pengumpulan === 'Dinilai' ? 'success' :
                                  siswa.status_pengumpulan === 'Mengerjakan' ? 'primary' :
                                  siswa.status_pengumpulan === 'Terlambat' ? 'warning' : 'neutral'
                                }
                                variant="soft"
                              >
                                {siswa.status_pengumpulan}
                              </Chip>
                            </td>
                            <td>
                              {siswa.has_submitted && siswa.tanggal_pengumpulan ? (
                                <Typography level="body-sm">
                                  {new Date(siswa.tanggal_pengumpulan).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              ) : (
                                <Typography level="body-sm" color="neutral">
                                  Belum mengumpulkan
                                </Typography>
                              )}
                            </td>                            <td>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography level="body-sm" fontWeight="md">
                                  {siswa.poin_didapat || 0} / {selectedTugas.poin_maksimal}
                                </Typography>
                                {siswa.has_submitted && (
                                  <Button
                                    size="sm"
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleEditPoints(siswa)}
                                    sx={{ minWidth: 'auto', px: 1 }}
                                  >
                                    ✏️
                                  </Button>
                                )}
                              </Box>
                            </td>
                            <td>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {siswa.has_submitted && siswa.file_jawaban_siswa && (
                                  <Button
                                    size="sm"
                                    variant="outlined"
                                    onClick={() => window.open(siswa.file_jawaban_siswa, '_blank')}
                                  >
                                    Lihat File
                                  </Button>
                                )}
                                {siswa.has_submitted && siswa.catatan_siswa && (
                                  <Tooltip title={siswa.catatan_siswa}>
                                    <Button
                                      size="sm"
                                      variant="soft"
                                      color="neutral"
                                    >
                                      💬
                                    </Button>
                                  </Tooltip>
                                )}
                                {!siswa.has_submitted && (
                                  <Typography level="body-sm" color="neutral" sx={{ fontStyle: 'italic' }}>
                                    Belum ada file
                                  </Typography>
                                )}
                              </Box>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Sheet>
                )}
              </Box>
            )}
          </ModalDialog>
        </Modal>

        {/* Edit Points Modal */}
        <Modal open={showEditPointsModal} onClose={() => setShowEditPointsModal(false)}>
          <ModalDialog sx={{ maxWidth: '500px', width: '90vw' }}>
            <ModalClose />
            <Typography level="h4" component="h2" sx={{ mb: 2 }}>
              Edit Poin Siswa
            </Typography>
            
            {selectedPengumpulan && (
              <Box>
                {/* Student Info */}
                <Card variant="soft" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography level="title-md" sx={{ mb: 1 }}>
                      {selectedPengumpulan.nama_lengkap}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      NIS: {selectedPengumpulan.nis} • Email: {selectedPengumpulan.email}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Points Form */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl>
                    <FormLabel>Poin Didapat (Maksimal: {selectedTugas?.poin_maksimal})</FormLabel>
                    <Input
                      type="number"
                      value={pointsFormData.poin_didapat?.toString() ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string so user can clear the input
                        if (value === "") {
                          handlePointsFormChange('poin_didapat', value);
                        } else if (/^\d+$/.test(value)) {
                          const numericValue = Number(value);
                          const max = selectedTugas?.poin_maksimal ?? 100;
                          if (numericValue <= max) {
                            handlePointsFormChange('poin_didapat', numericValue);
                          }
                        }
                      }}
                      slotProps={{
                        input: {
                          min: 0,
                          max: selectedTugas?.poin_maksimal ?? 100
                        }
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Catatan Guru (Opsional)</FormLabel>
                    <Textarea
                      placeholder="Berikan feedback kepada siswa..."
                      minRows={3}
                      value={pointsFormData.catatan_guru}
                      onChange={(e) => handlePointsFormChange('catatan_guru', e.target.value)}
                    />
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowEditPointsModal(false)}
                      disabled={loading}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleUpdatePoints}
                      loading={loading}
                      variant="solid"
                    >
                      Simpan Poin
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </ModalDialog>
        </Modal>
      </Box>
    </Box>
  );
};

export default GuruJadwal;
