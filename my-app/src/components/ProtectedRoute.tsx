import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './Middleware';
import { CircularProgress, Box } from '@mui/joy';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Tampilkan loading saat masih mengecek autentikasi
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress size="lg" />
      </Box>
    );
  }

  // Jika route memerlukan autentikasi tetapi user belum login
  if (requireAuth && !isAuthenticated) {
    // Simpan halaman yang ingin diakses untuk redirect setelah login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika user sudah login tetapi mengakses halaman login/register
  if (!requireAuth && isAuthenticated) {
    // Redirect berdasarkan role user
    if (user?.guru_id || user?.nip) {
      // User adalah guru
      return <Navigate to="/guru/dashboard" replace />;
    } else {
      // User adalah siswa
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;