// API service for handling backend calls
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Interface for backend response
interface BackendCourseData {
  id: string;
  title: string;
  class: string;
  semester: string;
  teacher: {
    name: string;
    nip: string;
  };
  absensi_count: number;
}

export interface CourseData {
  id: string;
  title: string;
  class: string;
  semester: string;
  teacher: {
    name: string;
    nip: string;
    avatar?: string;
  };
  absensiCount: number; // Changed from absensi_count to match frontend
}

// Interface for detail absensi data
export interface DetailAbsensiData {
  id_jadwal_pelajaran: number;
  nama_mapel: string;
  nama_kelas: string;
  guru_pengampu: string;
  nip_guru: string;
  id_pertemuan: number;
  pertemuan_ke: number;
  tanggal_pertemuan: string;
  materi_pertemuan: string;
  token_absen: string;
  status_kehadiran?: string;
  waktu_absen?: string;
  id_absensi?: number;
}

// Interface for course info
export interface CourseInfo {
  id_jadwal_pelajaran: number;
  nama_mapel: string;
  nama_kelas: string;
  guru_pengampu: string;
  nip_guru: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count: number;
}

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

// Function to get mata pelajaran by siswa ID
export const getMataPelajaranBySiswaID = async (siswaID: number): Promise<CourseData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/matapelajaran/siswa/${siswaID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<BackendCourseData[]> = await response.json();
    
    if (result.success) {
      return mapBackendToFrontend(result.data);
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching mata pelajaran:', error);
    throw error;
  }
};

// Function to get mata pelajaran by kelas ID
export const getMataPelajaranByKelasID = async (kelasID: number): Promise<CourseData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/matapelajaran/kelas/${kelasID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<BackendCourseData[]> = await response.json();
    
    if (result.success) {
      return mapBackendToFrontend(result.data);
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching mata pelajaran:', error);
    throw error;
  }
};

// Function to get current user info (siswa ID, kelas ID, etc.)
export const getCurrentUser = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Function to get detail absensi by jadwal ID
export const getDetailAbsensiByJadwalID = async (jadwalID: number, siswaID?: number): Promise<DetailAbsensiData[]> => {
  try {
    let url = `${API_BASE_URL}/detail-absensi/jadwal/${jadwalID}`;
    if (siswaID) {
      url += `?siswa_id=${siswaID}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<DetailAbsensiData[]> = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching detail absensi:', error);
    throw error;
  }
};

// Function to get course info by jadwal ID
export const getCourseInfoByJadwalID = async (jadwalID: number): Promise<CourseInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/detail-absensi/course-info/${jadwalID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<CourseInfo> = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching course info:', error);
    throw error;
  }
};
