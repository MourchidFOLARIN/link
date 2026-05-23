import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Eye, Clock, Edit3, Trash2, Save, X, Upload, Tag, CalendarDays, Globe } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const LinkDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();
    const fileRef = useRef(null);

    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['link', id],
        queryFn: async () => {
            const res = await axios.get(`/links/${id}`);
            return res.data.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await axios.post(`/links/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['link', id]);
            queryClient.invalidateQueries(['links']);
            setEditing(false);
            setImageFile(null);
            setImagePreview(null);
            toast.success('Modifications enregistrées');
        },
        onError: () => toast.error('Erreur lors de la sauvegarde')
    });

    const deleteMutation = useMutation({
        mutationFn: () => axios.delete(`/links/${id}`),
        onSuccess: () => {
            toast.success('Lien déplacé dans la corbeille');
            navigate('/dashboard');
        }
    });

    const startEdit = () => {
        setEditForm({ title: data?.title || '', description: data?.description || '' });
        setEditing(true);
    };

    const handleSave = () => {
        const fd = new FormData();
        fd.append('title', editForm.title);
        fd.append('description', editForm.description);
        if (imageFile) fd.append('preview_image_file', imageFile);
        updateMutation.mutate(fd);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

    if (isLoading) {
        return (
            <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
                <div className="skeleton" style={{ height: 500, borderRadius: 24 }} />
            </div>
        );
    }

    const link = data;
    if (!link) return null;

    const currentImage = imagePreview || (link.preview_image ? `/storage/${link.preview_image}` : null);

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
            
            {/* Header Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="btn-secondary"
                    style={{ padding: '8px 16px' }}
                >
                    <ArrowLeft size={16} /> Retour
                </button>

                <div style={{ display: 'flex', gap: 12 }}>
                    {!editing ? (
                        <>
                            <button className="btn-secondary" onClick={startEdit}><Edit3 size={15} /> Modifier</button>
                            <button className="btn-danger" onClick={() => { if(confirm('Déplacer vers la corbeille ?')) deleteMutation.mutate(); }}><Trash2 size={15} /> Supprimer</button>
                        </>
                    ) : (
                        <>
                            <button className="btn-secondary" onClick={() => { setEditing(false); setImageFile(null); setImagePreview(null); }}><X size={15} /> Annuler</button>
                            <button className="btn-primary" onClick={handleSave} disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? <span className="spinner" /> : <><Save size={15} /> Enregistrer</>}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Card */}
            <div className="glass-card animate-fade-in-up" style={{ overflow: 'hidden', padding: 0 }}>
                {/* Image Header */}
                <div style={{ aspectRatio: '21/9', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {currentImage ? (
                        <img src={currentImage} alt={link.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
                            <Globe size={80} strokeWidth={1} />
                        </div>
                    )}
                    
                    {/* Status badge */}
                    {link.processing_status && link.processing_status !== 'completed' && (
                        <div style={{ position: 'absolute', top: 20, right: 20 }}>
                            <div className={`badge ${link.processing_status === 'pending' ? 'badge-pending' : 'badge-failed'}`} style={{ padding: '6px 14px', fontSize: 12 }}>
                                <Clock size={14} /> {link.processing_status === 'pending' ? 'Analyse IA en cours...' : 'Échec de l\'analyse IA'}
                            </div>
                        </div>
                    )}

                    {/* Image Edit Overlay */}
                    {editing && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <input type="file" ref={fileRef} onChange={handleImageSelect} accept="image/*" style={{ display: 'none' }} />
                            <button className="btn-primary" onClick={() => fileRef.current.click()} style={{ padding: '12px 24px', fontSize: 15 }}>
                                <Upload size={18} /> Changer l'image de couverture
                            </button>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div style={{ padding: '40px' }}>
                    {!editing ? (
                        <>
                            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', margin: '0 0 16px', lineHeight: 1.3 }}>
                                {link.title || 'Sans titre'}
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8, margin: '0 0 32px' }}>
                                {link.description || 'Aucune description disponible.'}
                            </p>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>Titre</label>
                                <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="input-field" style={{ fontSize: 20, fontWeight: 700, padding: '14px 20px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>Description</label>
                                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="input-field" rows={5} style={{ resize: 'vertical', fontSize: 15, lineHeight: 1.6 }} />
                            </div>
                        </div>
                    )}

                    {/* URL Action Button */}
                    <a 
                        href={link.url} target="_blank" rel="noopener noreferrer" 
                        className="btn-primary"
                        style={{ display: 'inline-flex', padding: '14px 24px', fontSize: 15, marginBottom: 32 }}
                    >
                        Visiter le site <ExternalLink size={16} />
                    </a>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, padding: '24px', background: 'rgba(255,255,255,0.015)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Source</p>
                            <span className="domain-pill" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.2)' }}>{link.source_domain}</span>
                        </div>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Consultations</p>
                            <p style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Eye size={16} style={{ color: '#06b6d4' }} /> {link.views_count}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Ajouté le</p>
                            <p style={{ color: '#cbd5e1', fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><CalendarDays size={14} style={{ color: '#64748b' }} /> {formatDate(link.created_at)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Dernière vue</p>
                            <p style={{ color: '#cbd5e1', fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={14} style={{ color: '#64748b' }} /> {formatDate(link.last_viewed_at)}</p>
                        </div>
                    </div>

                    {/* Categories Tags */}
                    {link.categories && link.categories.length > 0 && (
                        <div style={{ marginTop: 32 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px' }}>Catégories associées</p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {link.categories.map(cat => (
                                    <span key={cat.id} className="cat-tag" style={{ padding: '6px 14px', fontSize: 12 }}>
                                        <Tag size={12} /> {cat.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkDetail;
