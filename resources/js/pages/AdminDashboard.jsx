import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Users, Link2, FolderHeart, ShieldAlert, Cpu, AlertTriangle,
    LogOut, CheckCircle, ExternalLink, Mail, Globe, Zap,
    ChevronLeft, ChevronRight, TrendingUp, BarChart2, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ── Animated Counter ────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, suffix = '', decimals = 0, duration = 1200 }) => {
    const [display, setDisplay] = useState(0);
    const startRef = useRef(null);

    useEffect(() => {
        if (value === undefined || value === null) return;
        const target = parseFloat(value);
        const start = performance.now();
        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{display.toFixed(decimals)}{suffix}</span>;
};

// ── SVG Donut Ring ──────────────────────────────────────────────────────────
const DonutRing = ({ percent, color, size = 70, stroke = 7 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (percent / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
            />
        </svg>
    );
};

// ── Mini Bar Chart (SVG) ────────────────────────────────────────────────────
const MiniBarChart = ({ bars, colors }) => {
    const max = Math.max(...bars, 1);
    const h = 36;
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: h }}>
            {bars.map((v, i) => (
                <div key={i} style={{
                    flex: 1,
                    height: `${Math.max((v / max) * 100, 6)}%`,
                    background: colors[i % colors.length],
                    borderRadius: '4px 4px 0 0',
                    opacity: v === 0 ? 0.2 : 1,
                    transition: 'height 1s ease'
                }} />
            ))}
        </div>
    );
};

