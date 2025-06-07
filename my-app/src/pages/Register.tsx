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
    Stack,
    Select,
    Option,
    FormHelperText
  } from '@mui/joy';
  import { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  
  // Interface untuk response API
  interface RegisterResponse {
      message: string;
      user: {
          siswa_id: number;
          nis: string;
          nama_lengkap: string;
          kelas_id: number;
          email: string;
      };
  }
  
  interface ValidationError {
      field: string;
      message: string;
  }
  
  interface ErrorResponse {
      error: string;
      message: string;
      errors?: ValidationError[];
  }
  
  function Register() {
      const navigate = useNavigate();
      
      const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')
      const [confirmPassword, setConfirmPassword] = useState('')
      const [noTelepon, setNoTelepon] = useState('')
      
      // Field untuk siswa
      const [nis, setNis] = useState('')
      const [namaLengkap, setNamaLengkap] = useState('')
      const [kelasId, setKelasId] = useState<number>(1)
      
      // State untuk loading dan error
      const [isLoading, setIsLoading] = useState(false)
      const [submitError, setSubmitError] = useState('')
      const [submitSuccess, setSubmitSuccess] = useState('')
      
      // State untuk validasi
      const [emailError, setEmailError] = useState('')
      const [passwordError, setPasswordError] = useState('')
      const [confirmPasswordError, setConfirmPasswordError] = useState('')
      const [phoneError, setPhoneError] = useState('')
      const [nisError, setNisError] = useState('')
      const [namaError, setNamaError] = useState('')
  
      // Opsi kelas
      const kelasOptions = [
          { value: 1, label: 'Kelas X-A' },
          { value: 2, label: 'Kelas X-B' },
          { value: 3, label: 'Kelas XI-A' },
          { value: 4, label: 'Kelas XI-B' },
          { value: 5, label: 'Kelas XII-A' },
          { value: 6, label: 'Kelas XII-B' }
      ]
  
      // Fungsi validasi
      const validateEmail = (email: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!email) {
              setEmailError('Email wajib diisi')
              return false
          }
          if (!emailRegex.test(email)) {
              setEmailError('Format email tidak valid')
              return false
          }
          setEmailError('')
          return true
      }
  
      const validatePassword = (password: string) => {
          if (!password) {
              setPasswordError('Password wajib diisi')
              return false
          }
          if (password.length < 6) {
              setPasswordError('Password minimal 6 karakter')
              return false
          }
          setPasswordError('')
          return true
      }
  
      const validateConfirmPassword = (confirmPassword: string) => {
          if (!confirmPassword) {
              setConfirmPasswordError('Konfirmasi password wajib diisi')
              return false
          }
          if (password !== confirmPassword) {
              setConfirmPasswordError('Password tidak cocok')
              return false
          }
          setConfirmPasswordError('')
          return true
      }
  
      const validatePhone = (phone: string) => {
          const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
          if (!phone) {
              setPhoneError('Nomor telepon wajib diisi')
              return false
          }
          if (!phoneRegex.test(phone)) {
              setPhoneError('Format nomor telepon tidak valid (contoh: 08123456789)')
              return false
          }
          setPhoneError('')
          return true
      }
  
      const validateNis = (nis: string) => {
          if (!nis) {
              setNisError('NIS wajib diisi')
              return false
          }
          if (nis.length < 8 || nis.length > 12) {
              setNisError('NIS harus 8-12 digit')
              return false
          }
          setNisError('')
          return true
      }
  
      const validateNama = (nama: string) => {
          if (!nama) {
              setNamaError('Nama lengkap wajib diisi')
              return false
          }
          if (nama.length < 3) {
              setNamaError('Nama minimal 3 karakter')
              return false
          }
          setNamaError('')
          return true
      }
  
      // Real-time validation
      useEffect(() => {
          if (email) validateEmail(email)
      }, [email])
  
      useEffect(() => {
          if (password) validatePassword(password)
      }, [password])
  
      useEffect(() => {
          if (confirmPassword) validateConfirmPassword(confirmPassword)
      }, [confirmPassword, password])
  
      useEffect(() => {
          if (noTelepon) validatePhone(noTelepon)
      }, [noTelepon])
  
      useEffect(() => {
          if (nis) validateNis(nis)
      }, [nis])
  
      useEffect(() => {
          if (namaLengkap) validateNama(namaLengkap)
      }, [namaLengkap])
  
      // Fungsi submit
      const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          
          setSubmitError('')
          setSubmitSuccess('')
          
          // Validasi semua field
          const isEmailValid = validateEmail(email)
          const isPasswordValid = validatePassword(password)
          const isConfirmPasswordValid = validateConfirmPassword(confirmPassword)
          const isPhoneValid = validatePhone(noTelepon)
          const isNisValid = validateNis(nis)
          const isNamaValid = validateNama(namaLengkap)
          
          if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid || 
              !isPhoneValid || !isNisValid || !isNamaValid) {
              setSubmitError('Mohon perbaiki semua field yang tidak valid')
              return
          }
          
          setIsLoading(true)
          
          try {
              const registrationData = {
                  nis: nis,
                  nama_lengkap: namaLengkap,
                  kelas_id: kelasId,
                  email: email,
                  password: password,
                  no_telepon: noTelepon,
                  confirm_password: confirmPassword
              }
              
              const response = await fetch('http://localhost:8080/api/auth/register', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(registrationData), 
              })
              
              const data: RegisterResponse | ErrorResponse = await response.json()
              
              if (response.ok) {
                  const successData = data as RegisterResponse
                  setSubmitSuccess(`Registrasi berhasil! Selamat datang ${successData.user.nama_lengkap}`)
                  
                  // Reset form
                  setEmail('')
                  setPassword('')
                  setConfirmPassword('')
                  setNoTelepon('')
                  setNis('')
                  setNamaLengkap('')
                  setKelasId(1)
                  
                  // Redirect ke login
                  setTimeout(() => {
                      navigate('/login')
                  }, 2000)
                  
              } else {
                  const errorData = data as ErrorResponse
                  setSubmitError(errorData.message || 'Gagal mendaftarkan akun')
              }
              
          } catch (error) {
              console.error('Registration error:', error)
              setSubmitError('Terjadi kesalahan koneksi. Pastikan server backend berjalan.')
          } finally {
              setIsLoading(false)
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
                      maxWidth: 500,
                      boxShadow: 'lg'
                  }}
              >
                  <CardContent>
                      <Stack spacing={3} alignItems="center">
                          {/* Logo/Title */}
                          <Typography 
                              level="h1" 
                              sx={{ 
                                  fontSize: { xs: '1.8rem', sm: '2.2rem' },
                                  fontWeight: 'bold',
                                  color: 'primary.500',
                                  textAlign: 'center',
                                  letterSpacing: '0.1em'
                              }}
                          >
                              DAFTAR PASTI
                          </Typography>
                          
                          {/* Avatar/Logo Circle */}
                          <Box
                              sx={{
                                  width: { xs: 50, sm: 60 },
                                  height: { xs: 50, sm: 60 },
                                  borderRadius: '50%',
                                  backgroundColor: 'primary.500',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mb: 1
                              }}
                          >
                              <Typography 
                                  sx={{ 
                                      color: 'white', 
                                      fontSize: { xs: '1.2rem', sm: '1.5rem' },
                                      fontWeight: 'bold' 
                                  }}
                              >
                                  P
                              </Typography>
                          </Box>
  
                          {/* Register Form */}
                          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                              <Stack spacing={2}>
                                  {/* Error Alert */}
                                  {submitError && (
                                      <Alert color="danger" variant="soft">
                                          <Typography level="body-sm">{submitError}</Typography>
                                      </Alert>
                                  )}
                                  
                                  {/* Success Alert */}
                                  {submitSuccess && (
                                      <Alert color="success" variant="soft">
                                          <Typography level="body-sm">{submitSuccess}</Typography>
                                      </Alert>
                                  )}
  
                                  {/* NIS Input */}
                                  <FormControl error={!!nisError}>
                                      <FormLabel>NIS</FormLabel>
                                      <Input 
                                          type="text"
                                          placeholder="Masukkan NIS (8-12 digit)" 
                                          value={nis}
                                          onChange={(e) => setNis(e.target.value)}
                                          disabled={isLoading}
                                          color={nisError ? 'danger' : nis ? 'success' : 'neutral'}
                                      />
                                      {nisError && <FormHelperText>{nisError}</FormHelperText>}
                                  </FormControl>
  
                                  {/* Nama Lengkap Input */}
                                  <FormControl error={!!namaError}>
                                      <FormLabel>Nama Lengkap</FormLabel>
                                      <Input 
                                          type="text"
                                          placeholder="Masukkan nama lengkap" 
                                          value={namaLengkap}
                                          onChange={(e) => setNamaLengkap(e.target.value)}
                                          disabled={isLoading}
                                          color={namaError ? 'danger' : namaLengkap ? 'success' : 'neutral'}
                                      />
                                      {namaError && <FormHelperText>{namaError}</FormHelperText>}
                                  </FormControl>
  
                                  {/* Kelas Select */}
                                  <FormControl>
                                      <FormLabel>Kelas</FormLabel>
                                      <Select 
                                          placeholder="Pilih Kelas"
                                          value={kelasId}
                                          onChange={(_, newValue) => setKelasId(newValue as number)}
                                          disabled={isLoading}
                                      >
                                          {kelasOptions.map((kelas) => (
                                              <Option key={kelas.value} value={kelas.value}>
                                                  {kelas.label}
                                              </Option>
                                          ))}
                                      </Select>
                                  </FormControl>
  
                                  {/* Email Input */}
                                  <FormControl error={!!emailError}>
                                      <FormLabel>Email</FormLabel>
                                      <Input 
                                          type="email"
                                          placeholder="Masukkan email" 
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                          disabled={isLoading}
                                          color={emailError ? 'danger' : email ? 'success' : 'neutral'}
                                      />
                                      {emailError && <FormHelperText>{emailError}</FormHelperText>}
                                  </FormControl>
  
                                  {/* No Telepon Input */}
                                  <FormControl error={!!phoneError}>
                                      <FormLabel>Nomor Telepon</FormLabel>
                                      <Input 
                                          type="tel"
                                          placeholder="08123456789" 
                                          value={noTelepon}
                                          onChange={(e) => setNoTelepon(e.target.value)}
                                          disabled={isLoading}
                                          color={phoneError ? 'danger' : noTelepon ? 'success' : 'neutral'}
                                      />
                                      {phoneError && <FormHelperText>{phoneError}</FormHelperText>}
                                  </FormControl>
  
                                  {/* Password Input */}
                                  <FormControl error={!!passwordError}>
                                      <FormLabel>Password</FormLabel>
                                      <Input
                                          type="password"
                                          placeholder="Masukkan password" 
                                          value={password}
                                          onChange={(e) => setPassword(e.target.value)}
                                          disabled={isLoading}
                                          color={passwordError ? 'danger' : password ? 'success' : 'neutral'}
                                      />
                                      {passwordError && <FormHelperText>{passwordError}</FormHelperText>}
                                  </FormControl>
  
                                  {/* Confirm Password Input */}
                                  <FormControl error={!!confirmPasswordError}>
                                      <FormLabel>Konfirmasi Password</FormLabel>
                                      <Input
                                          type="password"
                                          placeholder="Ulangi password" 
                                          value={confirmPassword}
                                          onChange={(e) => setConfirmPassword(e.target.value)}
                                          disabled={isLoading}
                                          color={confirmPasswordError ? 'danger' : confirmPassword ? 'success' : 'neutral'}
                                      />
                                      {confirmPasswordError && <FormHelperText>{confirmPasswordError}</FormHelperText>}
                                  </FormControl>
  
                                  {/* Register Button */}
                                  <Button 
                                      type="submit"
                                      size="lg"
                                      disabled={isLoading}
                                      startDecorator={isLoading ? <CircularProgress size="sm" /> : null}
                                      sx={{ mt: 2 }}
                                  >
                                      {isLoading ? 'Mendaftar...' : 'Daftar'}
                                  </Button>
                              </Stack>
                          </Box>
  
                          {/* Navigation Links */}
                          <Stack spacing={1} alignItems="center" sx={{ mt: 2 }}>
                              <Typography level="body-sm" color="neutral">
                                  Sudah punya akun?{' '}
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
                                      onClick={() => navigate('/login')}
                                  >
                                      Masuk disini
                                  </Typography>
                              </Typography>
                          </Stack>
                      </Stack>
                  </CardContent>
              </Card>
          </Box>
      )
  }
  
  export default Register