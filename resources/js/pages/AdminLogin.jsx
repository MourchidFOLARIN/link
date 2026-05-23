import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, logout, user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Rediriger si déjà connecté comme administrateur
    useEffect(() => {
        if (user && user.is_admin) {
            navigate('/admin-secret-access/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await login({ email, password });
            
            // Le backend Laravel retourne le user dans res.data
            const userData = res.data;
            
            if (userData && userData.is_admin) {
                toast.success('Accès administrateur accordé');
                navigate('/admin-secret-access/dashboard');
            } else {
                // Déconnexion car l'utilisateur n'est pas admin
                await logout();
                setError("Accès refusé. Ce portail est réservé aux administrateurs.");
                toast.error("Permissions insuffisantes.");
            }
        } catch (err) {
            setError('Identifiants incorrects ou erreur de communication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page animate-fade-in">
            {/* Decorative Orbs */}
            <div style={{
                position:'fixed', top:'10%', left:'5%',
                width:350, height:350, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                filter:'blur(50px)', pointerEvents:'none'
            }}/>
            <div style={{
                position:'fixed', bottom:'15%', right:'5%',
                width:300, height:300, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)',
                filter:'blur(50px)', pointerEvents:'none'
            }}/>

            <div className="auth-card animate-fade-in-scale" style={{ border: '1px solid rgba(244,63,94,0.15)', boxShadow: '0 30px 70px rgba(0,0,0,0.65), 0 0 40px rgba(244,63,94,0.03)' }}>
                {/* Custom Logo for Secret Portal */}
                <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)', boxShadow: '0 8px 24px rgba(244,63,94,0.3)' }}>
                    <ShieldAlert size={26} color="white" />
                </div>

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: 0, marginBottom: 8, letterSpacing: '-0.5px' }}>
                        Portail d'Administration
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.4 }}>
                        Veuillez vous authentifier avec vos privilèges administratifs pour accéder au backoffice.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="alert-error animate-fade-in-up" style={{ marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:7 }}>
                            Adresse Email Admin
                        </label>
                        <div style={{ position:'relative' }}>
                            <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                            <input
                                id="admin-email"
                                type="email"
                                placeholder="admin@exellencelink.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="input-field input-with-icon"
                                style={{ background: 'rgba(255,255,255,0.02)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:7 }}>
                            Mot de passe
                        </label>
                        <div style={{ position:'relative' }}>
                            <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                            <input
                                id="admin-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="input-field input-with-icon"
                                style={{ background: 'rgba(255,255,255,0.02)' }}
                            />
                        </div>
                    </div>

                    <button
                        id="admin-login-submit"
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ 
                            justifyContent:'center', 
                            padding:'13px 20px', 
                            marginTop: 10, 
                            fontSize:14,
                            background: 'linear-gradient(135deg, #f43f5e, #b829f7)',
                            boxShadow: '0 4px 16px rgba(244,63,94,0.2)'
                        }}
                        onMouseOver={e => { if(!loading) e.currentTarget.style.background='linear-gradient(135deg, #fb7185, #c084fc)'; }}
                        onMouseOut={e => { if(!loading) e.currentTarget.style.background='linear-gradient(135deg, #f43f5e, #b829f7)'; }}
                    >
                        {loading ? <span className="spinner" /> : 'S\'authentifier'}
                    </button>
                </form>

                {/* Secret portal disclaimer */}
                <div style={{ display:'flex', alignItems:'center', gap: 8, justifyContent:'center', marginTop: 24, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize:11, color:'#475569', fontWeight:600, textTransform:'uppercase', letterSpacing: '0.8px' }}>
                        Accès Sécurisé • Traçabilité Active
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
