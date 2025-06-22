import React from 'react';
import { useAuth } from '../components/Middleware'



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

