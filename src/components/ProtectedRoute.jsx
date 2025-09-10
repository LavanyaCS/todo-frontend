import React from 'react'
import { Navigate } from 'react-router';
function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    return (
        token ? children : <Navigate to="/" />
    
    )
}

export default ProtectedRoute
