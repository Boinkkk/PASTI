import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, Table, Sheet, Chip,
  Modal, ModalDialog, ModalClose, Input, Textarea, CircularProgress,
  IconButton, Tooltip, Select, Option, Tabs, TabList, Tab, TabPanel, 
  Grid, FormControl, FormLabel, Alert, Breadcrumbs, Link,
  Switch
} from '@mui/joy';
import {
  People as PeopleIcon, Add as AddIcon, Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon, Check as CheckIcon, 
  Close as CloseIcon, Search as SearchIcon, FilterList as FilterIcon,
  Home as HomeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import SidebarGuru from '../components/SidebarGuru';
import { 
  fetchAbsensiPertemuanSiswa, 
  fetchDetailAbsensi, 
  fetchGuruJadwal, 
  updateStatusPertemuan,
  updateAbsensiStatus as updateAbsensiStatusAPI,
  createManualAbsensi as createManualAbsensiAPI,
  updatePertemuan
} from '../services/api/guruApi';
import axios from 'axios';

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

interface PertemuanData {
  id_pertemuan: number;
  pertemuan_ke: number;
  materi: string;
  tanggal: string;
  token_absen: string;
  is_active: boolean;
  waktu_mulai_absen: string;
  waktu_selesai_absen: string;
  total_hadir: number;
  total_siswa: number;
}

interface AbsensiSiswa {
  absensi_id: number | null;
  siswa_id: number;
  no_telepon?: string;
  nis: string;
  nama_lengkap: string;
  waktu_absen: string | null;
  status_kehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | null;
}

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const STATUS_KEHADIRAN = ['Hadir', 'Alpha', 'Sakit', 'Izin'];

// // Dummy data for demonstration
// const DUMMY_JADWAL: JadwalKelas[] = [
//   {
//     jadwal_id: 1,
//     nama_mapel: 'Matematika',
//     nama_kelas: 'XII IPA 1',
//     hari: 'Senin',
//     waktu_mulai: '07:30',
//     waktu_selesai: '09:00',
//     ruang: 'A-101'
//   },
//   {
//     jadwal_id: 2,
//     nama_mapel: 'Fisika',
//     nama_kelas: 'XII IPA 2',
//     hari: 'Selasa',
//     waktu_mulai: '09:15',
//     waktu_selesai: '10:45',
//     ruang: 'Lab Fisika'
//   },
//   {
//     jadwal_id: 3,
//     nama_mapel: 'Matematika',
//     nama_kelas: 'XI IPA 1',
//     hari: 'Rabu',
//     waktu_mulai: '13:00',
//     waktu_selesai: '14:30',
//     ruang: 'A-102'
//   }
// ];

// const DUMMY_PERTEMUAN: PertemuanData[] = [
//   {
//     id_pertemuan: 1,
//     pertemuan_ke: 1,
//     materi: 'Pengenalan Limit Fungsi',
//     tanggal: '2024-01-15',
//     token_absen: '123456',
//     is_active: false,
//     waktu_mulai_absen: '07:30:00',
//     waktu_selesai_absen: '08:30:00',
//     total_hadir: 28,
//     total_siswa: 32
//   },
//   {
//     id_pertemuan: 2,
//     pertemuan_ke: 2,
//     materi: 'Sifat-sifat Limit',
//     tanggal: '2024-01-22',
//     token_absen: '789012',
//     is_active: false,
//     waktu_mulai_absen: '07:30:00',
//     waktu_selesai_absen: '08:30:00',
//     total_hadir: 25,
//     total_siswa: 32
//   }
// ];

// const DUMMY_SISWA: AbsensiSiswa[] = [
//   {
//     absensi_id: 1,
//     siswa_id: 1,
//     nis: '202201001',
//     nama_lengkap: 'Ahmad Rizky Pratama',
//     waktu_absen: '2024-01-22T07:35:00',
//     status_kehadiran: 'Hadir'
//   },
//   {
//     absensi_id: 2,
//     siswa_id: 2,
//     nis: '202201002',
//     nama_lengkap: 'Siti Nurhaliza',
//     waktu_absen: '2024-01-22T07:36:00',
//     status_kehadiran: 'Hadir'
//   },
//   {
//     absensi_id: 0,
//     siswa_id: 3,
//     nis: '202201003',
//     nama_lengkap: 'Budi Santoso',
//     waktu_absen: null,
//     status_kehadiran: null
//   },
//   {
//     absensi_id: 3,
//     siswa_id: 4,
//     nis: '202201004',
//     nama_lengkap: 'Rina Wulandari',
//     waktu_absen: null,
//     status_kehadiran: 'Sakit'
//   }
// ];

const GuruAbsensi: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [jadwalList, setJadwalList] = useState<JadwalKelas[]>([]);
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalKelas | null>(null);
  const [pertemuanList, setPertemuanList] = useState<PertemuanData[]>([]);
  const [selectedPertemuan, setSelectedPertemuan] = useState<PertemuanData | null>(null);
  
  const [siswaList, setSiswaList] = useState<AbsensiSiswa[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterHari, setFilterHari] = useState<string>('all');
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Form values
  const [formPertemuanKe, setFormPertemuanKe] = useState<number>(1);
  const [formMateri, setFormMateri] = useState<string>('');
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formTanggal, setFormTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Edit form values
  const [editFormMateri, setEditFormMateri] = useState<string>('');
  const [editFormTanggal, setEditFormTanggal] = useState<string>('');
  const [pertemuanToEdit, setPertemuanToEdit] = useState<PertemuanData | null>(null);
  
  
  // Load dummy data when component mounts
  useEffect(() => {
    const loadData = async () => {
      const JadwalGuruResponse = await fetchGuruJadwal();
      if (!JadwalGuruResponse) {
        setError('Gagal memuat jadwal mengajar. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      setJadwalList(JadwalGuruResponse.data);

      const pertemuanResponse = await fetchAbsensiPertemuanSiswa(JadwalGuruResponse.data[0].jadwal_id);

      setPertemuanList(pertemuanResponse.data || []);

      setLoading(false);
    };
    
    loadData();
  }, []);

  // Event handlers
  const handleCreatePertemuan = () => {
    const maxPertemuanKe = pertemuanList.length > 0 ? Math.max(...pertemuanList.map(p => p.pertemuan_ke)) : 0;
    setFormPertemuanKe(maxPertemuanKe + 1);
    setShowCreateModal(true);
  };

  const handleViewAbsensi = async (pertemuan: PertemuanData) => {
    setSelectedPertemuan(pertemuan);

    await handleGetDetailAbsensi(pertemuan.id_pertemuan);
    setShowDetailModal(true);
  };

  const handleJadwalClick = async (jadwal: JadwalKelas) => {
    setSelectedJadwal(jadwal);
    console.log(pertemuanList)
    const pertemuanResponse = await fetchAbsensiPertemuanSiswa(jadwal.jadwal_id);

      setPertemuanList(pertemuanResponse.data || []);

      setLoading(false);

  };

  const handleGetDetailAbsensi = async (pertemuanId: number) => {
    try {
      const detailResponse = await fetchDetailAbsensi(pertemuanId);
      setSiswaList(detailResponse.data || []);
    } catch (error) {
      console.error('Error fetching detail absensi:', error);
    }
  };

  const handleSendLink = async () => {
    try {
      if (!selectedPertemuan) {
        setError('Pilih pertemuan terlebih dahulu');
        return;
      }
  
      const token = selectedPertemuan?.token_absen;
  
      if (!token) {
        setError('Token absensi tidak ditemukan');
        return;
      }
  
      const absensiUrl = generateAbsensiUrl(token);
  
      // Ganti forEach dengan perulangan for...of
      for (const siswa of siswaList) {
        if (!siswa.no_telepon) {
          console.warn(`No telepon tidak tersedia untuk siswa ${siswa.nama_lengkap}`);
          continue; 
        }
  
        const message = `Halo ${siswa.nama_lengkap},\n\nSilakan klik link berikut untuk melakukan absensi: ${absensiUrl}\n\nTerima kasih!`;

        const responseSendLink = await axios.post('https://api.fonnte.com/send', {
          target: siswa.no_telepon,
          message: message
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'zZfEWfejvZfJWdXWw9kz' // Ganti dengan token Anda
          }
        });
        if (responseSendLink.status !== 200) {
          throw new Error(`Gagal mengirim link absensi: ${responseSendLink.statusText}`);
        }

  
        console.log(`Mengirim link absensi ke ${siswa.nama_lengkap} (${siswa.no_telepon})`);
      }

     
  
      setSuccess('Semua link absensi berhasil dikirim!');
  
    } catch (error) {
      console.error('Error sending link:', error);
      setError(error instanceof Error ? error.message : 'Gagal mengirim link absensi');
    }
  }

  const handleCreatePertemuanSubmit = () => {
    if (!selectedJadwal) return;

    const newPertemuan: PertemuanData = {
      id_pertemuan: pertemuanList.length + 1,
      pertemuan_ke: formPertemuanKe,
      materi: formMateri,
      tanggal: formTanggal,
      token_absen: Math.floor(100000 + Math.random() * 900000).toString(),
      is_active: true,
      waktu_mulai_absen: '07:30:00',
      waktu_selesai_absen: '08:30:00',
      total_hadir: 0,
      total_siswa: 32
    };

    setPertemuanList([...pertemuanList, newPertemuan]);
    setSuccess('Pertemuan berhasil dibuat!');
    setShowCreateModal(false);
    
    // Reset form
    setFormPertemuanKe(1);
    setFormMateri('');
    setFormDuration(60);
  };

  const handleEditPertemuan = (pertemuan: PertemuanData) => {
    setPertemuanToEdit(pertemuan);
    setEditFormMateri(pertemuan.materi);
    setEditFormTanggal(pertemuan.tanggal);
    setShowEditModal(true);
  };

  const handleEditPertemuanSubmit = async () => {
    if (!pertemuanToEdit) return;

    try {
      setLoading(true);
      
      // Call API to update pertemuan
      await updatePertemuan(pertemuanToEdit.id_pertemuan, editFormMateri, editFormTanggal);
      
      // Update local state after successful API call
      const updatedPertemuanList = pertemuanList.map(pertemuan => 
        pertemuan.id_pertemuan === pertemuanToEdit.id_pertemuan
          ? {
              ...pertemuan,
              materi: editFormMateri,
              tanggal: editFormTanggal
            }
          : pertemuan
      );

      setPertemuanList(updatedPertemuanList);
      
      // Update selectedPertemuan if it's the same as the edited one
      if (selectedPertemuan?.id_pertemuan === pertemuanToEdit.id_pertemuan) {
        setSelectedPertemuan({
          ...selectedPertemuan,
          materi: editFormMateri,
          tanggal: editFormTanggal
        });
      }

      setSuccess('Pertemuan berhasil diperbarui!');
      setShowEditModal(false);
      
      // Reset form
      setPertemuanToEdit(null);
      setEditFormMateri('');
      setEditFormTanggal('');
      
    } catch (error) {
      console.error('Error updating pertemuan:', error);
      setError('Gagal memperbarui pertemuan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Token berhasil disalin ke clipboard!');
  };

  const updateAbsensiStatus = async (absensiId: number, status: string) => {
    if (!selectedPertemuan) return;

    try {
      setLoading(true);
      
      // Call API to update status
      await updateAbsensiStatusAPI(absensiId, status);
      
      // Update local state
      setSiswaList(prevList => 
        prevList.map(siswa => 
          siswa.absensi_id === absensiId 
            ? { ...siswa, status_kehadiran: status as any }
            : siswa
        )
      );
      
      setSuccess(`Status kehadiran berhasil diubah menjadi ${status}`);
      
    } catch (error) {
      console.error('Error updating absensi status:', error);
      setError(error instanceof Error ? error.message : 'Gagal mengubah status kehadiran');
    } finally {
      setLoading(false);
    }
  };
  
  const createManualAbsensi = async (siswaId: number, status: string) => {
    if (!selectedPertemuan) return;

    try {
      setLoading(true);
      
      // Call API to create manual absensi
      const result = await createManualAbsensiAPI(selectedPertemuan.id_pertemuan, siswaId, status);
      
      // Update local state - result akan berisi id_absensi baik untuk create maupun update
      setSiswaList(prevList => 
        prevList.map(siswa => 
          siswa.siswa_id === siswaId 
            ? { 
                ...siswa, 
                absensi_id: result.id_absensi, 
                status_kehadiran: status as any,
                waktu_absen: result.waktu_absen || new Date().toISOString()
              }
            : siswa
        )
      );
      
      setSuccess(`Status kehadiran berhasil diubah menjadi ${status}`);
      
    } catch (error) {
      console.error('Error creating manual absensi:', error);
      setError(error instanceof Error ? error.message : 'Gagal membuat absensi manual');
    } finally {
      setLoading(false);
    }
  };
  
  
  // Function to handle changing pertemuan status (active/inactive)
  const handleChangeConditionAbsensi = async (isActive: boolean) => {
    if (!selectedPertemuan) return;

    try {
      setLoading(true);
      
      // Call API to update status
      await updateStatusPertemuan(selectedPertemuan.id_pertemuan, isActive);
      
      // Update local state
      setSelectedPertemuan(prev => prev ? { ...prev, is_active: isActive } : null);
      
      // Update pertemuan list
      setPertemuanList(prevList => 
        prevList.map(pertemuan => 
          pertemuan.id_pertemuan === selectedPertemuan.id_pertemuan 
            ? { ...pertemuan, is_active: isActive }
            : pertemuan
        )
      );
      
      setSuccess(`Absensi berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      
    } catch (error) {
      console.error('Error updating pertemuan status:', error);
      setError(error instanceof Error ? error.message : 'Gagal mengubah status absensi');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to generate absensi URL from token
  const generateAbsensiUrl = (token: string): string => {
    return `http://localhost:5173/absensi/token?token=${token}`;
  };

  // Function to show QR Code modal
  const handleShowQRCode = () => {
    setShowQRCodeModal(true);
  };
  
  // UI helpers
  const getStatusColor = (status: string | null): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'Hadir': return 'success';
      case 'Izin': return 'warning';
      case 'Sakit': return 'warning';
      case 'Alpha': return 'danger';
      default: return 'neutral';
    }
  };
  
  const filteredJadwal = jadwalList.filter(jadwal => {
    const matchSearch = jadwal.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        jadwal.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchHari = filterHari === 'all' || jadwal.hari === filterHari;
    return matchSearch && matchHari;
  });

  console.log("siswa list ", siswaList);
  console.log("pertemuan list ", pertemuanList);

  if (loading) {
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
              Kelola Absensi
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <PeopleIcon sx={{ fontSize: 32, color: 'primary.600' }} />
            Kelola Absensi Siswa
          </Typography>
          <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
            Kelola kehadiran siswa dengan mudah dan efisien
          </Typography>
        </Box>

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
        
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val as number)}>
          <TabList sx={{ mb: 2 }}>
            <Tab>Jadwal & Pertemuan</Tab>
            
          </TabList>
          
          <TabPanel value={0} sx={{ p: 0 }}>
            {/* Filter */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid xs={12} md={9}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Input 
                    placeholder="Cari kelas atau mata pelajaran..."
                    startDecorator={<SearchIcon />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1, maxWidth: 300 }}
                  />
                  <Select
                    placeholder="Filter Hari"
                    value={filterHari}
                    onChange={(_, value) => setFilterHari(value as string)}
                    startDecorator={<FilterIcon />}
                    sx={{ minWidth: 150 }}
                  >
                    <Option value="all">Semua Hari</Option>
                    {HARI.map(hari => (
                      <Option key={hari} value={hari}>{hari}</Option>
                    ))}
                  </Select>
                </Box>
              </Grid>
              <Grid xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="solid" 
                  color="primary" 
                  startDecorator={<AddIcon />}
                  onClick={handleCreatePertemuan}
                  disabled={!selectedJadwal}
                >
                  Pertemuan Baru
                </Button>
              </Grid>
            </Grid>
            
            {/* Jadwal Table */}
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography level="title-md">Jadwal Mengajar</Typography>
              </Box>
              <Sheet sx={{ maxHeight: '300px', overflow: 'auto' }}>
                <Table stickyHeader hoverRow>
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Mata Pelajaran</th>
                      <th style={{ width: '20%' }}>Kelas</th>
                      <th style={{ width: '15%' }}>Hari</th>
                      <th style={{ width: '20%' }}>Waktu</th>
                      <th style={{ width: '15%' }}>Ruang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJadwal.length > 0 ? (
                      filteredJadwal.map((jadwal) => (
                        <tr 
                          key={jadwal.jadwal_id} 
                          onClick={() => handleJadwalClick(jadwal)}
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: selectedJadwal?.jadwal_id === jadwal.jadwal_id ? 'rgba(25, 118, 210, 0.08)' : undefined 
                          }}
                        >
                          <td>
                            <Typography level="body-sm" sx={{ fontWeight: 'medium' }}>
                              {jadwal.nama_mapel}
                            </Typography>
                          </td>
                          <td>{jadwal.nama_kelas}</td>
                          <td>{jadwal.hari}</td>
                          <td>{jadwal.waktu_mulai.substring(0, 5)} - {jadwal.waktu_selesai.substring(0, 5)}</td>
                          <td>{jadwal.ruang || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                            {jadwalList.length === 0 
                              ? 'Belum ada jadwal mengajar' 
                              : 'Tidak ada jadwal yang sesuai dengan filter'}
                          </Typography>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Sheet>
            </Card>
            
            {/* Pertemuan Table */}
            <Card>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography level="title-md">
                  Daftar Pertemuan: {selectedJadwal?.nama_mapel || '-'} / {selectedJadwal?.nama_kelas || '-'}
                </Typography>
                {selectedJadwal && (
                  <Button 
                    size="sm"
                    variant="plain"
                    startDecorator={<RefreshIcon />}
                    onClick={() => {/* TODO: refresh */}}
                  >
                    Refresh
                  </Button>
                )}
              </Box>
              
              <Sheet sx={{ maxHeight: '400px', overflow: 'auto' }}>
                <Table stickyHeader hoverRow>
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>Pertemuan</th>
                      <th style={{ width: '12%' }}>Tanggal</th>
                      <th style={{ width: '25%' }}>Materi</th>
                      <th style={{ width: '17%' }}>Token</th>
                      <th style={{ width: '12%' }}>Status</th>
                      <th style={{ width: '15%' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pertemuanList.length > 0 ? (
                      pertemuanList.map((pertemuan) => {
                        
                        return (
                          <tr key={pertemuan.id_pertemuan}>
                            <td>
                              <Typography level="body-sm" sx={{ fontWeight: 'medium' }}>
                                {pertemuan.pertemuan_ke}
                              </Typography>
                            </td>
                            <td>
                              <Typography level="body-sm">
                                {new Date(pertemuan.tanggal).toLocaleDateString('id-ID')}
                              </Typography>
                            </td>
                            <td>
                              <Typography 
                                level="body-sm" 
                                sx={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {pertemuan.materi}
                              </Typography>
                            </td>
                            <td>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography level="body-sm" fontFamily="monospace" fontWeight="bold">
                                  {pertemuan.token_absen}
                                </Typography>
                                <IconButton 
                                  size="sm" 
                                  variant="plain"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(pertemuan.token_absen);
                                  }}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </td>
                            
                            <td>
                              <Chip color={pertemuan.is_active ? 'success' : 'danger'}
                                size='sm'>{pertemuan.is_active ? 'Aktif' : 'Tidak Aktif'}</Chip>
                            </td>
                            <td>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="sm"
                                  variant="outlined"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditPertemuan(pertemuan);
                                  }}
                                  startDecorator={<EditIcon />}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="solid"
                                  color="primary"
                                  onClick={() => handleViewAbsensi(pertemuan)}
                                >
                                  Detail
                                </Button>
                              </Box>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                            {!selectedJadwal 
                              ? 'Pilih jadwal untuk melihat pertemuan'
                              : 'Belum ada pertemuan untuk jadwal ini'}
                          </Typography>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Sheet>
            </Card>
          </TabPanel>
          
          <TabPanel value={1} sx={{ p: 0 }}>
            <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
                Fitur rekap absensi sedang dalam pengembangan
              </Typography>
            </Box>
          </TabPanel>
        </Tabs>
        
        {/* Modal: Create New Pertemuan */}
        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <ModalDialog>
            <ModalClose />
            <Box>
              <Typography level="h4" component="h2" sx={{ mb: 2 }}>
                Buat Pertemuan Baru
              </Typography>
            
              {selectedJadwal && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography level="body-sm" fontWeight="bold">
                      Mata Pelajaran: {selectedJadwal.nama_mapel}
                    </Typography>
                    <Typography level="body-sm" fontWeight="bold">
                      Kelas: {selectedJadwal.nama_kelas}
                    </Typography>
                  </Box>
                  
                  <FormControl>
                    <FormLabel>Pertemuan ke</FormLabel>
                  <Input
                    type="number"
                    value={formPertemuanKe}
                      onChange={e => setFormPertemuanKe(Number(e.target.value))}
                    required
                  />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Tanggal</FormLabel>
                  <Input
                    type="date"
                    value={formTanggal}
                      onChange={e => setFormTanggal(e.target.value)}
                    required
                  />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Materi</FormLabel>
                  <Textarea
                      placeholder="Masukkan materi yang akan diajarkan"
                    value={formMateri}
                      onChange={e => setFormMateri(e.target.value)}
                      minRows={2}
                      maxRows={4}
                    required
                  />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Durasi Token Aktif (menit)</FormLabel>
                    <Select
                      value={formDuration}
                      onChange={(_, value) => setFormDuration(value as number)}
                    >
                      <Option value={5}>5 menit</Option>
                      <Option value={10}>10 menit</Option>
                      <Option value={15}>15 menit</Option>
                      <Option value={30}>30 menit</Option>
                      <Option value={60}>60 menit</Option>
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="neutral" 
                      onClick={() => setShowCreateModal(false)}
                    >
                      Batal
                    </Button>
                    <Button 
                      variant="solid" 
                      color="primary" 
                      onClick={handleCreatePertemuanSubmit}
                      disabled={!formPertemuanKe || !formMateri || !formTanggal}
                    >
                      Buat Pertemuan
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </ModalDialog>
        </Modal>
        
        {/* Modal: View Absensi Detail */}
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)}>
          <ModalDialog sx={{ mmaxWidth: '800px',
                      width: '90vw',
                      maxHeight: '90vh', 
                      overflow: 'auto'}}>
            <ModalClose />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography level="h4" component="h2" sx={{ mb: 2 }}>
                Detail Absensi Pertemuan {selectedPertemuan?.pertemuan_ke}
              </Typography>
            
              {selectedPertemuan && (
                <>
                  <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {/* Baris untuk Mata Pelajaran */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ width: 120, color: 'text.secondary' }}> 
                        Mata Pelajaran
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>:</Typography>
                      <Typography level="body-sm" fontWeight="bold">
                        {selectedJadwal?.nama_mapel || '-'}
                      </Typography>
                    </Box>

                    {/* Baris untuk Token */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ width: 120, color: 'text.secondary' }}>
                        Token
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography level="body-sm" fontWeight="bold" fontFamily="monospace">
                          {selectedPertemuan.token_absen}
                        </Typography>
                        <IconButton 
                          size="sm" 
                          variant="plain"
                          onClick={() => copyToClipboard(selectedPertemuan.token_absen)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ width: 120, color: 'text.secondary' }}>
                        Aktifkan Absensi
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>:</Typography>
                      <Switch
                        checked={selectedPertemuan.is_active}
                        onChange={(e) => handleChangeConditionAbsensi(e.target.checked)}
                        disabled={loading}
                      />
                    </Box>
                    
                    {/* Baris untuk Total Kehadiran */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ width: 120, color: 'text.secondary' }}>
                        Total Kehadiran
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography level="body-sm" fontWeight="bold">
                          {siswaList.filter(siswa => siswa.status_kehadiran === 'Hadir').length} / {siswaList.length}
                        </Typography>
                        <Chip 
                          size="sm" 
                          variant="soft" 
                          color={(() => {
                            const totalHadir = siswaList.filter(siswa => siswa.status_kehadiran === 'Hadir').length;
                            const totalSiswa = siswaList.length;
                            const percentage = totalSiswa > 0 ? (totalHadir / totalSiswa) * 100 : 0;
                            if (percentage >= 80) return 'success';
                            if (percentage >= 60) return 'primary';
                            if (percentage >= 40) return 'warning';
                            return 'danger';
                          })()}
                        >
                          {siswaList.length > 0 
                            ? Math.round((siswaList.filter(siswa => siswa.status_kehadiran === 'Hadir').length / siswaList.length) * 100)
                            : 0}%
                        </Chip>
                      </Box>
                    </Box>
                    
                    <Chip color="primary"
                        onClick={handleShowQRCode}
                        size="lg"
                        variant="solid">Show QR CODE</Chip>
                      <Chip color="success"
                        onClick={handleSendLink}
                        size="lg"
                        variant="solid">Send Absen Link</Chip>
                  </Box>
                  
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography level="body-sm" fontWeight="bold">
                      Materi: {selectedPertemuan.materi}
                    </Typography>
                  </Box>

                    {/* Search Student */}
                  <Box sx={{ mb: 2 }}>
                    <Input
                      placeholder="Cari siswa berdasarkan nama atau NIS..."
                      startDecorator={<SearchIcon />}
                      fullWidth
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ maxWidth: '400px' }}
                    />
                  </Box>
                  
                  {/* Absensi Siswa Table */}
                  <Sheet sx={{ flex: 1, overflow: 'auto', maxHeight: 300, borderRadius: 8 }}>
                    <Table hoverRow>
                      <thead>
                        <tr>
                          <th style={{ width: '5%' }}>No</th>
                          <th style={{ width: '15%' }}>NIS</th>
                          <th style={{ width: '30%' }}>Nama</th>
                          <th style={{ width: '20%' }}>Waktu Absen</th>
                          <th style={{ width: '15%' }}>Status</th>
                          <th style={{ width: '15%' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {siswaList.length > 0 ? (
                          siswaList
                            .filter(siswa => 
                              searchTerm === '' || 
                              siswa.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              siswa.nis.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((siswa, index) => (
                            <tr key={siswa.siswa_id}>
                              <td>{index + 1}</td>
                              <td>{siswa.nis}</td>
                              <td>
                                <Typography level="body-sm" fontWeight="medium">
                                  {siswa.nama_lengkap}
                                </Typography>
                              </td>
                              <td>
                                {siswa.waktu_absen 
                                  ? new Date(siswa.waktu_absen).toLocaleString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit'
                                    })
                                  : '-'
                                }
                              </td>
                              <td>
                                <Chip
                                  color={getStatusColor(siswa.status_kehadiran)}
                                  size="sm"
                                  variant="soft"
                                >
                                  {siswa.status_kehadiran || 'Belum Absen'}
                                </Chip>
                              </td>
                              <td>
                              
                                {siswa.status_kehadiran ? (
                                  <Select
                                    size="sm"
                                    value={siswa.status_kehadiran || ''}
                                    onChange={(_, val) => {
                                      if (val) {
                                        if (siswa.absensi_id && siswa.absensi_id > 0) {
                                          // Update existing absensi
                                          updateAbsensiStatus(siswa.absensi_id, val as string);
                                        } else {
                                          // Create new absensi (siswa sudah punya status tapi belum ada absensi_id)
                                          createManualAbsensi(siswa.siswa_id, val as string);
                                        }
                                      }
                                    }}
                                    sx={{ minWidth: 100 }}
                                  >
                                    {STATUS_KEHADIRAN.map(status => (
                                      <Option key={status} value={status}>{status}</Option>
                                    ))}
                                  </Select>
                                ) : (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Tandai Hadir" arrow>
                                      <IconButton
                                        size="sm"
                                        color="success"
                                        variant="outlined"
                                        onClick={() => createManualAbsensi(siswa.siswa_id, 'Hadir')}
                                      >
                                        <CheckIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Tandai Alpha" arrow>
                                      <IconButton
                                        size="sm"
                                        color="danger"
                                        variant="outlined"
                                        onClick={() => createManualAbsensi(siswa.siswa_id, 'Alpha')}
                                      >
                                        <CloseIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                              <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                                Belum ada data absensi
                              </Typography>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Sheet>
                </>
              )}
            </Box>
          </ModalDialog>
        </Modal>
        
        {/* Modal: QR Code Absensi */}
        <Modal open={showQRCodeModal} onClose={() => setShowQRCodeModal(false)}>
          <ModalDialog sx={{ maxWidth: '400px', width: '90vw' }}>
            <ModalClose />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography level="h4" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
                QR Code Absensi Pertemuan {selectedPertemuan?.pertemuan_ke}
              </Typography>
              
              {selectedPertemuan && (
                <QRCodeCanvas 
                  value={generateAbsensiUrl(selectedPertemuan.token_absen)} 
                  size={256}
                  style={{ 
                    height: 'auto', 
                    maxWidth: '100%', 
                    width: '100%',
                    margin: '0 auto'
                  }}
                />
              )}
              
              <Button 
                variant="solid" 
                color="primary" 
                onClick={() => copyToClipboard(generateAbsensiUrl(selectedPertemuan?.token_absen || ''))}
                fullWidth
              >
                Salin URL Absensi
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
        
        {/* Modal: Edit Pertemuan */}
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
          <ModalDialog>
            <ModalClose />
            <Box>
              <Typography level="h4" component="h2" sx={{ mb: 2 }}>
                Edit Pertemuan {pertemuanToEdit?.pertemuan_ke}
              </Typography>
            
              {pertemuanToEdit && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography level="body-sm" fontWeight="bold">
                      Mata Pelajaran: {selectedJadwal?.nama_mapel}
                    </Typography>
                    <Typography level="body-sm" fontWeight="bold">
                      Kelas: {selectedJadwal?.nama_kelas}
                    </Typography>
                    <Typography level="body-sm" fontWeight="bold">
                      Pertemuan ke: {pertemuanToEdit.pertemuan_ke}
                    </Typography>
                  </Box>
                  
                  <FormControl>
                    <FormLabel>Tanggal</FormLabel>
                    <Input
                      type="date"
                      value={editFormTanggal}
                      onChange={e => setEditFormTanggal(e.target.value)}
                      required
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Materi</FormLabel>
                    <Textarea
                      placeholder="Masukkan materi yang akan diajarkan"
                      value={editFormMateri}
                      onChange={e => setEditFormMateri(e.target.value)}
                      minRows={2}
                      maxRows={4}
                      required
                    />
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="neutral" 
                      onClick={() => setShowEditModal(false)}
                    >
                      Batal
                    </Button>
                    <Button 
                      variant="solid" 
                      color="primary" 
                      onClick={handleEditPertemuanSubmit}
                      disabled={!editFormMateri || !editFormTanggal || loading}
                      loading={loading}
                    >
                      Simpan Perubahan
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </ModalDialog>
        </Modal>
      </Box>
    </Box>
  );
};

export default GuruAbsensi;