
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

// New interfaces for the updated API response
export interface PertemuanItem {
  id_pertemuan: number;
  pertemuan_ke: number;
  tanggal_pertemuan: string;
  materi_pertemuan: string;
  token_absen: string;
  status_kehadiran: string;
  waktu_absen?: string;
  id_absensi?: number;
}

export interface MapelInfo {
  id_jadwal_pelajaran: number;
  nama_mapel: string;
  nama_kelas: string;
  nama_guru: string;
  nip_guru: string;
}

export interface PertemuanResponse {
  mapel: MapelInfo;
  pertemuan: PertemuanItem[];
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



// Function to get detail absensi by jadwal ID (updated for new API structure)
export const getDetailAbsensiByJadwalID = async (jadwalID: number): Promise<DetailAbsensiData[]> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Invalid Token");

    const response = await fetch(`http://localhost:8080/api/absensi/daftarPertemuan?id_jadwal_pelajaran=${jadwalID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }


    const result = await response.json();

    console.log("result", result.data)
    
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
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Invalid Token");

    const response = await fetch(`http://localhost:8080/api/absensi/daftarPertemuan?id_jadwal_pelajaran=${jadwalID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
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

import axios from "axios";

export const fetchSiswaProfile = async () => {
  const token = localStorage.getItem("token")
  console.log(token)

  if (!token) throw new Error("Invalid Token")

  const response = await axios.get("http://localhost:8080/api/users/me", {
    headers:{
      Authorization: `${token}`
    }
  })

  console.log(response)

  return response.data
}

export const fetchDaftarKelas = async () => {
  const token = localStorage.getItem("token")
  console.log(token)

  if (!token) throw new Error("Invalid Token")

  const response = await axios.get("http://localhost:8080/api/absensi/daftarPelajaran", {
    headers:{
      Authorization: `${token}`
    }
  })

  console.log(response)

  return response.data
}

// Guru related interfaces and functions
export interface GuruProfile {
  guru_id: number;
  nip: string;
  nama_lengkap: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface LoginGuruRequest {
  nip: string;
  password: string;
}

export interface LoginGuruResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: GuruProfile;
  };
}

// Interface for guru registration
export interface RegisterGuruRequest {
  nip: string;
  nama_lengkap: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterGuruResponse {
  status: string;
  message: string;
  data?: any;
}

// Function to login guru
export const loginGuru = async (credentials: LoginGuruRequest): Promise<LoginGuruResponse> => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login-guru', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login guru gagal');
    }

    return result;
  } catch (error) {
    console.error('Error during guru login:', error);
    throw error;
  }
};

// Function to register guru
export const registerGuru = async (guruData: RegisterGuruRequest): Promise<RegisterGuruResponse> => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/register-guru', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guruData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registrasi guru gagal');
    }

    return result;
  } catch (error) {
    console.error('Error during guru registration:', error);
    throw error;
  }
};

// Function to get guru profile
export const fetchGuruProfile = async (): Promise<GuruProfile> => {
  const token = localStorage.getItem("token");
  
  if (!token) throw new Error("Invalid Token");

  try {
    const response = await fetch("http://localhost:8080/api/guru/profile", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === "succes" || result.message.includes("berhasil")) {
      return result.data;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching guru profile:', error);
    throw error;
  }
};

// Function to get all siswa (for guru)
export const fetchAllSiswa = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) throw new Error("Invalid Token");

  try {
    const response = await fetch("http://localhost:8080/api/guru/siswa", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === "succes" || result.message.includes("berhasil")) {
      return result.data;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching all siswa:', error);
    throw error;
  }
};
