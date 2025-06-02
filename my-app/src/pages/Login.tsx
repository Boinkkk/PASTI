import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/Middleware'
import logo from '../../public/svg/Login-logo.svg'
import Input from '@mui/joy/Input';
import { Button, FormControl, Alert, CircularProgress, Typography } from '@mui/joy';
import FormLabel from '@mui/joy/FormLabel';

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
  const { login } = useAuth() // Gunakan AuthContext

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

      console.log(response)

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.message || 'Login gagal')
      }      const loginData = data as LoginResponse
      
      // Gunakan AuthContext untuk login (akan trigger ProtectedRoute)
      login(loginData.token, loginData.user)
      
      setSuccess(loginData.message)
      
      // ProtectedRoute akan otomatis redirect, tapi tambahkan fallback
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
    <div className="container flex h-screen w-screen">
        <div className='flex items-center justify-center w-screen flex-col px-4'>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-widest mt-3 mb-3 mx-3 text-secondary text-center'>PASTI</h1>
            <img src={logo} className='w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mt-3'/>
            
            <form onSubmit={handleLogin}  autoComplete='on' className='w-full max-w-sm'>
              {error && (
                <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
                  <Typography level="body-sm">{error}</Typography>
                </Alert>
              )}
              
              {success && (
                <Alert color="success" variant="soft" sx={{ mb: 2 }}>
                  <Typography level="body-sm">{success}</Typography>
                </Alert>
              )}
                  <FormControl className='w-full max-w-sm mb-3'>
                    <FormLabel>Email</FormLabel>
                    <Input 
                      id="email"
                      name='email'
                      type="email"
                      placeholder="Enter Your Email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoComplete='username'
                    />
                  </FormControl>

                  <FormControl className='w-full max-w-sm mb-3'>
                    <FormLabel>Password</FormLabel>
                    <Input
                      id='password'
                      name='password'
                      type="password"
                      placeholder="Enter Your Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete='current-password'
                      
                    />
                  </FormControl>

                  <Button 
                    type="submit"
                    className='w-full mb-3' 
                    sx={{ bgcolor: 'background.main' }}
                    disabled={loading}
                    startDecorator={loading ? <CircularProgress size="sm" /> : null}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
            </form>            <div className="mt-4 text-center">
              <Typography level="body-sm" color="neutral">
                Login sebagai{' '}
                <Typography 
                  component="a" 
                  level="body-sm" 
                  sx={{ 
                    color: 'primary.500', 
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => navigate('/login-guru')}
                >
                  Guru
                </Typography>
              </Typography>
              <Typography level="body-xs" color="neutral" sx={{ mt: 1 }}>
                Belum punya akun?{' '}
                <Typography 
                  component="a" 
                  level="body-xs" 
                  sx={{ 
                    color: 'primary.500', 
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Daftar disini
                </Typography>
              </Typography>
            </div>
        </div>       
    </div>
  )
}

export default Login
