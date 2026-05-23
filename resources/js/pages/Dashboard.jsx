import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
    Plus, Search, Trash2, ExternalLink, Clock, AlertCircle, Link2, 
    Upload, Tag, X, MoreVertical, LayoutGrid, List
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

/* ── LinkCard ── */
const LinkCard = ({ link, onDelete, onNavigate }) => (
    <div className="link-card animate-fade-in-up stagger-children" onClick={() => onNavigate(`/links/${link.id}`)}>
        {/* Preview */}
        <div className="link-card-preview">
            {link.preview_image ? (
                <img src={`/storage/${link.preview_image}`} alt={link.title} loading="lazy" />
            ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#1e293b' }}>
                    <ExternalLink size={42} strokeWidth={1.2} />
                </div>
            )}
            
            {/* Status badges */}
            <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:6, flexDirection:'column', alignItems:'flex-end' }}>
                {link.processing_status === 'pending' && (
                    <div className="badge badge-pending" style={{ animation:'pulse-glow 2s infinite' }}>
                        <Clock size={10} /> Analyse IA
                    </div>
                )}
                {link.processing_status === 'failed' && (
                    <div className="badge badge-failed">
                        <AlertCircle size={10} /> Échec
                    </div>
                )}
            </div>
        </div>

        {/* Content */}
        <div style={{ padding:'18px 20px', flex:1, display:'flex', flexDirection:'column' }}>
            <h3 style={{ fontWeight:600, fontSize:15, color:'#f1f5f9', margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:'1.4', marginBottom:6 }}>
                {link.title || 'Sans titre'}
            </h3>
            
            <p style={{ color:'#64748b', fontSize:13, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', flex:1, lineHeight:'1.5' }}>
                {link.description || 'Aucune description disponible.'}
            </p>

            {/* Categories Tags */}
            {link.categories && link.categories.length > 0 && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop: 14 }}>
                    {link.categories.slice(0, 3).map(cat => (
                        <span key={cat.id} className="cat-tag">
                            {cat.name}
                        </span>
                    ))}
                    {link.categories.length > 3 && (
                        <span className="cat-tag" style={{ background:'rgba(255,255,255,0.05)', color:'#94a3b8', borderColor:'rgba(255,255,255,0.1)' }}>
                            +{link.categories.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, marginTop:14, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <span className="domain-pill">{link.source_domain}</span>
                <div style={{ display:'flex', gap:4 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="btn-icon"
                        title="Corbeille"
                        style={{ color: '#64748b' }}
                        onMouseOver={e => { e.currentTarget.style.color='#f87171'; e.currentTarget.style.background='rgba(239,68,68,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.color='#64748b'; e.currentTarget.style.background='transparent'; }}
                    >
                        <Trash2 size={15} />
                    </button>
                    <a
                        href={link.url} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-icon"
                        title="Ouvrir"
                        style={{ color: '#64748b' }}
                        onMouseOver={e => { e.currentTarget.style.color='#818cf8'; e.currentTarget.style.background='rgba(99,102,241,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.color='#64748b'; e.currentTarget.style.background='transparent'; }}
                    >
                        <ExternalLink size={15} />
                    </a>
                </div>
            </div>
        </div>
    </div>
);

/* ── Dashboard Page ── */
const Dashboard = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const queryClient = useQueryClient();

    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid'); // grid | list

    // Add Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [newImagePreview, setNewImagePreview] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [addError, setAddError] = useState('');
    const fileInputRef = useRef(null);

    // Fetch Links
    const { data: linksData, isLoading } = useQuery({
        queryKey: ['links', search, selectedCategory, page],
        queryFn: async () => {
            const res = await axios.get('/links', { 
                params: { search, category: selectedCategory, page, per_page: 12 } 
            });
            return res.data.data; // Paginated response
        },
        keepPreviousData: true
    });

    // Fetch Categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await axios.get('/categories');
            return res.data.data;
        }
    });

    // Mutations
    const addCategoryMutation = useMutation({
        mutationFn: (name) => axios.post('/categories', { name }),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['categories']);
            setSelectedCategories([...selectedCategories, res.data.data.id]);
            setNewCategoryName('');
            toast.success('Catégorie ajoutée');
        },
        onError: () => toast.error('Erreur ajout catégorie')
    });

    const addLinkMutation = useMutation({
        mutationFn: (formData) => axios.post('/links', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['links']);
            toast.success('Lien ajouté avec succès');
            closeModal();
            // Start polling if AI is processing
            setTimeout(() => queryClient.invalidateQueries(['links']), 5000);
            setTimeout(() => queryClient.invalidateQueries(['links']), 15000);
        },
        onError: (err) => {
            setAddError(err.response?.data?.message || 'Erreur réseau');
        }
    });

    const deleteLinkMutation = useMutation({
        mutationFn: (id) => axios.delete(`/links/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['links']);
            toast.success('Lien déplacé dans la corbeille');
        }
    });

    // Handlers
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            setNewImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setAddError('');
        const fd = new FormData();
        fd.append('url', newUrl);
        if (newTitle) fd.append('title', newTitle);
        if (newDescription) fd.append('description', newDescription);
        if (newImage) fd.append('preview_image_file', newImage);
        selectedCategories.forEach(id => fd.append('categories[]', id));
        
        addLinkMutation.mutate(fd);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setNewUrl(''); setNewTitle(''); setNewDescription('');
        setNewImage(null); setNewImagePreview(null);
        setSelectedCategories([]); setAddError(''); setNewCategoryName('');
    };

    const links = linksData?.data || [];
    const categories = categoriesData || [];
    const lastPage = linksData?.last_page || 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
            
            {/* Header */}
            <header className="page-header">
                <div>
                    <h1 className="page-title">Mes Liens</h1>
                    <p className="page-subtitle">Gérez et explorez vos ressources sauvegardées.</p>
                </div>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    {/* View Mode Toggle */}
                    <div className="segmented">
                        <button className={`segmented-item ${viewMode==='grid'?'active':''}`} onClick={()=>setViewMode('grid')}><LayoutGrid size={15} /></button>
                        <button className={`segmented-item ${viewMode==='list'?'active':''}`} onClick={()=>setViewMode('list')}><List size={15} /></button>
                    </div>

                    <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={16} /> Ajouter
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="glass-card dashboard-filters" style={{ padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position:'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748b' }} />
                    <input
                        type="text"
                        placeholder="Rechercher par titre, description ou URL..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="input-field input-with-icon"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    />
                </div>
                <select 
                    className="input-field" 
                    style={{ width: 220, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Stats Row (optional visual boost) */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <div className="stat-card">
                    <p className="stat-value">{linksData?.total || 0}</p>
                    <p className="stat-label">Liens sauvegardés</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{categories.length}</p>
                    <p className="stat-label">Catégories actives</p>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="links-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:24 }}>
                    {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:320 }} />)}
                </div>
            ) : links.length === 0 ? (
                <div className="empty-state animate-fade-in-up" style={{ flex: 1, justifyContent: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Link2 size={32} style={{ color:'#475569' }} />
                    </div>
                    <p style={{ color:'#f1f5f9', fontSize:18, fontWeight:600, margin:0 }}>Aucun lien trouvé</p>
                    <p style={{ color:'#64748b', fontSize:14, margin:'8px 0 0', maxWidth: 300 }}>
                        {search || selectedCategory ? "Essayez de modifier vos filtres de recherche." : "Commencez par ajouter votre premier lien."}
                    </p>
                    {!(search || selectedCategory) && (
                        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ marginTop: 24 }}>
                            <Plus size={16} /> Ajouter un lien
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="links-grid" style={{ display:'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', gap:24 }}>
                        {links.map((link, i) => (
                            <LinkCard
                                key={link.id}
                                link={link}
                                onDelete={() => { if(confirm('Déplacer vers la corbeille ?')) deleteLinkMutation.mutate(link.id); }}
                                onNavigate={navigate}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {lastPage > 1 && (
                        <div className="pagination">
                            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Préc.</button>
                            <span style={{ fontSize: 13, color: '#64748b', padding: '0 8px' }}>Page {page} / {lastPage}</span>
                            <button className="page-btn" disabled={page === lastPage} onClick={() => setPage(p => p + 1)}>Suiv.</button>
                        </div>
                    )}
                </>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                            <div>
                                <h3 style={{ fontSize:22, fontWeight:700, color:'#f1f5f9', margin:0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(99,102,241,0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={18} />
                                    </div>
                                    Ajouter un lien
                                </h3>
                                <p style={{ color:'#94a3b8', fontSize:14, margin:'6px 0 0' }}>Laissez l'IA analyser la page ou remplissez manuellement.</p>
                            </div>
                            <button onClick={closeModal} className="btn-icon">
                                <X size={20} />
                            </button>
                        </div>

                        {addError && <div className="alert-error animate-fade-in-up" style={{ marginBottom: 20 }}>{addError}</div>}
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* URL Input */}
                            <div>
                                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#cbd5e1', marginBottom:8 }}>URL du lien <span style={{ color: '#fb7185' }}>*</span></label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    required
                                    autoFocus
                                    className="input-field"
                                    style={{ fontSize: 15, padding: '14px 16px' }}
                                />
                            </div>

                            {/* Categories Selection */}
                            <div>
                                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#cbd5e1', marginBottom:8 }}>Catégories</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                    {categories.map(cat => {
                                        const isSelected = selectedCategories.includes(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                                                    else setSelectedCategories([...selectedCategories, cat.id]);
                                                }}
                                                className={`cat-tag ${isSelected ? 'active' : ''}`}
                                                style={{ 
                                                    padding: '6px 14px', fontSize: 12, 
                                                    color: isSelected ? '#fff' : '#a5b4fc',
                                                    background: isSelected ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '',
                                                    border: isSelected ? 'none' : ''
                                                }}
                                            >
                                                {cat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input 
                                        type="text" 
                                        placeholder="Nouvelle catégorie..." 
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="input-field"
                                        style={{ fontSize: 13, padding: '8px 12px' }}
                                    />
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        onClick={() => { if (newCategoryName.trim()) addCategoryMutation.mutate(newCategoryName); }}
                                        disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
                                        style={{ padding: '8px 14px' }}
                                    >
                                        {addCategoryMutation.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Créer'}
                                    </button>
                                </div>
                            </div>

                            {/* Manual Options */}
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Tag size={14} /> Remplissage manuel (Optionnel)
                                </p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <input
                                        type="text" placeholder="Titre personnalisé" value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)} className="input-field"
                                    />
                                    <textarea
                                        placeholder="Description" value={newDescription}
                                        onChange={e => setNewDescription(e.target.value)} className="input-field" rows={2} style={{ resize: 'vertical' }}
                                    />
                                    
                                    <div>
                                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display:'none' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <button type="button" className="btn-secondary" onClick={() => fileInputRef.current.click()} style={{ fontSize: 13 }}>
                                                <Upload size={14} /> Importer une image
                                            </button>
                                            {newImagePreview && (
                                                <div style={{ position: 'relative', width: 44, height: 44, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <img src={newImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { setNewImage(null); setNewImagePreview(null); }}
                                                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: 3, cursor: 'pointer' }}
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="divider" style={{ margin: '8px 0' }} />

                            <div style={{ display:'flex', gap:12 }}>
                                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent:'center' }} onClick={closeModal}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent:'center' }} disabled={addLinkMutation.isPending || !newUrl}>
                                    {addLinkMutation.isPending ? <span className="spinner" /> : 'Sauvegarder le lien'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
