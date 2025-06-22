import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { 
  Box, Card, CardContent, Typography, Button, Alert, Table, 
  FormControl, FormLabel 
} from '@mui/joy';
import { Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

interface SiswaRegister {
  nis: string;
  nama_lengkap: string;
  email: string;
  kelas_id: number;
  no_telepon: string;
  password: string;
  confirm_password: string;
}

const AdminUploadSiswa: React.FC = () => {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState<SiswaRegister[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'danger' | 'warning'>('success');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File terlalu besar. Maksimal 5MB');
      setMessageType('danger');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        if (results.errors.length > 0) {
          setMessage('Format CSV tidak valid');
          setMessageType('danger');
          return;
        }

        const data: SiswaRegister[] = results.data.map((row: any) => ({
          nis: row.nis?.trim(),
          nama_lengkap: row.nama_lengkap?.trim(),
          email: row.email?.trim(),
          kelas_id: parseInt(row.kelas_id),
          no_telepon: row.no_telepon?.trim(),
          password: row.password?.trim(),
          confirm_password: row.confirm_password?.trim(),
        }));

        // Validate required fields
        const invalidRows = data.filter(item => 
          !item.nis || !item.nama_lengkap || !item.email || 
          !item.kelas_id || !item.password
        );

        if (invalidRows.length > 0) {
          setMessage(`Ditemukan ${invalidRows.length} baris dengan data tidak lengkap`);
          setMessageType('warning');
        }

        // Limit to 50 records per batch
        if (data.length > 50) {
          setMessage('Maksimal 50 siswa per upload');
          setMessageType('warning');
          setCsvData(data.slice(0, 50));
        } else {
          setCsvData(data);
        }

        setMessage(`Berhasil memuat ${Math.min(data.length, 50)} data dari CSV`);
        setMessageType('success');
      },
      error: function (error) {
        setMessage(`Gagal memuat file: ${error.message}`);
        setMessageType('danger');
      },
    });
  };
  const handleSubmit = async () => {
    if (csvData.length === 0) return;

    setUploading(true);
    setMessage('Sedang memproses...');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const siswa of csvData) {
        try {
          await axios.post('http://localhost:8080/api/auth/register', siswa, {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          });
          successCount++;
        } catch (error: any) {
          errorCount++;
          errors.push(`${siswa.nis}: ${error.response?.data?.message || 'Gagal mendaftar'}`);
        }
        
        // Add delay to prevent overwhelming server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setMessage(`Berhasil: ${successCount}, Gagal: ${errorCount}`);
      setMessageType(errorCount > 0 ? 'warning' : 'success');
      
      if (errors.length > 0) {
        console.log('Errors:', errors);
      }
      
      setCsvData([]); // Clear data after processing
      
    } catch (error: any) {
      console.error(error);
      setMessage(`Terjadi kesalahan: ${error.message}`);
      setMessageType('danger');
    }
    setUploading(false);
  };
  return (
    <AdminLayout adminUsername={adminUsername}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Typography level="h2" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
          Upload Data Siswa
        </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography level="h4" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <UploadIcon />
            Upload File CSV
          </Typography>
            <FormControl sx={{ mb: 2 }}>
            <FormLabel>Pilih File CSV</FormLabel>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </FormControl>
          
          <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
            <strong>Format CSV:</strong> nis, nama_lengkap, email, kelas_id, no_telepon, password, confirm_password
            <br />
            <strong>Ketentuan:</strong> Maksimal 50 siswa per upload, file maksimal 5MB
          </Typography>

          {message && (
            <Alert color={messageType} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            disabled={uploading || csvData.length === 0}
            loading={uploading}
            color="primary"
            size="lg"
            startDecorator={<UploadIcon />}
          >
            {uploading ? 'Memproses...' : `Upload ${csvData.length} Siswa`}
          </Button>
        </CardContent>
      </Card>

      {csvData.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography level="h4" sx={{ mb: 2 }}>
              Preview Data ({csvData.length} siswa)
            </Typography>
            <Box sx={{ overflow: 'auto' }}>
              <Table>
                <thead>
                  <tr>
                    <th>NIS</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Kelas ID</th>
                    <th>No Telepon</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 10).map((siswa, index) => (
                    <tr key={index}>
                      <td>{siswa.nis}</td>
                      <td>{siswa.nama_lengkap}</td>
                      <td>{siswa.email}</td>
                      <td>{siswa.kelas_id}</td>
                      <td>{siswa.no_telepon}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
            {csvData.length > 10 && (
              <Typography level="body-sm" sx={{ mt: 1, color: 'text.secondary' }}>
                Menampilkan 10 dari {csvData.length} data
              </Typography>
            )}
          </CardContent>        </Card>
      )}
      </Box>
    </AdminLayout>
  );
};

export default AdminUploadSiswa;
