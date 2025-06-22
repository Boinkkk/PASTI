import { API_BASE_URL, API_ENDPOINTS, getAdminAuthHeaders} from '../config/apiConfig';

// Types for Admin API
export interface GuruData {
  guru_id: number;
  nip: string;
  nama_lengkap: string;
  email: string;
  created_at: string;
}

export interface EditGuruData {
  guru_id: number;
  nip: string;
  nama_lengkap: string;
  email: string;
}

export interface SiswaData {
  siswa_id: number;
  nis: string;
  nama: string; // Backend returns 'nama', not 'nama_lengkap'
  email: string;
  kelas_id: number;
  kelas: string; // Backend returns 'kelas', not 'kelas_nama'
  no_telepon: string;
  created_at: string;
}

export interface KelasData {
  kelas_id: number;
  nama_kelas: string;
  jurusan: string;
  created_at: string;
}

export interface AdminApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Admin Guru Management
export const fetchAllGuru = async (): Promise<AdminApiResponse<GuruData[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.GURU}`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal memuat data guru');
    }

    return result;
  } catch (error) {
    console.error('Error fetching guru data:', error);
    throw error;
  }
};

export const updateGuru = async (guruId: number, data: EditGuruData): Promise<AdminApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.GURU}/${guruId}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal mengupdate data guru');
    }

    return result;
  } catch (error) {
    console.error('Error updating guru:', error);
    throw error;
  }
};

export const updateGuruPassword = async (guruId: number, password: string): Promise<AdminApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.GURU}/${guruId}/password`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal mengupdate password guru');
    }

    return result;
  } catch (error) {
    console.error('Error updating guru password:', error);
    throw error;
  }
};

// Admin Kelas Management
export const fetchAllKelas = async (): Promise<AdminApiResponse<KelasData[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.KELAS}`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal memuat data kelas');
    }

    return result;
  } catch (error) {
    console.error('Error fetching kelas data:', error);
    throw error;
  }
};

// Admin Siswa Management
export const fetchAllSiswa = async (): Promise<AdminApiResponse<SiswaData[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SISWA}`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal memuat data siswa');
    }

    return result;
  } catch (error) {
    console.error('Error fetching siswa data:', error);
    throw error;
  }
};

export const updateSiswa = async (siswaId: number, data: any): Promise<AdminApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SISWA}/${siswaId}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal mengupdate data siswa');
    }

    return result;
  } catch (error) {
    console.error('Error updating siswa:', error);
    throw error;
  }
};

export const updateSiswaPassword = async (siswaId: number, password: string): Promise<AdminApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SISWA}/${siswaId}/password`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal mengupdate password siswa');
    }

    return result;
  } catch (error) {
    console.error('Error updating siswa password:', error);
    throw error;
  }
};

// Upload functions
export const uploadGuru = async (formData: FormData): Promise<AdminApiResponse<any>> => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Invalid Admin Token');

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.GURU}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        // Don't set Content-Type for FormData - browser will set it automatically
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal upload data guru');
    }

    return result;
  } catch (error) {
    console.error('Error uploading guru:', error);
    throw error;
  }
};

export const uploadSiswa = async (formData: FormData): Promise<AdminApiResponse<any>> => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Invalid Admin Token');

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SISWA}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        // Don't set Content-Type for FormData - browser will set it automatically
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal upload data siswa');
    }

    return result;
  } catch (error) {
    console.error('Error uploading siswa:', error);
    throw error;
  }
};
