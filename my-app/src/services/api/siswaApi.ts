import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/apiConfig';

// Function to fetch siswa profile
export const fetchSiswaProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SISWA.PROFILE}`, {
      headers: {
        Authorization: `${localStorage.getItem('token')}`,
      },
    });

    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Error fetching siswa profile:', error);
    throw error;
  }
};

// Function to fetch daftar kelas
export const fetchDaftarKelas = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SISWA.DAFTAR_PELAJARAN}`, {
      headers: {
        Authorization: `${localStorage.getItem('token')}`,
      },
    });

    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Error fetching daftar kelas:', error);
    throw error;
  }
};

// Interface for update profile request
export interface UpdateProfileRequest {
  no_telepon: string;
  password?: string;
}

// Function to update siswa profile
export const updateSiswaProfile = async (data: UpdateProfileRequest) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/profile`, data, {
      headers: {
        Authorization: `${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating siswa profile:', error);
    throw error;
  }
};


