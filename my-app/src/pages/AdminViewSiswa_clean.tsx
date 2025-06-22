import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, Button, Table, Alert,
  IconButton, Input, FormControl, FormLabel, Chip, Modal, ModalDialog, Stack,
  Select, Option, Divider
} from '@mui/joy';
import { 
  People as PeopleIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

interface SiswaData {
  siswa_id: number;
  nis: string;
  nama_lengkap: string;
  email: string;
  kelas_id: number;
  kelas_nama: string;
  no_telepon: string;
  created_at: string;
}

interface EditSiswaData {
  siswa_id: number;
  nis: string;
  nama_lengkap: string;
  kelas_id: number;
  no_telepon: string;
  email: string;
}

interface KelasOption {
  kelas_id: number;
  nama_kelas: string;
}

const AdminViewSiswa: React.FC = () => {
  const navigate = useNavigate();
  const [siswaList, setSiswaList] = useState<SiswaData[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<SiswaData[]>([]);
  const [kelasList, setKelasList] = useState<KelasOption[]>([]);
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
  const [editData, setEditData] = useState<{[key: number]: EditSiswaData}>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [passwordModal, setPasswordModal] = useState<{open: boolean, siswaId: number | null}>({open: false, siswaId: null});
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
    fetchSiswaData();
    fetchKelasData();
  }, [navigate]);

  // Filter siswa based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSiswa(siswaList);
    } else {
      const filtered = siswaList.filter(siswa => 
        siswa.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        siswa.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        siswa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        siswa.kelas_nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSiswa(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, siswaList]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSiswa = filteredSiswa.slice(startIndex, endIndex);

  const fetchSiswaData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/admin/siswa', {
        headers: {
          'Authorization': token
        }
      });

      if (response.data.status === 'success') {
        setSiswaList(response.data.data || []);
        setMessage(`Berhasil memuat ${response.data.data?.length || 0} data siswa`);
        setMessageType('success');
      } else {
        setMessage(response.data.message || 'Gagal memuat data siswa');
        setMessageType('danger');
      }
    } catch (error: any) {
      console.error('Fetch siswa error:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan saat memuat data');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchKelasData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await axios.get('http://localhost:8080/api/admin/kelas', {
        headers: {
          'Authorization': token
        }
      });

      if (response.data.status === 'success') {
        setKelasList(response.data.data || []);
      }
    } catch (error) {
      console.error('Fetch kelas error:', error);
    }
  };

  const startEdit = (siswa: SiswaData) => {
    setEditMode({...editMode, [siswa.siswa_id]: true});
    setEditData({
      ...editData,
      [siswa.siswa_id]: {
        siswa_id: siswa.siswa_id,
        nis: siswa.nis,
        nama_lengkap: siswa.nama_lengkap,
        kelas_id: siswa.kelas_id,
        no_telepon: siswa.no_telepon,
        email: siswa.email
      }
    });
  };

  const cancelEdit = (siswaId: number) => {
    const newEditMode = {...editMode};
    delete newEditMode[siswaId];
    setEditMode(newEditMode);
    
    const newEditData = {...editData};
    delete newEditData[siswaId];
    setEditData(newEditData);
  };

  const updateSiswa = async (siswaId: number) => {
    const data = editData[siswaId];
    if (!data) return;

    setUpdatingId(siswaId);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.put(`http://localhost:8080/api/admin/siswa/${siswaId}`, data, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        setMessage('Data siswa berhasil diupdate');
        setMessageType('success');
        cancelEdit(siswaId);
        fetchSiswaData(); // Refresh data
      } else {
        setMessage(response.data.message || 'Gagal mengupdate data siswa');
        setMessageType('danger');
      }
      
    } catch (error: any) {
      console.error('Update siswa error:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengupdate data');
      setMessageType('danger');
    } finally {
      setUpdatingId(null);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const openPasswordModal = (siswaId: number) => {
    setPasswordModal({open: true, siswaId});
    setNewPassword('');
  };

  const closePasswordModal = () => {
    setPasswordModal({open: false, siswaId: null});
    setNewPassword('');
  };

  const updatePassword = async () => {
    if (!passwordModal.siswaId || !newPassword.trim()) return;
    
    setUpdatingId(passwordModal.siswaId);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.put(`http://localhost:8080/api/admin/siswa/${passwordModal.siswaId}/password`, 
        { password: newPassword }, 
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setMessage('Password siswa berhasil diupdate');
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
    <AdminLayout adminUsername={adminUsername}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Typography level="h2" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
          Data Siswa
        </Typography>

        {/* Search */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <FormControl>
              <FormLabel>Cari Siswa</FormLabel>
              <Input
                placeholder="Cari berdasarkan nama, NIS, email, atau kelas..."
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
              Total Siswa: {siswaList.length}
            </Chip>
            <Chip variant="soft" color="neutral" size="lg">
              Ditampilkan: {currentSiswa.length} dari {filteredSiswa.length}
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
              <PeopleIcon />
              Daftar Siswa
            </Typography>
            
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Memuat data...</Typography>
              </Box>
            ) : currentSiswa.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Tidak ada data siswa yang ditemukan</Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table hoverRow>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>NIS</th>
                      <th>Nama Lengkap</th>
                      <th>Kelas</th>
                      <th>No Telepon</th>
                      <th>Email</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSiswa.map((siswa, index) => (
                      <tr key={siswa.siswa_id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          {editMode[siswa.siswa_id] ? (
                            <Input
                              value={editData[siswa.siswa_id]?.nis || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                [siswa.siswa_id]: {
                                  ...editData[siswa.siswa_id],
                                  nis: e.target.value
                                }
                              })}
                              size="sm"
                            />
                          ) : (
                            siswa.nis
                          )}
                        </td>
                        <td>
                          {editMode[siswa.siswa_id] ? (
                            <Input
                              value={editData[siswa.siswa_id]?.nama_lengkap || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                [siswa.siswa_id]: {
                                  ...editData[siswa.siswa_id],
                                  nama_lengkap: e.target.value
                                }
                              })}
                              size="sm"
                            />
                          ) : (
                            siswa.nama_lengkap
                          )}
                        </td>
                        <td>
                          {editMode[siswa.siswa_id] ? (
                            <Select
                              value={editData[siswa.siswa_id]?.kelas_id || siswa.kelas_id}
                              onChange={(_, value) => setEditData({
                                ...editData,
                                [siswa.siswa_id]: {
                                  ...editData[siswa.siswa_id],
                                  kelas_id: value as number
                                }
                              })}
                              size="sm"
                            >
                              {kelasList.map((kelas) => (
                                <Option key={kelas.kelas_id} value={kelas.kelas_id}>
                                  {kelas.nama_kelas}
                                </Option>
                              ))}
                            </Select>
                          ) : (
                            siswa.kelas_nama
                          )}
                        </td>
                        <td>
                          {editMode[siswa.siswa_id] ? (
                            <Input
                              value={editData[siswa.siswa_id]?.no_telepon || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                [siswa.siswa_id]: {
                                  ...editData[siswa.siswa_id],
                                  no_telepon: e.target.value
                                }
                              })}
                              size="sm"
                            />
                          ) : (
                            siswa.no_telepon
                          )}
                        </td>
                        <td>
                          {editMode[siswa.siswa_id] ? (
                            <Input
                              value={editData[siswa.siswa_id]?.email || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                [siswa.siswa_id]: {
                                  ...editData[siswa.siswa_id],
                                  email: e.target.value
                                }
                              })}
                              size="sm"
                            />
                          ) : (
                            siswa.email
                          )}
                        </td>
                        <td>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {editMode[siswa.siswa_id] ? (
                              <>
                                <IconButton
                                  size="sm"
                                  color="success"
                                  onClick={() => updateSiswa(siswa.siswa_id)}
                                  disabled={updatingId === siswa.siswa_id}
                                  loading={updatingId === siswa.siswa_id}
                                >
                                  <SaveIcon />
                                </IconButton>
                                <IconButton
                                  size="sm"
                                  color="neutral"
                                  onClick={() => cancelEdit(siswa.siswa_id)}
                                  disabled={updatingId === siswa.siswa_id}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  size="sm"
                                  color="primary"
                                  onClick={() => startEdit(siswa)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <Button
                                  size="sm"
                                  variant="outlined"
                                  onClick={() => openPasswordModal(siswa.siswa_id)}
                                >
                                  Reset Password
                                </Button>
                              </>
                            )}
                          </Box>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            onClick={fetchSiswaData}
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
              Ubah Password Siswa
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
                  disabled={updatingId === passwordModal.siswaId}
                />
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="plain" 
                  color="neutral"
                  onClick={closePasswordModal}
                  disabled={updatingId === passwordModal.siswaId}
                >
                  Batal
                </Button>
                <Button 
                  color="primary"
                  onClick={updatePassword}
                  disabled={!newPassword.trim() || updatingId === passwordModal.siswaId}
                  loading={updatingId === passwordModal.siswaId}
                >
                  Simpan
                </Button>
              </Box>
            </Stack>
          </ModalDialog>
        </Modal>
      </Box>
    </AdminLayout>
  );
};

export default AdminViewSiswa;
