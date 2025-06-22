import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Modal,
  ModalDialog,
  ModalClose,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Stack,
  Select,
  Option
} from '@mui/joy';
import {
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Book as BookIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import {
  fetchTugasSiswa,
  submitTugas,
  deletePengumpulan,
  uploadFile,
  type TugasSiswaData,
  type SubmitTugasRequest
} from '../services/api/tugasSiswaApi';

const TugasSiswa: React.FC = () => {
  const [tugas, setTugas] = useState<TugasSiswaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState<TugasSiswaData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileInput, setFileInput] = useState('');
  const [catatanInput, setCatatanInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [mapelFilter, setKelasFilter] = useState<string>('Semua');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch tugas on component mount
  useEffect(() => {
    loadTugas();
  }, []);

  const loadTugas = async () => {
    try {
      setLoading(true);
      const data = await fetchTugasSiswa();
      setTugas(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat daftar tugas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  const handleSubmitTugas = async () => {
    if (!selectedTugas) return;

    try {
      setSubmitting(true);
        // Jika ada file yang dipilih, upload terlebih dahulu
      let fileUrl = fileInput;
      if (selectedFile) {
        try {
          // Upload file ke server
          console.log('🔍 Frontend - Uploading file:', selectedFile.name);
          const uploadResponse = await uploadFile(selectedFile);
          console.log('🔍 Frontend - Upload response:', uploadResponse);
          
          // Ambil URL dari response
          fileUrl = uploadResponse.url;
          console.log('🔍 Frontend - Final fileUrl:', fileUrl);
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          // Fallback: gunakan nama file sebagai placeholder jika upload gagal
          fileUrl = selectedFile.name;
        }
      }const submitData: SubmitTugasRequest = {
        file_jawaban_siswa: fileUrl,
        catatan_siswa: catatanInput
      };

      console.log('🔍 Frontend - Submitting tugas with data:', submitData);
      console.log('   - fileUrl from upload:', fileUrl);
      console.log('   - selectedFile name:', selectedFile?.name);
      console.log('   - fileInput value:', fileInput);

      await submitTugas(selectedTugas.tugas_id, submitData);
      
      // Reload tugas to get updated data
      await loadTugas();
      
      // Close modal and reset form
      setSubmitModalOpen(false);
      setSelectedTugas(null);
      setFileInput('');
      setCatatanInput('');
      setSelectedFile(null);
      
      setError(null);
    } catch (err) {
      setError('Gagal mengumpulkan tugas');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileInput(file.name);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePengumpulan = async (tugasId: number) => {
    if (!confirm('Yakin ingin menghapus pengumpulan tugas ini?')) return;

    try {
      await deletePengumpulan(tugasId);
      await loadTugas();
      setError(null);
    } catch (err) {
      setError('Gagal menghapus pengumpulan tugas');
      console.error(err);
    }
  };
  const openSubmitModal = (tugasData: TugasSiswaData) => {
    setSelectedTugas(tugasData);
    setFileInput(tugasData.file_jawaban_siswa || '');
    setCatatanInput(tugasData.catatan_siswa || '');
    setSelectedFile(null);
    setSubmitModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Belum Mengerjakan': return 'neutral';
      case 'Mengerjakan': return 'primary';
      case 'Terlambat': return 'warning';
      case 'Dinilai': return 'success';
      default: return 'neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Belum Mengerjakan': return <AssignmentIcon />;
      case 'Mengerjakan': return <EditIcon />;
      case 'Terlambat': return <WarningIcon />;
      case 'Dinilai': return <CheckIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date() > new Date(deadline);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const groupTugasByMapel = (tugasList: TugasSiswaData[]) => {
    const grouped: { [key: string]: TugasSiswaData[] } = {};
    
    tugasList.forEach(tugas => {
      const mapel = "TUGAS KELAS | "  + tugas.jadwal_pelajaran?.kelas.nama_kelas || 'Mata Pelajaran Tidak Diketahui';
      if (!grouped[mapel]) {
        grouped[mapel] = [];
      }
      grouped[mapel].push(tugas);
    });
    
    return grouped;
  };

  // Filter functions
  const getFilteredTugas = () => {
    let filtered = tugas;

    // Filter by status
    if (statusFilter !== 'Semua') {
      filtered = filtered.filter(t => t.status_pengumpulan === statusFilter);
    }

    // Filter by kelas
    if (mapelFilter !== 'Semua') {
      filtered = filtered.filter(t => t.jadwal_pelajaran?.mata_pelajaran?.nama_mapel === mapelFilter);
    }

    return filtered;
  };

  // Get unique status options
  const getStatusOptions = () => {
    const uniqueStatus = [...new Set(tugas.map(t => t.status_pengumpulan))];
    return ['Semua', ...uniqueStatus];
  };
  // Get unique kelas options
  const getKelasOptions = () => {
    const uniqueKelas = [...new Set(tugas.map(t => t.jadwal_pelajaran?.mata_pelajaran?.nama_mapel).filter(Boolean))];
    return ['Semua', ...uniqueKelas];
  };

  // Get statistics for display
  const getStatistics = () => {
    const filtered = getFilteredTugas();
    const total = filtered.length;
    const belumMengerjakan = filtered.filter(t => t.status_pengumpulan === 'Belum Mengerjakan').length;
    const mengerjakan = filtered.filter(t => t.status_pengumpulan === 'Mengerjakan').length;
    const terlambat = filtered.filter(t => t.status_pengumpulan === 'Terlambat').length;
    const dinilai = filtered.filter(t => t.status_pengumpulan === 'Dinilai').length;
    
    return { total, belumMengerjakan, mengerjakan, terlambat, dinilai };
  };if (loading) {
    return (
      <>
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <Box 
          component="main" 
          sx={{ 
            ml: sidebarOpen ? '280px' : '60px',
            transition: 'margin-left 0.3s ease',
            minHeight: '100vh',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Box>
      </>
    );
  }
  const groupedTugas = groupTugasByMapel(getFilteredTugas());

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Box 
        component="main" 
        sx={{ 
          ml: sidebarOpen ? '280px' : '60px',
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          backgroundColor: 'background.body',
          p: 3
        }}
      >
        <Typography level="h2" sx={{ mb: 3 }}>
          📚 Tugas Saya
        </Typography>        {/* Filter Section */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography level="title-md" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filter Tugas
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={3}>
              <FormControl>
                <FormLabel sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Status Pengerjaan</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(_, value) => setStatusFilter(value as string)}
                  size="sm"
                >
                  {getStatusOptions().map((status) => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <FormControl>
                <FormLabel sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Kelas</FormLabel>
                <Select
                  value={mapelFilter}
                  onChange={(_, value) => setKelasFilter(value as string)}
                  size="sm"
                >
                  {getKelasOptions().map((kelas) => (
                    <Option key={kelas} value={kelas}>
                      {kelas}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>            <Grid xs={12} sm={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: '100%', flexWrap: 'wrap' }}>
                <Button
                  variant="soft"
                  color="neutral"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('Semua');
                    setKelasFilter('Semua');
                  }}
                >
                  Reset Filter
                </Button>
                <Chip size="sm" variant="soft" color="primary">
                  {getFilteredTugas().length} tugas ditemukan
                </Chip>
              </Box>
            </Grid>
          </Grid>
          
          {/* Statistics Section */}
          <Divider sx={{ my: 2 }} />
          <Typography level="title-sm" sx={{ mb: 1, fontWeight: 'bold' }}>
            📊 Statistik Status
          </Typography>
          <Grid container spacing={1}>
            {(() => {
              const stats = getStatistics();
              return (
                <>
                  <Grid xs={6} sm={3}>
                    <Chip size="sm" variant="soft" color="neutral" sx={{ width: '100%', justifyContent: 'center' }}>
                      Belum: {stats.belumMengerjakan}
                    </Chip>
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <Chip size="sm" variant="soft" color="primary" sx={{ width: '100%', justifyContent: 'center' }}>
                      Mengerjakan: {stats.mengerjakan}
                    </Chip>
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <Chip size="sm" variant="soft" color="warning" sx={{ width: '100%', justifyContent: 'center' }}>
                      Terlambat: {stats.terlambat}
                    </Chip>
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <Chip size="sm" variant="soft" color="success" sx={{ width: '100%', justifyContent: 'center' }}>
                      Dinilai: {stats.dinilai}
                    </Chip>
                  </Grid>
                </>
              );            })()}
          </Grid>
          
          {/* Quick Filter Buttons */}
          <Divider sx={{ my: 2 }} />
          <Typography level="title-sm" sx={{ mb: 1, fontWeight: 'bold' }}>
            ⚡ Filter Cepat
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant={statusFilter === 'Belum Mengerjakan' ? 'solid' : 'soft'}
              color="neutral"
              onClick={() => setStatusFilter('Belum Mengerjakan')}
            >
              Belum Dikerjakan
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'Mengerjakan' ? 'solid' : 'soft'}
              color="primary"
              onClick={() => setStatusFilter('Mengerjakan')}
            >
              Sedang Dikerjakan
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'Terlambat' ? 'solid' : 'soft'}
              color="warning"
              onClick={() => setStatusFilter('Terlambat')}
            >
              Terlambat
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'Dinilai' ? 'solid' : 'soft'}
              color="success"
              onClick={() => setStatusFilter('Dinilai')}
            >
              Sudah Dinilai
            </Button>
          </Box>
        </Card>

        {error && (
          <Alert color="danger" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {Object.keys(groupedTugas).length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.tertiary', mb: 2 }} />
            <Typography level="h4" color="neutral">
              Tidak ada tugas tersedia
            </Typography>
            <Typography color="neutral">
              Belum ada tugas yang diberikan untuk kelas Anda.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={4}>
            {Object.entries(groupedTugas).map(([mapel, tugasList]) => (
              <Box key={mapel}>
                <Typography level="h3" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookIcon />
                  {mapel}
                  <Chip size="sm" variant="soft">
                    {tugasList.length} tugas
                  </Chip>
                </Typography>
                  <Grid container spacing={3}>
                  {tugasList.map((tugasItem) => (
                    <Grid xs={12} md={6} lg={4} key={tugasItem.tugas_id}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          transition: 'all 0.2s',
                          borderRadius: 'lg',
                          boxShadow: 'sm',
                          '&:hover': {
                            boxShadow: 'lg',
                            transform: 'translateY(-4px)'
                          },
                          ...(isDeadlinePassed(tugasItem.deadline_pengumpulan) && 
                              tugasItem.status_pengumpulan === 'Belum Mengerjakan' && {
                            borderColor: 'warning.400',
                            bgcolor: 'warning.50'
                          }),
                          // Styling berdasarkan status
                          ...(tugasItem.status_pengumpulan === 'Dinilai' && {
                            borderColor: 'success.400',
                            bgcolor: 'success.50'
                          }),
                          ...(tugasItem.status_pengumpulan === 'Mengerjakan' && {
                            borderColor: 'primary.400',
                            bgcolor: 'primary.50'
                          })
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          {/* Header dengan status chip di kanan atas */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography level="h4" sx={{ 
                              flex: 1, 
                              mr: 1,
                              fontWeight: 'bold',
                              color: 'text.primary',
                              fontSize: '1.1rem'
                            }}>
                              {tugasItem.judul_tugas}
                            </Typography>
                            <Chip
                              size="sm"
                              color={getStatusColor(tugasItem.status_pengumpulan)}
                              startDecorator={getStatusIcon(tugasItem.status_pengumpulan)}
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                              }}
                            >
                              {tugasItem.status_pengumpulan}
                            </Chip>
                          </Box>

                          {/* Mata Pelajaran dan Tipe */}
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                              size="sm" 
                              variant="soft" 
                              color="neutral"
                              sx={{ fontSize: '0.7rem' }}
                            >
                              {tugasItem.jadwal_pelajaran?.mata_pelajaran?.nama_mapel || 'Mata Pelajaran Tidak Diketahui'}
                            </Chip>
                            <Chip 
                              size="sm" 
                              variant="soft" 
                              color="primary"
                              sx={{ fontSize: '0.7rem' }}
                            >
                              {tugasItem.tipe_tugas}
                            </Chip>
                          </Box>

                          {/* Deskripsi dengan batas tinggi */}
                          <Typography 
                            level="body-sm" 
                            sx={{ 
                              mb: 2, 
                              color: 'text.secondary',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4,
                              minHeight: '3.5em'
                            }}
                          >
                            {tugasItem.deskripsi_tugas}
                          </Typography>

                          {/* Deadline dengan ikon */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mb: 2,
                            p: 1,
                            bgcolor: isDeadlinePassed(tugasItem.deadline_pengumpulan) ? 'danger.50' : 'neutral.50',
                            borderRadius: 'sm'
                          }}>
                            <TimeIcon sx={{ fontSize: 16, color: isDeadlinePassed(tugasItem.deadline_pengumpulan) ? 'danger.500' : 'neutral.500' }} />
                            <Typography 
                              level="body-sm" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: isDeadlinePassed(tugasItem.deadline_pengumpulan) ? 'danger.600' : 'neutral.700'
                              }}
                            >
                              Deadline: {formatDateTime(tugasItem.deadline_pengumpulan)}
                            </Typography>
                          </Box>

                          {/* Poin Maksimal */}
                          <Box sx={{ 
                            display: 'flex-col', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mb: 3,
                            p: 1,
                            bgcolor: 'primary.50',
                            borderRadius: 'sm'
                          }}>
                            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                              <strong>Poin Maksimal:</strong> {tugasItem.poin_maksimal}
                            </Typography>
                            {tugasItem.status_pengumpulan === 'Dinilai' && (
                              <Typography level="body-sm" color="success" sx={{ fontWeight: 'bold' }}>
                                <strong>Poin Didapat:</strong> {tugasItem.poin_didapat}
                              </Typography>
                            )}
                          </Box>

                          <Divider sx={{ my: 2 }} />                          {/* Actions */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {tugasItem.status_pengumpulan === 'Belum Mengerjakan' && (
                              <Button
                                size="sm"
                                color="primary"
                                startDecorator={<UploadIcon />}
                                onClick={() => openSubmitModal(tugasItem)}
                                sx={{ flex: 1 }}
                              >
                                Kumpulkan
                              </Button>
                            )}

                            {(tugasItem.status_pengumpulan === 'Mengerjakan' || tugasItem.status_pengumpulan === 'Terlambat') && (
                              <>
                                <Button
                                  size="sm"
                                  color="primary"
                                  variant="soft"
                                  startDecorator={<EditIcon />}
                                  onClick={() => openSubmitModal(tugasItem)}
                                  sx={{ flex: 1 }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="soft"
                                  startDecorator={<DeleteIcon />}
                                  onClick={() => handleDeletePengumpulan(tugasItem.tugas_id)}
                                  sx={{ flex: 1 }}
                                >
                                  Hapus
                                </Button>
                              </>
                            )}                            {tugasItem.file_tugas_guru && (
                              <Button
                                size="sm"
                                variant="outlined"
                                color="neutral"
                                startDecorator={<DownloadIcon />}
                                onClick={() => {
                                  // Akses file langsung melalui backend tanpa auth
                                  const fileUrl = `http://localhost:8080${tugasItem.file_tugas_guru}`;
                                  window.open(fileUrl, '_blank');
                                }}
                                sx={{ width: '100%', mt: 1 }}
                              >
                                File Guru
                              </Button>
                            )}
                          </Box>

                          {/* Status Info untuk tugas yang sudah dinilai */}
                          {tugasItem.status_pengumpulan === 'Dinilai' && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.50', borderRadius: 'sm' }}>
                              <Typography level="body-sm" color="success">
                                <strong>Tanggal Pengumpulan:</strong> {tugasItem.tanggal_pengumpulan ? formatDateTime(tugasItem.tanggal_pengumpulan) : '-'}
                              </Typography>
                              {tugasItem.catatan_guru && (
                                <Typography level="body-sm" color="success" sx={{ mt: 1 }}>
                                  <strong>Catatan Guru:</strong> {tugasItem.catatan_guru}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Stack>
        )}        {/* Submit/Edit Modal */}
        <Modal open={submitModalOpen} onClose={() => setSubmitModalOpen(false)}>
            <ModalDialog
              sx={{
                minWidth: 300,
                maxWidth: 700,
                width: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              {selectedTugas?.status_pengumpulan === 'Belum Mengerjakan' ? 'Kumpulkan Tugas' : 'Edit Pengumpulan'}
            </Typography>
            
            {selectedTugas && (
              <Box>
                <Typography level="title-md" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {selectedTugas.judul_tugas}
                </Typography>
                <Typography level="body-sm" color="neutral" sx={{ mb: 3 }}>
                  {selectedTugas.jadwal_pelajaran?.mata_pelajaran?.nama_mapel || 'Mata Pelajaran Tidak Diketahui'} - {selectedTugas.jadwal_pelajaran?.kelas?.nama_kelas || 'Kelas Tidak Diketahui'}
                </Typography>

                <Stack spacing={3}>
                  {/* File Upload Section */}
                  <FormControl>
                    <FormLabel sx={{ fontWeight: 'bold', mb: 1 }}>Upload File Jawaban</FormLabel>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
                      style={{ display: 'none' }}
                    />
                    
                    {/* Custom file upload button */}
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: selectedFile ? 'success.300' : 'neutral.300',
                        borderRadius: 'md',
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: selectedFile ? 'success.50' : 'neutral.50',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.400',
                          bgcolor: 'primary.50'
                        }
                      }}
                      onClick={handleFileButtonClick}
                    >
                      <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.500', mb: 1 }} />
                      <Typography level="body-md" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {selectedFile ? 'File Terpilih' : 'Klik untuk Upload File'}
                      </Typography>
                      <Typography level="body-sm" color="neutral">
                        {selectedFile ? selectedFile.name : 'Format: PDF, DOC, DOCX, JPG, PNG, ZIP (Max 10MB)'}
                      </Typography>
                      {selectedFile && (
                        <Chip
                          size="sm"
                          color="success"
                          sx={{ mt: 1 }}
                          startDecorator={<AttachFileIcon />}
                        >
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Chip>
                      )}
                    </Box>
                    
                    {/* Manual URL input sebagai alternatif */}
                    <Typography level="body-sm" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                      Atau masukkan URL file:
                    </Typography>
                    <Input
                      placeholder="https://drive.google.com/... atau link file lainnya"
                      value={fileInput}
                      onChange={(e) => setFileInput(e.target.value)}
                      startDecorator={<AttachFileIcon />}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel sx={{ fontWeight: 'bold' }}>Catatan Siswa</FormLabel>
                    <Textarea
                      placeholder="Tambahkan catatan, penjelasan, atau komentar untuk tugas ini..."
                      value={catatanInput}
                      onChange={(e) => setCatatanInput(e.target.value)}
                      minRows={4}
                      maxRows={6}
                    />
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      color="primary"
                      onClick={handleSubmitTugas}
                      loading={submitting}
                      startDecorator={<UploadIcon />}
                      sx={{ flex: 1 }}
                      disabled={!selectedFile && !fileInput.trim()}
                    >
                      {selectedTugas.status_pengumpulan === 'Belum Mengerjakan' ? 'Kumpulkan Tugas' : 'Update Pengumpulan'}
                    </Button>
                    <Button
                      variant="soft"
                      color="neutral"
                      onClick={() => setSubmitModalOpen(false)}
                      sx={{ flex: 1 }}
                    >
                      Batal
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}          </ModalDialog>
        </Modal>
      </Box>
    </>
  );
};

export default TugasSiswa;