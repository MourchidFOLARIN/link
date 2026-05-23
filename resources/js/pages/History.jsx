import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { History, ArrowLeft, ExternalLink, Eye, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['history'],
        queryFn: async () => {
            const res = await axios.get('/links/history');
            return res.data.data;
        }
    });

    const items = data?.data || [];

    const formatDate = (d) => {
        if (!d) return '';
        const date = new Date(d);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Il y a quelques secondes';
        if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`;
        return date.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    };

    return (
        <div className="bg-mesh" style={{ minHeight:'100vh', padding:40 }}>
            <header style={{ maxWidth:900, margin:'0 auto', display:'flex', alignItems:'center', gap:16, marginBottom:36 }}>
                <button onClick={() => navigate('/dashboard')} style={{ padding:10, color:'#94a3b8', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, cursor:'pointer', display:'flex' }}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize:24, fontWeight:700, color:'#f1f5f9', margin:0, display:'flex', alignItems:'center', gap:12 }}>
                        <History size={22} style={{ color:'#818cf8' }} /> Historique
                    </h2>
                    <p style={{ color:'#64748b', fontSize:14, margin:'4px 0 0' }}>Vos liens récemment consultés.</p>
                </div>
            </header>

            <div style={{ maxWidth:900, margin:'0 auto' }}>
                {isLoading ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:80, borderRadius:16 }} />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <History size={52} strokeWidth={1} style={{ color:'#1e293b', marginBottom:16 }} />
                        <p style={{ color:'#475569', fontSize:16, fontWeight:500, margin:0 }}>Aucun historique</p>
                        <p style={{ color:'#334155', fontSize:14, margin:'8px 0 0' }}>Consultez un lien pour le retrouver ici.</p>
                    </div>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {items.map(link => (
                            <div key={link.id} className="glass-card glass-card-hover animate-fade-in-up" style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:16, cursor:'pointer' }} onClick={() => navigate(`/links/${link.id}`)}>
                                {/* Preview */}
                                <div style={{ width:56, height:56, borderRadius:14, overflow:'hidden', background:'rgba(255,255,255,0.03)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    {link.preview_image ? (
                                        <img src={`/storage/${link.preview_image}`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                    ) : (
                                        <ExternalLink size={22} style={{ color:'#1e293b' }} />
                                    )}
                                </div>
                                {/* Info */}
                                <div style={{ flex:1, minWidth:0 }}>
                                    <h3 style={{ fontSize:15, fontWeight:600, color:'#f1f5f9', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                        {link.title || 'Sans titre'}
                                    </h3>
                                    <p style={{ fontSize:12, color:'#475569', margin:'4px 0 0', display:'flex', alignItems:'center', gap:8 }}>
                                        <span className="domain-pill" style={{ display:'inline' }}>{link.source_domain}</span>
                                    </p>
                                </div>
                                {/* Meta */}
                                <div style={{ textAlign:'right', flexShrink:0 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:5, color:'#64748b', fontSize:12, justifyContent:'flex-end' }}>
                                        <Eye size={13} /> {link.views_count} vue{link.views_count > 1 ? 's' : ''}
                                    </div>
                                    <div style={{ display:'flex', alignItems:'center', gap:5, color:'#475569', fontSize:11, marginTop:4, justifyContent:'flex-end' }}>
                                        <Clock size={11} /> {formatDate(link.last_viewed_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
