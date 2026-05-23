import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { checkAuth(); }, []);

    const persistToken = (token) => {
        if (!token) return;

        localStorage.setItem('auth_token', token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    };

    const clearToken = () => {
        localStorage.removeItem('auth_token');
        delete axios.defaults.headers.common.Authorization;
    };

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                axios.defaults.headers.common.Authorization = `Bearer ${token}`;
            }

            const response = await axios.get('/user');
            setUser(response.data);
        } catch {
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        await axios.get('/sanctum/csrf-cookie', { baseURL: '' });
        const response = await axios.post('/auth/login', credentials);
        persistToken(response.data?.access_token);
        await checkAuth();
        return response.data;
    };

    const register = async (data) => {
        await axios.get('/sanctum/csrf-cookie', { baseURL: '' });
        const response = await axios.post('/auth/register', data);
        persistToken(response.data?.access_token);
        await checkAuth();
        return response.data;
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch { /* ignore */ }
        clearToken();
        setUser(null);
    };

    const updateUser = (data) => {
        setUser(prev => ({ ...prev, ...data }));
    };

    const loginWithToken = async (token) => {
        persistToken(token);
        await checkAuth();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, updateUser, loginWithToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

export const useAuth = () => useContext(AuthContext);
