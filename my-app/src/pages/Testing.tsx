import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/Middleware'


interface Siswa {
    siswa_id: number;
    nis: string;
    nama_lengkap: string;
    kelas_id: number;
    email?: string;
    poin_motivasi?: number;
    tingkat_disiplin?: string;
    foto_profil?: string;
  }

const Testing: React.FC = () => {
    const {user} = useAuth(); 
    return (
        <>
            <h1>Hello</h1>
            <h1>{user?.kelas_id}</h1>
        </>
        
    )
}

export default Testing;

