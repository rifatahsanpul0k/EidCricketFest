import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const { isAdmin } = useAuth();
    const location = useLocation();

    if (!isAdmin) {
        sessionStorage.setItem('redirectAfterLogin', location.pathname);
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
