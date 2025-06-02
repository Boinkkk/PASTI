import logo from '../../public/svg/Login-logo.svg'
import Input from '@mui/joy/Input';
import { Button, FormControl, Alert, Select, Option, Typography } from '@mui/joy';
import FormLabel from '@mui/joy/FormLabel';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Interface untuk response API
interface RegisterResponse {
    message: string;
    user: {
        id: number;
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
    const [noTelepon, setNoTelepon] = useState('')
    
    // Field baru untuk siswa
    const [nis, setNis] = useState('')
    const [namaLengkap, setNamaLengkap] = useState('')
    const [kelasId, setKelasId] = useState<number>(1) // Default kelas A (value 1)
    const [poinMotivasi] = useState(0) // Default 0
    const [tingkatDisiplin] = useState('Baik') // Default Baik
    const [fotoProfil] = useState<string | null>(null) // Default null
    
    // State untuk loading dan error
    const [isLoading, setIsLoading] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState('')
    
    // State untuk validasi email
    const [emailError, setEmailError] = useState('')
    const [isEmailValid, setIsEmailValid] = useState(false)
    const [emailTouched, setEmailTouched] = useState(false)
    
    // State untuk validasi password
    const [passwordError, setPasswordError] = useState('')
    const [isPasswordValid, setIsPasswordValid] = useState(false)
    const [passwordTouched, setPasswordTouched] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState('')
    
    // State untuk validasi nomor telepon
    const [phoneError, setPhoneError] = useState('')
    const [isPhoneValid, setIsPhoneValid] = useState(false)
    const [phoneTouched, setPhoneTouched] = useState(false)
    
    // State untuk validasi NIS
    const [nisError, setNisError] = useState('')
    const [isNisValid, setIsNisValid] = useState(false)
    const [nisTouched, setNisTouched] = useState(false)
    
    // State untuk validasi Nama Lengkap
    const [namaError, setNamaError] = useState('')
    const [isNamaValid, setIsNamaValid] = useState(false)
    const [namaTouched, setNamaTouched] = useState(false)

    // Opsi kelas
    const kelasOptions = [
        { value: 1, label: 'Kelas A' },
        { value: 2, label: 'Kelas B' },
        { value: 3, label: 'Kelas C' },
        { value: 4, label: 'Kelas D' },
        { value: 5, label: 'Kelas E' }
    ]

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
        
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'student.com', 'sman1.sch.id']
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

    // Fungsi validasi nomor telepon
    const validatePhone = (phone: string) => {
        if (!phone) {
            setPhoneError('')
            setIsPhoneValid(false)
            return false
        }

        const cleanPhone = phone.replace(/\D/g, '')

        if (cleanPhone.length < 10) {
            setPhoneError('Nomor telepon terlalu pendek (minimal 10 digit)')
            setIsPhoneValid(false)
            return false
        }

        if (cleanPhone.length > 15) {
            setPhoneError('Nomor telepon terlalu panjang (maksimal 15 digit)')
            setIsPhoneValid(false)
            return false
        }

        const indonesianPrefixes = ['08', '62', '+62']
        const isValidPrefix = indonesianPrefixes.some(prefix => {
            if (prefix === '08') {
                return cleanPhone.startsWith('08')
            } else if (prefix === '62') {
                return cleanPhone.startsWith('62')
            }
            return false
        }) || phone.startsWith('+62')

        if (!isValidPrefix) {
            setPhoneError('Nomor telepon harus dimulai dengan 08, 62, atau +62')
            setIsPhoneValid(false)
            return false
        }

        const validOperators = ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853', '0855', '0856', '0857', '0858']
        const phonePrefix = cleanPhone.substring(0, 4)
        
        if (cleanPhone.startsWith('08') && !validOperators.includes(phonePrefix)) {
            setPhoneError('Format nomor operator tidak valid')
            setIsPhoneValid(false)
            return false
        }

        setPhoneError('')
        setIsPhoneValid(true)
        return true
    }

