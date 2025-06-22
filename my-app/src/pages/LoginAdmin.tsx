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
  Divider,
  FormControl,
  FormLabel
} from '@mui/joy';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const LoginAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
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
      const response = await fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        // Store admin token
        localStorage.setItem('adminToken', result.data.token);
        localStorage.setItem('adminUsername', result.data.username);
        
        // Redirect to admin dashboard or upload page
        navigate('/admin/upload-siswa');
      } else {
        setError(result.message || 'Login gagal');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan saat login');
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
            <AdminIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
            <Typography level="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              Login Admin
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  name="username"
                  placeholder="Masukkan username admin"
                  value={formData.username}
                  onChange={handleInputChange}
                  startDecorator={<PersonIcon />}
                  size="lg"
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleInputChange}
                  startDecorator={<LockIcon />}
                  size="lg"
                  required
                />
              </FormControl>

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
              sx={{ textDecoration: 'none' }}
            >
              Login sebagai Siswa
            </Link>
            <Link
              component="button"
              onClick={() => navigate('/login-guru')}
              sx={{ textDecoration: 'none' }}
            >
              Login sebagai Guru
            </Link>
            <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 2 }}>
              Admin Panel PASTI
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginAdmin;
