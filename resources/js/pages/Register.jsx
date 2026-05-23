import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Link2 } from 'lucide-react';
import axios from 'axios';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await axios.post('/auth/register', formData);
            navigate('/login');
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
            {/* Decorative orbs */}
            <div style={{
                position:'fixed', top:'10%', right:'15%',
                width:280, height:280, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                filter:'blur(40px)', pointerEvents:'none'
            }}/>

            <div className="auth-card animate-fade-in-up" style={{ maxWidth: 480 }}>
                {/* Logo */}
                <div className="auth-logo">
                    <Link2 size={26} color="white" />
                </div>

                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0, marginBottom: 6 }}>
                        Créer un compte ✨
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

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
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
