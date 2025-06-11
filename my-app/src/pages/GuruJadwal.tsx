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
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import SidebarGuru from '../components/SidebarGuru';
import { fetchGuruJadwal } from '../services/api/guruApi';
import { 
  fetchTugasGuru, 
  createTugas, 
  updateTugas, 
  deleteTugas,
  type TugasData,
  type CreateTugasRequest 
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

const GuruJadwal: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data states
  const [jadwalList, setJadwalList] = useState<JadwalKelas[]>([]);
  const [tugasList, setTugasList] = useState<TugasData[]>([]);
  const [selectedTugas, setSelectedTugas] = useState<TugasData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    judul_tugas: '',
    deskripsi_tugas: '',
    jadwal_id: 0,
    deadline_pengumpulan: '',
    poin_maksimal: 100,
    tipe_tugas: 'Individu' as 'Individu' | 'Kelompok'
  });

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
        </Box>

        {/* Stats Cards */}
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
        </Box>

        {/* Tasks Table */}
        <Card>
          <CardContent>
            <Typography level="title-md" sx={{ mb: 2 }}>
              Daftar Tugas
            </Typography>
            
            <Sheet sx={{ borderRadius: 'md', overflow: 'auto' }}>
              <Table hoverRow>
                <thead>
                  <tr>
                    <th>Judul Tugas</th>
                    <th>Mata Pelajaran / Kelas</th>
                    <th>Tipe</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Poin</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tugasList.length > 0 ? (
                    tugasList.map((tugas) => (
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
                          <Box>
                            <Typography level="body-sm" fontWeight="md">
                              {tugas.jadwal_pelajaran?.nama_mapel || '-'}
                            </Typography>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                              {tugas.jadwal_pelajaran?.nama_kelas || '-'}
                            </Typography>
                          </Box>
                        </td>
                        <td>
                          <Chip
                            color={tugas.tipe_tugas === 'Kelompok' ? 'primary' : 'neutral'}
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
                              {new Date(tugas.deadline_pengumpulan).toLocaleDateString('id-ID')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography level="body-sm">
                              {new Date(tugas.deadline_pengumpulan).toLocaleTimeString('id-ID', {
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
                              <IconButton size="sm" variant="soft">
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
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                        <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                          Belum ada tugas yang dibuat
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
        </Modal>

        {/* Edit Task Modal */}
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
      </Box>
    </Box>
  );
};

export default GuruJadwal;
