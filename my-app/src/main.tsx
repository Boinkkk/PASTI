import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './pages/Login.tsx'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage.tsx'
import theme from './theme.ts'
import { CssVarsProvider } from '@mui/joy'
import Register from './pages/Register.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Absensi from './pages/Absensi.tsx'
import Kelas from './pages/Kelas.tsx'
import { AuthProvider } from './components/Middleware.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import LoginGuru from './pages/LoginGuru.tsx'
import RegisterGuru from './pages/RegisterGuru.tsx'
import GuruDashboard from './pages/GuruDashboard.tsx'
import GuruJadwal from './pages/GuruJadwal.tsx'
import GuruSiswa from './pages/GuruSiswa.tsx'
import GuruAbsensi from './pages/GuruAbsensi.tsx'
import GuruQRGenerator from './pages/GuruQRGenerator.tsx'
import KelasTest from './pages/Kelas_test.tsx'
import TugasSiswa from './pages/TugasSiswa.tsx'
import AbsensiToken from './pages/AbsensiToken.tsx'

const router = createBrowserRouter([
  {
    path: '/', 
    element: (
      <Login/>
    )
  },
  {
    path: '/login', 
    element: (
      <ProtectedRoute requireAuth={false}>
        <Login/>
      </ProtectedRoute>
    )
  },
  {
    path: '/login-guru', 
    element: (
      <ProtectedRoute requireAuth={false}>
        <LoginGuru/>
      </ProtectedRoute>
    )
  },
  {
    path: '/guru/dashboard', 
    element: (
      <ProtectedRoute>
        <GuruDashboard/>
      </ProtectedRoute>
    )
  },
  {
    path: '/guru/jadwal', 
    element: (
      <ProtectedRoute>
        <GuruJadwal></GuruJadwal>
      </ProtectedRoute>
    )
  },
  {
    path: '/guru/absensi', 
    element: (
      <ProtectedRoute>
        <GuruAbsensi/>
      </ProtectedRoute>
    )
  },
  {
    path: '/guru/qr-generator', 
    element: (
      <ProtectedRoute>
        <GuruQRGenerator/>
      </ProtectedRoute>
    )
  },
  {
    path: '/guru/siswa', 
    element: (
      <ProtectedRoute>
        <GuruSiswa/>
      </ProtectedRoute>
    )
  },
  {
    path: '/register', 
    element: (
      <ProtectedRoute requireAuth={false}>
        <Register/>
      </ProtectedRoute>
    )
  },
  {
    path: '/register-guru', 
    element: (
      <ProtectedRoute requireAuth={false}>
        <RegisterGuru/>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard', 
    element: (
      <ProtectedRoute>
        <Dashboard/>
      </ProtectedRoute>
    )
  },
  {
    path: '/absensi', 
    element: (
      <ProtectedRoute>
        <Absensi/>
      </ProtectedRoute>
    )
  },
  {
    path: '/tugas',
    element: (
      <ProtectedRoute>
        <TugasSiswa/>
      </ProtectedRoute>
    )
  },
  {
    path: '/absensi/kelas/:mata_pelajaran', 
    element: (
      <ProtectedRoute>
        <Kelas/>
      </ProtectedRoute>
    )
  },
  {
    path: '/absensi/kelas/test', 
    element: (
      <ProtectedRoute>
        <KelasTest/>
      </ProtectedRoute>
    )
  },
  {
    path: '/absensi/token',
    element: (
      <ProtectedRoute>
        <AbsensiToken/>
      </ProtectedRoute>
    )
  },
  {
    path: '*', 
    element: <NotFoundPage/>
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssVarsProvider theme={theme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </CssVarsProvider>
  </StrictMode>,
)