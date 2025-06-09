import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface Mapel {
  id_mapel: number;
  nama_mapel: string;
}

interface Jadwal {
  id_jadwal: number;
  id_mapel: number;
  mapel: Mapel;
}

interface Jurusan {
  id_jurusan: number;
  nama_jurusan: string;
}

interface Kelas {
  kelas_id: number;
  nama_kelas: string;
  wali_kelas_id: number | null;
  id_jurusan: number;
  created_at: string;
  updated_at: string;
  jurusan: Jurusan;
}

interface Siswa {
  siswa_id: number;
  nis: string;
  nama_lengkap: string;
  kelas_id: number;
  email: string;
  no_telepon: string;
  poin_motivasi: number;
  tingkat_disiplin: string;
  foto_profil: string;
  created_at: string;
  updated_at: string;
  kelas: Kelas;
}

interface PertemuanData {
  id_pertemuan: number;
  id_jadwal: number;
  pertemuan_ke: number;
  token_absen: string;
  tanggal: string;
  materi: string;
  jadwal: Jadwal;
}

interface AbsensiData {
  id_absensi: number;
  id_pertemuan: number;
  id_siswa: number;
  waktu_absen: string;
  status: string;
  keterangan: string;
  pertemuan: PertemuanData;
  siswa: Siswa;
}

interface SubmitResponse {
  status: string;
  message: string;
  data?: AbsensiData;
}

const AbsensiToken: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token_absensi = searchParams.get('token');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [pertemuan, setPertemuan] = useState<PertemuanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<SubmitResponse | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('Memvalidasi token...');

  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;

    if (!token_absensi) {
      setError('Token tidak valid dalam URL');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Anda harus login sebagai siswa terlebih dahulu');
      setLoading(false);
      return;
    }

    hasProcessedRef.current = true;
    autoProcessAttendance();
  }, [token_absensi, token]);

  const autoProcessAttendance = async () => {
    try {
      setLoading(true);
      setProcessingStep('Memvalidasi token...');

      const response = await fetch(`http://localhost:8080/api/absensi/${token_absensi}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
      });

      const result: SubmitResponse = await response.json();

      if (response.ok && result.status === 'succes') {
        const absensiData = result.data as AbsensiData;

        const pertemuanData: PertemuanData = {
          id_pertemuan: absensiData.id_pertemuan,
          id_jadwal: absensiData.pertemuan.id_jadwal,
          pertemuan_ke: absensiData.pertemuan.pertemuan_ke,
          token_absen: token_absensi!,
          tanggal: absensiData.pertemuan.tanggal,
          materi: absensiData.pertemuan.materi,
          jadwal: absensiData.pertemuan.jadwal
        };

        setPertemuan(pertemuanData);
        setSuccess(true);
        setAttendanceResult(result);

        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        return;
      }

      throw new Error(result.message || 'Gagal memproses absensi');

    } catch (err) {
      console.error('❌ Auto-attendance error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses absensi');
    } finally {
      setLoading(false);
    }
  };

  // Tampilan loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Memproses Absensi</h2>
          <p className="text-gray-600 mb-4">{processingStep}</p>
          {pertemuan && (
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-blue-800 mb-2">Data Pertemuan</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Pertemuan ke-{pertemuan.pertemuan_ke}</div>
                <div>Materi: {pertemuan.materi}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tampilan error
  if (error && !pertemuan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Token Tidak Valid</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Tampilan sukses
  if (success && attendanceResult) {
    const isAlreadyAttended = attendanceResult.message.toLowerCase().includes('sudah');

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md w-full">
          <div className={`text-6xl mb-4 ${isAlreadyAttended ? 'text-yellow-500' : 'text-green-500'}`}>
            {isAlreadyAttended ? '⚠️' : '✅'}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isAlreadyAttended ? 'Sudah Absen' : 'Absensi Berhasil!'}
          </h2>
          <p className="text-gray-600 mb-4">{attendanceResult.message}</p>

          {pertemuan && (
            <div className="bg-gray-50 p-4 rounded-lg text-left mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Detail Absensi</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="font-medium">Pertemuan:</span> ke-{pertemuan.pertemuan_ke}</div>
                <div><span className="font-medium">Materi:</span> {pertemuan.materi}</div>
                <div><span className="font-medium">Tanggal:</span> {new Date(pertemuan.tanggal).toLocaleDateString('id-ID')}</div>
                {attendanceResult.data && (
                  <>
                    <div><span className="font-medium">Waktu Absen:</span> {new Date(attendanceResult.data.waktu_absen).toLocaleString('id-ID')}</div>
                    <div><span className="font-medium">Status:</span> {attendanceResult.data.status}</div>
                    <div><span className="font-medium">Mata Pelajaran:</span> {attendanceResult.data.pertemuan.jadwal.mapel.nama_mapel}</div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 mb-2">Akan kembali ke dashboard dalam 3 detik...</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Kembali Sekarang
          </button>
        </div>
      </div>
    );
  }

  // Tampilan error saat pertemuan diketahui
  if (error && pertemuan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Gagal Memproses Absensi</h2>
          <p className="text-gray-600 mb-4">{error}</p>

          <div className="bg-gray-50 p-4 rounded-lg text-left mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Informasi Pertemuan</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Pertemuan ke-{pertemuan.pertemuan_ke}</div>
              <div>Materi: {pertemuan.materi}</div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-2"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: tidak seharusnya sampai sini
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p>Memproses...</p>
      </div>
    </div>
  );
};

export default AbsensiToken;
