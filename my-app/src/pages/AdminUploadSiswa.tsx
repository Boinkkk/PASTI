import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

interface SiswaRegister {
  nis: string;
  nama_lengkap: string;
  email: string;
  kelas_id: number;
  no_telepon: string;
  password: string;
  confirm_password: string;
}

const BulkRegister: React.FC = () => {
  const [csvData, setCsvData] = useState<SiswaRegister[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const data: SiswaRegister[] = results.data.map((row: any) => ({
          nis: row.nis,
          nama_lengkap: row.nama_lengkap,
          email: row.email,
          kelas_id: parseInt(row.kelas_id),
          no_telepon: row.no_telepon,
          password: row.password,
          confirm_password: row.confirm_password,
        }));
        setCsvData(data);
        setMessage(`Berhasil memuat ${data.length} data dari CSV`);
      },
      error: function (error) {
        setMessage(`Gagal memuat file: ${error.message}`);
      },
    });
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      for (const siswa of csvData) {
        await axios.post('http://localhost:8080/api/auth/register', siswa);
      }
      setMessage(`Semua data berhasil dikirim (${csvData.length} siswa)`);
    } catch (error: any) {
      console.error(error);
      setMessage(`Terjadi kesalahan saat mengirim data`);
    }
    setUploading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Bulk Register Siswa</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-4"
      />
      <button
        onClick={handleSubmit}
        disabled={uploading || csvData.length === 0}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {uploading ? 'Mengirim...' : 'Kirim Data'}
      </button>
      <p className="mt-4">{message}</p>
    </div>
  );
};

export default BulkRegister;
