import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/apiConfig';
import type { 
  DetailAbsensiData, 
  CourseInfo, 
  PertemuanResponse, 
  BackendCourseData, 
  CourseData 
} from '../types';

// Helper function to convert backend data to frontend format
const mapBackendToFrontend = (backendData: BackendCourseData[]): CourseData[] => {
  return backendData.map(item => ({
    id: item.id,
    title: item.title,
    class: item.class,
    semester: item.semester,
    teacher: {
      name: item.teacher.name,
      nip: item.teacher.nip,
    },
    absensiCount: item.absensi_count,
  }));
};

// Function to get detail absensi by jadwal ID
export const getDetailAbsensiByJadwalID = async (jadwalID: number): Promise<DetailAbsensiData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ABSENSI.DAFTAR_PERTEMUAN}?id_jadwal_pelajaran=${jadwalID}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log("result", result.data);
    
    if (result.status === "succes" && result.data) {
      // Transform the new API response to match the expected format
      const { mapel, pertemuan } = result.data as PertemuanResponse;
      
      return pertemuan.map(item => ({
        id_jadwal_pelajaran: mapel.id_jadwal_pelajaran,
        nama_mapel: mapel.nama_mapel,
        nama_kelas: mapel.nama_kelas,
        guru_pengampu: mapel.nama_guru,
        nip_guru: mapel.nip_guru,
        id_pertemuan: item.id_pertemuan,
        pertemuan_ke: item.pertemuan_ke,
        tanggal_pertemuan: item.tanggal_pertemuan,
        materi_pertemuan: item.materi_pertemuan,
        token_absen: item.token_absen,
        status_kehadiran: item.status_kehadiran,
        waktu_absen: item.waktu_absen,
        id_absensi: item.id_absensi
      }));
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching detail absensi:', error);
    throw error;
  }
};

// Function to get course info by jadwal ID (updated for new API structure)
export const getCourseInfoByJadwalID = async (jadwalID: number): Promise<CourseInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ABSENSI.DAFTAR_PERTEMUAN}?id_jadwal_pelajaran=${jadwalID}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === "succes" && result.data) {
      const { mapel } = result.data as PertemuanResponse;
      
      return {
        id_jadwal_pelajaran: mapel.id_jadwal_pelajaran,
        nama_mapel: mapel.nama_mapel,
        nama_kelas: mapel.nama_kelas,
        guru_pengampu: mapel.nama_guru,
        nip_guru: mapel.nip_guru
      };
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching course info:', error);
    throw error;
  }
};

export { mapBackendToFrontend };
