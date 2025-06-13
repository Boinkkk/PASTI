import { apiClient, API_ENDPOINTS } from '../config/apiConfig';

export interface TugasData {
  tugas_id: number;
  jadwal_id: number;
  judul_tugas: string;
  deskripsi_tugas: string;
  file_tugas_guru?: string;
  tanggal_dibuat: string;
  deadline_pengumpulan: string;
  poin_maksimal: number;
  tipe_tugas: 'Individu' | 'Kelompok';
  created_at: string;
  updated_at: string;
  jadwal_pelajaran?: {
    jadwal_id: number;
    kelas_id: number;
    mapel_id: number;
    guru_id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruang: string;
    created_at: string;
    updated_at: string;
    kelas: {
      kelas_id: number;
      nama_kelas: string;
      wali_kelas_id: number | null;
      id_jurusan: number;
      created_at: string;
      updated_at: string;
      jurusan: {
        id_jurusan: number;
        nama_jurusan: string;
      };
    };
    mata_pelajaran: {
      mapel_id: number;
      kode_mapel: string;
      nama_mapel: string;
      deskripsi: string;
      created_at: string;
      updated_at: string;
    };
    guru: {
      guru_id: number;
      nip: string;
      nama_lengkap: string;
      email: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface CreateTugasRequest {
  jadwal_id: number;
  judul_tugas: string;
  deskripsi_tugas: string;
  deadline_pengumpulan: string;
  poin_maksimal: number;
  tipe_tugas: 'Individu' | 'Kelompok';
  file_tugas_guru?: string;
}

export interface UpdateTugasRequest {
  judul_tugas?: string;
  deskripsi_tugas?: string;
  deadline_pengumpulan?: string;
  poin_maksimal?: number;
  tipe_tugas?: 'Individu' | 'Kelompok';
  file_tugas_guru?: string;
}

export interface PengumpulanTugas {
  pengumpulan_id?: number;
  tugas_id: number;
  siswa_id: number;
  file_jawaban_siswa?: string;
  catatan_siswa?: string;
  tanggal_pengumpulan?: string;
  nilai?: number;
  catatan_guru?: string;
  status_pengumpulan: 'Belum Mengerjakan' | 'Mengerjakan' | 'Terlambat' | 'Dinilai';
  poin_didapat: number;
  has_submitted: boolean;
  nis: string;
  nama_lengkap: string;
  email: string;
}

// Fetch all tugas for guru
export const fetchTugasGuru = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.GURU.TUGAS);
    return response.data;
  } catch (error) {
    console.error('Error fetching tugas guru:', error);
    throw error;
  }
};

// Fetch tugas by jadwal_id
export const fetchTugasByJadwal = async (jadwalId: number) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.GURU.TUGAS}/jadwal/${jadwalId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tugas by jadwal:', error);
    throw error;
  }
};

// Create new tugas
export const createTugas = async (data: CreateTugasRequest) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.GURU.TUGAS, data);
    return response.data;
  } catch (error) {
    console.error('Error creating tugas:', error);
    throw error;
  }
};

// Update tugas
export const updateTugas = async (tugasId: number, data: UpdateTugasRequest) => {
  try {
    const response = await apiClient.put(`${API_ENDPOINTS.GURU.TUGAS}/${tugasId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating tugas:', error);
    throw error;
  }
};

// Delete tugas
export const deleteTugas = async (tugasId: number) => {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.GURU.TUGAS}/${tugasId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting tugas:', error);
    throw error;
  }
};

// Get tugas detail with submissions
export const fetchTugasDetail = async (tugasId: number) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.GURU.TUGAS}/${tugasId}/detail`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tugas detail:', error);
    throw error;
  }
};

// Get pengumpulan tugas by tugas_id
export const fetchPengumpulanByTugas = async (tugasId: number) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.GURU.TUGAS}/${tugasId}/pengumpulan`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pengumpulan tugas:', error);
    throw error;
  }
};

// Update student points for a submission
export const updateStudentPoints = async (pengumpulanId: number, poinDidapat: number, catatanGuru?: string) => {
  try {
    const response = await apiClient.put(`${API_ENDPOINTS.GURU.TUGAS}/pengumpulan/${pengumpulanId}/poin`, {
      poin_didapat: poinDidapat,
      catatan_guru: catatanGuru,
      status_pengumpulan: 'Dinilai'
    });
    return response.data;
  } catch (error) {
    console.error('Error updating student points:', error);
    throw error;
  }
};
