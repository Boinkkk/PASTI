// API Configuration
export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_SISWA: '/auth/login',
    LOGIN_GURU: '/auth/login-guru',
    REGISTER_GURU: '/auth/register-guru',
  },
  SISWA: {
    PROFILE: '/users/me',
    DAFTAR_PELAJARAN: '/absensi/daftarPelajaran',
  },
  GURU: {
    PROFILE: '/guru/profile',
    SISWA: '/guru/siswa',
    JADWAL: '/guru/jadwalMengajar',
    ABSENSI_PERTEMUAN_SISWA: '/guru/pertemuan',
    DETAIL_ABSENSI: '/guru/absensi',
  },
  ABSENSI: {
    DAFTAR_PERTEMUAN: '/absensi/daftarPertemuan',
  },
} as const;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Invalid Token');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `${token}`,
  };
};

export const getBasicHeaders = () => ({
  'Content-Type': 'application/json',
});