    // Fungsi validasi NIS
    const validateNis = (nis: string) => {
        if (!nis) {
            setNisError('')
            setIsNisValid(false)
            return false
        }

        const cleanNis = nis.replace(/\D/g, '')
        
        if (cleanNis.length < 8) {
            setNisError('NIS minimal 8 digit')
            setIsNisValid(false)
            return false
        }

        if (cleanNis.length > 12) {
            setNisError('NIS maksimal 12 digit')
            setIsNisValid(false)
            return false
        }

        setNisError('')
        setIsNisValid(true)
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

        if (nama.length > 50) {
            setNamaError('Nama terlalu panjang (maksimal 50 karakter)')
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

    // Fungsi untuk mengirim data registrasi ke backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Reset error states
        setSubmitError('')
        setSubmitSuccess('')
        
        // Validasi semua field sekali lagi
        const isEmailValidFinal = validateEmail(email)
        const isPasswordValidFinal = validatePassword(password)
        const isPhoneValidFinal = validatePhone(noTelepon)
        const isNisValidFinal = validateNis(nis)
        const isNamaValidFinal = validateNama(namaLengkap)
        
        if (!isEmailValidFinal || !isPasswordValidFinal || !isPhoneValidFinal || !isNisValidFinal || !isNamaValidFinal) {
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
                poin_motivasi: poinMotivasi,
                tingkat_disiplin: tingkatDisiplin,
                foto_profil: fotoProfil
            }
            
            const response = await fetch('http://localhost:8080/api/v1/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            })
            
            const data: RegisterResponse | ErrorResponse = await response.json()
            
            if (response.ok) {
                const successData = data as RegisterResponse
                setSubmitSuccess(`${successData.message}! Selamat datang ${successData.user.nama_lengkap}`)
                
                // Reset form
                setEmail('')
                setPassword('')
                setNoTelepon('')
                setNis('')
                setNamaLengkap('')
                setKelasId(1)
                
                // Reset validation states
                setEmailTouched(false)
                setPasswordTouched(false)
                setPhoneTouched(false)
                setNisTouched(false)
                setNamaTouched(false)
                
                // Redirect ke login setelah 2 detik
                setTimeout(() => {
                    navigate('/login')
                }, 2000)
                
            } else {
                const errorData = data as ErrorResponse
                
                if (errorData.errors && errorData.errors.length > 0) {
                    // Handle validation errors from backend
                    const errorMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join(', ')
                    setSubmitError(`Validasi gagal: ${errorMessages}`)
                } else {
                    setSubmitError(errorData.message || 'Gagal mendaftarkan akun')
                }
            }
            
        } catch (error) {
            console.error('Registration error:', error)
            setSubmitError('Terjadi kesalahan koneksi. Pastikan server backend berjalan.')
        } finally {
            setIsLoading(false)
        }
    }

    // Real-time validation untuk semua field
    useEffect(() => {
        if (emailTouched) validateEmail(email)
    }, [email, emailTouched])

    useEffect(() => {
        if (passwordTouched) validatePassword(password)
    }, [password, passwordTouched])

    useEffect(() => {
        if (phoneTouched) validatePhone(noTelepon)
    }, [noTelepon, phoneTouched])

    useEffect(() => {
        if (nisTouched) validateNis(nis)
    }, [nis, nisTouched])

    useEffect(() => {
        if (namaTouched) validateNama(namaLengkap)
    }, [namaLengkap, namaTouched])

    // Handle functions
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

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value
        const formattedPhone = newPhone.replace(/[^\d+]/g, '')
        setNoTelepon(formattedPhone)
        if (!phoneTouched) setPhoneTouched(true)
    }

    const handlePhoneBlur = () => {
        setPhoneTouched(true)
        validatePhone(noTelepon)
    }

