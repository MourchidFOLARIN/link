import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Link2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

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
                <div className="auth-logo">
                    <Link2 size={26} color="white" />
                </div>

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
                        {loading ? <span className="spinner" /> : 'Se connecter'}
                    </button>
                </form>

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
