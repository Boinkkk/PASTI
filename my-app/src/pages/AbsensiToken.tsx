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

  console.log("Token Absensi:", token_absensi);

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

      console.log("test")

      console.log('Token Absensi:', token_absensi);

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
  };  // Tampilan loading
  if (loading) {
    return (      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 text-center max-w-lg w-full fade-in">
          {/* Loading Animation */}
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl">📋</div>
            </div>
          </div>
          
          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Memproses Absensi</h2>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-gray-600 mb-6 text-lg">{processingStep}</p>
          
          {pertemuan && (
            <div className="bg-blue-50 p-6 rounded-lg text-left border border-blue-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">📚</span>
                </div>
                <h3 className="font-bold text-blue-800 text-lg">Data Pertemuan</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {pertemuan.pertemuan_ke}
                  </span>
                  <span className="text-blue-700 font-medium">Pertemuan ke-{pertemuan.pertemuan_ke}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 text-xs">
                    📖
                  </span>
                  <span className="text-blue-700"><span className="font-medium">Materi:</span> {pertemuan.materi}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }  // Tampilan error
  if (error && !pertemuan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 text-center max-w-lg w-full slide-up">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-4xl">⚠️</span>
            </div>
          </div>
          
          {/* Error Content */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Token Tidak Valid</h2>
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          
          {/* Action Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-colors duration-200"
          >
            <span className="mr-2">🏠</span>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }  // Tampilan sukses
  if (success && attendanceResult) {
    const isAlreadyAttended = attendanceResult.message.toLowerCase().includes('sudah');

    return (
      <div className={`min-h-screen ${isAlreadyAttended ? 'bg-gradient-to-br from-yellow-50 to-orange-100' : 'bg-gradient-to-br from-green-50 to-emerald-100'} flex items-center justify-center p-4`}>
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 text-center max-w-lg w-full">
          {/* Success Icon */}
          <div className="mb-6">
            <div className={`w-20 h-20 ${isAlreadyAttended ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className={`${isAlreadyAttended ? 'text-yellow-500' : 'text-green-500'} text-4xl`}>
                {isAlreadyAttended ? '⚠️' : '✅'}
              </span>
            </div>
          </div>
          
          {/* Success Content */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {isAlreadyAttended ? 'Sudah Absen Sebelumnya' : 'Absensi Berhasil!'}
          </h2>
          <div className={`${isAlreadyAttended ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'} border rounded-lg p-4 mb-6`}>
            <p className={`${isAlreadyAttended ? 'text-yellow-700' : 'text-green-700'} font-medium`}>
              {attendanceResult.message}
            </p>
          </div>

          {pertemuan && (
            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg text-left mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📝</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Detail Absensi</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Pertemuan</span>
                  <span className="text-gray-800 font-bold">ke-{pertemuan.pertemuan_ke}</span>
                </div>
                <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Materi</span>
                  <span className="text-gray-800 font-bold text-right">{pertemuan.materi}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Tanggal</span>
                  <span className="text-gray-800 font-bold">{new Date(pertemuan.tanggal).toLocaleDateString('id-ID')}</span>
                </div>
                {attendanceResult.data && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-gray-600 font-medium">Waktu Absen</span>
                      <span className="text-gray-800 font-bold">{new Date(attendanceResult.data.waktu_absen).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-gray-600 font-medium">Status</span>
                      <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                        attendanceResult.data.status === 'Hadir' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attendanceResult.data.status}
                      </span>
                    </div>
                    <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-gray-600 font-medium">Mata Pelajaran</span>
                      <span className="text-gray-800 font-bold text-right">{attendanceResult.data.pertemuan.jadwal.mapel.nama_mapel}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Countdown & Action */}
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
              <span>🕐</span>
              <span className="text-sm font-medium">Akan kembali ke dashboard dalam 3 detik...</span>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg w-full transition-colors duration-200"
          >
            <span className="mr-2">🏠</span>
            Kembali Sekarang
          </button>
        </div>
      </div>
    );
  }  // Tampilan error saat pertemuan diketahui
  if (error && pertemuan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 text-center max-w-lg w-full">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-4xl">❌</span>
            </div>
          </div>
          
          {/* Error Content */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Gagal Memproses Absensi</h2>
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>

          {/* Meeting Info */}
          <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg text-left mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">ℹ️</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Informasi Pertemuan</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-600 font-medium">Pertemuan</span>
                <span className="text-gray-800 font-bold">ke-{pertemuan.pertemuan_ke}</span>
              </div>
              <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-600 font-medium">Materi</span>
                <span className="text-gray-800 font-bold text-right">{pertemuan.materi}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg w-full transition-colors duration-200"
            >
              <span className="mr-2">🔄</span>
              Coba Lagi
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg w-full transition-colors duration-200"
            >
              <span className="mr-2">🏠</span>
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }  // Default: tidak seharusnya sampai sini
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 text-center max-w-md w-full">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Memproses...</h3>
        <p className="text-gray-600">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
};

export default AbsensiToken;
