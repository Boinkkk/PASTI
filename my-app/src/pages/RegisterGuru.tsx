import logo from '/svg/Login-logo.svg'
import Input from '@mui/joy/Input';
import { Button, FormControl, Alert, Typography } from '@mui/joy';
import FormLabel from '@mui/joy/FormLabel';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerGuru } from '../services/api';

// Local interface for guru registration request
interface RegisterGuruRequest {
    nip: string;
    nama_lengkap: string;
    email: string;
    password: string;
    confirm_password: string;
}

function RegisterGuru() {
    const navigate = useNavigate();
    
    const [nip, setNip] = useState('')
    const [namaLengkap, setNamaLengkap] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    // State untuk loading dan error
    const [isLoading, setIsLoading] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState('')
    
    // State untuk validasi NIP
    const [nipError, setNipError] = useState('')
    const [isNipValid, setIsNipValid] = useState(false)
    const [nipTouched, setNipTouched] = useState(false)
    
    // State untuk validasi Nama Lengkap
    const [namaError, setNamaError] = useState('')
    const [isNamaValid, setIsNamaValid] = useState(false)
    const [namaTouched, setNamaTouched] = useState(false)
    
    // State untuk validasi email
    const [emailError, setEmailError] = useState('')
    const [isEmailValid, setIsEmailValid] = useState(false)
    const [emailTouched, setEmailTouched] = useState(false)
    
    // State untuk validasi password
    const [passwordError, setPasswordError] = useState('')
    const [isPasswordValid, setIsPasswordValid] = useState(false)
    const [passwordTouched, setPasswordTouched] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState('')
    
    // State untuk validasi confirm password
    const [confirmPasswordError, setConfirmPasswordError] = useState('')
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false)
    const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)

    // Fungsi validasi NIP
    const validateNip = (nip: string) => {
        if (!nip) {
            setNipError('')
            setIsNipValid(false)
            return false
        }

        const cleanNip = nip.replace(/\D/g, '')
        
        if (cleanNip.length < 8) {
            setNipError('NIP minimal 8 digit')
            setIsNipValid(false)
            return false
        }

        if (cleanNip.length > 20) {
            setNipError('NIP maksimal 20 digit')
            setIsNipValid(false)
            return false
        }

        setNipError('')
        setIsNipValid(true)
        return true
    }

    // Fungsi validasi Nama Lengkap
    const validateNama = (nama: string) => {
        if (!nama) {
            setNamaError('')
            setIsNamaValid(false)
            return false
        }

        if (nama.length < 3) {
            setNamaError('Nama terlalu pendek (minimal 3 karakter)')
            setIsNamaValid(false)
            return false
        }

        if (nama.length > 100) {
            setNamaError('Nama terlalu panjang (maksimal 100 karakter)')
            setIsNamaValid(false)
            return false
        }

        const nameRegex = /^[a-zA-Z\s]+$/
        if (!nameRegex.test(nama)) {
            setNamaError('Nama hanya boleh berisi huruf dan spasi')
            setIsNamaValid(false)
            return false
        }

        setNamaError('')
        setIsNamaValid(true)
        return true
    }

    // Fungsi validasi email
    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        
        if (!email) {
            setEmailError('')
            setIsEmailValid(false)
            return false
        }
        
        if (email.length < 5) {
            setEmailError('Email terlalu pendek (minimal 5 karakter)')
            setIsEmailValid(false)
            return false
        }
        
        if (!emailRegex.test(email)) {
            setEmailError('Format email tidak valid (contoh: user@domain.com)')
            setIsEmailValid(false)
            return false
        }
        
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'sekolah.sch.id', 'education.ac.id']
        const domain = email.split('@')[1]
        
        if (domain && !commonDomains.some(validDomain => domain.includes(validDomain.split('.')[0]))) {
            setEmailError('Gunakan email dari domain yang umum (gmail, yahoo, dll)')
            setIsEmailValid(false)
            return false
        }
        
        setEmailError('')
        setIsEmailValid(true)
        return true
    }

    // Fungsi validasi password
    const validatePassword = (password: string) => {
        if (!password) {
            setPasswordError('')
            setIsPasswordValid(false)
            setPasswordStrength('')
            return false
        }

        const minLength = 8
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumbers = /\d/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

        if (password.length < minLength) {
            setPasswordError(`Password minimal ${minLength} karakter`)
            setIsPasswordValid(false)
            setPasswordStrength('Lemah')
            return false
        }

        let strength = 0
        let strengthText = ''
        let errors = []

        if (hasLowerCase) strength++
        else errors.push('huruf kecil')

        if (hasUpperCase) strength++
        else errors.push('huruf besar')

        if (hasNumbers) strength++
        else errors.push('angka')

        if (hasSpecialChar) strength++
        else errors.push('karakter khusus (!@#$%^&*)')

        if (errors.length > 0) {
            setPasswordError(`Password harus mengandung: ${errors.join(', ')}`)
            setIsPasswordValid(false)
        } else {
            setPasswordError('')
            setIsPasswordValid(true)
        }

        if (strength <= 2) {
            strengthText = 'Lemah'
        } else if (strength === 3) {
            strengthText = 'Sedang'
        } else {
            strengthText = 'Kuat'
        }

        setPasswordStrength(strengthText)
        return errors.length === 0
    }

    // Fungsi validasi confirm password
    const validateConfirmPassword = (confirmPassword: string) => {
        if (!confirmPassword) {
            setConfirmPasswordError('')
            setIsConfirmPasswordValid(false)
            return false
        }

        if (confirmPassword !== password) {
            setConfirmPasswordError('Password tidak cocok')
            setIsConfirmPasswordValid(false)
            return false
        }

        setConfirmPasswordError('')
        setIsConfirmPasswordValid(true)
        return true
    }

    // Fungsi untuk mengirim data registrasi ke backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Reset error states
        setSubmitError('')
        setSubmitSuccess('')
        
        // Validasi semua field sekali lagi
        const isNipValidFinal = validateNip(nip)
        const isNamaValidFinal = validateNama(namaLengkap)
        const isEmailValidFinal = validateEmail(email)
        const isPasswordValidFinal = validatePassword(password)
        const isConfirmPasswordValidFinal = validateConfirmPassword(confirmPassword)
        
        if (!isNipValidFinal || !isNamaValidFinal || !isEmailValidFinal || !isPasswordValidFinal || !isConfirmPasswordValidFinal) {
            setSubmitError('Mohon perbaiki semua field yang tidak valid')
            return
        }
        
        setIsLoading(true)
        
        try {
            const registrationData: RegisterGuruRequest = {
                nip: nip,
                nama_lengkap: namaLengkap,
                email: email,
                password: password,
                confirm_password: confirmPassword
            }
              const result = await registerGuru(registrationData)
            
            setSubmitSuccess('Registrasi guru berhasil! Silakan login untuk melanjutkan.')
            console.log('Registration successful:', result)
            
            // Reset form
            setNip('')
            setNamaLengkap('')
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            
            // Reset validation states
            setNipTouched(false)
            setNamaTouched(false)
            setEmailTouched(false)
            setPasswordTouched(false)
            setConfirmPasswordTouched(false)
            
            // Redirect ke login guru setelah 2 detik
            setTimeout(() => {
                navigate('/login-guru')
            }, 2000)
            
        } catch (error: any) {
            console.error('Registration error:', error)
            setSubmitError(error.message || 'Terjadi kesalahan saat registrasi. Pastikan server backend berjalan.')
        } finally {
            setIsLoading(false)
        }
    }

    // Real-time validation untuk semua field
    useEffect(() => {
        if (nipTouched) validateNip(nip)
    }, [nip, nipTouched])

    useEffect(() => {
        if (namaTouched) validateNama(namaLengkap)
    }, [namaLengkap, namaTouched])

    useEffect(() => {
        if (emailTouched) validateEmail(email)
    }, [email, emailTouched])

    useEffect(() => {
        if (passwordTouched) validatePassword(password)
    }, [password, passwordTouched])

    useEffect(() => {
        if (confirmPasswordTouched) validateConfirmPassword(confirmPassword)
    }, [confirmPassword, confirmPasswordTouched, password])

    // Handle functions
    const handleNipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNip = e.target.value
        const formattedNip = newNip.replace(/\D/g, '')
        setNip(formattedNip)
        if (!nipTouched) setNipTouched(true)
    }

    const handleNipBlur = () => {
        setNipTouched(true)
        validateNip(nip)
    }

    const handleNamaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNama = e.target.value
        setNamaLengkap(newNama)
        if (!namaTouched) setNamaTouched(true)
    }

    const handleNamaBlur = () => {
        setNamaTouched(true)
        validateNama(namaLengkap)
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value
        setEmail(newEmail)
        if (!emailTouched) setEmailTouched(true)
    }

    const handleEmailBlur = () => {
        setEmailTouched(true)
        validateEmail(email)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value
        setPassword(newPassword)
        if (!passwordTouched) setPasswordTouched(true)
    }

    const handlePasswordBlur = () => {
        setPasswordTouched(true)
        validatePassword(password)
    }

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newConfirmPassword = e.target.value
        setConfirmPassword(newConfirmPassword)
        if (!confirmPasswordTouched) setConfirmPasswordTouched(true)
    }

    const handleConfirmPasswordBlur = () => {
        setConfirmPasswordTouched(true)
        validateConfirmPassword(confirmPassword)
    }

    // Helper functions untuk styling input
    const getNipInputColor = () => {
        if (!nipTouched || !nip) return 'neutral'
        return isNipValid ? 'success' : 'danger'
    }

    const getNamaInputColor = () => {
        if (!namaTouched || !namaLengkap) return 'neutral'
        return isNamaValid ? 'success' : 'danger'
    }

    const getEmailInputColor = () => {
        if (!emailTouched || !email) return 'neutral'
        return isEmailValid ? 'success' : 'danger'
    }

    const getPasswordInputColor = () => {
        if (!passwordTouched || !password) return 'neutral'
        return isPasswordValid ? 'success' : 'danger'
    }

    const getConfirmPasswordInputColor = () => {
        if (!confirmPasswordTouched || !confirmPassword) return 'neutral'
        return isConfirmPasswordValid ? 'success' : 'danger'
    }

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 'Lemah') return 'text-red-600'
        if (passwordStrength === 'Sedang') return 'text-yellow-600'
        if (passwordStrength === 'Kuat') return 'text-green-600'
        return 'text-gray-600'
    }

    // Check if all fields are valid
    const isFormValid = isNipValid && isNamaValid && isEmailValid && isPasswordValid && isConfirmPasswordValid

    return (
        <div className="container flex h-screen w-screen overflow-y-auto">
            <div className='flex items-center justify-center w-screen flex-col px-4 py-8'>
                <h1 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-widest mt-3 mb-3 mx-3 text-secondary text-center'>
                    REGISTRASI GURU PASTI
                </h1>
                
                <img src={logo} className='w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mt-3 mb-6'/>
                
                <form onSubmit={handleSubmit} className='w-full max-w-sm space-y-4'>
                    {/* SUCCESS MESSAGE */}
                    {submitSuccess && (
                        <Alert color="success" variant="soft" size="md">
                            {submitSuccess}
                        </Alert>
                    )}

                    {/* ERROR MESSAGE */}
                    {submitError && (
                        <Alert color="danger" variant="soft" size="md">
                            {submitError}
                        </Alert>
                    )}

                    {/* NIP FIELD */}
                    <FormControl>
                        <FormLabel>
                            NIP (Nomor Induk Pegawai) {nip && (
                                <span className={isNipValid ? 'text-green-600' : 'text-red-600'}>
                                    {isNipValid ? '✓' : '✗'}
                                </span>
                            )}
                        </FormLabel>
                        <Input 
                            placeholder="Masukkan NIP (8-20 digit)" 
                            className='w-full rounded-none'
                            value={nip}
                            onChange={handleNipChange}
                            onBlur={handleNipBlur}
                            color={getNipInputColor()}
                            type="text"
                            inputMode="numeric"
                            disabled={isLoading}
                        />
                        {nipTouched && nip && (
                            <div className="mt-1">
                                {nipError ? (
                                    <Alert color="danger" variant="soft" size="sm">
                                        {nipError}
                                    </Alert>
                                ) : isNipValid ? (
                                    <Alert color="success" variant="soft" size="sm">
                                        NIP valid ✓
                                    </Alert>
                                ) : null}
                            </div>
                        )}
                    </FormControl>

                    {/* NAMA LENGKAP FIELD */}
                    <FormControl>
                        <FormLabel>
                            Nama Lengkap {namaLengkap && (
                                <span className={isNamaValid ? 'text-green-600' : 'text-red-600'}>
                                    {isNamaValid ? '✓' : '✗'}
                                </span>
                            )}
                        </FormLabel>
                        <Input 
                            placeholder="Masukkan Nama Lengkap" 
                            className='w-full rounded-none'
                            value={namaLengkap}
                            onChange={handleNamaChange}
                            onBlur={handleNamaBlur}
                            color={getNamaInputColor()}
                            type="text"
                            autoComplete="name"
                            disabled={isLoading}
                        />
                        {namaTouched && namaLengkap && (
                            <div className="mt-1">
                                {namaError ? (
                                    <Alert color="danger" variant="soft" size="sm">
                                        {namaError}
                                    </Alert>
                                ) : isNamaValid ? (
                                    <Alert color="success" variant="soft" size="sm">
                                        Nama valid ✓
                                    </Alert>
                                ) : null}
                            </div>
                        )}
                    </FormControl>

                    {/* EMAIL FIELD */}
                    <FormControl>
                        <FormLabel>
                            Email {email && (
                                <span className={isEmailValid ? 'text-green-600' : 'text-red-600'}>
                                    {isEmailValid ? '✓' : '✗'}
                                </span>
                            )}
                        </FormLabel>
                        <Input 
                            placeholder="Masukkan Email" 
                            className='w-full rounded-none'
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            color={getEmailInputColor()}
                            type="email"
                            autoComplete="email"
                            disabled={isLoading}
                        />
                        {emailTouched && email && (
                            <div className="mt-1">
                                {emailError ? (
                                    <Alert color="danger" variant="soft" size="sm">
                                        {emailError}
                                    </Alert>
                                ) : isEmailValid ? (
                                    <Alert color="success" variant="soft" size="sm">
                                        Email valid ✓
                                    </Alert>
                                ) : null}
                            </div>
                        )}
                    </FormControl>

                    {/* PASSWORD FIELD */}
                    <FormControl>
                        <FormLabel>
                            Password {password && (
                                <span className={isPasswordValid ? 'text-green-600' : 'text-red-600'}>
                                    {isPasswordValid ? '✓' : '✗'}
                                </span>
                            )}
                            {passwordStrength && (
                                <span className={`ml-2 text-xs ${getPasswordStrengthColor()}`}>
                                    ({passwordStrength})
                                </span>
                            )}
                        </FormLabel>
                        <Input 
                            placeholder="Masukkan Password" 
                            className='w-full rounded-none'
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                            color={getPasswordInputColor()}
                            autoComplete="new-password"
                            disabled={isLoading}
                        />
                        {passwordTouched && password && (
                            <div className="mt-1">
                                {passwordError ? (
                                    <Alert color="danger" variant="soft" size="sm">
                                        {passwordError}
                                    </Alert>
                                ) : isPasswordValid ? (
                                    <Alert color="success" variant="soft" size="sm">
                                        Password kuat ✓
                                    </Alert>
                                ) : null}
                            </div>
                        )}
                    </FormControl>

                    {/* CONFIRM PASSWORD FIELD */}
                    <FormControl>
                        <FormLabel>
                            Konfirmasi Password {confirmPassword && (
                                <span className={isConfirmPasswordValid ? 'text-green-600' : 'text-red-600'}>
                                    {isConfirmPasswordValid ? '✓' : '✗'}
                                </span>
                            )}
                        </FormLabel>
                        <Input 
                            placeholder="Ulangi Password" 
                            className='w-full rounded-none'
                            type="password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            onBlur={handleConfirmPasswordBlur}
                            color={getConfirmPasswordInputColor()}
                            autoComplete="new-password"
                            disabled={isLoading}
                        />
                        {confirmPasswordTouched && confirmPassword && (
                            <div className="mt-1">
                                {confirmPasswordError ? (
                                    <Alert color="danger" variant="soft" size="sm">
                                        {confirmPasswordError}
                                    </Alert>
                                ) : isConfirmPasswordValid ? (
                                    <Alert color="success" variant="soft" size="sm">
                                        Password cocok ✓
                                    </Alert>
                                ) : null}
                            </div>
                        )}
                    </FormControl>
                    
                    <Button 
                        type="submit"
                        className='w-full' 
                        sx={{ bgcolor: 'background.main' }}
                        disabled={!isFormValid || isLoading}
                        size="lg"
                        loading={isLoading}
                    >
                        {isLoading ? 'Mendaftarkan...' : 'Daftar Sebagai Guru'}
                    </Button>

                    {/* Login Link */}
                    <div className="text-center">
                        <Typography level="body-sm" className="text-gray-600">
                            Sudah punya akun?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login-guru')}
                                className="text-blue-600 hover:text-blue-800 underline"
                                disabled={isLoading}
                            >
                                Login Guru di sini
                            </button>
                        </Typography>
                        <Typography level="body-sm" className="text-gray-600 mt-2">
                            Bukan guru?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-blue-600 hover:text-blue-800 underline"
                                disabled={isLoading}
                            >
                                Daftar Siswa di sini
                            </button>
                        </Typography>
                    </div>
                </form>
            </div>       
        </div>
    )
}

export default RegisterGuru
