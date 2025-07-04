import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Input,
  FormControl,
  FormLabel,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/joy';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { fetchSiswaProfile, updateSiswaProfile, type UpdateProfileRequest } from '../services/api/siswaApi';

interface SiswaProfileData {
  siswa_id: number;
  nis: string;
  nama_lengkap: string;
  kelas_id: number;
  email: string;
  no_telepon: string;
  poin_motivasi: number;
  tingkat_disiplin: string;
  foto_profil: string;
  kelas?: {
    nama_kelas: string;
    jurusan: {
      nama_jurusan: string;
    };
  };
}

const SiswaProfile: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileData, setProfileData] = useState<SiswaProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Form state
  const [formData, setFormData] = useState({
    no_telepon: '',
    password: '',
    confirm_password: ''
  });

  // Load profile data when component mounts
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetchSiswaProfile();      if (response?.data) {
        setProfileData(response.data);
        setFormData({
          no_telepon: response.data.no_telepon || '',
          password: '',
          confirm_password: ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Gagal memuat data profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleUpdateProfile = async () => {
    // Validasi password jika diisi
    if (formData.password) {
      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter!');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError('Konfirmasi password tidak sesuai!');
        return;
      }
    }

    try {
      setLoading(true);
      
      const updateData: UpdateProfileRequest = {
        no_telepon: formData.no_telepon
      };

      // Tambahkan password jika diisi
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateSiswaProfile(updateData);
      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirm_password: ''
      }));
      
      // Reload profile data
      await loadProfileData();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profileData) {
      setFormData({
        no_telepon: profileData.no_telepon || '',
        password: '',
        confirm_password: ''
      });
    }
    setError(null);
  };

  // const getDisciplineColor = (tingkat: string) => {
  //   switch (tingkat) {
  //     case 'Sangat Baik': return 'success';
  //     case 'Baik': return 'primary';
  //     case 'Cukup': return 'warning';
  //     case 'Kurang': return 'danger';
  //     case 'Sangat Kurang': return 'danger';
  //     default: return 'neutral';
  //   }
  // };

  if (loading && !profileData) {
    return (      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ml: sidebarOpen ? '280px' : '60px',
          transition: 'margin 0.3s ease'
        }}>
          <CircularProgress size="lg" />
        </Box>
      </Box>
    );
  }

  return (    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '280px' : '60px',
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
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon sx={{ fontSize: 32, color: 'primary.600' }} />
            Profil Siswa
          </Typography>
          <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
            Kelola informasi profil pribadi Anda
          </Typography>
        </Box>

        {profileData && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
            {/* Profile Picture & Basic Info */}
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={profileData.foto_profil || undefined}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.100',
                    color: 'primary.600',
                    fontSize: '3rem'
                  }}
                >
                  {!profileData.foto_profil && profileData.nama_lengkap?.charAt(0).toUpperCase()}
                </Avatar>
                
                <Typography level="h4" sx={{ mb: 1 }}>
                  {profileData.nama_lengkap}
                </Typography>
                
                <Typography level="body-md" sx={{ color: 'text.secondary', mb: 2 }}>
                  NIS: {profileData.nis}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Chip
                    startDecorator={<SchoolIcon />}
                    color="primary"
                    variant="soft"
                  >
                    {profileData.kelas?.nama_kelas || 'Kelas tidak tersedia'}
                  </Chip>
                  
                  {/* <Chip
                    color={getDisciplineColor(profileData.tingkat_disiplin) as any}
                    variant="soft"
                  >
                    Disiplin: {profileData.tingkat_disiplin}
                  </Chip>
                  
                  <Chip
                    color="success"
                    variant="soft"
                  >
                    Poin: {profileData.poin_motivasi}
                  </Chip> */}
                </Box>

                {!isEditing && (
                  <Button
                    startDecorator={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    variant="outlined"
                    fullWidth
                  >
                    Edit Profil
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography level="title-lg">
                    Detail Profil
                  </Typography>
                  {isEditing && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startDecorator={<SaveIcon />}
                        onClick={handleUpdateProfile}
                        loading={loading}
                        variant="solid"
                        color="primary"
                      >
                        Simpan
                      </Button>
                      <Button
                        startDecorator={<CancelIcon />}
                        onClick={handleCancelEdit}
                        variant="outlined"
                        color="neutral"
                      >
                        Batal
                      </Button>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>                  {/* Nama Lengkap - Read only */}
                  <FormControl>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <Typography level="body-md" sx={{ p: 1.5, bgcolor: 'background.level2', borderRadius: 'sm', color: 'text.secondary' }}>
                      {profileData.nama_lengkap} (Tidak dapat diubah)
                    </Typography>
                  </FormControl>                  {/* Email - Read only */}
                  <FormControl>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <FormLabel>Email</FormLabel>
                    </Box>
                    <Typography level="body-md" sx={{ p: 1.5, bgcolor: 'background.level2', borderRadius: 'sm', color: 'text.secondary' }}>
                      {profileData.email} (Tidak dapat diubah)
                    </Typography>
                  </FormControl>

                  {/* No Telepon */}
                  <FormControl>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <FormLabel>No. Telepon</FormLabel>
                    </Box>
                    {isEditing ? (
                      <Input
                        value={formData.no_telepon}
                        onChange={(e) => handleInputChange('no_telepon', e.target.value)}
                        placeholder="Masukkan nomor telepon"
                      />
                    ) : (
                      <Typography level="body-md" sx={{ p: 1.5, bgcolor: 'background.level1', borderRadius: 'sm' }}>
                        {profileData.no_telepon || 'Belum diisi'}
                      </Typography>
                    )}
                  </FormControl>                  {/* Password - Hanya saat editing */}
                  {isEditing && (
                    <>
                      <FormControl>
                        <FormLabel>Password Baru (Opsional)</FormLabel>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Masukkan password baru (minimal 6 karakter)"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Konfirmasi Password Baru</FormLabel>
                        <Input
                          type="password"
                          value={formData.confirm_password}
                          onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                          placeholder="Ulangi password baru"
                        />
                      </FormControl>
                    </>
                  )}

                  {/* Read-only fields */}
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>NIS</FormLabel>
                    <Typography level="body-md" sx={{ p: 1.5, bgcolor: 'background.level2', borderRadius: 'sm', color: 'text.secondary' }}>
                      {profileData.nis} (Tidak dapat diubah)
                    </Typography>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Kelas</FormLabel>
                    <Typography level="body-md" sx={{ p: 1.5, bgcolor: 'background.level2', borderRadius: 'sm', color: 'text.secondary' }}>
                      {profileData.kelas?.nama_kelas || 'Belum diatur'} (Tidak dapat diubah)
                    </Typography>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SiswaProfile;
