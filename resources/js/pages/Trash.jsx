import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Trash2, RotateCcw, AlertCircle, Link2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Trash = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [page, setPage] = useState(1);

    const { data: trashData, isLoading } = useQuery({
        queryKey: ['trash', page],
        queryFn: async () => {
            const res = await axios.get('/links/trash', { params: { page, per_page: 12 } });
            return res.data.data;
        },
        keepPreviousData: true
    });

    const restoreMutation = useMutation({
        mutationFn: (id) => axios.post(`/links/${id}/restore`),
        onSuccess: () => {
            queryClient.invalidateQueries(['trash']);
            queryClient.invalidateQueries(['links']);
            toast.success('Lien restauré avec succès');
        }
    });

    const forceDeleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/links/${id}/force`),
        onSuccess: () => {
            queryClient.invalidateQueries(['trash']);
            toast.success('Lien supprimé définitivement');
        }
    });

    const items = trashData?.data || [];
    const lastPage = trashData?.last_page || 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            
            <header className="page-header" style={{ marginBottom: 40 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(244,63,94,0.1)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={20} />
                        </div>
                        Corbeille
                    </h1>
                    <p className="page-subtitle">Récupérez vos liens supprimés ou videz-les définitivement.</p>
                </div>
            </header>

            {isLoading ? (
                <div className="links-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:20 }}>
                    {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:180 }} />)}
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state animate-fade-in-up" style={{ flex: 1, justifyContent: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Trash2 size={32} style={{ color:'#475569' }} />
                    </div>
                    <p style={{ color:'#f1f5f9', fontSize:18, fontWeight:600, margin:0 }}>Corbeille vide</p>
                    <p style={{ color:'#64748b', fontSize:14, margin:'8px 0 0', maxWidth: 300 }}>
                        Les liens que vous supprimez seront conservés ici temporairement.
                    </p>
                </div>
            ) : (
                <>
                <div className="links-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:20 }}>
                        {items.map((link, i) => (
                            <div key={link.id} className="glass-card glass-card-hover animate-fade-in-up" style={{ padding: 24, animationDelay: `${i * 0.05}s` }}>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.04)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Link2 size={18} style={{ color: '#64748b' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontWeight:600, fontSize:15, color:'#f1f5f9', margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {link.title || 'Sans titre'}
                                        </h3>
                                        <p style={{ color:'#64748b', fontSize:13, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {link.url}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display:'flex', gap:10 }}>
                                    <button
                                        className="btn-secondary"
                                        style={{ flex:1, justifyContent:'center' }}
                                        onClick={() => restoreMutation.mutate(link.id)}
                                        disabled={restoreMutation.isPending}
                                    >
                                        <RotateCcw size={15} /> Restaurer
                                    </button>
                                    <button
                                        className="btn-danger"
                                        onClick={() => { if(confirm('Supprimer définitivement ce lien ? Cette action est irréversible.')) forceDeleteMutation.mutate(link.id); }}
                                        disabled={forceDeleteMutation.isPending}
                                    >
                                        <Trash2 size={15} />
                                    </button>
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

export default Trash;