    const handleNisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNis = e.target.value
        const formattedNis = newNis.replace(/\D/g, '')
        setNis(formattedNis)
        if (!nisTouched) setNisTouched(true)
    }

    const handleNisBlur = () => {
        setNisTouched(true)
        validateNis(nis)
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

    // Fungsi untuk menentukan warna input
    const getEmailInputColor = () => {
        if (!emailTouched || !email) return 'neutral'
        return isEmailValid ? 'success' : 'danger'
    }

    const getPasswordInputColor = () => {
        if (!passwordTouched || !password) return 'neutral'
        return isPasswordValid ? 'success' : 'danger'
    }

    const getPhoneInputColor = () => {
        if (!phoneTouched || !noTelepon) return 'neutral'
        return isPhoneValid ? 'success' : 'danger'
    }

    const getNisInputColor = () => {
        if (!nisTouched || !nis) return 'neutral'
        return isNisValid ? 'success' : 'danger'
    }

    const getNamaInputColor = () => {
        if (!namaTouched || !namaLengkap) return 'neutral'
        return isNamaValid ? 'success' : 'danger'
    }

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 'Lemah') return 'text-red-600'
        if (passwordStrength === 'Sedang') return 'text-yellow-600'
        if (passwordStrength === 'Kuat') return 'text-green-600'
        return 'text-gray-600'
    }

    // Check if all fields are valid
    const isFormValid = isEmailValid && isPasswordValid && isPhoneValid && isNisValid && isNamaValid

    return (
        <div className="container flex h-screen w-screen overflow-y-auto">
            <div className='flex items-center justify-center w-screen flex-col px-4 py-8'>
                <h1 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-widest mt-3 mb-3 mx-3 text-secondary text-center'>
                    PASTI REGISTER
                </h1>
                <img src={logo} className='w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mt-3 mb-6'/>
                
                <form onSubmit={handleSubmit} className='w-full max-w-sm'>
                    <FormControl className='w-full'>
                        {/* SUCCESS MESSAGE */}
                        {submitSuccess && (
                            <Alert color="success" variant="soft" size="md" className="mb-4">
                                {submitSuccess}
                            </Alert>
                        )}

                        {/* ERROR MESSAGE */}
                        {submitError && (
                            <Alert color="danger" variant="soft" size="md" className="mb-4">
                                {submitError}
                            </Alert>
                        )}

                        {/* NIS FIELD */}
                        <FormLabel>
                            NIS (Nomor Induk Siswa) {nis && (
                                <span className={isNisValid ? 'text-green-600' : 'text-red-600'}>
                                    {isNisValid ? '✓' : '✗'}
                                </span>
                            )}
                        </FormLabel>
                        <Input 
                            placeholder="Masukkan NIS (8-12 digit)" 
                            className='mb-1 w-full rounded-none'
                            value={nis}
                            onChange={handleNisChange}
                            onBlur={handleNisBlur}
                            color={getNisInputColor()}
                            type="text"
                            inputMode="numeric"
                            disabled={isLoading}
                        />
                        
                        {nisTouched && nis && (
                            <div className="mb-3">
                                {nisError ? (
                                    <Alert color="danger" variant="soft" size="sm">
                                        {nisError}
                                    </Alert>
                                ) : isNisValid ? (
                                    <Alert color="success" variant="soft" size="sm">
                                        NIS valid ✓
                                    </Alert>
                                ) : null}
                            </div>
                        )}

                        {/* NAMA LENGKAP FIELD */}
                        <FormLabel>
                            Nama Lengkap {namaLengkap && (
                                <span className={isNamaValid ? 'text-green-600' : 'text-red-600'}>
                                    {isNamaValid ? '✓' : '✗'}
                                </span>
                            )}
                        </FormLabel>
                        <Input 
                            placeholder="Masukkan Nama Lengkap" 
                            className='mb-1 w-full rounded-none'
                            value={namaLengkap}
                            onChange={handleNamaChange}
                            onBlur={handleNamaBlur}
                            color={getNamaInputColor()}
                            type="text"
                            autoComplete="name"
                            disabled={isLoading}
                        />
                        
                        {namaTouched && namaLengkap && (
                            <div className="mb-3">
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

                        {/* KELAS FIELD */}
                        <FormLabel>
                            Kelas
                            <span className="text-green-600 ml-2">✓</span>
                        </FormLabel>
                        <Select 
                            placeholder="Pilih Kelas"
                            className='mb-3 w-full rounded-none'
                            value={kelasId}
                            onChange={(_, newValue) => setKelasId(newValue as number)}
                            color="success"
                            disabled={isLoading}
                        >
                            {kelasOptions.map((kelas) => (
                                <Option key={kelas.value} value={kelas.value}>
                                    {kelas.label}
                                </Option>
                            ))}
                        </Select>

                        {/* EMAIL FIELD */}
                        <FormLabel>
                            Email {email && (
                                <span className={isEmailValid ? 'text-green-600' : 'text-red-600'}>
                                    {isEmailValid ? '✓' : '✗'}
                                </span>
                            )}
                        </FormLabel>
                        <Input 
                            placeholder="Enter Your Email" 
                            className='mb-1 w-full rounded-none'
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            color={getEmailInputColor()}
                            type="email"
                            autoComplete="email"
                            disabled={isLoading}
                        />
                        
                        {emailTouched && email && (
                            <div className="mb-3">
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

                        {/* PASSWORD FIELD */}
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
                            placeholder="Enter Your Password" 
                            className='mb-1 w-full rounded-none'
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                            color={getPasswordInputColor()}
                            autoComplete="new-password"
                            disabled={isLoading}
                        />
                        
                        {passwordTouched && password && (
                            <div className="mb-3">
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

                        {/* PHONE FIELD */}
                        <FormLabel>
                            Nomor Telepon {noTelepon && (
                                <span className={isPhoneValid ? 'text-green-600' : 'text-red-600'}>
                                    {isPhoneValid ? '✓' : '✗'}
                                </span>
                            )}
                        </FormLabel>
                        <Input 
                            placeholder="08xxxxxxxxxx atau +62xxxxxxxxx" 
                            className='mb-1 w-full rounded-none'
                            value={noTelepon}
                            onChange={handlePhoneChange}
                            onBlur={handlePhoneBlur}
                            color={getPhoneInputColor()}
                            type="tel"
                            disabled={isLoading}
                        />
                        
                        {phoneTouched && noTelepon && (
                            <div className="mb-3">
                                {phoneError ? (
                                    <Alert color="danger" variant="soft" size="sm">
                                        {phoneError}
                                    </Alert>
                                ) : isPhoneValid ? (
                                    <Alert color="success" variant="soft" size="sm">
                                        Nomor telepon valid ✓
                                    </Alert>
                                ) : null}
                            </div>
                        )}

                        {/* INFO FIELDS */}
                        <div className="mb-3 p-3 bg-blue-50 rounded-md">
                            <Typography level="body-sm" className="text-blue-800 font-medium">
                                Informasi Default:
                            </Typography>
                            <Typography level="body-xs" className="text-blue-600">
                                • Poin Motivasi: {poinMotivasi} (akan diatur otomatis)
                            </Typography>
                            <Typography level="body-xs" className="text-blue-600">
                                • Tingkat Disiplin: {tingkatDisiplin} (default)
                            </Typography>
                            <Typography level="body-xs" className="text-blue-600">
                                • Foto Profil: Belum ada (dapat diupload nanti)
                            </Typography>
                        </div>
                        
                        <Button 
                            type="submit"
                            className='w-full mb-3' 
                            sx={{ bgcolor: 'background.main' }}
                            disabled={!isFormValid || isLoading}
                            size="lg"
                            loading={isLoading}
                        >
                            {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                        </Button>

                        {/* Login Link */}
                        <div className="text-center mt-4">
                            <Typography level="body-sm" className="text-gray-600">
                                Sudah punya akun?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-blue-600 hover:text-blue-800 underline"
                                    disabled={isLoading}
                                >
                                    Login di sini
                                </button>
                            </Typography>
                        </div>
                    </FormControl>
                </form>
            </div>       
        </div>
    )
}

export default Register