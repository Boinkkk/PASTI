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
