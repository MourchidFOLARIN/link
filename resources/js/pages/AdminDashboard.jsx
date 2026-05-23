import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
    Users, Link2, FolderHeart, ShieldAlert, Cpu, AlertTriangle, 
    ArrowLeft, LogOut, CheckCircle, ExternalLink, Calendar, Mail, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const toast = useToast();
    const queryClient = useQueryClient();

    // Query Stats
    const { data: statsData, isLoading, isError, refetch } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await axios.get('/admin/stats');
            return res.data.data;
        },
        refetchInterval: 15000 // Rafraîchir toutes les 15 secondes pour le suivi en temps réel
    });

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Déconnexion de la session admin');
            navigate('/admin-secret-access');
        } catch {
            toast.error('Erreur lors de la déconnexion');
        }
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050911', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <span className="spinner" style={{ width: 36, height: 36, borderColor: 'rgba(244,63,94,0.2)', borderTopColor: '#f43f5e', borderWidth: 3 }} />
                <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Chargement du Backoffice ExellenceLink...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ minHeight: '100vh', background: '#050911', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <ShieldAlert size={32} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Accès non autorisé ou Erreur Serveur</h2>
                <p style={{ color: '#64748b', fontSize: 14, margin: '8px 0 24px', maxWidth: 360 }}>
                    Vous n'avez pas les droits suffisants pour afficher cette page ou la connexion au serveur a échoué.
                </p>
                <button className="btn-secondary" onClick={() => navigate('/admin-secret-access')}>
                    <ArrowLeft size={14} /> Retour à la connexion
                </button>
            </div>
        );
    }

    const { metrics, ai_status, recent_users, recent_links } = statsData || {};

    // Calculs de pourcentages d'IA
    const aiTotal = (ai_status?.pending || 0) + (ai_status?.completed || 0) + (ai_status?.failed || 0);
    const getAiPercent = (count) => {
        if (!aiTotal) return 0;
        return Math.round((count / aiTotal) * 100);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#050911', padding: '36px 40px', color: '#f1f5f9', position: 'relative', overflowX: 'hidden' }}>
            
            {/* Background Orbs */}
            <div style={{
                position:'absolute', top:'-10%', right:'-10%',
                width:450, height:450, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 70%)',
                filter:'blur(60px)', pointerEvents:'none', zIndex: 0
            }}/>
            <div style={{
                position:'absolute', bottom:'10%', left:'-10%',
                width:400, height:400, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
                filter:'blur(60px)', pointerEvents:'none', zIndex: 0
            }}/>

            <div style={{ position: 'relative', zIndex: 1 }}>
                
                {/* Header */}
                <header className="page-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 24, marginBottom: 36 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Backoffice Secret
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>•</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Statistiques Globales</span>
                        </div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            Dashboard d'Administration
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn-secondary" onClick={() => refetch()} style={{ fontSize: 13, padding: '8px 16px' }}>
                            Rafraîchir
                        </button>
                        <button 
                            className="btn-danger" 
                            onClick={handleLogout} 
                            style={{ 
                                background: 'rgba(244,63,94,0.08)',
                                border: '1px solid rgba(244,63,94,0.2)',
                                color: '#fb7185',
                                padding: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            <LogOut size={14} /> Déconnexion
                        </button>
                    </div>
                </header>

                {/* Metrics Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
                    
                    {/* Users */}
                    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: '20px 24px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={22} />
                        </div>
                        <div>
                            <p className="stat-value" style={{ fontSize: 26, fontWeight: 800 }}>{metrics?.users_count || 0}</p>
                            <p className="stat-label" style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Membres inscrits</p>
                        </div>
                    </div>

                    {/* Links Active */}
                    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: '20px 24px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34,197,94,0.1)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Link2 size={22} />
                        </div>
                        <div>
                            <p className="stat-value" style={{ fontSize: 26, fontWeight: 800 }}>{metrics?.links_active || 0}</p>
                            <p className="stat-label" style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Liens actifs</p>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: '20px 24px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(168,85,247,0.1)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FolderHeart size={22} />
                        </div>
                        <div>
                            <p className="stat-value" style={{ fontSize: 26, fontWeight: 800 }}>{metrics?.categories_count || 0}</p>
                            <p className="stat-label" style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thématiques créées</p>
                        </div>
                    </div>

                    {/* Trash */}
                    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: '20px 24px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(244,63,94,0.1)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={22} />
                        </div>
                        <div>
                            <p className="stat-value" style={{ fontSize: 26, fontWeight: 800 }}>{metrics?.links_trashed || 0}</p>
                            <p className="stat-label" style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Liens à la corbeille</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 36 }}>
                    
                    {/* IA Processing State Column */}
                    <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: '#f1f5f9' }}>
                            <Cpu size={18} style={{ color: '#818cf8' }} /> Analyse de Contenu par IA (Gemini 1.5 Flash)
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Completed */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Analyses IA réussies</span>
                                    <span style={{ color: '#4ade80', fontWeight: 700 }}>{ai_status?.completed} ({getAiPercent(ai_status?.completed)}%)</span>
                                </div>
                                <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 100, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${getAiPercent(ai_status?.completed)}%`, background: 'linear-gradient(90deg, #4ade80, #22c55e)', borderRadius: 100 }} />
                                </div>
                            </div>

                            {/* Pending */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>En attente de traitement</span>
                                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>{ai_status?.pending} ({getAiPercent(ai_status?.pending)}%)</span>
                                </div>
                                <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 100, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${getAiPercent(ai_status?.pending)}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: 100 }} />
                                </div>
                            </div>

                            {/* Failed */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Analyses IA échouées</span>
                                    <span style={{ color: '#f87171', fontWeight: 700 }}>{ai_status?.failed} ({getAiPercent(ai_status?.failed)}%)</span>
                                </div>
                                <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 100, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${getAiPercent(ai_status?.failed)}%`, background: 'linear-gradient(90deg, #f87171, #ef4444)', borderRadius: 100 }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Recap info */}
                    <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CheckCircle size={18} style={{ color: '#4ade80' }} />
                            <div>
                                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Volume total de liens traités</p>
                                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{metrics?.links_total} liens enregistrés</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Calendar size={18} style={{ color: '#6366f1' }} />
                            <div>
                                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Rapport d'activité</p>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Système opérationnel</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Tables Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24 }}>
                    
                    {/* Recent Users Table */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={16} style={{ color: '#818cf8' }} /> Dernières Inscriptions
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <th style={{ padding: '12px 8px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Utilisateur</th>
                                        <th style={{ padding: '12px 8px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Email & Métier</th>
                                        <th style={{ padding: '12px 8px', fontSize: 12, color: '#64748b', fontWeight: 600, textAlign: 'center' }}>Liens</th>
                                        <th style={{ padding: '12px 8px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_users?.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ padding: 24, textalign: 'center', color: '#64748b', fontSize: 13 }}>Aucun utilisateur enregistré.</td>
                                        </tr>
                                    ) : (
                                        recent_users?.map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div className="avatar" style={{ width: 28, height: 28, borderRadius: 8, fontSize: 11 }}>
                                                            {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : u.name.charAt(0)}
                                                        </div>
                                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={10} /> {u.email}</span>
                                                        {u.profession && <span style={{ fontSize: 11, color: '#475569' }}>{u.profession}</span>}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <span className="badge badge-info" style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10 }}>
                                                        {u.links_count}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 8px', fontSize: 11, color: '#64748b' }}>
                                                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Links Table */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link2 size={16} style={{ color: '#4ade80' }} /> Flux Global des Liens
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <th style={{ padding: '12px 8px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Source & Titre</th>
                                        <th style={{ padding: '12px 8px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Par</th>
                                        <th style={{ padding: '12px 8px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Analyse IA</th>
                                        <th style={{ padding: '12px 8px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_links?.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Aucun lien enregistré sur le serveur.</td>
                                        </tr>
                                    ) : (
                                        recent_links?.map(l => (
                                            <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '12px 8px', maxWidth: 220 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.title}>
                                                            {l.title || 'Sans titre'}
                                                        </span>
                                                        <span className="domain-pill" style={{ width: 'fit-content', fontSize: 9 }}>{l.source_domain}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 8px', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                                                    {l.user_name}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {l.processing_status === 'pending' && <span className="badge badge-pending" style={{ fontSize: 9 }}><Cpu size={8} /> En cours</span>}
                                                    {l.processing_status === 'completed' && <span className="badge badge-success" style={{ fontSize: 9 }}><CheckCircle size={8} /> OK</span>}
                                                    {l.processing_status === 'failed' && <span className="badge badge-failed" style={{ fontSize: 9 }}><AlertTriangle size={8} /> Échoué</span>}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Ouvrir le lien original" style={{ color: '#64748b' }} onMouseOver={e => e.currentTarget.style.color='#818cf8'} onMouseOut={e => e.currentTarget.style.color='#64748b'}>
                                                        <ExternalLink size={13} />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
