import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Link2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await axios.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page animate-fade-in">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-logo">
                    <Link2 size={26} color="white" />
                </div>
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
                        Mot de passe oublié ?
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                        Entrez votre email et nous vous enverrons un lien de réinitialisation.
                    </p>
                </div>

                {message && (
                    <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'#4ade80', padding:'12px 16px', borderRadius:12, fontSize:14, marginBottom:20 }}>
                        {message}
                    </div>
                )}
                {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Adresse Email</label>
                        <div style={{ position:'relative' }}>
                            <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                            <input type="email" placeholder="nom@exemple.com" value={email} onChange={e => setEmail(e.target.value)} required className="input-field input-with-icon" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent:'center', padding:'13px 20px', fontSize:15 }}>
                        {loading ? <span className="spinner" /> : 'Envoyer le lien'}
                    </button>
                </form>

                <hr className="divider" style={{ margin: '24px 0' }} />
                <p style={{ textAlign:'center', margin:0 }}>
                    <Link to="/login" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none', fontSize:13, display:'inline-flex', alignItems:'center', gap:6 }}>
                        <ArrowLeft size={14} /> Retour à la connexion
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
