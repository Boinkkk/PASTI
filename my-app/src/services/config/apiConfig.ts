// API Configuration
import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_SISWA: '/auth/login',
    LOGIN_GURU: '/auth/login-guru',
    REGISTER_GURU: '/auth/register-guru',
  },  SISWA: {
    PROFILE: '/users/me',
    DAFTAR_PELAJARAN: '/absensi/daftarPelajaran',
    TUGAS: '/users/tugas',
  },
  GURU: {
    PROFILE: '/guru/profile',
    SISWA: '/guru/siswa',
    JADWAL: '/guru/jadwalMengajar',
    ABSENSI_PERTEMUAN_SISWA: '/guru/pertemuan',
    DETAIL_ABSENSI: '/guru/absensi',
    TUGAS: '/guru/tugas',
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

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include auth headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    
    // JANGAN set Content-Type untuk FormData (file uploads)
    // Browser akan otomatis set multipart/form-data dengan boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
