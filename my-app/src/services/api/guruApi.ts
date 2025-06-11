import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/apiConfig';
import type { GuruProfile } from '../types';

// Function to get guru profile
export const fetchGuruProfile = async (): Promise<GuruProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GURU.PROFILE}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GURU.SISWA}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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

export const fetchGuruJadwal = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GURU.JADWAL}`, {
            headers: getAuthHeaders(),
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;

    } catch (error) {
        console.error('Error fetching guru jadwal:', error);
        throw error;
    }
};

export const fetchAbsensiPertemuanSiswa = async (idJadwal: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GURU.ABSENSI_PERTEMUAN_SISWA}`, {
            params: { jadwal_id: idJadwal },
            headers: getAuthHeaders(),
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;

    } catch (error) {
        console.error('Error fetching absensi pertemuan siswa:', error);
        throw error;
    }
}

export const fetchDetailAbsensi = async (idPertemuan: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GURU.DETAIL_ABSENSI}?`, {
            params: { id_pertemuan: idPertemuan },
            headers: getAuthHeaders(),
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;

    } catch (error) {
        console.error('Error fetching detail absensi:', error);
        throw error;
    }
}

// Function to update pertemuan status (active/inactive)
export const updateStatusPertemuan = async (pertemuanId: number, isActive: boolean) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/guru/pertemuan/${pertemuanId}/status`,
            { is_active: isActive },
            { headers: getAuthHeaders() }
        );

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = response.data;
        
        if (result.status === "succes" || result.message.includes("berhasil")) {
            return result.data;
        } else {
            throw new Error(result.message || 'Gagal mengubah status pertemuan');
        }
    } catch (error) {
        console.error('Error updating pertemuan status:', error);
        throw error;
    }
};

// Function to update absensi status
export const updateAbsensiStatus = async (absensiId: number, status: string) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/guru/absensi/${absensiId}/status`,
            { status_kehadiran: status },
            { headers: getAuthHeaders() }
        );

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = response.data;
        
        if (result.status === "succes" || result.message.includes("berhasil")) {
            return result.data;
        } else {
            throw new Error(result.message || 'Gagal mengubah status absensi');
        }
    } catch (error) {
        console.error('Error updating absensi status:', error);
        throw error;
    }
};

// Function to create manual absensi
export const createManualAbsensi = async (idPertemuan: number, idSiswa: number, statusKehadiran: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/guru/absensi/manual`,
            { 
                id_pertemuan: idPertemuan,
                id_siswa: idSiswa,
                status_kehadiran: statusKehadiran 
            },
            { headers: getAuthHeaders() }
        );

        if (response.status !== 201) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = response.data;
        
        if (result.status === "succes" || result.message.includes("berhasil")) {
            return result.data;
        } else {
            throw new Error(result.message || 'Gagal membuat absensi manual');
        }
    } catch (error) {
        console.error('Error creating manual absensi:', error);
        throw error;
    }
};
