import { API_BASE_URL, API_ENDPOINTS, getBasicHeaders } from '../config/apiConfig';
import type { LoginGuruRequest, LoginGuruResponse, RegisterGuruRequest, RegisterGuruResponse } from '../types';

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
