import { apiClient } from '../services/config/apiConfig';

/**
 * Download file dengan authentication
 * @param fileUrl - URL file yang akan didownload (relative path seperti /uploads/tugas/file.pdf)
 * @param filename - Nama file untuk download (opsional)
 */
export const downloadFileWithAuth = async (fileUrl: string, filename?: string) => {
  try {
    console.log('🔍 Downloading file with auth:', fileUrl);
    
    // Pastikan URL dimulai dengan /uploads
    const url = fileUrl.startsWith('/uploads') ? fileUrl : `/uploads${fileUrl}`;
    
    // Request file dengan authentication header
    const response = await apiClient.get(url, {
      responseType: 'blob', // Penting untuk file download
    });

    // Buat blob URL untuk download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);

    // Buat element link untuk trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Set filename jika ada, atau extract dari URL
    if (filename) {
      link.download = filename;
    } else {
      const urlParts = fileUrl.split('/');
      link.download = urlParts[urlParts.length - 1];
    }
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    console.log('✅ File downloaded successfully');
  } catch (error) {
    console.error('❌ Error downloading file:', error);
    
    // Jika error, coba buka di tab baru sebagai fallback
    const fallbackUrl = `http://localhost:8080${fileUrl}`;
    window.open(fallbackUrl, '_blank');
  }
};

/**
 * Preview file dalam tab baru dengan authentication
 * @param fileUrl - URL file yang akan dipreview
 */
export const previewFileWithAuth = async (fileUrl: string) => {
  try {
    console.log('🔍 Previewing file with auth:', fileUrl);
    
    // Pastikan URL dimulai dengan /uploads
    const url = fileUrl.startsWith('/uploads') ? fileUrl : `/uploads${fileUrl}`;
    
    // Request file dengan authentication header
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    // Buat blob URL untuk preview
    const blob = new Blob([response.data]);
    const previewUrl = window.URL.createObjectURL(blob);
      // Buka di tab baru
    window.open(previewUrl, '_blank');
    
    // Cleanup setelah beberapa detik (biarkan browser load dulu)
    setTimeout(() => {
      window.URL.revokeObjectURL(previewUrl);
    }, 5000);
    
    console.log('✅ File opened for preview');
  } catch (error) {
    console.error('❌ Error previewing file:', error);
    
    // Jika error, coba buka di tab baru sebagai fallback
    const fallbackUrl = `http://localhost:8080${fileUrl}`;
    window.open(fallbackUrl, '_blank');
  }
};
