import { API_BASE_URL, API_ENDPOINTS, getBasicHeaders } from '../config/apiConfig';
import type { LoginGuruRequest, LoginGuruResponse, RegisterGuruRequest, RegisterGuruResponse } from '../types';

// Login siswa interface
export interface LoginSiswaRequest {
  email: string;
  password: string;
}

export interface LoginSiswaResponse {
  status: string;
  message: string;
  data: string; // JWT token
}

// Function to login siswa
export const loginSiswa = async (credentials: LoginSiswaRequest): Promise<LoginSiswaResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN_SISWA}`, {
      method: 'POST',
      headers: getBasicHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login siswa gagal');
    }

    return result;
  } catch (error) {
    console.error('Error during siswa login:', error);
    throw error;
  }
};

// Function to login guru
export const loginGuru = async (credentials: LoginGuruRequest): Promise<LoginGuruResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN_GURU}`, {
      method: 'POST',
      headers: getBasicHeaders(),
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
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER_GURU}`, {
      method: 'POST',
      headers: getBasicHeaders(),
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
