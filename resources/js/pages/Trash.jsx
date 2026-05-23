import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Trash2, RotateCcw, ArrowLeft, ExternalLink, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Trash = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: trashData, isLoading } = useQuery({
        queryKey: ['trash'],
        queryFn: async () => {
            const response = await axios.get('/links/trash');
            return response.data.data;
        }
    });

    const restoreMutation = useMutation({
        mutationFn: (id) => axios.post(`/links/${id}/restore`),
        onSuccess: () => {
            queryClient.invalidateQueries(['trash']);
            queryClient.invalidateQueries(['links']);
        }
    });

    const forceDeleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/links/${id}/force`),
        onSuccess: () => queryClient.invalidateQueries(['trash'])
    });

    const items = trashData?.data || [];

    return (
        <div className="bg-mesh" style={{ minHeight:'100vh', padding:'40px' }}>
            {/* Header */}
            <header style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ padding:10, color:'#94a3b8', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, cursor:'pointer', display:'flex', transition:'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.color='#f1f5f9'; e.currentTarget.style.background='rgba(255,255,255,0.08)'; }}
                        onMouseOut={e => { e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize:24, fontWeight:700, color:'#f1f5f9', margin:0, display:'flex', alignItems:'center', gap:12 }}>
                            <Trash2 size={22} style={{ color:'#f87171' }} /> Corbeille
                        </h2>
                        <p style={{ color:'#64748b', fontSize:14, margin:'4px 0 0' }}>Récupérez vos liens supprimés par erreur.</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div style={{ maxWidth:1100, margin:'0 auto' }}>
                {isLoading ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:20 }}>
                        {[1,2].map(i => (
                            <div key={i} className="skeleton" style={{ height:160, borderRadius:18 }} />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <Trash2 size={52} strokeWidth={1} style={{ color:'#1e293b', marginBottom:16 }} />
                        <p style={{ color:'#475569', fontSize:16, fontWeight:500, margin:0 }}>Votre corbeille est vide</p>
                        <p style={{ color:'#334155', fontSize:14, margin:'8px 0 0' }}>Les liens supprimés apparaîtront ici.</p>
                    </div>
                ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:20 }}>
                        {items.map(link => (
                            <div key={link.id} className="glass-card glass-card-hover animate-fade-in-up" style={{ padding:22 }}>
                                <h3 style={{ fontWeight:600, fontSize:15, color:'#f1f5f9', margin:'0 0 8px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                    {link.title || 'Sans titre'}
                                </h3>
                                <p style={{ color:'#475569', fontSize:13, margin:'0 0 20px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                    {link.url}
                                </p>

                                <div style={{ display:'flex', gap:10 }}>
                                    <button
                                        className="btn-secondary"
                                        style={{ flex:1, justifyContent:'center', fontSize:13, padding:'9px 14px' }}
                                        onClick={() => restoreMutation.mutate(link.id)}
                                        disabled={restoreMutation.isPending}
                                    >
                                        <RotateCcw size={15} /> Restaurer
                                    </button>
                                    <button
                                        className="btn-danger"
                                        style={{ padding:'9px 14px' }}
                                        onClick={() => { if(confirm('Supprimer définitivement ?')) forceDeleteMutation.mutate(link.id); }}
                                        disabled={forceDeleteMutation.isPending}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Trash;
