import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
    Plus, Search, Trash2, LogOut, LayoutDashboard, History,
    ExternalLink, Clock, AlertCircle, MoreVertical, Link2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Sidebar ── */
const Sidebar = ({ user, onLogout, onNavigate }) => (
    <aside className="sidebar" style={{ width:260, display:'flex', flexDirection:'column', padding:24, height:'100vh', position:'sticky', top:0 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40, padding:'0 6px' }}>
            <div style={{
                width:40, height:40, borderRadius:14,
                background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 6px 20px rgba(99,102,241,0.3)'
            }}>
                <Link2 size={20} color="white" />
            </div>
            <span style={{ fontWeight:700, fontSize:18, letterSpacing:'-0.5px', color:'#f1f5f9' }}>ExellenceLink</span>
        </div>

        {/* Nav */}
        <nav style={{ display:'flex', flexDirection:'column', gap:4, flex:1 }}>
            <button className="sidebar-item active">
                <LayoutDashboard size={18} /> Tableau de bord
            </button>
            <button className="sidebar-item">
                <History size={18} /> Historique
            </button>
            <button className="sidebar-item" onClick={() => onNavigate('/trash')}>
                <Trash2 size={18} /> Corbeille
            </button>
        </nav>

        {/* User */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:20, marginTop:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, padding:'0 4px' }}>
                <div className="avatar">{user?.name?.[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:14, color:'#f1f5f9', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
                    <p style={{ fontSize:12, color:'#475569', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.profession || 'Utilisateur'}</p>
                </div>
            </div>
            <button className="sidebar-item" onClick={onLogout} style={{ color:'#f87171' }}>
                <LogOut size={18} /> Déconnexion
            </button>
        </div>
    </aside>
);

/* ── LinkCard ── */
const LinkCard = ({ link, onDelete }) => (
    <div className="link-card animate-fade-in-up">
        {/* Preview */}
        <div className="link-card-preview">
            {link.preview_image ? (
                <img src={`/storage/${link.preview_image}`} alt={link.title} />
            ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#1e293b' }}>
                    <ExternalLink size={42} strokeWidth={1.2} />
                </div>
            )}
            {/* Status badge */}
            <div style={{ position:'absolute', top:12, right:12 }}>
                {link.processing_status === 'pending' && (
                    <div className="badge badge-pending" style={{ animation:'pulse-glow 2s infinite' }}>
                        <Clock size={11} /> Analyse IA...
                    </div>
                )}
                {link.processing_status === 'failed' && (
                    <div className="badge badge-failed">
                        <AlertCircle size={11} /> Échec
                    </div>
                )}
            </div>
        </div>

        {/* Content */}
        <div style={{ padding:'18px 20px', flex:1, display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:8 }}>
                <h3 style={{ fontWeight:600, fontSize:15, color:'#f1f5f9', margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:'1.4' }}>
                    {link.title || 'Sans titre'}
                </h3>
            </div>
            <p style={{ color:'#64748b', fontSize:13, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', flex:1, lineHeight:'1.5' }}>
                {link.description || 'Aucune description disponible.'}
            </p>

            {/* Footer */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, marginTop:14, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <span className="domain-pill">{link.source_domain}</span>
                <div style={{ display:'flex', gap:4 }}>
                    <button
                        onClick={onDelete}
                        style={{ padding:8, color:'#64748b', background:'transparent', border:'none', cursor:'pointer', borderRadius:10, transition:'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.color='#f87171'; e.currentTarget.style.background='rgba(239,68,68,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.color='#64748b'; e.currentTarget.style.background='transparent'; }}
                        title="Supprimer"
                    >
                        <Trash2 size={15} />
                    </button>
                    <a
                        href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ padding:8, color:'#64748b', borderRadius:10, transition:'all 0.2s', display:'flex', textDecoration:'none' }}
                        onMouseOver={e => { e.currentTarget.style.color='#818cf8'; e.currentTarget.style.background='rgba(99,102,241,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.color='#64748b'; e.currentTarget.style.background='transparent'; }}
                        title="Ouvrir"
                    >
                        <ExternalLink size={15} />
                    </a>
                </div>
            </div>
        </div>
    </div>
);

/* ── Dashboard ── */
const Dashboard = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUrl, setNewUrl] = useState('');

    const { user, logout } = useAuth();
    const queryClient = useQueryClient();

    const { data: linksData, isLoading } = useQuery({
        queryKey: ['links', search],
        queryFn: async () => {
            const response = await axios.get('/links', { params: { search } });
            return response.data.data;
        }
    });

    const addLinkMutation = useMutation({
        mutationFn: (url) => axios.post('/links', { url }),
        onSuccess: () => {
            queryClient.invalidateQueries(['links']);
            setIsAddModalOpen(false);
            setNewUrl('');
        }
    });

    const deleteLinkMutation = useMutation({
        mutationFn: (id) => axios.delete(`/links/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['links'])
    });

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const links = linksData?.data || [];

    return (
        <div className="bg-mesh" style={{ display:'flex', minHeight:'100vh' }}>
            <Sidebar user={user} onLogout={handleLogout} onNavigate={navigate} />

            {/* Main */}
            <main style={{ flex:1, padding:'36px 40px', overflowY:'auto' }}>
                {/* Header */}
                <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:36 }}>
                    <div>
                        <h2 style={{ fontSize:24, fontWeight:700, color:'#f1f5f9', margin:0 }}>Mes Liens</h2>
                        <p style={{ color:'#64748b', fontSize:14, margin:'4px 0 0' }}>Gérez et explorez vos ressources sauvegardées.</p>
                    </div>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                        {/* Search */}
                        <div style={{ position:'relative' }}>
                            <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="input-field input-with-icon"
                                style={{ width:240 }}
                            />
                        </div>
                        {/* Add */}
                        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={18} /> Ajouter
                        </button>
                    </div>
                </header>

                {/* Grid */}
                {isLoading ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:24 }}>
                        {[1,2,3].map(i => (
                            <div key={i} className="skeleton" style={{ height:280, borderRadius:18 }} />
                        ))}
                    </div>
                ) : links.length === 0 ? (
                    <div className="empty-state">
                        <Link2 size={52} strokeWidth={1} style={{ color:'#1e293b', marginBottom:16 }} />
                        <p style={{ color:'#475569', fontSize:16, fontWeight:500, margin:0 }}>Aucun lien pour le moment</p>
                        <p style={{ color:'#334155', fontSize:14, margin:'8px 0 0' }}>Cliquez sur "Ajouter" pour commencer.</p>
                    </div>
                ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:24 }}>
                        {links.map(link => (
                            <LinkCard
                                key={link.id}
                                link={link}
                                onDelete={() => deleteLinkMutation.mutate(link.id)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', margin:'0 0 6px' }}>Ajouter un lien</h3>
                        <p style={{ color:'#64748b', fontSize:14, margin:'0 0 24px' }}>Collez l'URL et notre IA l'analysera automatiquement.</p>
                        <form onSubmit={e => { e.preventDefault(); addLinkMutation.mutate(newUrl); }}>
                            <input
                                id="add-link-url"
                                type="url"
                                placeholder="https://..."
                                value={newUrl}
                                onChange={e => setNewUrl(e.target.value)}
                                autoFocus
                                className="input-field"
                                style={{ marginBottom: 20 }}
                            />
                            <div style={{ display:'flex', gap:12 }}>
                                <button type="button" className="btn-secondary" style={{ flex:1, justifyContent:'center' }} onClick={() => setIsAddModalOpen(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex:1, justifyContent:'center' }} disabled={addLinkMutation.isPending || !newUrl}>
                                    {addLinkMutation.isPending ? <span className="spinner" /> : 'Ajouter'}
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
