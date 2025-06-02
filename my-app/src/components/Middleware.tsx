import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  // Siswa fields
  siswa_id?: number;
  nis?: string;
  kelas_id?: number;
  poin_motivasi?: number;
  tingkat_disiplin?: string;
  
  // Guru fields
  guru_id?: number;
  nip?: string;
  
  // Common fields
  nama_lengkap: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage untuk token dan user yang tersimpan
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
      } catch (error) {
        // Jika error parsing, hapus data yang rusak
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);
  const login = (newToken: string, newUser: User) => {
    console.log('Login triggered with:', { newToken, newUser }); // Debug log
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    console.log('Auth state updated'); // Debug log
  };
  const logout = () => {
    console.log('Logout triggered'); // Debug log
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Auth state cleared'); // Debug log
  };
  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  // Debug log untuk memonitor auth state
  console.log('Auth Context State:', {
    hasToken: !!token,
    hasUser: !!user,
    isAuthenticated: !!token && !!user,
    isLoading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};