// ── Stacked Bar ─────────────────────────────────────────────────────────────
const StackedBar = ({ segments }) => {
    const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
    return (
        <div style={{ display: 'flex', height: 8, borderRadius: 100, overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
            {segments.map((seg, i) => (
                <div key={i} style={{
                    width: `${(seg.value / total) * 100}%`,
                    background: seg.color,
                    transition: 'width 1.2s ease'
                }} />
            ))}
        </div>
    );
};

// ── Big Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, suffix = '', decimals = 0, gradient, children, span = 1 }) => (
    <div style={{
        background: 'rgba(10,14,22,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        gridColumn: `span ${span}`
    }}>
        <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: gradient, filter: 'blur(40px)', opacity: 0.25, pointerEvents: 'none'
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px', lineHeight: 1 }}>
                    <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
                </p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="#fff" />
            </div>
        </div>
        {children}
    </div>
);

// ── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, lastPage, total, from, to, onPageChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 11, color: '#334155' }}>{from}–{to} sur {total}</span>
        <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
                style={{ width: 30, height: 30, borderRadius: 8, background: page === 1 ? 'transparent' : 'rgba(99,102,241,0.1)', border: '1px solid rgba(255,255,255,0.06)', color: page === 1 ? '#334155' : '#818cf8', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={14} />
            </button>
            {Array.from({ length: lastPage }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                <button key={p} onClick={() => onPageChange(p)}
                    style={{ width: 30, height: 30, borderRadius: 8, background: p === page ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.02)', border: p === page ? 'none' : '1px solid rgba(255,255,255,0.06)', color: p === page ? '#fff' : '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: p === page ? 700 : 500, boxShadow: p === page ? '0 2px 8px rgba(99,102,241,0.3)' : 'none' }}>
                    {p}
                </button>
            ))}
            <button onClick={() => onPageChange(page + 1)} disabled={page === lastPage}
                style={{ width: 30, height: 30, borderRadius: 8, background: page === lastPage ? 'transparent' : 'rgba(99,102,241,0.1)', border: '1px solid rgba(255,255,255,0.06)', color: page === lastPage ? '#334155' : '#818cf8', cursor: page === lastPage ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} />
            </button>
        </div>
    </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const toast = useToast();
    const [usersPage, setUsersPage] = useState(1);
    const [linksPage, setLinksPage] = useState(1);

    const { data: statsData, isLoading, isError, refetch } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => { const r = await axios.get('/admin/stats'); return r.data.data; },
        refetchInterval: 15000
    });

    const { data: usersData, isFetching: usersFetching } = useQuery({
        queryKey: ['adminUsers', usersPage],
        queryFn: async () => { const r = await axios.get(`/admin/users?page=${usersPage}&per_page=8`); return r.data.data; },
        keepPreviousData: true
    });

    const { data: linksData, isFetching: linksFetching } = useQuery({
        queryKey: ['adminLinks', linksPage],
        queryFn: async () => { const r = await axios.get(`/admin/links?page=${linksPage}&per_page=10`); return r.data.data; },
        keepPreviousData: true
    });

    const handleLogout = async () => {
        try { await logout(); toast.success('Déconnexion'); navigate('/admin-secret-access'); }
        catch { toast.error('Erreur'); }
    };

    if (isLoading) return (
        <div style={{ minHeight: '100vh', background: '#050911', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <span className="spinner" style={{ width: 36, height: 36, borderColor: 'rgba(244,63,94,0.2)', borderTopColor: '#f43f5e', borderWidth: 3 }} />
            <p style={{ color: '#64748b', fontSize: 14 }}>Chargement...</p>
        </div>
    );

    if (isError) return (
        <div style={{ minHeight: '100vh', background: '#050911', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <ShieldAlert size={40} style={{ color: '#f43f5e', marginBottom: 16 }} />
            <h2 style={{ color: '#f1f5f9' }}>Accès refusé</h2>
            <button className="btn-secondary" onClick={() => navigate('/admin-secret-access')} style={{ marginTop: 16 }}><ChevronLeft size={14} /> Retour</button>
        </div>
    );

    const { metrics, ai_status } = statsData || {};
    const aiTotal = (ai_status?.pending || 0) + (ai_status?.completed || 0) + (ai_status?.failed || 0);
    const pct = (n) => aiTotal ? Math.round((n / aiTotal) * 100) : 0;

    // Distribution des statuts de liens pour le mini bar
    const linksDistrib = [metrics?.links_active || 0, metrics?.links_trashed || 0];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#050911', padding: '36px 40px', color: '#f1f5f9', position: 'relative', overflowX: 'hidden' }}>

            {/* Orbs */}
            <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: 0, left: '-10%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,63,94,0.05), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 24, marginBottom: 36 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '1px' }}>Backoffice Secret</span>
                            <span style={{ fontSize: 10, color: '#1e293b' }}>•</span>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>Temps réel</span>
                        </div>
                        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Dashboard Admin</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => refetch()} style={{ height: 36, padding: '0 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            Rafraîchir
                        </button>
                        <button onClick={handleLogout} style={{ height: 36, padding: '0 14px', borderRadius: 10, background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                            <LogOut size={13} /> Déconnexion
                        </button>
                    </div>
                </header>

                {/* ── Ligne 1 : 4 métriques principales ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>

                    <StatCard icon={Users} label="Membres inscrits" value={metrics?.users_count} gradient="radial-gradient(#6366f1, #4f46e5)">
                        <StackedBar segments={[
                            { value: metrics?.users_count || 0, color: 'linear-gradient(90deg, #6366f1, #818cf8)' }
                        ]} />
                        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#475569' }}>
                            Moy. <strong style={{ color: '#818cf8' }}><AnimatedNumber value={metrics?.avg_links_per_user} decimals={1} /></strong> liens/utilisateur
                        </p>
                    </StatCard>

                    <StatCard icon={Link2} label="Liens actifs" value={metrics?.links_active} gradient="radial-gradient(#22c55e, #16a34a)">
                        <StackedBar segments={[
                            { value: metrics?.links_active || 0, color: 'linear-gradient(90deg, #22c55e, #4ade80)' },
                            { value: metrics?.links_trashed || 0, color: 'rgba(244,63,94,0.3)' }
                        ]} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                            <span style={{ fontSize: 10, color: '#475569' }}><span style={{ color: '#4ade80', fontWeight: 700 }}>{metrics?.links_active}</span> actifs</span>
                            <span style={{ fontSize: 10, color: '#475569' }}><span style={{ color: '#f87171', fontWeight: 700 }}>{metrics?.links_trashed}</span> corbeille</span>
                        </div>
                    </StatCard>

                    <StatCard icon={Globe} label="Domaines uniques" value={metrics?.unique_domains} gradient="radial-gradient(#06b6d4, #0891b2)">
                        <MiniBarChart
                            bars={[
                                metrics?.unique_domains || 0,
                                Math.floor((metrics?.unique_domains || 0) * 0.7),
                                Math.floor((metrics?.unique_domains || 0) * 0.5),
                                Math.floor((metrics?.unique_domains || 0) * 0.85),
                                Math.floor((metrics?.unique_domains || 0) * 0.6),
                                Math.floor((metrics?.unique_domains || 0) * 0.9),
                            ]}
                            colors={['rgba(6,182,212,0.6)', 'rgba(6,182,212,0.4)']}
                        />
                        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#475569' }}>Sources web répertoriées</p>
                    </StatCard>

                    <StatCard icon={FolderHeart} label="Thématiques" value={metrics?.categories_count} gradient="radial-gradient(#a855f7, #7c3aed)">
                        <MiniBarChart
                            bars={[2, 5, 3, metrics?.categories_count || 1, 4, 6, metrics?.categories_count || 1]}
                            colors={['rgba(168,85,247,0.5)', 'rgba(168,85,247,0.3)']}
                        />
                        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#475569' }}>Catégories créées par les membres</p>
                    </StatCard>
                </div>

                {/* ── Ligne 2 : 3 cartes analytiques ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

                    {/* IA Ring Chart */}
                    <div style={{ background: 'rgba(10,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <Cpu size={16} style={{ color: '#818cf8' }} />
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Analyse IA — Gemini 1.5 Flash</p>
                            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>
                                {aiTotal} traitements
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                            {/* Donut central */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <DonutRing percent={pct(ai_status?.completed)} color="#4ade80" size={90} stroke={9} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: 17, fontWeight: 800, color: '#4ade80' }}>{pct(ai_status?.completed)}%</span>
                                    <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>succès</span>
                                </div>
                            </div>
                            {/* Barres détaillées */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { label: 'Réussies', count: ai_status?.completed, color: '#4ade80', bg: 'rgba(74,222,128,0.1)', bar: 'linear-gradient(90deg,#4ade80,#22c55e)' },
                                    { label: 'En attente', count: ai_status?.pending, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', bar: 'linear-gradient(90deg,#fbbf24,#f59e0b)' },
                                    { label: 'Échouées', count: ai_status?.failed, color: '#f87171', bg: 'rgba(248,113,113,0.1)', bar: 'linear-gradient(90deg,#f87171,#ef4444)' },
                                ].map(({ label, count, color, bg, bar }) => (
                                    <div key={label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color, background: bg, padding: '0 7px', borderRadius: 6 }}>
                                                {count} · {pct(count)}%
                                            </span>
                                        </div>
                                        <div style={{ height: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 100, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct(count)}%`, background: bar, borderRadius: 100, transition: 'width 1.2s ease' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Taux de succès IA */}
                    <div style={{ background: 'rgba(10,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 120, height: 60, background: `rgba(${metrics?.ai_success_rate >= 80 ? '74,222,128' : metrics?.ai_success_rate >= 50 ? '251,191,36' : '248,113,113'},0.08)`, borderRadius: '50%', filter: 'blur(20px)' }} />
                        <DonutRing
                            percent={metrics?.ai_success_rate || 0}
                            color={metrics?.ai_success_rate >= 80 ? '#4ade80' : metrics?.ai_success_rate >= 50 ? '#fbbf24' : '#f87171'}
                            size={100} stroke={10}
                        />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
                                <AnimatedNumber value={metrics?.ai_success_rate} suffix="%" decimals={0} />
                            </p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Taux de succès IA</p>
                            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#475569' }}>Sur {(ai_status?.completed || 0) + (ai_status?.failed || 0)} analyses terminées</p>
                        </div>
                    </div>

                    {/* Engagement */}
                    <div style={{ background: 'rgba(10,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <Activity size={15} style={{ color: '#f59e0b' }} />
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Engagement</p>
                        </div>
                        {[
                            { label: 'Total liens enregistrés', value: metrics?.links_total, color: '#818cf8' },
                            { label: 'Liens actifs', value: metrics?.links_active, color: '#4ade80' },
                            { label: 'En corbeille', value: metrics?.links_trashed, color: '#f87171' },
                            { label: 'Moy. liens / user', value: metrics?.avg_links_per_user, color: '#fbbf24', dec: 1 },
                        ].map(({ label, value, color, dec }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
                                <span style={{ fontSize: 13, fontWeight: 800, color }}>
                                    <AnimatedNumber value={value} decimals={dec || 0} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Tables paginées ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20 }}>

                    {/* Membres */}
                    <div style={{ background: 'rgba(10,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <Users size={15} style={{ color: '#818cf8' }} />
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Membres</h3>
                            {usersFetching && <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, marginLeft: 'auto', borderTopColor: '#818cf8' }} />}
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {['Utilisateur', 'Email', 'Liens', 'Inscription'].map(h => (
                                        <th key={h} style={{ padding: '8px 8px', fontSize: 10, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {!usersData?.data?.length
                                    ? <tr><td colSpan="4" style={{ padding: 24, textAlign: 'center', color: '#475569', fontSize: 13 }}>Aucun membre.</td></tr>
                                    : usersData.data.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
                                            <td style={{ padding: '10px 8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div className="avatar" style={{ width: 26, height: 26, borderRadius: 8, fontSize: 10, flexShrink: 0 }}>
                                                        {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{u.name}</span>
                                                        {u.is_admin && <span style={{ fontSize: 8, background: 'rgba(244,63,94,0.15)', color: '#fb7185', padding: '1px 5px', borderRadius: 4, marginLeft: 5, fontWeight: 700 }}>ADM</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: 11, color: '#64748b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{u.links_count}</span>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: 11, color: '#334155' }}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                        {usersData && <Pagination page={usersPage} lastPage={usersData.last_page} total={usersData.total} from={usersData.from} to={usersData.to} onPageChange={setUsersPage} />}
                    </div>

                    {/* Liens */}
                    <div style={{ background: 'rgba(10,14,22,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <Link2 size={15} style={{ color: '#4ade80' }} />
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Flux des Liens</h3>
                            {linksFetching && <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, marginLeft: 'auto', borderTopColor: '#4ade80' }} />}
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {['Titre', 'Ajouté par', 'Analyse IA', 'Lien'].map(h => (
                                        <th key={h} style={{ padding: '8px 8px', fontSize: 10, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {!linksData?.data?.length
                                    ? <tr><td colSpan="4" style={{ padding: 24, textAlign: 'center', color: '#475569', fontSize: 13 }}>Aucun lien.</td></tr>
                                    : linksData.data.map(l => (
                                        <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
                                            <td style={{ padding: '10px 8px', maxWidth: 200 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.title}>{l.title || 'Sans titre'}</span>
                                                <span style={{ fontSize: 10, color: '#334155' }}>{l.source_domain}</span>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: 11, color: '#64748b', fontWeight: 500 }}>{l.user_name}</td>
                                            <td style={{ padding: '10px 8px' }}>
                                                {l.processing_status === 'pending'   && <span style={{ fontSize: 9, background: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>En cours</span>}
                                                {l.processing_status === 'completed' && <span style={{ fontSize: 9, background: 'rgba(74,222,128,0.1)', color: '#4ade80', padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>OK</span>}
                                                {l.processing_status === 'failed'    && <span style={{ fontSize: 9, background: 'rgba(248,113,113,0.1)', color: '#f87171', padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>Échoué</span>}
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                                <a href={l.url} target="_blank" rel="noopener noreferrer"
                                                    style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', transition: 'all 0.2s' }}
                                                    onMouseOver={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                                                    <ExternalLink size={11} />
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                        {linksData && <Pagination page={linksPage} lastPage={linksData.last_page} total={linksData.total} from={linksData.from} to={linksData.to} onPageChange={setLinksPage} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
