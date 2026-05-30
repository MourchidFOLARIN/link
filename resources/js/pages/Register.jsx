import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Link2 } from 'lucide-react';
import AppLogo from '../components/AppLogo';
import { useAuth } from '../context/AuthContext';

const FieldInput = ({ label, name, type = 'text', icon: Icon, placeholder, value, onChange, required, error }) => (
    <div>
        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>{label}</label>
        <div style={{ position:'relative' }}>
            {Icon && <Icon size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />}
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className={`input-field ${Icon ? 'input-with-icon' : ''}`}
            />
        </div>
        {error && <p style={{ color:'#f87171', fontSize:12, marginTop:5, marginLeft:2 }}>{error[0]}</p>}
    </div>
);

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', password_confirmation: '', profession: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
            else setErrors({ general: 'Une erreur est survenue.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="auth-page animate-fade-in" style={{ alignItems: 'flex-start', paddingTop: 48, paddingBottom: 48 }}>
            <div className="auth-card animate-fade-in-up" style={{ maxWidth: 480 }}>
                <AppLogo />

                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0, marginBottom: 6 }}>
                        Créer un compte
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                        Rejoignez ExellenceLink dès maintenant.
                    </p>
                </div>

                {errors.general && (
                    <div className="alert-error" style={{ marginBottom: 20 }}>{errors.general}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    <FieldInput label="Nom complet" name="name" icon={User} placeholder="John Doe" value={formData.name} onChange={handleChange} required error={errors.name} />
                    <FieldInput label="Adresse Email" name="email" type="email" icon={Mail} placeholder="john@exemple.com" value={formData.email} onChange={handleChange} required error={errors.email} />
                    <FieldInput label="Profession" name="profession" icon={Briefcase} placeholder="Développeur, Designer..." value={formData.profession} onChange={handleChange} />

                    <div className="auth-password-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <FieldInput label="Mot de passe" name="password" type="password" icon={Lock} placeholder="••••••••" value={formData.password} onChange={handleChange} required error={errors.password} />
                        <FieldInput label="Confirmer" name="password_confirmation" type="password" icon={Lock} placeholder="••••••••" value={formData.password_confirmation} onChange={handleChange} required />
                    </div>

                    <button
                        id="register-submit"
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ justifyContent:'center', padding:'13px 20px', marginTop:6, fontSize:15 }}
                    >
                        {loading ? <span className="spinner" /> : "S'inscrire"}
                    </button>
                </form>

                {/* Social Login Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: 10 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ color: '#475569', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ou</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Google Sign Up Button */}
                <button
                    onClick={() => {
                        setLoading(true);
                        window.location.href = '/api/auth/google/redirect';
                    }}
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

                <hr className="divider" style={{ margin: '24px 0' }} />
                <p style={{ textAlign:'center', color:'#475569', fontSize:13, margin:0 }}>
                    Déjà un compte ?{' '}
                    <Link to="/login" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}>
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
