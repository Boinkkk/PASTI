// Common API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count: number;
}

// Backend Course Data Interface
export interface BackendCourseData {
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

// Frontend Course Data Interface
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

// Detail Absensi Data Interface
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

// Course Info Interface
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

export interface DaftarPertemuanGuruResponse {
  jadwal_id: number;
  nama_mapel: string;
  nama_kelas: string;
  hari: string;
  guru_id: number;
  waktu_mulai: string;
  waktu_selesai: string;
  ruang: string;
}

// Guru related interfaces
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
