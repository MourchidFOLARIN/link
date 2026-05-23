import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Link2, LayoutDashboard, History, Trash2,
    LogOut, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Historique',      icon: History,          path: '/history'   },
    { label: 'Corbeille',       icon: Trash2,            path: '/trash'     },
    { label: 'Profil',          icon: User,              path: '/profile'   },
];

const Layout = ({ children }) => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const active = (path) => location.pathname === path;

    return (
        <div className="app-layout bg-mesh">
            {/* ── Sidebar ── */}
            <aside className="sidebar">
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Link2 size={20} color="white" />
                    </div>
                    <span className="sidebar-logo-text">ExellenceLink</span>
                </div>

                {/* Nav */}
                <span className="sidebar-section-label">Navigation</span>
                <nav className="sidebar-nav">
                    {NAV.map(({ label, icon: Icon, path }) => (
                        <button
                            key={path}
                            className={`sidebar-item ${active(path) ? 'active' : ''}`}
                            onClick={() => navigate(path)}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    {/* User Row */}
                    <div
                        className="sidebar-user"
                        onClick={() => navigate('/profile')}
                    >
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt="avatar"
                                style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                            />
                        ) : (
                            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, borderRadius: 10 }}>
                                {user?.name?.[0]}
                            </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.name}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.profession || 'Utilisateur'}
                            </p>
                        </div>
                        <User size={14} style={{ color: '#475569', flexShrink: 0 }} />
                    </div>

                    <button
                        className="sidebar-item"
                        onClick={handleLogout}
                        style={{ color: '#fb7185' }}
                    >
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="app-main">
                <header className="mobile-topbar">
                    <div className="mobile-brand">
                        <div className="sidebar-logo-icon">
                            <Link2 size={18} color="white" />
                        </div>
                        <span>ExellenceLink</span>
                    </div>
                    {user?.avatar_url ? (
                        <button className="mobile-avatar" onClick={() => navigate('/profile')} aria-label="Profil">
                            <img src={user.avatar_url} alt="" />
                        </button>
                    ) : (
                        <button className="mobile-avatar" onClick={() => navigate('/profile')} aria-label="Profil">
                            {user?.name?.[0]}
                        </button>
                    )}
                </header>
                {children}
            </main>

            <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
                {NAV.map(({ label, icon: Icon, path }) => (
                    <button
                        key={path}
                        className={`mobile-nav-item ${active(path) ? 'active' : ''}`}
                        onClick={() => navigate(path)}
                        aria-label={label}
                    >
                        <Icon size={19} />
                        <span>{label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
