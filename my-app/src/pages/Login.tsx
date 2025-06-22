import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion'
import StableInput from '../components/StableInput'
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider
} from '@mui/joy';


function Login() {  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const navigate = useNavigate()  // Motion components - Memoize untuk mencegah re-creation
  const MotionBox = useMemo(() => motion(Box), [])
  const MotionCard = useMemo(() => motion(Card), [])

  // Memoize styles untuk mencegah re-render
  const containerStyles = useMemo(() => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    padding: 2,
    position: 'relative',
    overflow: 'hidden'
  }), [])

  const cardStyles = useMemo(() => ({
    width: '100%', 
    maxWidth: 450,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(20px)',
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 'xl'
  }), [])

  // Memoize input styles untuk stabilitas
  const inputStyles = useMemo(() => ({
    '&:hover': {
      borderColor: 'rgba(102, 126, 234, 0.5)',
      transform: 'translateY(-1px)',
      transition: 'all 0.3s ease'
    },
    '&:focus-within': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    }
  }), [])

  const buttonStyles = useMemo(() => ({
    mt: 2,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
      transform: 'translateY(-2px)',
      transition: 'all 0.3s ease'
    },
    '&:active': {
      transform: 'translateY(0px)'
    }
  }), [])

  // SOLUSI 3: Disable initial animation setelah mount pertama
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 2000) // Disable setelah 2 detik
    
    return () => clearTimeout(timer)  }, [])

  // Debug: Log re-renders
  React.useEffect(() => {
    console.log('Login component re-rendered')
  })

  // Memoize event handlers untuk mencegah re-render
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }, [])

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }, [])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Email dan password harus diisi')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password
      })

      console.log(response)

      const token = response.data.data
      localStorage.setItem("token", token)
      
      setSuccess(response.data.message)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)

    } catch (err) {
      setError("Wrong Password And Email")    } finally {
      setLoading(false)
    }
  }, [email, password, navigate])

  return (    <MotionBox 
      initial={isInitialLoad ? { opacity: 0 } : { opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      sx={containerStyles}
    >{/* Background decorative elements - Static untuk performa */}
      <MotionBox
        initial={isInitialLoad ? { x: -100, opacity: 0 } : { x: 0, opacity: 0.1 }}
        animate={{ x: 0, opacity: 0.1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      />
      
      <MotionBox
        initial={isInitialLoad ? { x: 100, opacity: 0 } : { x: 0, opacity: 0.1 }}
        animate={{ x: 0, opacity: 0.1 }}
        transition={{ duration: 1.2, delay: 0.7 }}
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      />      <MotionCard 
        initial={isInitialLoad ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ y: -5 }}
        sx={cardStyles}
      >
        <CardContent>
          <Stack spacing={4} alignItems="center">            {/* Logo/Title Section */}
            <motion.div 
              initial={isInitialLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Stack alignItems="center" spacing={2}>                <motion.div
                  initial={isInitialLoad ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    duration: 0.8,
                    delay: 0.2
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <MotionBox
                    sx={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 100 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                        transform: 'translateX(-100%)',
                        animation: 'shine 3s infinite',
                      },
                      '@keyframes shine': {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' }
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        color: 'white', 
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                        fontWeight: 'bold',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                      }}
                    >
                      📚
                    </Typography>
                  </MotionBox>
                </motion.div>                
                <motion.div 
                  initial={isInitialLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <Typography 
                    level="h1" 
                    sx={{ 
                      fontSize: { xs: '2.5rem', sm: '3rem' },
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'center',
                      letterSpacing: '0.1em',
                      textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    PASTI
                  </Typography>
                </motion.div>                
                <motion.div 
                  initial={isInitialLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Typography 
                    level="body-md" 
                    sx={{ 
                      color: 'text.secondary',
                      textAlign: 'center',
                      fontWeight: 500
                    }}
                  >
                    Platform Akademik Sistem Terintegrasi
                  </Typography>
                </motion.div>
              </Stack>
            </motion.div>            {/* Divider */}
            <motion.div 
              initial={isInitialLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{ width: '100%' }}
            >
              <Divider sx={{ my: 1 }}>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  Login Siswa
                </Typography>
              </Divider>
            </motion.div>            {/* Login Form */}
            <motion.div
              initial={isInitialLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                <Stack spacing={2}>
                  {/* Error Alert dengan AnimatePresence */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert color="danger" variant="soft">
                          <Typography level="body-sm">{error}</Typography>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Success Alert dengan AnimatePresence */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert color="success" variant="soft">
                          <Typography level="body-sm">{success}</Typography>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>                  {/* Email Input - Static setelah initial load */}
                  <StableInput
                    label="Email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={loading}
                    autoComplete="username"
                    isInitialLoad={isInitialLoad}
                    delay={0.7}
                    styles={inputStyles}
                    inputKey="email"
                  />

                  {/* Password Input - Static setelah initial load */}
                  <StableInput
                    label="Password"
                    type="password"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={loading}
                    autoComplete="current-password"
                    isInitialLoad={isInitialLoad}
                    delay={0.8}
                    styles={inputStyles}
                    inputKey="password"
                  />{/* Login Button - Hover dan tap animasi tetap aktif */}
                  <motion.div
                    key="button-container"
                    initial={isInitialLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit"
                      size="lg"
                      disabled={loading}
                      startDecorator={loading ? <CircularProgress size="sm" /> : null}
                      sx={buttonStyles}
                    >
                      {loading ? 'Masuk...' : 'Masuk'}
                    </Button>
                  </motion.div>
                </Stack>
              </Box>
            </motion.div>            {/* Navigation Links - Static setelah initial load */}
            <motion.div
              initial={isInitialLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
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
                  Jika Lupa password, silakan hubungi admin sekolah.
                </Typography>
              </Stack>
            </motion.div></Stack>
        </CardContent>
      </MotionCard>
    </MotionBox>
  )
}

export default Login