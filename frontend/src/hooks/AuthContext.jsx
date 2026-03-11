import React, { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext(null);
const AUTH_KEY = 'ecf_auth';

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        try {
            const stored = localStorage.getItem(AUTH_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const login = useCallback((userData) => {
        localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        setAuth(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_KEY);
        setAuth(null);
    }, []);

    const isAdmin = !!(auth?.role === 'SUPER_ADMIN' || auth?.role === 'SCORER');

    return (
        <AuthContext.Provider value={{ auth, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
