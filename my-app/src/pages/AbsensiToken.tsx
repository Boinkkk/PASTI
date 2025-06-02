import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Middleware';

interface PertemuanData {
  id_pertemuan: number;
  id_jadwal: number;
  pertemuan_ke: number;
  tanggal: string;
  materi: string;
  token_absen: string;
  status_pertemuan: string;
  waktu_mulai_absen: string;
  waktu_selesai_absen: string;
}

interface SubmitResponse {
  success: boolean;
  message: string;
  data?: {
    absensi_id: number;
    timestamp: string;
  };
}

const AbsensiToken: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [pertemuan, setPertemuan] = useState<PertemuanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<SubmitResponse | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('Memvalidasi token...');

  useEffect(() => {
    if (!token) {
      setError('Token tidak valid dalam URL');
      setLoading(false);
      return;
    }

    if (!isAuthenticated || !user) {
      setError('Anda harus login sebagai siswa terlebih dahulu');
      setLoading(false);
      return;
    }

    // Otomatis proses absensi ketika halaman dimuat
    autoProcessAttendance();
  }, [token, user, isAuthenticated]);

  const autoProcessAttendance = async () => {
    try {
      setLoading(true);
      setProcessingStep('Memvalidasi token...');
      
      // Step 1: Validate token and get meeting data
      console.log('🔍 Validating token:', token);
      const validateResponse = await fetch(`http://localhost:8080/api/v1/absensi/token/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const validateResult = await validateResponse.json();

      if (!validateResponse.ok) {
        throw new Error(validateResult.message || 'Token tidak valid');
      }

      const pertemuanData = validateResult.data;
      setPertemuan(pertemuanData);
      console.log('✅ Token valid, pertemuan:', pertemuanData.materi);

      // Step 2: Check if student already submitted attendance
      setProcessingStep('Memeriksa status absensi...');
      console.log('📊 Checking existing attendance for siswa:', user!.siswa_id);
      const checkResponse = await fetch(
        `http://localhost:8080/api/v1/absensi/check/${pertemuanData.id_pertemuan}/${user!.siswa_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const checkResult = await checkResponse.json();
        if (checkResult.exists) {
        console.log('⚠️ Attendance already exists');
        setSuccess(true);
        setAttendanceResult({
          success: true,
          message: 'Anda sudah melakukan absensi untuk pertemuan ini sebelumnya'
        });
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        return;
      }

      // Step 3: Automatically submit attendance
      setProcessingStep('Memproses absensi...');
      console.log('📝 Auto-submitting attendance...');
      const submitResponse = await fetch('http://localhost:8080/api/v1/absensi/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          siswa_id: user!.siswa_id,
          keterangan: `Auto-absensi via link oleh ${user!.nama_lengkap}`
        }),
      });

      const submitResult = await submitResponse.json();

      if (submitResponse.ok && submitResult.success) {
        console.log('✅ Attendance submitted successfully:', submitResult.data);
        setSuccess(true);
        setAttendanceResult(submitResult);
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(submitResult.message || 'Gagal menyimpan absensi');
      }

    } catch (err) {
      console.error('❌ Auto-attendance error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses absensi');
    } finally {
      setLoading(false);
    }
  };

  // Loading screen dengan progress indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Memproses Absensi</h2>
          <p className="text-gray-600 mb-4">{processingStep}</p>
          
          {pertemuan && (
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-blue-800 mb-2">Data Pertemuan</h3>
              <div className="text-sm text-blue-700">
                <div>Pertemuan ke-{pertemuan.pertemuan_ke}</div>
                <div>Materi: {pertemuan.materi}</div>
                <div>Siswa: {user?.nama_lengkap}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error screen
  if (error && !pertemuan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Token Tidak Valid</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Success screen
  if (success && attendanceResult) {
    const isAlreadyAttended = attendanceResult.message.includes('sudah melakukan absensi');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <div className={`text-6xl mb-4 ${isAlreadyAttended ? 'text-yellow-500' : 'text-green-500'}`}>
            {isAlreadyAttended ? '⚠️' : '✅'}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isAlreadyAttended ? 'Sudah Absen' : 'Absensi Berhasil!'}
          </h2>
          <p className="text-gray-600 mb-4">
            {attendanceResult.message}
          </p>
          
          {pertemuan && (
            <div className="bg-gray-50 p-4 rounded-lg text-left mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Detail Absensi</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="font-medium">Pertemuan:</span> ke-{pertemuan.pertemuan_ke}</div>
                <div><span className="font-medium">Materi:</span> {pertemuan.materi}</div>
                <div><span className="font-medium">Tanggal:</span> {new Date(pertemuan.tanggal).toLocaleDateString('id-ID')}</div>
                <div><span className="font-medium">Siswa:</span> {user?.nama_lengkap}</div>
                {attendanceResult.data && (
                  <div><span className="font-medium">Waktu:</span> {new Date(attendanceResult.data.timestamp).toLocaleString('id-ID')}</div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Akan kembali ke dashboard dalam 3 detik...</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali Sekarang
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Error during processing
  if (error && pertemuan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Gagal Memproses Absensi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg text-left mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Informasi Pertemuan</h3>
            <div className="text-sm text-gray-600">
              <div>Pertemuan ke-{pertemuan.pertemuan_ke}</div>
              <div>Materi: {pertemuan.materi}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // This should not normally be reached
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Memproses...</p>
      </div>
    </div>
  );
};

export default AbsensiToken;
