import { apiClient, API_ENDPOINTS } from '../config/apiConfig';

export interface TugasSiswaData {
  tugas_id: number;
  jadwal_id: number;
  judul_tugas: string;
  deskripsi_tugas: string;
  file_tugas_guru?: string;
  tanggal_dibuat: string;
  deadline_pengumpulan: string;
  poin_maksimal: number;
  tipe_tugas: 'Individu' | 'Kelompok';
  jadwal_pelajaran?: {
    jadwal_id: number;
    nama_mapel: string;
    nama_kelas: string;
    hari: string;
    waktu_mulai: string;
    waktu_selesai: string;
    ruang: string;
  };
  status_pengumpulan: 'Belum Mengerjakan' | 'Mengerjakan' | 'Terlambat' | 'Dinilai';
  file_jawaban_siswa?: string;
  catatan_siswa?: string;
  tanggal_pengumpulan?: string;
  nilai?: number;
  catatan_guru?: string;
  poin_didapat: number;
}

export interface SubmitTugasRequest {
  file_jawaban_siswa?: string;
  catatan_siswa?: string;
}

export interface PengumpulanDetail {
  pengumpulan_id: number;
  tugas_id: number;
  siswa_id: number;
  file_jawaban_siswa?: string;
  catatan_siswa?: string;
  tanggal_pengumpulan: string;
  nilai?: number;
  catatan_guru?: string;
  status_pengumpulan: 'Belum Mengerjakan' | 'Mengerjakan' | 'Terlambat' | 'Dinilai';
  poin_didapat: number;
  tugas?: {
    tugas_id: number;
    judul_tugas: string;
    deskripsi_tugas: string;
    deadline_pengumpulan: string;
    poin_maksimal: number;
    tipe_tugas: string;
  };
}

// Fetch all tugas for siswa (berdasarkan kelas)
export const fetchTugasSiswa = async (): Promise<TugasSiswaData[]> => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.SISWA.TUGAS}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tugas siswa:', error);
    throw error;
  }
};

// Submit or update tugas
export const submitTugas = async (tugasId: number, data: SubmitTugasRequest) => {
  try {
    const response = await apiClient.post(`${API_ENDPOINTS.SISWA.TUGAS}/${tugasId}/submit`, data);
    return response.data;
  } catch (error) {
    console.error('Error submitting tugas:', error);
    throw error;
  }
};

// Get detail pengumpulan tugas
export const fetchDetailPengumpulan = async (tugasId: number): Promise<PengumpulanDetail> => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.SISWA.TUGAS}/${tugasId}/detail`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching detail pengumpulan:', error);
    throw error;
  }
};

// Delete pengumpulan tugas
export const deletePengumpulan = async (tugasId: number) => {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.SISWA.TUGAS}/${tugasId}/submit`);
    return response.data;
  } catch (error) {
    console.error('Error deleting pengumpulan:', error);
    throw error;
  }
};

// Upload file function
export const uploadFile = async (file: File): Promise<{ url: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/tugas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
