import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import AppLogo from '../components/AppLogo';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, loginWithToken } = useAuth();
    const navigate = useNavigate();

    // Gestion du retour d'authentification Google
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const err = params.get('error');

        if (token) {
            setLoading(true);
            loginWithToken(token)
                .then(() => {
                    navigate('/dashboard');
                })
                .catch(() => {
                    setError("Erreur lors de la connexion automatique via Google.");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (err) {
            if (err === 'google_not_configured') {
                setError("La connexion Google n'est pas encore configurée par l'administrateur. Veuillez renseigner GOOGLE_CLIENT_ID dans le fichier .env.");
            } else {
                setError("Échec de l'authentification Google. Veuillez réessayer.");
            }
            // Nettoyer l'URL des paramètres d'erreur
            navigate('/login', { replace: true });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch {
            setError('Identifiants invalides ou erreur serveur.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setLoading(true);
        window.location.href = '/api/auth/google/redirect';
    };

    return (
        <div className="auth-page animate-fade-in">
            {/* Decorative orbs */}
            <div style={{
                position:'fixed', top:'15%', left:'10%',
                width:300, height:300, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                filter:'blur(40px)', pointerEvents:'none'
            }}/>
            <div style={{
                position:'fixed', bottom:'20%', right:'8%',
                width:250, height:250, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                filter:'blur(40px)', pointerEvents:'none'
            }}/>

            <div className="auth-card animate-fade-in-up">
                {/* Logo */}
                <AppLogo />

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0, marginBottom: 6 }}>
                        Bon retour 👋
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                        Connectez-vous pour accéder à vos liens.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="alert-error" style={{ marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>
                            Adresse Email
                        </label>
                        <div style={{ position:'relative' }}>
                            <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                            <input
                                id="login-email"
                                type="email"
                                placeholder="nom@exemple.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="input-field input-with-icon"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>
                            Mot de passe
                        </label>
                        <div style={{ position:'relative' }}>
                            <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                            <input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="input-field input-with-icon"
                            />
                        </div>
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ justifyContent:'center', padding:'13px 20px', marginTop: 6, fontSize:15 }}
                    >
                        {loading && !email ? <span className="spinner" /> : 'Se connecter'}
                    </button>
                </form>

                {/* Social Login Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0', gap: 10 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ color: '#475569', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ou</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    type="button"
                    style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: 12,
                        fontWeight: 600,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        outline: 'none'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 2 }}>
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.549 0 9s.347 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.886 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Continuer avec Google
                </button>

                {/* Footer */}
                <hr className="divider" style={{ margin: '28px 0' }} />
                <p style={{ textAlign:'center', color:'#475569', fontSize:13, margin:0 }}>
                    Pas encore de compte ?{' '}
                    <Link to="/register" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}>
                        Créer un compte
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
