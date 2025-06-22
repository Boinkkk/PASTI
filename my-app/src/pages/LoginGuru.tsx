import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Input,
  Alert,
  Link,
  Divider
} from '@mui/joy';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../components/Middleware';
import { loginGuru } from '../services/api/authApi';

const LoginGuru: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    nip: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginGuru({
        nip: formData.nip,
        password: formData.password,
      });

      // Use AuthContext login method
      login(result.data.token, result.data.user);
      
      // Redirect to guru dashboard
      navigate('/guru/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          boxShadow: 'xl'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SchoolIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
            <Typography level="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              Login Guru
            </Typography>
            <Typography level="body-md" sx={{ color: 'text.secondary' }}>
              Sistem Absensi PASTI
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert color="danger" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Input
                name="nip"
                placeholder="NIP"
                value={formData.nip}
                onChange={handleInputChange}
                startDecorator={<PersonIcon />}
                size="lg"
                required
              />

              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                startDecorator={<LockIcon />}
                size="lg"
                required
              />

              <Button
                type="submit"
                loading={loading}
                size="lg"
                sx={{
                  mt: 2,
                  bgcolor: '#1976d2',
                  '&:hover': { bgcolor: '#1565c0' }
                }}
              >
                {loading ? 'Memproses...' : 'Login'}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }}>atau</Divider>

          {/* Navigation Links */}
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link
              component="button"
              onClick={() => navigate('/login')}
              sx={{ 
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center',
                width: '100%'
              }}
            >
              Login sebagai Siswa
            </Link>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 2 }}>
              Semangat Mengajar Masa Depan Bangsa!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginGuru;
