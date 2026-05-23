import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import PWAStatus from './components/PWAStatus';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import LinkDetail from './pages/LinkDetail';
import HistoryPage from './pages/History';
import Trash from './pages/Trash';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';

// Admin (secret)
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const queryClient = new QueryClient();

// Loader Spinner Full Screen
const FullScreenLoader = () => (
    <div style={{ minHeight:'100vh', background:'#050911', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
    </div>
);

// Protected Route Wrap
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <FullScreenLoader />;
    if (!user) return <Navigate to="/login" />;
    return <Layout>{children}</Layout>;
};

// Guest Route Wrap
const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <FullScreenLoader />;
    if (user) return <Navigate to="/dashboard" />;

    // Si c'est la première visite (onboarding non complété), on redirige vers l'onboarding
    const hasCompletedOnboarding = localStorage.getItem('has_completed_onboarding') === 'true';
    if (!hasCompletedOnboarding) {
        return <Navigate to="/onboarding" />;
    }

    return children;
};

// Admin Route Wrap (client-side guard – real security is on API middleware)
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <FullScreenLoader />;
    if (!user || !user.is_admin) return <Navigate to="/admin-secret-access" />;
    return children;
};

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Onboarding */}
            <Route path="/onboarding" element={<Onboarding />} />

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

            {/* Admin secret portal – aucun lien visible dans l'interface */}
            <Route path="/admin-secret-access" element={<AdminLogin />} />
            <Route path="/admin-secret-access/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

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
                        <ToastProvider>
                            <PWAStatus />
                            <App />
                        </ToastProvider>
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </React.StrictMode>
    );
}

export default App;
