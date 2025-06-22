import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, Button, Alert, 
  IconButton, Input, FormControl, FormLabel, Stack, 
  Select, Option
} from '@mui/joy';
import { 
  Logout as LogoutIcon, 
  Upload as UploadIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

interface KelasOption {
  kelas_id: number;
  nama_kelas: string;
}

interface GuruOption {
  guru_id: number;
  nip: string;
  nama_lengkap: string;
}

interface MapelOption {
  mapel_id: number;
  nama_mapel: string;
}

interface JadwalEntry {
  kelas_id: number;
  mapel_id: number;
  guru_id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruang: string;
}

const AdminUploadJadwal: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'danger' | 'warning'>('success');
  const [adminUsername, setAdminUsername] = useState('');
  
  // Options data
  const [kelasList, setKelasList] = useState<KelasOption[]>([]);
  const [guruList, setGuruList] = useState<GuruOption[]>([]);
  const [mapelList, setMapelList] = useState<MapelOption[]>([]);
  
  // Form data
  const [jadwalEntries, setJadwalEntries] = useState<JadwalEntry[]>([
    {
      kelas_id: 0,
      mapel_id: 0,
      guru_id: 0,
      hari: '',
      jam_mulai: '',
      jam_selesai: '',
      ruang: ''
    }
  ]);

  // CSV Upload
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'csv'>('manual');

  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Check admin authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const username = localStorage.getItem('adminUsername');
    
    if (!token || !username) {
      navigate('/admin/login');
      return;
    }
    
    setAdminUsername(username);
    fetchOptionsData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const fetchOptionsData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Fetch kelas, guru, dan mapel data
      const [kelasRes, guruRes, mapelRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/kelas', { headers: { 'Authorization': token } }),
        axios.get('http://localhost:8080/api/admin/guru', { headers: { 'Authorization': token } }),
        axios.get('http://localhost:8080/api/admin/mapel', { headers: { 'Authorization': token } })
      ]);

      if (kelasRes.data.status === 'success') {
        setKelasList(kelasRes.data.data);
      }
      if (guruRes.data.status === 'success') {
        setGuruList(guruRes.data.data);
      }
      if (mapelRes.data.status === 'success') {
        setMapelList(mapelRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch options data:', error);
      setMessage('Gagal memuat data pilihan');
      setMessageType('danger');
    }
  };

  const addJadwalEntry = () => {
    setJadwalEntries([...jadwalEntries, {
      kelas_id: 0,
      mapel_id: 0,
      guru_id: 0,
      hari: '',
      jam_mulai: '',
      jam_selesai: '',
      ruang: ''
    }]);
  };

  const removeJadwalEntry = (index: number) => {
    if (jadwalEntries.length > 1) {
      setJadwalEntries(jadwalEntries.filter((_, i) => i !== index));
    }
  };

  const updateJadwalEntry = (index: number, field: keyof JadwalEntry, value: string | number) => {
    const updatedEntries = jadwalEntries.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    );
    setJadwalEntries(updatedEntries);
  };

  const handleManualUpload = async () => {
    // Validate entries
    const invalidEntries = jadwalEntries.filter(entry => 
      !entry.kelas_id || !entry.mapel_id || !entry.guru_id || 
      !entry.hari || !entry.jam_mulai || !entry.jam_selesai
    );

    if (invalidEntries.length > 0) {
      setMessage('Mohon lengkapi semua field yang wajib diisi');
      setMessageType('danger');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.post('http://localhost:8080/api/admin/upload-jadwal', {
        jadwal_entries: jadwalEntries
      }, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        setMessage(`Berhasil mengupload ${jadwalEntries.length} jadwal pelajaran`);
        setMessageType('success');
        // Reset form
        setJadwalEntries([{
          kelas_id: 0,
          mapel_id: 0,
          guru_id: 0,
          hari: '',
          jam_mulai: '',
          jam_selesai: '',
          ruang: ''
        }]);
      } else {
        setMessage(response.data.message || 'Gagal mengupload jadwal');
        setMessageType('danger');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengupload');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setMessage('Pilih file CSV terlebih dahulu');
      setMessageType('danger');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const formData = new FormData();
      formData.append('jadwalFile', csvFile);

      const response = await axios.post('http://localhost:8080/api/admin/upload-jadwal-csv', formData, {
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        setMessage(response.data.message || 'Berhasil mengupload jadwal dari CSV');
        setMessageType('success');
        setCsvFile(null);
      } else {
        setMessage(response.data.message || 'Gagal mengupload jadwal dari CSV');
        setMessageType('danger');
      }
    } catch (error: any) {
      console.error('CSV Upload error:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengupload CSV');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "kelas_id,mapel_id,guru_id,hari,jam_mulai,jam_selesai,ruang\n1,1,1,Senin,08:00,09:30,A101\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_jadwal_pelajaran.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Upload Jadwal Pelajaran
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography level="body-md">
            Admin: <strong>{adminUsername}</strong>
          </Typography>
          <IconButton color="danger" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin/upload-siswa')}
        >
          Upload Siswa
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin/upload-guru')}
        >
          Upload Guru
        </Button>
        <Button 
          variant="solid" 
          color="primary"
        >
          Upload Jadwal
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin/siswa')}
        >
          Lihat Data Siswa
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin/guru')}
        >
          Lihat Data Guru
        </Button>
      </Box>

      {/* Method Selection */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography level="h4" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon />
            Pilih Metode Upload
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant={uploadMethod === 'manual' ? 'solid' : 'outlined'}
              onClick={() => setUploadMethod('manual')}
            >
              Manual Entry
            </Button>
            <Button 
              variant={uploadMethod === 'csv' ? 'solid' : 'outlined'}
              onClick={() => setUploadMethod('csv')}
            >
              Upload CSV
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Message Alert */}
      {message && (
        <Alert color={messageType} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Manual Entry Form */}
      {uploadMethod === 'manual' && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography level="h4">Manual Entry</Typography>
              <Button 
                startDecorator={<AddIcon />}
                onClick={addJadwalEntry}
                size="sm"
              >
                Tambah Jadwal
              </Button>
            </Box>

            <Stack spacing={3}>
              {jadwalEntries.map((entry, index) => (
                <Card key={index} variant="soft">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography level="title-md">Jadwal #{index + 1}</Typography>
                      {jadwalEntries.length > 1 && (
                        <IconButton 
                          color="danger" 
                          size="sm"
                          onClick={() => removeJadwalEntry(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                      <FormControl>
                        <FormLabel>Kelas *</FormLabel>
                        <Select
                          value={entry.kelas_id || undefined}
                          onChange={(_, value) => updateJadwalEntry(index, 'kelas_id', value as number)}
                        >
                          <Option value={undefined}>Pilih Kelas</Option>
                          {kelasList.map((kelas) => (
                            <Option key={kelas.kelas_id} value={kelas.kelas_id}>
                              {kelas.nama_kelas}
                            </Option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Mata Pelajaran *</FormLabel>
                        <Select
                          value={entry.mapel_id || undefined}
                          onChange={(_, value) => updateJadwalEntry(index, 'mapel_id', value as number)}
                        >
                          <Option value={undefined}>Pilih Mata Pelajaran</Option>
                          {mapelList.map((mapel) => (
                            <Option key={mapel.mapel_id} value={mapel.mapel_id}>
                              {mapel.nama_mapel}
                            </Option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Guru *</FormLabel>
                        <Select
                          value={entry.guru_id || undefined}
                          onChange={(_, value) => updateJadwalEntry(index, 'guru_id', value as number)}
                        >
                          <Option value={undefined}>Pilih Guru</Option>
                          {guruList.map((guru) => (
                            <Option key={guru.guru_id} value={guru.guru_id}>
                              {guru.nama_lengkap} ({guru.nip})
                            </Option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Hari *</FormLabel>
                        <Select
                          value={entry.hari || undefined}
                          onChange={(_, value) => updateJadwalEntry(index, 'hari', value as string)}
                        >
                          <Option value={undefined}>Pilih Hari</Option>
                          {hariOptions.map((hari) => (
                            <Option key={hari} value={hari}>
                              {hari}
                            </Option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Jam Mulai *</FormLabel>
                        <Input
                          type="time"
                          value={entry.jam_mulai}
                          onChange={(e) => updateJadwalEntry(index, 'jam_mulai', e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Jam Selesai *</FormLabel>
                        <Input
                          type="time"
                          value={entry.jam_selesai}
                          onChange={(e) => updateJadwalEntry(index, 'jam_selesai', e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Ruang</FormLabel>
                        <Input
                          value={entry.ruang}
                          onChange={(e) => updateJadwalEntry(index, 'ruang', e.target.value)}
                          placeholder="Contoh: A101"
                        />
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                onClick={handleManualUpload}
                loading={loading}
                disabled={loading}
                startDecorator={<UploadIcon />}
                size="lg"
              >
                Upload Jadwal
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* CSV Upload Form */}
      {uploadMethod === 'csv' && (
        <Card variant="outlined">
          <CardContent>
            <Typography level="h4" sx={{ mb: 2 }}>Upload CSV</Typography>
            
            <Stack spacing={3}>
              <Box>
                <Typography level="body-md" sx={{ mb: 1 }}>
                  Format CSV yang diperlukan:
                </Typography>
                <Typography level="body-sm" sx={{ fontFamily: 'monospace', bgcolor: 'background.level1', p: 1, borderRadius: 1 }}>
                  kelas_id,mapel_id,guru_id,hari,jam_mulai,jam_selesai,ruang
                </Typography>
                <Button 
                  variant="plain" 
                  size="sm" 
                  onClick={downloadTemplate}
                  sx={{ mt: 1 }}
                >
                  Download Template CSV
                </Button>
              </Box>              <FormControl>
                <FormLabel>Pilih File CSV</FormLabel>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </FormControl>

              <Box sx={{ textAlign: 'center' }}>
                <Button 
                  onClick={handleCsvUpload}
                  loading={loading}
                  disabled={loading || !csvFile}
                  startDecorator={<UploadIcon />}
                  size="lg"
                >
                  Upload CSV
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminUploadJadwal;
