import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, Button, Table, Alert,
  IconButton, Input, FormControl, FormLabel, Chip, Modal, ModalDialog, Stack,
  Select, Option, Divider
} from '@mui/joy';
import { 
  Logout as LogoutIcon, 
  People as PeopleIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon
} from '@mui/icons-material';
import axios from 'axios';

interface SiswaData {
  siswa_id: number;
  nis: string;
  nama: string;
  kelas: string;
  kelas_id: number;
  no_telepon: string;
  email: string;
  created_at: string;
}

interface EditSiswaData {
  siswa_id: number;
  nis: string;
  nama: string;
  kelas_id: number;
  no_telepon: string;
}

interface KelasOption {
  kelas_id: number;
  nama_kelas: string;
}

const AdminViewSiswa: React.FC = () => {
  const navigate = useNavigate();
  const [siswaList, setSiswaList] = useState<SiswaData[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<SiswaData[]>([]);
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
  const [kelasList, setKelasList] = useState<KelasOption[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
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
    fetchKelasList();
  }, [navigate]);

  // Filter siswa based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSiswa(siswaList);
    } else {
      const filtered = siswaList.filter(siswa => 
        siswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        siswa.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        siswa.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
        siswa.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };
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
          'Authorization': token,
        }
      });

      if (response.data.status === 'success') {
        setSiswaList(response.data.data);
        setFilteredSiswa(response.data.data);
        setMessage(`Berhasil memuat ${response.data.data.length} data siswa`);
        setMessageType('success');
      } else {
        setMessage(response.data.message || 'Gagal memuat data siswa');
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

  const fetchKelasList = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Assuming there's an endpoint to get kelas list
      const response = await axios.get('http://localhost:8080/api/kelas', {
        headers: {
          'Authorization': token,
        }
      });

      if (response.data.status === 'success') {
        setKelasList(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch kelas list:', error);
    }
  };

  const startEdit = (siswa: SiswaData) => {
    setEditMode(prev => ({ ...prev, [siswa.siswa_id]: true }));
    setEditData(prev => ({
      ...prev,
      [siswa.siswa_id]: {
        siswa_id: siswa.siswa_id,
        nis: siswa.nis,
        nama: siswa.nama,
        kelas_id: siswa.kelas_id,
        no_telepon: siswa.no_telepon || ''
      }
    }));
  };

  const cancelEdit = (siswaId: number) => {
    setEditMode(prev => ({ ...prev, [siswaId]: false }));
    setEditData(prev => {
      const newData = { ...prev };
      delete newData[siswaId];
      return newData;
    });
  };

  const updateEditData = (siswaId: number, field: keyof EditSiswaData, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: value
      }
    }));
  };

  const saveEdit = async (siswaId: number) => {
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Data Siswa
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
          Lihat Data Siswa
        </Button>
      </Box>

      {/* Search */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <FormControl>
            <FormLabel>Cari Siswa</FormLabel>
            <Input
              placeholder="Cari berdasarkan nama, NIS, kelas, atau email..."
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
      )}      {/* Stats and Pagination Info */}
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
            <Typography level="body-md" sx={{ textAlign: 'center', py: 4 }}>
              Memuat data...
            </Typography>
          ) : currentSiswa.length === 0 ? (
            <Typography level="body-md" sx={{ textAlign: 'center', py: 4 }}>
              {siswaList.length === 0 ? 'Belum ada data siswa' : 'Tidak ada siswa yang sesuai dengan pencarian'}
            </Typography>
          ) : (
            <Box sx={{ overflow: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>No</th>
                    <th style={{ width: '15%' }}>NIS</th>
                    <th style={{ width: '25%' }}>Nama</th>
                    <th style={{ width: '15%' }}>Kelas</th>
                    <th style={{ width: '20%' }}>No. Telepon</th>
                    <th style={{ width: '20%' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSiswa.map((siswa, index) => {
                    const actualIndex = startIndex + index + 1;
                    const isEditing = editMode[siswa.siswa_id];
                    const isUpdating = updatingId === siswa.siswa_id;
                    
                    return (
                      <tr key={siswa.siswa_id}>
                        <td>{actualIndex}</td>
                        
                        {/* NIS */}
                        <td>
                          {isEditing ? (
                            <Input
                              size="sm"
                              value={editData[siswa.siswa_id]?.nis || ''}
                              onChange={(e) => updateEditData(siswa.siswa_id, 'nis', e.target.value)}
                              disabled={isUpdating}
                            />
                          ) : (
                            <strong>{siswa.nis}</strong>
                          )}
                        </td>
                        
                        {/* Nama */}
                        <td>
                          {isEditing ? (
                            <Input
                              size="sm"
                              value={editData[siswa.siswa_id]?.nama || ''}
                              onChange={(e) => updateEditData(siswa.siswa_id, 'nama', e.target.value)}
                              disabled={isUpdating}
                            />
                          ) : (
                            siswa.nama
                          )}
                        </td>
                        
                        {/* Kelas */}
                        <td>
                          {isEditing ? (
                            <Select
                              size="sm"
                              value={editData[siswa.siswa_id]?.kelas_id}
                              onChange={(_, value) => updateEditData(siswa.siswa_id, 'kelas_id', value as number)}
                              disabled={isUpdating}
                            >
                              {kelasList.map((kelas) => (
                                <Option key={kelas.kelas_id} value={kelas.kelas_id}>
                                  {kelas.nama_kelas}
                                </Option>
                              ))}
                            </Select>
                          ) : (
                            <Chip variant="soft" color="neutral" size="sm">
                              {siswa.kelas}
                            </Chip>
                          )}
                        </td>
                        
                        {/* No Telepon */}
                        <td>
                          {isEditing ? (
                            <Input
                              size="sm"
                              value={editData[siswa.siswa_id]?.no_telepon || ''}
                              onChange={(e) => updateEditData(siswa.siswa_id, 'no_telepon', e.target.value)}
                              disabled={isUpdating}
                            />
                          ) : (
                            siswa.no_telepon || 'N/A'
                          )}
                        </td>
                        
                        {/* Actions */}
                        <td>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {isEditing ? (
                              <>
                                <IconButton 
                                  size="sm"
                                  color="success"
                                  variant="soft"
                                  onClick={() => saveEdit(siswa.siswa_id)}
                                  disabled={isUpdating}
                                  loading={isUpdating}
                                >
                                  <SaveIcon />
                                </IconButton>
                                <IconButton 
                                  size="sm"
                                  color="neutral"
                                  variant="soft"
                                  onClick={() => cancelEdit(siswa.siswa_id)}
                                  disabled={isUpdating}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </>
                            ) : (
                              <IconButton 
                                size="sm"
                                color="primary"
                                variant="soft"
                                onClick={() => startEdit(siswa)}
                              >
                                <EditIcon />
                              </IconButton>
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
          onClick={fetchSiswaData}
          loading={loading}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>
    </Box>
  );
};

export default AdminViewSiswa;
