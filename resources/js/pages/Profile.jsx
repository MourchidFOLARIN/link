import React, { useState, useRef } from 'react';
import { User, Mail, Briefcase, Camera, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const fileRef = useRef(null);

    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', profession: user?.profession || '' });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.patch('/user/profile', form);
            updateUser(res.data.data);
            toast.success('Profil mis à jour avec succès');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally { setSaving(false); }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            const res = await axios.post('/user/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            updateUser({ avatar: res.data.data.avatar, avatar_url: res.data.data.avatar_url });
            toast.success('Avatar mis à jour');
        } catch (err) {
            toast.error('Erreur lors de l\'upload');
        } finally { setUploading(false); }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm('Supprimer votre avatar ?')) return;
        try {
            await axios.delete('/user/avatar');
            updateUser({ avatar: null, avatar_url: null });
            toast.success('Avatar supprimé');
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
            
            <header className="page-header" style={{ marginBottom: 40 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(6,182,212,0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={20} />
                        </div>
                        Mon Profil
                    </h1>
                    <p className="page-subtitle">Gérez vos informations personnelles et préférences.</p>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Avatar Section */}
                <div className="glass-card animate-fade-in-up responsive-profile-card">
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: 100, height: 100, borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(99,102,241,0.2)' }}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ color: 'white', fontSize: 36, fontWeight: 800, textTransform: 'uppercase' }}>{user?.name?.[0]}</span>
                            )}
                        </div>
                        <button 
                            className="btn-primary" 
                            style={{ position: 'absolute', bottom: -8, right: -8, padding: 8, borderRadius: '50%', width: 36, height: 36, justifyContent: 'center' }}
                            onClick={() => fileRef.current.click()}
                            disabled={uploading}
                        >
                            {uploading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Camera size={16} />}
                        </button>
                        <input type="file" ref={fileRef} onChange={handleAvatarUpload} accept="image/*" style={{ display: 'none' }} />
                    </div>
                    
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>Photo de profil</h3>
                        <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 16px' }}>Image PNG, JPG ou WEBP. Max 2 Mo.</p>
                        {user?.avatar_url && (
                            <button className="btn-danger" onClick={handleDeleteAvatar}>Supprimer l'avatar</button>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="glass-card animate-fade-in-up" style={{ padding: 32, animationDelay: '0.1s' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 24px' }}>Informations personnelles</h3>
                    
                    <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>Nom complet</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input name="name" value={form.name} onChange={handleChange} required className="input-field input-with-icon" style={{ padding: '14px 16px 14px 48px' }} />
                            </div>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>Adresse Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field input-with-icon" style={{ padding: '14px 16px 14px 48px' }} />
                            </div>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>Profession</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input name="profession" value={form.profession} onChange={handleChange} placeholder="ex: Développeur, Designer..." className="input-field input-with-icon" style={{ padding: '14px 16px 14px 48px' }} />
                            </div>
                        </div>

                        <hr className="divider" style={{ margin: '8px 0' }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px 24px' }}>
                                {saving ? <span className="spinner" /> : <><Save size={16} /> Enregistrer les modifications</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
