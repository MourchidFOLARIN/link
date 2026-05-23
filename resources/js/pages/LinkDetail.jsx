import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Eye, Clock, Edit3, Trash2, Save, X, Upload, Tag } from 'lucide-react';

const LinkDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
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
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => axios.delete(`/links/${id}`),
        onSuccess: () => navigate('/dashboard')
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
            <div className="bg-mesh" style={{ minHeight:'100vh', padding:40 }}>
                <div style={{ maxWidth:800, margin:'0 auto' }}>
                    <div className="skeleton" style={{ height:400, borderRadius:20 }} />
                </div>
            </div>
        );
    }

    const link = data;
    if (!link) return null;

    const currentImage = imagePreview || (link.preview_image ? `/storage/${link.preview_image}` : null);

    return (
        <div className="bg-mesh" style={{ minHeight:'100vh', padding:40 }}>
            <div style={{ maxWidth:800, margin:'0 auto' }}>
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
                    <button onClick={() => navigate('/dashboard')} style={{ padding:10, color:'#94a3b8', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, cursor:'pointer', display:'flex' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ display:'flex', gap:10 }}>
                        {!editing ? (
                            <>
                                <button className="btn-secondary" onClick={startEdit}><Edit3 size={15} /> Modifier</button>
                                <button className="btn-danger" onClick={() => { if(confirm('Déplacer vers la corbeille ?')) deleteMutation.mutate(); }}><Trash2 size={15} /></button>
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

                {/* Card */}
                <div className="glass-card animate-fade-in-up" style={{ overflow:'hidden' }}>
                    {/* Image Preview */}
                    <div style={{ aspectRatio:'16/9', background:'rgba(255,255,255,0.02)', position:'relative', overflow:'hidden' }}>
                        {currentImage ? (
                            <img src={currentImage} alt={link.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : (
                            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#1e293b' }}>
                                <ExternalLink size={64} strokeWidth={1} />
                            </div>
                        )}
                        {/* Status badge */}
                        {link.processing_status && link.processing_status !== 'completed' && (
                            <div style={{ position:'absolute', top:16, right:16 }}>
                                <div className={`badge ${link.processing_status === 'pending' ? 'badge-pending' : 'badge-failed'}`}>
                                    <Clock size={11} /> {link.processing_status === 'pending' ? 'Analyse IA...' : 'Échec IA'}
                                </div>
                            </div>
                        )}
                        {/* Upload button when editing */}
                        {editing && (
                            <div style={{ position:'absolute', bottom:16, right:16 }}>
                                <input type="file" ref={fileRef} onChange={handleImageSelect} accept="image/*" style={{ display:'none' }} />
                                <button className="btn-primary" onClick={() => fileRef.current.click()} style={{ fontSize:13, padding:'8px 14px' }}>
                                    <Upload size={14} /> Changer l'image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div style={{ padding:'28px 32px' }}>
                        {!editing ? (
                            <>
                                <h1 style={{ fontSize:24, fontWeight:700, color:'#f1f5f9', margin:'0 0 12px', lineHeight:1.3 }}>
                                    {link.title || 'Sans titre'}
                                </h1>
                                <p style={{ color:'#94a3b8', fontSize:15, lineHeight:1.7, margin:'0 0 24px' }}>
                                    {link.description || 'Aucune description disponible.'}
                                </p>
                            </>
                        ) : (
                            <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:24 }}>
                                <div>
                                    <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Titre</label>
                                    <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="input-field" style={{ fontSize:18, fontWeight:600 }} />
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Description</label>
                                    <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="input-field" rows={4} style={{ resize:'vertical', fontFamily:'inherit' }} />
                                </div>
                            </div>
                        )}

                        {/* URL */}
                        <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#818cf8', textDecoration:'none', fontSize:14, fontWeight:500, padding:'8px 16px', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:10, marginBottom:24, maxWidth:'100%', overflow:'hidden' }}>
                            <ExternalLink size={14} style={{ flexShrink:0 }} />
                            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{link.url}</span>
                        </a>

                        <hr className="divider" />

                        {/* Metadata */}
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:16, marginTop:20 }}>
                            <div>
                                <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:1, margin:'0 0 4px' }}>Domaine</p>
                                <span className="domain-pill">{link.source_domain}</span>
                            </div>
                            <div>
                                <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:1, margin:'0 0 4px' }}>Vues</p>
                                <p style={{ color:'#f1f5f9', fontSize:15, fontWeight:600, margin:0, display:'flex', alignItems:'center', gap:6 }}><Eye size={14} /> {link.views_count}</p>
                            </div>
                            <div>
                                <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:1, margin:'0 0 4px' }}>Ajouté le</p>
                                <p style={{ color:'#94a3b8', fontSize:13, margin:0 }}>{formatDate(link.created_at)}</p>
                            </div>
                            <div>
                                <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:1, margin:'0 0 4px' }}>Dernière vue</p>
                                <p style={{ color:'#94a3b8', fontSize:13, margin:0 }}>{formatDate(link.last_viewed_at)}</p>
                            </div>
                        </div>

                        {/* Categories */}
                        {link.categories && link.categories.length > 0 && (
                            <div style={{ marginTop:20 }}>
                                <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:1, margin:'0 0 8px' }}>Catégories</p>
                                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                    {link.categories.map(cat => (
                                        <span key={cat.id} className="badge badge-success" style={{ textTransform:'none', letterSpacing:0 }}>
                                            <Tag size={10} /> {cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkDetail;
