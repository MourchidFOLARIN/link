import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { History, ExternalLink, Eye, Clock, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['history', page],
        queryFn: async () => {
            const res = await axios.get('/links/history', { params: { page, per_page: 15 } });
            return res.data.data;
        },
        keepPreviousData: true
    });

    const items = data?.data || [];
    const lastPage = data?.last_page || 1;

    const formatDate = (d) => {
        if (!d) return '';
        const date = new Date(d);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Il y a quelques secondes';
        if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff/3600)} h`;
        return date.toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', maxWidth: 900, margin: '0 auto', width: '100%' }}>
            
            <header className="page-header" style={{ marginBottom: 40 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <History size={20} />
                        </div>
                        Historique
                    </h1>
                    <p className="page-subtitle">Vos liens récemment consultés.</p>
                </div>
            </header>

            {isLoading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height:84, borderRadius:16 }} />)}
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state animate-fade-in-up" style={{ flex: 1, justifyContent: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <History size={32} style={{ color:'#475569' }} />
                    </div>
                    <p style={{ color:'#f1f5f9', fontSize:18, fontWeight:600, margin:0 }}>Aucun historique</p>
                    <p style={{ color:'#64748b', fontSize:14, margin:'8px 0 0', maxWidth: 300 }}>
                        Consultez vos liens depuis le tableau de bord pour les retrouver ici.
                    </p>
                </div>
            ) : (
                <>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {items.map((link, i) => (
                            <div 
                                key={link.id} 
                                className="glass-card glass-card-hover animate-fade-in-up responsive-list-card" 
                                style={{ cursor: 'pointer', animationDelay: `${i * 0.04}s` }}
                                onClick={() => navigate(`/links/${link.id}`)}
                            >
                                {/* Preview thumbnail */}
                                <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {link.preview_image ? (
                                        <img src={`/storage/${link.preview_image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <ExternalLink size={20} style={{ color: '#475569' }} />
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {link.title || 'Sans titre'}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="domain-pill">{link.source_domain}</span>
                                        <span style={{ color: '#475569', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CalendarDays size={12} /> Ajouté le {new Date(link.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Meta stats */}
                                <div className="responsive-list-card-stats">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13, justifyContent: 'flex-end', fontWeight: 500, marginBottom: 4 }}>
                                        <Eye size={14} style={{ color: '#818cf8' }} /> {link.views_count} vue{link.views_count > 1 ? 's' : ''}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: 12, justifyContent: 'flex-end' }}>
                                        <Clock size={12} /> {formatDate(link.last_viewed_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {lastPage > 1 && (
                        <div className="pagination">
                            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Préc.</button>
                            <span style={{ fontSize: 13, color: '#64748b', padding: '0 8px' }}>Page {page} / {lastPage}</span>
                            <button className="page-btn" disabled={page === lastPage} onClick={() => setPage(p => p + 1)}>Suiv.</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HistoryPage;
