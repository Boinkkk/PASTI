import { apiClient, API_ENDPOINTS } from '../config/apiConfig';

export interface TugasSiswaData {
  tugas_id: number;
  jadwal_id: number;
  judul_tugas: string;
  deskripsi_tugas: string;
  file_tugas_guru?: string;
  tanggal_dibuat?: string;
  deadline_pengumpulan: string;
  poin_maksimal: number;
  tipe_tugas: 'Individu' | 'Kelompok';
  status_pengumpulan: 'Belum Mengerjakan' | 'Mengerjakan' | 'Terlambat' | 'Dinilai';
  file_jawaban_siswa?: string;
  catatan_siswa?: string;
  tanggal_pengumpulan?: string;
  nilai?: number;
  catatan_guru?: string;
  poin_didapat: number;

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
    console.log('🔍 Frontend - Uploading file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    // JANGAN set Content-Type manual untuk multipart/form-data!
    // Browser akan otomatis set dengan boundary yang benar
    const response = await apiClient.post('/upload/tugas', formData);

    console.log('🔍 Frontend - Upload response:', response.data);
    console.log('   - URL:', response.data.data?.url);
    console.log('   - Filename:', response.data.data?.filename);

    return response.data.data || response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
