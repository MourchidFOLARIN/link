import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import LinkDetail from './pages/LinkDetail';
import HistoryPage from './pages/History';
import Trash from './pages/Trash';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div style={{ minHeight:'100vh', background:'#050911', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
            </div>
        );
    }
    if (!user) return <Navigate to="/login" />;
    return children;
};

const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div style={{ minHeight:'100vh', background:'#050911', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
            </div>
        );
    }
    if (user) return <Navigate to="/dashboard" />;
    return children;
};

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Auth (guests only) */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/links/:id" element={<ProtectedRoute><LinkDetail /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

if (document.getElementById('app')) {
    const root = createRoot(document.getElementById('app'));
    root.render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </React.StrictMode>
    );
}

export default App;
