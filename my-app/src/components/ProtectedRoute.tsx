import type { JSX } from '@emotion/react/jsx-runtime'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  requireAuth?: boolean
  children: JSX.Element
}

const ProtectedRoute = ({ requireAuth = true, children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token')

  if (requireAuth && !token) {
    // Butuh login, tapi belum login → redirect ke /login
    return <Navigate to="/login" replace />
  }

  if (!requireAuth && token) {
    // Tidak boleh login (misal halaman login/register), tapi sudah login → redirect ke /dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute