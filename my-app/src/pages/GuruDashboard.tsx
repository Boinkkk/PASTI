import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Button,
  Table,
  Sheet,
  Chip,
  Modal,
  ModalDialog,
  ModalClose,
  Divider,
  Alert,
  Input,
  Textarea,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemContent,
  AspectRatio,
  DialogTitle,
  DialogContent,
  Stack
} from '@mui/joy';
import { 
  School as SchoolIcon,
  QrCode as QrCodeIcon,
  ContentCopy as ContentCopyIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Share as ShareIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import SidebarGuru from '../components/SidebarGuru';
import { useAuth } from '../components/Middleware';

interface JadwalGuru {
  jadwal_id: number;
  nama_mapel: string;
  nama_kelas: string;
  hari: string;
  waktu_mulai: string;
  waktu_selesai: string;
  ruang: string;
}

interface PertemuanAktif {
  id_pertemuan: number;
  pertemuan_ke: number;
  materi: string;
  token_absen: string;
  status_pertemuan: string;
  waktu_mulai_absen: string;
  waktu_selesai_absen: string;
  total_hadir: number;
  total_siswa: number;
}

const GuruDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [jadwalList, setJadwalList] = useState<JadwalGuru[]>([]);
  const [pertemuanAktif, setPertemuanAktif] = useState<PertemuanAktif[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedPertemuan, setSelectedPertemuan] = useState<PertemuanAktif | null>(null);
  const [newPertemuanModal, setNewPertemuanModal] = useState(false);  const [selectedJadwal, setSelectedJadwal] = useState<JadwalGuru | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Form states for new pertemuan
  const [pertemuanKe, setPertemuanKe] = useState('');
  const [materi, setMateri] = useState('');
  const [durasiMenit, setDurasiMenit] = useState('120'); // Default 2 jam

  useEffect(() => {
    fetchGuruData();
  }, [user?.guru_id]);

  const fetchGuruData = async () => {
    if (!user?.guru_id) return;

    try {
      setLoading(true);
      
      // Fetch jadwal guru
      const jadwalResponse = await fetch(`http://localhost:8080/api/v1/guru/jadwal/${user.guru_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (jadwalResponse.ok) {
        const jadwalResult = await jadwalResponse.json();
        setJadwalList(jadwalResult.data || []);
      }

      // Fetch pertemuan aktif
      const pertemuanResponse = await fetch(`http://localhost:8080/api/v1/guru/pertemuan-aktif/${user.guru_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (pertemuanResponse.ok) {
        const pertemuanResult = await pertemuanResponse.json();
        setPertemuanAktif(pertemuanResult.data || []);
      }

    } catch (error) {
      console.error('Error fetching guru data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleMulaiPertemuan = async () => {
    if (!selectedJadwal || !pertemuanKe || !materi) {
      alert('Mohon lengkapi semua field');
      return;
    }

    try {
      const token = generateToken();
      const waktuSelesai = new Date();
      waktuSelesai.setMinutes(waktuSelesai.getMinutes() + parseInt(durasiMenit));

      const response = await fetch('http://localhost:8080/api/v1/guru/mulai-pertemuan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jadwal_id: selectedJadwal.jadwal_id,
          pertemuan_ke: parseInt(pertemuanKe),
          materi: materi,
          token_absen: token,
          waktu_selesai_absen: waktuSelesai.toISOString(),
        }),
      });

      if (response.ok) {
        alert('Pertemuan berhasil dimulai!');
        setNewPertemuanModal(false);
        setPertemuanKe('');
        setMateri('');
        setSelectedJadwal(null);
        fetchGuruData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal memulai pertemuan');
      }
    } catch (error) {
      console.error('Error starting pertemuan:', error);
      alert('Gagal memulai pertemuan');
    }
  };

  const handleAkhiriPertemuan = async (pertemuanId: number) => {
    if (!confirm('Apakah Anda yakin ingin mengakhiri pertemuan ini?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/v1/guru/akhiri-pertemuan/${pertemuanId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Pertemuan berhasil diakhiri!');
        fetchGuruData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal mengakhiri pertemuan');
      }
    } catch (error) {
      console.error('Error ending pertemuan:', error);
      alert('Gagal mengakhiri pertemuan');
    }
  };
  const copyTokenLink = (token: string) => {
    const link = `${window.location.origin}/absensi/token/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link absensi telah disalin ke clipboard!');
    });
  };

  const shareViaWhatsApp = (token: string, pertemuan: PertemuanAktif) => {
    const link = `${window.location.origin}/absensi/token/${token}`;
    const message = `🎓 *Absensi ${pertemuan.materi}*\n\n📅 Pertemuan ke-${pertemuan.pertemuan_ke}\n🔗 Link: ${link}\n⏰ Batas waktu: ${pertemuan.waktu_selesai_absen}\n\nSilakan klik link untuk melakukan absensi.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = (token: string, pertemuan: PertemuanAktif) => {
    const link = `${window.location.origin}/absensi/token/${token}`;
    const subject = `Absensi ${pertemuan.materi} - Pertemuan ${pertemuan.pertemuan_ke}`;
    const body = `Silakan akses link berikut untuk melakukan absensi:\n\n${link}\n\nBatas waktu: ${pertemuan.waktu_selesai_absen}\n\nTerima kasih.`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  const refreshAttendanceData = async () => {
    await fetchGuruData();
  };
  // Auto refresh setiap 30 detik jika diaktifkan
  useEffect(() => {
    let interval: number;
    if (autoRefresh) {
      interval = window.setInterval(() => {
        fetchGuruData();
      }, 30000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [autoRefresh]);
  const showTokenDetails = (pertemuan: PertemuanAktif) => {
    setSelectedPertemuan(pertemuan);
    setShowTokenModal(true);
  };

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
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '280px' : '70px',
          transition: 'margin 0.3s ease',
          bgcolor: '#f8f9fa',
          minHeight: '100vh',
          p: 3
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography level="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Dashboard Guru
          </Typography>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            Selamat datang, {user?.nama_lengkap}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchoolIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                <Box>
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    Total Jadwal
                  </Typography>
                  <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    {jadwalList.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
                <Box>
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    Pertemuan Aktif
                  </Typography>
                  <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    {pertemuanAktif.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: '#ed6c02' }} />
                <Box>
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    Total Kehadiran Hari Ini
                  </Typography>
                  <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    {pertemuanAktif.reduce((total, p) => total + p.total_hadir, 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Pertemuan Aktif */}
        <Card sx={{ mb: 3 }}>
          <CardContent>            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                Pertemuan Aktif
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Auto refresh setiap 30 detik">
                  <IconButton
                    variant={autoRefresh ? "solid" : "outlined"}
                    color={autoRefresh ? "success" : "neutral"}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  size="sm"
                  variant="outlined"
                  onClick={refreshAttendanceData}
                  startDecorator={<RefreshIcon />}
                >
                  Refresh
                </Button>
                {pertemuanAktif.length === 0 && (
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    Tidak ada pertemuan aktif
                  </Typography>
                )}
              </Box>
            </Box>

            {pertemuanAktif.length > 0 ? (
              <Sheet sx={{ borderRadius: 'md', overflow: 'auto' }}>
                <Table>                  <thead>
                    <tr>
                      <th>Pertemuan</th>
                      <th>Materi</th>
                      <th>Token</th>
                      <th>Kehadiran</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pertemuanAktif.map((pertemuan) => (
                      <tr key={pertemuan.id_pertemuan}>
                        <td>Pertemuan {pertemuan.pertemuan_ke}</td>
                        <td>{pertemuan.materi}</td>
                        <td>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography level="body-sm" sx={{ fontFamily: 'monospace' }}>
                              {pertemuan.token_absen}
                            </Typography>
                            <Button
                              size="sm"
                              variant="plain"
                              onClick={() => copyTokenLink(pertemuan.token_absen)}
                            >
                              <ContentCopyIcon sx={{ fontSize: 16 }} />
                            </Button>
                          </Box>
                        </td>
                        <td>{pertemuan.total_hadir}/{pertemuan.total_siswa}</td>
                        <td>
                          <Chip
                            color={pertemuan.status_pertemuan === 'Aktif' ? 'success' : 'neutral'}
                            size="sm"
                            variant="soft"
                          >
                            {pertemuan.status_pertemuan}
                          </Chip>
                        </td>                        <td>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Lihat QR Code & Detail">
                              <Button
                                size="sm"
                                variant="outlined"
                                onClick={() => showTokenDetails(pertemuan)}
                              >
                                <QrCodeIcon sx={{ fontSize: 16 }} />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Share via WhatsApp">
                              <Button
                                size="sm"
                                variant="outlined"
                                color="success"
                                onClick={() => shareViaWhatsApp(pertemuan.token_absen, pertemuan)}
                              >
                                <WhatsAppIcon sx={{ fontSize: 16 }} />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Share via Email">
                              <Button
                                size="sm"
                                variant="outlined"
                                color="primary"
                                onClick={() => shareViaEmail(pertemuan.token_absen, pertemuan)}
                              >
                                <EmailIcon sx={{ fontSize: 16 }} />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Akhiri Pertemuan">
                              <Button
                                size="sm"
                                color="danger"
                                variant="outlined"
                                onClick={() => handleAkhiriPertemuan(pertemuan.id_pertemuan)}
                              >
                                <StopIcon sx={{ fontSize: 16 }} />
                              </Button>
                            </Tooltip>
                          </Box>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Sheet>
            ) : (
              <Alert color="neutral" variant="soft">
                Tidak ada pertemuan yang sedang berlangsung
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Jadwal Mengajar */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                Jadwal Mengajar
              </Typography>
            </Box>

            {jadwalList.length > 0 ? (
              <Sheet sx={{ borderRadius: 'md', overflow: 'auto' }}>
                <Table>
                  <thead>
                    <tr>
                      <th>Mata Pelajaran</th>
                      <th>Kelas</th>
                      <th>Hari</th>
                      <th>Waktu</th>
                      <th>Ruang</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalList.map((jadwal) => (
                      <tr key={jadwal.jadwal_id}>
                        <td>{jadwal.nama_mapel}</td>
                        <td>{jadwal.nama_kelas}</td>
                        <td>{jadwal.hari}</td>
                        <td>{jadwal.waktu_mulai} - {jadwal.waktu_selesai}</td>
                        <td>{jadwal.ruang}</td>
                        <td>
                          <Button
                            size="sm"
                            color="primary"
                            onClick={() => {
                              setSelectedJadwal(jadwal);
                              setNewPertemuanModal(true);
                            }}
                          >
                            <PlayArrowIcon sx={{ fontSize: 16, mr: 1 }} />
                            Mulai Pertemuan
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Sheet>
            ) : (
              <Alert color="neutral" variant="soft">
                Tidak ada jadwal mengajar
              </Alert>
            )}
          </CardContent>
        </Card>        {/* Modal Token Details */}
        <Modal open={showTokenModal} onClose={() => setShowTokenModal(false)}>
          <ModalDialog sx={{ maxWidth: 600, width: '100%' }}>
            <ModalClose />
            <DialogTitle>
              <Typography level="h4" sx={{ mb: 1 }}>
                🎓 Detail Token Absensi
              </Typography>
            </DialogTitle>
            
            {selectedPertemuan && (
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Header Info */}
                  <Alert color="primary" variant="soft">
                    <Box>
                      <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                        Pertemuan {selectedPertemuan.pertemuan_ke}
                      </Typography>
                      <Typography level="body-sm">
                        {selectedPertemuan.materi}
                      </Typography>
                    </Box>
                  </Alert>
                  
                  {/* Token dan QR Code */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    {/* Token Section */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography level="title-sm" sx={{ mb: 2 }}>
                        Token Absensi
                      </Typography>
                      <Box sx={{ 
                        bgcolor: '#f0f8ff', 
                        p: 2, 
                        borderRadius: 'md',
                        border: '2px dashed #1976d2',
                        mb: 2
                      }}>
                        <Typography 
                          level="h2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            color: '#1976d2',
                            letterSpacing: '4px',
                            fontWeight: 'bold'
                          }}
                        >
                          {selectedPertemuan.token_absen}
                        </Typography>
                      </Box>
                      
                      <Typography level="body-xs" sx={{ 
                        bgcolor: '#f8f9fa', 
                        p: 1, 
                        borderRadius: 'sm',
                        wordBreak: 'break-all',
                        mb: 2,
                        fontFamily: 'monospace'
                      }}>
                        {window.location.origin}/absensi/token/{selectedPertemuan.token_absen}
                      </Typography>
                    </Box>
                    
                    {/* QR Code Section */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography level="title-sm" sx={{ mb: 2 }}>
                        QR Code
                      </Typography>
                      <AspectRatio ratio="1" sx={{ width: 200, mx: 'auto', mb: 2 }}>                        <QRCodeSVG 
                          value={`${window.location.origin}/absensi/token/${selectedPertemuan.token_absen}`}
                          size={180}
                          level="M"
                          includeMargin={true}
                        />
                      </AspectRatio>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        Scan untuk akses langsung
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startDecorator={<ContentCopyIcon />}
                      onClick={() => copyTokenLink(selectedPertemuan.token_absen)}
                    >
                      Copy Link
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      startDecorator={<WhatsAppIcon />}
                      onClick={() => shareViaWhatsApp(selectedPertemuan.token_absen, selectedPertemuan)}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startDecorator={<EmailIcon />}
                      onClick={() => shareViaEmail(selectedPertemuan.token_absen, selectedPertemuan)}
                    >
                      Email
                    </Button>
                    <Button
                      variant="outlined"
                      color="neutral"
                      startDecorator={<ShareIcon />}
                      onClick={() => {
                        setSelectedPertemuan(selectedPertemuan);
                        setShowShareModal(true);
                      }}
                    >
                      More Options
                    </Button>
                  </Stack>
                  
                  <Divider />
                  
                  {/* Statistics */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, textAlign: 'center' }}>
                    <Box>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        Kehadiran
                      </Typography>
                      <Typography level="title-lg" sx={{ color: 'success.500' }}>
                        {selectedPertemuan.total_hadir}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        Total Siswa
                      </Typography>
                      <Typography level="title-lg">
                        {selectedPertemuan.total_siswa}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        Persentase
                      </Typography>
                      <Typography level="title-lg" sx={{ 
                        color: selectedPertemuan.total_siswa > 0 
                          ? (selectedPertemuan.total_hadir / selectedPertemuan.total_siswa * 100 >= 80 ? 'success.500' : 'warning.500')
                          : 'neutral.500'
                      }}>
                        {selectedPertemuan.total_siswa > 0 
                          ? Math.round(selectedPertemuan.total_hadir / selectedPertemuan.total_siswa * 100)
                          : 0}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Time Info */}
                  <Alert color="warning" variant="soft">
                    <Typography level="body-sm">
                      ⏰ <strong>Batas waktu:</strong> {selectedPertemuan.waktu_selesai_absen} <br/>
                      📊 <strong>Status:</strong> {selectedPertemuan.status_pertemuan}
                    </Typography>
                  </Alert>
                </Box>
              </DialogContent>
            )}          </ModalDialog>
        </Modal>

        {/* Modal Share Options */}
        <Modal open={showShareModal} onClose={() => setShowShareModal(false)}>
          <ModalDialog sx={{ maxWidth: 400, width: '100%' }}>
            <ModalClose />
            <DialogTitle>
              <Typography level="h4" sx={{ mb: 1 }}>
                📤 Kirim Absensi ke Siswa
              </Typography>
            </DialogTitle>
            
            {selectedPertemuan && (
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert color="primary" variant="soft">
                    <Typography level="body-sm">
                      Pilih cara untuk mengirimkan link absensi kepada siswa
                    </Typography>
                  </Alert>
                  
                  <List sx={{ '--ListItem-paddingY': '8px' }}>
                    <ListItem>
                      <ListItemContent>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="success"
                          size="lg"
                          startDecorator={<WhatsAppIcon />}
                          onClick={() => {
                            shareViaWhatsApp(selectedPertemuan.token_absen, selectedPertemuan);
                            setShowShareModal(false);
                          }}
                        >
                          Kirim via WhatsApp
                        </Button>
                      </ListItemContent>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemContent>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          size="lg"
                          startDecorator={<EmailIcon />}
                          onClick={() => {
                            shareViaEmail(selectedPertemuan.token_absen, selectedPertemuan);
                            setShowShareModal(false);
                          }}
                        >
                          Kirim via Email
                        </Button>
                      </ListItemContent>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemContent>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="neutral"
                          size="lg"
                          startDecorator={<ContentCopyIcon />}
                          onClick={() => {
                            copyTokenLink(selectedPertemuan.token_absen);
                            setShowShareModal(false);
                          }}
                        >
                          Copy Link ke Clipboard
                        </Button>
                      </ListItemContent>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemContent>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="warning"
                          size="lg"
                          startDecorator={<QrCodeIcon />}
                          onClick={() => {
                            setShowShareModal(false);
                            // QR code modal sudah terbuka
                          }}
                        >
                          Tampilkan QR Code
                        </Button>
                      </ListItemContent>
                    </ListItem>
                  </List>
                  
                  <Divider />
                  
                  <Typography level="body-xs" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    💡 Tip: Siswa dapat menggunakan token <strong>{selectedPertemuan.token_absen}</strong> untuk absensi manual
                  </Typography>
                </Box>
              </DialogContent>
            )}
          </ModalDialog>
        </Modal>

        {/* Modal New Pertemuan */}
        <Modal open={newPertemuanModal} onClose={() => setNewPertemuanModal(false)}>
          <ModalDialog sx={{ maxWidth: 400, width: '100%' }}>
            <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              Mulai Pertemuan Baru
            </Typography>
            
            {selectedJadwal && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert color="primary" variant="soft">
                  <Typography level="body-sm">
                    <strong>{selectedJadwal.nama_mapel}</strong><br/>
                    Kelas: {selectedJadwal.nama_kelas}
                  </Typography>
                </Alert>
                
                <Input
                  placeholder="Pertemuan ke-"
                  type="number"
                  value={pertemuanKe}
                  onChange={(e) => setPertemuanKe(e.target.value)}
                  slotProps={{
                    input: {
                      min: 1,
                      max: 16
                    }
                  }}
                />
                
                <Textarea
                  placeholder="Materi pertemuan"
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  minRows={3}
                />
                
                <Input
                  placeholder="Durasi absensi (menit)"
                  type="number"
                  value={durasiMenit}
                  onChange={(e) => setDurasiMenit(e.target.value)}
                  slotProps={{
                    input: {
                      min: 30,
                      max: 300
                    }
                  }}
                />
                
                <Button
                  onClick={handleMulaiPertemuan}
                  disabled={!pertemuanKe || !materi}
                >
                  Mulai Pertemuan & Generate Token
                </Button>
              </Box>
            )}
          </ModalDialog>
        </Modal>
      </Box>
    </Box>
  );
};

export default GuruDashboard;
