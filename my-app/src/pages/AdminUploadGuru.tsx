import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, Button, Alert, 
  FormControl, FormLabel 
} from '@mui/joy';
import { Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

interface GuruUploadResponse {
  filename: string;
  total_records: number;
  success_count: number;
  error_count: number;
  errors: string[];
}

const AdminUploadGuru: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'danger' | 'warning'>('success');
  const [uploadResult, setUploadResult] = useState<GuruUploadResponse | null>(null);
  const [adminUsername, setAdminUsername] = useState('');

  // Check admin authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const username = localStorage.getItem('adminUsername');
    
    if (!token || !username) {
      navigate('/admin/login');
      return;
    }
    
    setAdminUsername(username);  }, [navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setMessage('File harus berformat CSV');
      setMessageType('danger');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage('File terlalu besar. Maksimal 5MB');
      setMessageType('danger');
      return;
    }

    setFile(selectedFile);
    setMessage('');
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Pilih file CSV terlebih dahulu');
      setMessageType('warning');
      return;
    }

    setUploading(true);
    setMessage('Sedang memproses upload...');
    setMessageType('success');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:8080/api/admin/upload-guru', formData, {
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success' || response.data.status === 'partial_success') {
        setUploadResult(response.data.data);
        setMessage(response.data.message);
        setMessageType(response.data.status === 'success' ? 'success' : 'warning');
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(response.data.message || 'Upload gagal');
        setMessageType('danger');
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan saat upload');
      setMessageType('danger');
    } finally {
      setUploading(false);
    }
  };
  const downloadTemplate = () => {
    const csvContent = 'nip,nama_lengkap,email,password\n197001011998021001,Dr. Ahmad Sudrajat M.Pd,ahmad.sudrajat@sekolah.ac.id,guru123\n197205152000032002,Siti Nurhaliza S.Pd,siti.nurhaliza@sekolah.ac.id,guru123';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_upload_guru.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  return (
    <AdminLayout adminUsername={adminUsername}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Typography level="h2" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
          Upload Data Guru
        </Typography>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="h4" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <UploadIcon />
              Upload File CSV Guru
            </Typography>
            
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Pilih File CSV</FormLabel>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </FormControl>
            <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
            <strong>Format CSV:</strong> nip, nama_lengkap, email, password
            <br />
            <strong>Contoh:</strong> 197001011998021001, Dr. Ahmad Sudrajat M.Pd, ahmad.sudrajat@sekolah.ac.id, guru123
            <br />
            <strong>Catatan:</strong> Password akan di-hash secara otomatis oleh sistem
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              startDecorator={<DownloadIcon />}
              variant="outlined"
              onClick={downloadTemplate}
            >
              Download Template
            </Button>
            
            <Button
              startDecorator={<UploadIcon />}
              loading={uploading}
              disabled={!file || uploading}
              onClick={handleUpload}
              color="primary"
            >
              {uploading ? 'Mengupload...' : 'Upload Data'}
            </Button>
          </Box>
          
          {file && (
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              File terpilih: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Message Alert */}
      {message && (
        <Alert color={messageType} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="h4" sx={{ mb: 2 }}>
              Hasil Upload
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
              <Typography level="body-md">
                <strong>File:</strong> {uploadResult.filename}
              </Typography>
              <Typography level="body-md">
                <strong>Total Records:</strong> {uploadResult.total_records}
              </Typography>
              <Typography level="body-md" sx={{ color: 'success.500' }}>
                <strong>Berhasil:</strong> {uploadResult.success_count}
              </Typography>
              <Typography level="body-md" sx={{ color: 'danger.500' }}>
                <strong>Gagal:</strong> {uploadResult.error_count}
              </Typography>
            </Box>
            
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Box>
                <Typography level="title-sm" sx={{ mb: 1, color: 'danger.500' }}>
                  Error Details:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  {uploadResult.errors.map((error, index) => (
                    <Typography key={index} level="body-sm" sx={{ color: 'danger.700', mb: 0.5 }}>
                      • {error}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="h4" sx={{ mb: 2 }}>
            Petunjuk Upload Data Guru
          </Typography>
          
          <Typography level="body-md" component="div">
            <ol>
              <li><strong>Download template CSV</strong> dengan mengklik tombol "Download Template"</li>              <li><strong>Isi data guru</strong> sesuai format yang disediakan:
                <ul>
                  <li><strong>nip:</strong> Nomor Induk Pegawai (wajib, unik)</li>
                  <li><strong>nama_lengkap:</strong> Nama lengkap guru (wajib)</li>
                  <li><strong>email:</strong> Email guru (wajib, format email valid)</li>
                  <li><strong>password:</strong> Password guru (wajib, akan di-hash otomatis oleh sistem)</li>
                </ul>
              </li>
              <li><strong>Simpan file</strong> dalam format CSV</li>
              <li><strong>Upload file</strong> menggunakan form di atas</li>
              <li><strong>Periksa hasil</strong> upload untuk memastikan semua data berhasil diproses</li>
            </ol>
          </Typography>        </CardContent>
      </Card>
      </Box>
    </AdminLayout>
  );
};

export default AdminUploadGuru;
