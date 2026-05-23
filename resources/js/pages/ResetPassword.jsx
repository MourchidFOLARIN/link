import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Link2 } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await axios.post('/auth/reset-password', {
                token: searchParams.get('token'),
                email: searchParams.get('email'),
                password,
                password_confirmation: passwordConfirmation,
            });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page animate-fade-in">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-logo"><Link2 size={26} color="white" /></div>
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>Nouveau mot de passe</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Choisissez un mot de passe sécurisé.</p>
                </div>

                {message && (
                    <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'#4ade80', padding:'12px 16px', borderRadius:12, fontSize:14, marginBottom:20 }}>
                        {message} — Redirection...
                    </div>
                )}
                {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                    <div>
                        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Nouveau mot de passe</label>
                        <div style={{ position:'relative' }}>
                            <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="input-field input-with-icon" />
                        </div>
                    </div>
                    <div>
                        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Confirmer le mot de passe</label>
                        <div style={{ position:'relative' }}>
                            <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                            <input type="password" placeholder="••••••••" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required className="input-field input-with-icon" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent:'center', padding:'13px 20px', fontSize:15 }}>
                        {loading ? <span className="spinner" /> : 'Réinitialiser'}
                    </button>
                </form>

                <hr className="divider" style={{ margin:'24px 0' }} />
                <p style={{ textAlign:'center', margin:0 }}>
                    <Link to="/login" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none', fontSize:13 }}>Retour à la connexion</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
