import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Middleware';
import { Box, CircularProgress } from '@mui/joy';

const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.guru_id || user.nip) {
        // User is a guru
        navigate('/guru/dashboard', { replace: true });
      } else if (user.siswa_id || user.nis) {
        // User is a siswa
        navigate('/dashboard', { replace: true });
      } else {
        // Fallback - redirect to student dashboard
        navigate('/dashboard', { replace: true });
      }
    } else {
      // User not authenticated, redirect to login
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading while redirecting
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
};

export default RoleBasedRedirect;
