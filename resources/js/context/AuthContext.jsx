import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { checkAuth(); }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/user');
            setUser(response.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        await axios.get('/sanctum/csrf-cookie', { baseURL: '' });
        const response = await axios.post('/auth/login', credentials);
        await checkAuth();
        return response.data;
    };

    const register = async (data) => {
        await axios.get('/sanctum/csrf-cookie', { baseURL: '' });
        const response = await axios.post('/auth/register', data);
        return response.data;
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch { /* ignore */ }
        setUser(null);
    };

    const updateUser = (data) => {
        setUser(prev => ({ ...prev, ...data }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
