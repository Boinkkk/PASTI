import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/Middleware'
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  FormLabel,
  Input,
  Alert, 
  CircularProgress,
  Card,
  CardContent,
  Stack
} from '@mui/joy';

// Interface untuk response login
interface LoginResponse {
  message: string;
  token: string;
  user: {
    siswa_id: number;
    nis: string;
    nama_lengkap: string;
    kelas_id: number;
    email: string;
    poin_motivasi?: number;
    tingkat_disiplin?: string;
  };
}

// Interface untuk error response
interface ErrorResponse {
  error: string;
  message: string;
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Email dan password harus diisi')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('http://localhost:8080/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.message || 'Login gagal')
      }

      const loginData = data as LoginResponse
      
      login(loginData.token, loginData.user)
      
      setSuccess(loginData.message)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Card 
        sx={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: 'lg'
        }}
      >
        <CardContent>
          <Stack spacing={3} alignItems="center">
            {/* Logo/Title */}
            <Typography 
              level="h1" 
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 'bold',
                color: 'primary.500',
                textAlign: 'center',
                letterSpacing: '0.2em'
              }}
            >
              PASTI
            </Typography>
            
            {/* Avatar/Logo Circle */}
            <Box
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                borderRadius: '50%',
                backgroundColor: 'primary.500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Typography 
                sx={{ 
                  color: 'white', 
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 'bold' 
                }}
              >
                P
              </Typography>
            </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                {/* Error Alert */}
                {error && (
                  <Alert color="danger" variant="soft">
                    <Typography level="body-sm">{error}</Typography>
                  </Alert>
                )}
                
                {/* Success Alert */}
                {success && (
                  <Alert color="success" variant="soft">
                    <Typography level="body-sm">{success}</Typography>
                  </Alert>
                )}

                {/* Email Input */}
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email"
                    placeholder="Masukkan email Anda" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                    size="lg"
                  />
                </FormControl>

                {/* Password Input */}
                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Masukkan password Anda" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    size="lg"
                  />
                </FormControl>

                {/* Login Button */}
                <Button 
                  type="submit"
                  size="lg"
                  disabled={loading}
                  startDecorator={loading ? <CircularProgress size="sm" /> : null}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Masuk...' : 'Masuk'}
                </Button>
              </Stack>
            </Box>

            {/* Navigation Links */}
            <Stack spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <Typography level="body-sm" color="neutral">
                Login sebagai{' '}
                <Typography 
                  component="button"
                  level="body-sm" 
                  sx={{ 
                    color: 'primary.500', 
                    textDecoration: 'none',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => navigate('/login-guru')}
                >
                  Guru
                </Typography>
              </Typography>
              
              <Typography level="body-xs" color="neutral">
                Belum punya akun?{' '}
                <Typography 
                  component="button"
                  level="body-xs" 
                  sx={{ 
                    color: 'primary.500', 
                    textDecoration: 'none',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Daftar disini
                </Typography>
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login