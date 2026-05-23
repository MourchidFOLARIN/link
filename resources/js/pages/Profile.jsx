import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Briefcase, Camera, Trash2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const fileRef = useRef(null);

    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', profession: user?.profession || '' });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true); setMessage(''); setError('');
        try {
            const res = await axios.patch('/user/profile', form);
            updateUser(res.data.data);
            setMessage('Profil mis à jour avec succès !');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
        } finally { setSaving(false); }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true); setError('');
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            const res = await axios.post('/user/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            updateUser({ avatar: res.data.data.avatar, avatar_url: res.data.data.avatar_url });
            setMessage('Avatar mis à jour !');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'upload.');
        } finally { setUploading(false); }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm('Supprimer votre avatar ?')) return;
        try {
            await axios.delete('/user/avatar');
            updateUser({ avatar: null, avatar_url: null });
            setMessage('Avatar supprimé.');
        } catch (err) {
            setError('Erreur lors de la suppression.');
        }
    };

    return (
        <div className="bg-mesh" style={{ minHeight:'100vh', padding:40 }}>
            <div style={{ maxWidth:600, margin:'0 auto' }}>
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:36 }}>
                    <button onClick={() => navigate('/dashboard')} style={{ padding:10, color:'#94a3b8', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, cursor:'pointer', display:'flex' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize:24, fontWeight:700, color:'#f1f5f9', margin:0 }}>Mon Profil</h2>
                        <p style={{ color:'#64748b', fontSize:14, margin:'4px 0 0' }}>Gérez vos informations personnelles.</p>
                    </div>
                </div>

                {/* Messages */}
                {message && <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'#4ade80', padding:'12px 16px', borderRadius:12, fontSize:14, marginBottom:20 }}>{message}</div>}
                {error && <div className="alert-error" style={{ marginBottom:20 }}>{error}</div>}

                {/* Avatar Section */}
                <div className="glass-card" style={{ padding:28, marginBottom:24 }}>
                    <h3 style={{ fontSize:16, fontWeight:600, color:'#f1f5f9', margin:'0 0 20px' }}>Photo de profil</h3>
                    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                        <div style={{ width:80, height:80, borderRadius:20, overflow:'hidden', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            ) : (
                                <span style={{ color:'white', fontSize:28, fontWeight:700, textTransform:'uppercase' }}>{user?.name?.[0]}</span>
                            )}
                        </div>
                        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                            <input type="file" ref={fileRef} onChange={handleAvatarUpload} accept="image/*" style={{ display:'none' }} />
                            <button className="btn-secondary" onClick={() => fileRef.current.click()} disabled={uploading} style={{ fontSize:13 }}>
                                <Camera size={15} /> {uploading ? 'Upload...' : 'Changer'}
                            </button>
                            {user?.avatar_url && (
                                <button className="btn-danger" onClick={handleDeleteAvatar} style={{ fontSize:13 }}>
                                    <Trash2 size={15} /> Supprimer
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="glass-card" style={{ padding:28 }}>
                    <h3 style={{ fontSize:16, fontWeight:600, color:'#f1f5f9', margin:'0 0 20px' }}>Informations</h3>
                    <form onSubmit={handleSaveProfile} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                        <div>
                            <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Nom complet</label>
                            <div style={{ position:'relative' }}>
                                <User size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                                <input name="name" value={form.name} onChange={handleChange} required className="input-field input-with-icon" />
                            </div>
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Adresse Email</label>
                            <div style={{ position:'relative' }}>
                                <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                                <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field input-with-icon" />
                            </div>
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Profession</label>
                            <div style={{ position:'relative' }}>
                                <Briefcase size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                                <input name="profession" value={form.profession} onChange={handleChange} placeholder="Développeur, Designer..." className="input-field input-with-icon" />
                            </div>
                        </div>
                        <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent:'center', padding:'12px 20px', marginTop:4 }}>
                            {saving ? <span className="spinner" /> : <><Save size={16} /> Enregistrer</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
