import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, Button, Table, Alert,
  IconButton, Input, FormControl, FormLabel, Chip, Modal, ModalDialog, Stack,
  Divider
} from '@mui/joy';
import { 
  Logout as LogoutIcon, 
  School as SchoolIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon
} from '@mui/icons-material';
import axios from 'axios';

interface GuruData {
  guru_id: number;
  nip: string;
  nama_lengkap: string;
  email: string;
  created_at: string;
}

interface EditGuruData {
  guru_id: number;
  nip: string;
  nama_lengkap: string;
  email: string;
}

const AdminViewGuru: React.FC = () => {
  const navigate = useNavigate();
  const [guruList, setGuruList] = useState<GuruData[]>([]);
  const [filteredGuru, setFilteredGuru] = useState<GuruData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'danger' | 'warning'>('success');
  const [adminUsername, setAdminUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  
  // Edit state
  const [editMode, setEditMode] = useState<{[key: number]: boolean}>({});
  const [editData, setEditData] = useState<{[key: number]: EditGuruData}>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [passwordModal, setPasswordModal] = useState<{open: boolean, guruId: number | null}>({open: false, guruId: null});
  const [newPassword, setNewPassword] = useState('');

  // Check admin authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const username = localStorage.getItem('adminUsername');
    
    if (!token || !username) {
      navigate('/admin/login');
      return;
    }
    
    setAdminUsername(username);
    fetchGuruData();
  }, [navigate]);

  // Filter guru based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGuru(guruList);
    } else {
      const filtered = guruList.filter(guru => 
        guru.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guru.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guru.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGuru(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, guruList]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredGuru.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGuru = filteredGuru.slice(startIndex, endIndex);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const fetchGuruData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/admin/guru', {
        headers: {
          'Authorization': token,
        }
      });

      if (response.data.status === 'success') {
        setGuruList(response.data.data);
        setFilteredGuru(response.data.data);
        setMessage(`Berhasil memuat ${response.data.data.length} data guru`);
        setMessageType('success');
      } else {
        setMessage(response.data.message || 'Gagal memuat data guru');
        setMessageType('danger');
      }
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      } else {
        setMessage(error.response?.data?.message || 'Terjadi kesalahan saat memuat data');
        setMessageType('danger');
      }
    } finally {
      setLoading(false);
    }
  };
  const startEdit = (guru: GuruData) => {
    setEditMode(prev => ({ ...prev, [guru.guru_id]: true }));
    setEditData(prev => ({
      ...prev,
      [guru.guru_id]: {
        guru_id: guru.guru_id,
        nip: guru.nip,
        nama_lengkap: guru.nama_lengkap,
        email: guru.email || ''
      }
    }));
  };

  const cancelEdit = (guruId: number) => {
    setEditMode(prev => ({ ...prev, [guruId]: false }));
    setEditData(prev => {
      const newData = { ...prev };
      delete newData[guruId];
      return newData;
    });
  };

  const updateEditData = (guruId: number, field: keyof EditGuruData, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [guruId]: {
        ...prev[guruId],
        [field]: value
      }
    }));
  };

  const saveEdit = async (guruId: number) => {
    const data = editData[guruId];
    if (!data) return;

    setUpdatingId(guruId);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.put(`http://localhost:8080/api/admin/guru/${guruId}`, data, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        setMessage('Data guru berhasil diupdate');
        setMessageType('success');
        cancelEdit(guruId);
        fetchGuruData(); // Refresh data
      } else {
        setMessage(response.data.message || 'Gagal mengupdate data guru');
        setMessageType('danger');
      }
      
    } catch (error: any) {
      console.error('Update error:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengupdate data');
      setMessageType('danger');
    } finally {
      setUpdatingId(null);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const openPasswordModal = (guruId: number) => {
    setPasswordModal({open: true, guruId});
    setNewPassword('');
  };

  const closePasswordModal = () => {
    setPasswordModal({open: false, guruId: null});
    setNewPassword('');
  };

  const updatePassword = async () => {
    if (!passwordModal.guruId || !newPassword.trim()) return;
    
    setUpdatingId(passwordModal.guruId);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.put(`http://localhost:8080/api/admin/guru/${passwordModal.guruId}/password`, 
        { password: newPassword }, 
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setMessage('Password guru berhasil diupdate');
        setMessageType('success');
        closePasswordModal();
      } else {
        setMessage(response.data.message || 'Gagal mengupdate password');
        setMessageType('danger');
      }
      
    } catch (error: any) {
      console.error('Update password error:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengupdate password');
      setMessageType('danger');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Data Guru
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography level="body-md">
            Admin: <strong>{adminUsername}</strong>
          </Typography>
          <IconButton color="danger" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>      {/* Navigation */}
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
          variant="outlined" 
          onClick={() => navigate('/admin/upload-jadwal')}
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
          variant="solid" 
          color="primary"
        >
          Lihat Data Guru
        </Button>
      </Box>

      {/* Search */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <FormControl>
            <FormLabel>Cari Guru</FormLabel>
            <Input
              placeholder="Cari berdasarkan nama, NIP, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startDecorator={<SearchIcon />}
              size="lg"
            />
          </FormControl>
        </CardContent>
      </Card>

      {/* Message Alert */}
      {message && (
        <Alert color={messageType} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Stats and Pagination Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip variant="soft" color="primary" size="lg">
            Total Guru: {guruList.length}
          </Chip>
          <Chip variant="soft" color="neutral" size="lg">
            Ditampilkan: {currentGuru.length} dari {filteredGuru.length}
          </Chip>
        </Box>
        
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <PrevIcon />
            </IconButton>
            
            <Typography level="body-sm">
              Halaman {currentPage} dari {totalPages}
            </Typography>
            
            <IconButton 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <NextIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Data Table */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="h4" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon />
            Daftar Guru
          </Typography>
          {loading ? (
            <Typography level="body-md" sx={{ textAlign: 'center', py: 4 }}>
              Memuat data...
            </Typography>
          ) : currentGuru.length === 0 ? (
            <Typography level="body-md" sx={{ textAlign: 'center', py: 4 }}>
              {guruList.length === 0 ? 'Belum ada data guru' : 'Tidak ada guru yang sesuai dengan pencarian'}
            </Typography>
          ) : (
            <Box sx={{ overflow: 'auto' }}>              <Table sx={{ minWidth: 800 }}>
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>No</th>
                    <th style={{ width: '20%' }}>NIP</th>
                    <th style={{ width: '35%' }}>Nama Lengkap</th>
                    <th style={{ width: '25%' }}>Email</th>
                    <th style={{ width: '15%' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGuru.map((guru, index) => {
                    const actualIndex = startIndex + index + 1;
                    const isEditing = editMode[guru.guru_id];
                    const isUpdating = updatingId === guru.guru_id;
                    
                    return (
                      <tr key={guru.guru_id}>
                        <td>{actualIndex}</td>
                        
                        {/* NIP */}
                        <td>
                          {isEditing ? (
                            <Input
                              size="sm"
                              value={editData[guru.guru_id]?.nip || ''}
                              onChange={(e) => updateEditData(guru.guru_id, 'nip', e.target.value)}
                              disabled={isUpdating}
                            />
                          ) : (
                            <strong>{guru.nip}</strong>
                          )}
                        </td>
                        
                        {/* Nama Lengkap */}
                        <td>
                          {isEditing ? (
                            <Input
                              size="sm"
                              value={editData[guru.guru_id]?.nama_lengkap || ''}
                              onChange={(e) => updateEditData(guru.guru_id, 'nama_lengkap', e.target.value)}
                              disabled={isUpdating}
                            />
                          ) : (
                            guru.nama_lengkap
                          )}
                        </td>
                          {/* Email */}
                        <td>
                          {isEditing ? (
                            <Input
                              size="sm"
                              type="email"
                              value={editData[guru.guru_id]?.email || ''}
                              onChange={(e) => updateEditData(guru.guru_id, 'email', e.target.value)}
                              disabled={isUpdating}
                            />
                          ) : (
                            guru.email || 'N/A'
                          )}
                        </td>
                        
                        {/* Actions */}
                        <td>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {isEditing ? (
                              <>
                                <IconButton 
                                  size="sm"
                                  color="success"
                                  variant="soft"
                                  onClick={() => saveEdit(guru.guru_id)}
                                  disabled={isUpdating}
                                  loading={isUpdating}
                                >
                                  <SaveIcon />
                                </IconButton>
                                <IconButton 
                                  size="sm"
                                  color="neutral"
                                  variant="soft"
                                  onClick={() => cancelEdit(guru.guru_id)}
                                  disabled={isUpdating}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton 
                                  size="sm"
                                  color="primary"
                                  variant="soft"
                                  onClick={() => startEdit(guru)}
                                  title="Edit Data"
                                >
                                  <EditIcon />
                                </IconButton>
                                <Button 
                                  size="sm"
                                  color="warning"
                                  variant="soft"
                                  onClick={() => openPasswordModal(guru.guru_id)}
                                  title="Ubah Password"
                                >
                                  Pass
                                </Button>
                              </>
                            )}
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          onClick={fetchGuruData}
          loading={loading}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Password Modal */}
      <Modal open={passwordModal.open} onClose={closePasswordModal}>
        <ModalDialog>
          <Typography level="h4" sx={{ mb: 2 }}>
            Ubah Password Guru
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <FormControl>
              <FormLabel>Password Baru</FormLabel>
              <Input
                type="password"
                placeholder="Masukkan password baru..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={updatingId === passwordModal.guruId}
              />
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="plain" 
                color="neutral"
                onClick={closePasswordModal}
                disabled={updatingId === passwordModal.guruId}
              >
                Batal
              </Button>
              <Button 
                color="primary"
                onClick={updatePassword}
                disabled={!newPassword.trim() || updatingId === passwordModal.guruId}
                loading={updatingId === passwordModal.guruId}
              >
                Simpan
              </Button>
            </Box>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default AdminViewGuru;
