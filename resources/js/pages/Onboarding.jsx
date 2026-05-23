import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Sparkles, ShieldCheck, Smartphone, ArrowRight, Check, AlertTriangle, Eye, Lock, Globe, FileText, Share2, Tag, Compass } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "Centralisez vos Liens",
        description: "Regroupez tous vos favoris, articles, réseaux et inspirations dans un espace unique, structuré et toujours accessible. Ne perdez plus jamais un seul lien important.",
        icon: Link2,
        color: "#6366f1", // Indigo
        bgGradient: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.02) 100%)",
        illustration: (
            <div className="illustration-wrapper">
                {/* Background glowing grid orbs */}
                <div className="glow-orb indigo-orb" />
                
                {/* Floating links gathering into a central container */}
                <div className="onboarding-links-container">
                    <div className="floating-card link-c1">
                        <Globe size={14} color="#6366f1" />
                        <span className="card-lbl">github.com/cool-repo</span>
                    </div>
                    <div className="floating-card link-c2">
                        <Share2 size={14} color="#38bdf8" />
                        <span className="card-lbl">twitter.com/news</span>
                    </div>
                    <div className="floating-card link-c3">
                        <Compass size={14} color="#fb7185" />
                        <span className="card-lbl">dribbble.com/design</span>
                    </div>
                    
                    {/* Central Vault/Folder */}
                    <div className="central-vault">
                        <div className="vault-core">
                            <Link2 size={36} className="glow-icon-indigo pulse" />
                        </div>
                        <div className="vault-ring ring-1" />
                        <div className="vault-ring ring-2" />
                    </div>
                    
                    {/* Particle streams going to the vault */}
                    <div className="stream-particle p1" />
                    <div className="stream-particle p2" />
                    <div className="stream-particle p3" />
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "Catégorisation par IA",
        description: "Laissez l'intelligence artificielle Gemini 1.5 Flash analyser vos liens à la volée. Notre moteur extrait automatiquement le résumé, le titre et attribue les bons tags.",
        icon: Sparkles,
        color: "#ec4899", // Rose
        bgGradient: "linear-gradient(135deg, rgba(236,72,153,0.18) 0%, rgba(236,72,153,0.02) 100%)",
        illustration: (
            <div className="illustration-wrapper">
                <div className="glow-orb pink-orb" />
                
                <div className="ai-process-container">
                    {/* The incoming raw link */}
                    <div className="raw-link-bar">
                        <Globe size={14} color="#94a3b8" />
                        <span>https://react.dev/reference/react</span>
                    </div>
                    
                    {/* AI scanning laser */}
                    <div className="ai-laser" />
                    
                    {/* Result card appearing after scan */}
                    <div className="ai-result-card">
                        <div className="ai-card-header">
                            <Sparkles size={16} className="sparkle-glow" />
                            <span className="ai-badge">Gemini AI Active</span>
                        </div>
                        <div className="ai-card-title">Documentation Officielle React</div>
                        <div className="ai-card-desc">
                            <FileText size={12} style={{ marginRight: 6, flexShrink: 0 }} />
                            <span>Référence complète des Hooks et APIs de React 19...</span>
                        </div>
                        <div className="ai-tags">
                            <span className="tag-pill tag-pink"><Tag size={10} /> React</span>
                            <span className="tag-pill tag-blue"><Tag size={10} /> Dev</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: "Navigation 100% Sécurisée",
        description: "Bénéficiez d'une barrière de sécurité intégrée. Chaque lien est scanné en amont pour bloquer les attaques SSRF et neutraliser les redirections masquées ou dangereuses.",
        icon: ShieldCheck,
        color: "#10b981", // Emeraude
        bgGradient: "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.02) 100%)",
        illustration: (
            <div className="illustration-wrapper">
                <div className="glow-orb emerald-orb" />
                
                <div className="security-visual-container">
                    {/* Malicious attempt getting blocked */}
                    <div className="security-threat blocked">
                        <AlertTriangle size={12} color="#f43f5e" />
                        <span>malicious-ssrf.local</span>
                        <span className="status-badge status-blocked">Bloqué</span>
                    </div>
                    
                    {/* Shield barrier */}
                    <div className="glass-shield">
                        <ShieldCheck size={48} className="shield-icon-glow" />
                        <div className="shield-grid" />
                    </div>
                    
                    {/* Safe link passing through */}
                    <div className="security-threat allowed">
                        <Check size={12} color="#10b981" />
                        <span>wikipedia.org/wiki/AI</span>
                        <span className="status-badge status-allowed">Sécurisé</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 4,
        title: "Expérience APK & PWA Tactile",
        description: "Installez l'application en un clic sur votre smartphone. Profitez d'une fluidité hors pair, de gestes tactiles naturels et d'un mode hors-ligne toujours opérationnel.",
        icon: Smartphone,
        color: "#a78bfa", // Violet
        bgGradient: "linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(167,139,250,0.02) 100%)",
        illustration: (
            <div className="illustration-wrapper">
                <div className="glow-orb purple-orb" />
                
                <div className="phone-mockup-wrapper">
                    <div className="real-phone">
                        <div className="phone-notch" />
                        <div className="phone-inner-screen">
                            {/* Simulator app header */}
                            <div className="sim-header">
                                <Link2 size={14} color="#a78bfa" />
                                <span>ExellenceLink</span>
                            </div>
                            
                            {/* App body scroll simulation */}
                            <div className="sim-scrollable">
                                <div className="sim-stat-grid">
                                    <div className="sim-stat">
                                        <span className="sim-stat-val">24</span>
                                        <span className="sim-stat-lbl">Liens</span>
                                    </div>
                                    <div className="sim-stat">
                                        <span className="sim-stat-val">5</span>
                                        <span className="sim-stat-lbl">Tags</span>
                                    </div>
                                </div>
                                
                                <div className="sim-item">
                                    <div className="sim-item-line w-80" />
                                    <div className="sim-item-line w-50" />
                                    <div className="sim-item-tag pink" />
                                </div>
                                <div className="sim-item">
                                    <div className="sim-item-line w-60" />
                                    <div className="sim-item-line w-40" />
                                    <div className="sim-item-tag blue" />
                                </div>
                            </div>
                            
                            {/* Floating Action Button */}
                            <div className="sim-fab">
                                <Sparkles size={12} color="white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
];

const Onboarding = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeOnboarding();
        }
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    const completeOnboarding = () => {
        localStorage.setItem('has_completed_onboarding', 'true');
        navigate('/register');
    };

    const activeStep = steps[currentStep];
    const IconComponent = activeStep.icon;

    return (
        <div className="auth-page animate-fade-in" style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {/* Background Orbs */}
            <div style={{
                position: 'fixed', top: '15%', left: '10%',
                width: 350, height: 350, borderRadius: '50%',
                background: `radial-gradient(circle, ${activeStep.color}24 0%, transparent 70%)`,
                filter: 'blur(60px)', pointerEvents: 'none',
                transition: 'background 0.6s ease'
            }} />
            <div style={{
                position: 'fixed', bottom: '20%', right: '8%',
                width: 300, height: 300, borderRadius: '50%',
                background: `radial-gradient(circle, ${activeStep.color}1c 0%, transparent 70%)`,
                filter: 'blur(60px)', pointerEvents: 'none',
                transition: 'background 0.6s ease'
            }} />

            {/* Top Bar */}
            <div style={{
                position: 'absolute', top: 24, left: 0, right: 0,
                padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                maxWidth: 480, margin: '0 auto', width: '100%'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="auth-logo" style={{ width: 38, height: 38, margin: 0, boxShadow: `0 0 15px ${activeStep.color}40`, border: `1px solid ${activeStep.color}30` }}>
                        <Link2 size={19} color="white" />
                    </div>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: 17, letterSpacing: '0.5px' }}>ExellenceLink</span>
                </div>
                
                {currentStep < steps.length - 1 && (
                    <button 
                        onClick={handleSkip}
                        style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease',
                            padding: '6px 14px', borderRadius: 20
                        }}
                        onMouseEnter={e => {
                            e.target.style.color = '#f1f5f9';
                            e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.color = '#94a3b8';
                            e.target.style.background = 'rgba(255,255,255,0.03)';
                        }}
                    >
                        Passer
                    </button>
                )}
            </div>

            {/* Main Card */}
            <div className="auth-card" style={{ 
                maxWidth: 460, width: '100%', padding: '32px 28px', marginTop: 50,
                minHeight: 560, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                background: 'rgba(13, 21, 39, 0.7)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
                
                {/* Illustration Section */}
                <div style={{ 
                    height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    background: activeStep.bgGradient, borderRadius: 20, border: '1px solid rgba(255,255,255,0.03)',
                    marginBottom: 28, position: 'relative', overflow: 'hidden',
                    transition: 'background 0.6s ease'
                }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -15 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {activeStep.illustration}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Content Section */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', marginBottom: 28 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                        >
                            <h2 style={{ fontSize: 25, fontWeight: 800, color: '#f8fafc', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                <IconComponent size={26} style={{ color: activeStep.color, filter: `drop-shadow(0 0 8px ${activeStep.color}60)` }} />
                                {activeStep.title}
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: 14.5, lineHeight: '1.6', margin: 0, padding: '0 6px' }}>
                                {activeStep.description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Dots indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                        {steps.map((step, idx) => (
                            <div 
                                key={step.id} 
                                onClick={() => setCurrentStep(idx)}
                                style={{
                                    width: idx === currentStep ? 28 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    background: idx === currentStep ? activeStep.color : '#1e293b',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                        ))}
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleNext}
                        className="btn btn-primary"
                        style={{
                            background: activeStep.color,
                            boxShadow: `0 8px 24px ${activeStep.color}3a`,
                            border: 'none',
                            padding: '15px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            fontWeight: 700,
                            fontSize: 15,
                            borderRadius: 14,
                            width: '100%',
                            cursor: 'pointer',
                            color: 'white',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={e => {
                            e.target.style.transform = 'translateY(-1.5px)';
                            e.target.style.boxShadow = `0 12px 30px ${activeStep.color}50`;
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = `0 8px 24px ${activeStep.color}3a`;
                        }}
                    >
                        {currentStep === steps.length - 1 ? (
                            <>
                                Découvrir l'application
                                <Check size={18} />
                            </>
                        ) : (
                            <>
                                Continuer
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Custom high-fidelity onboarding animation styles */}
            <style dangerouslySetInnerHTML={{__html: `
                .illustration-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Orb background glows */
                .glow-orb {
                    position: absolute;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    filter: blur(40px);
                    opacity: 0.6;
                    pointer-events: none;
                }
                .indigo-orb { background: rgba(99, 102, 241, 0.4); top: 20%; left: 30%; }
                .pink-orb { background: rgba(236, 72, 153, 0.4); bottom: 10%; right: 20%; }
                .emerald-orb { background: rgba(16, 185, 129, 0.4); top: 30%; right: 30%; }
                .purple-orb { background: rgba(167, 139, 250, 0.4); bottom: 20%; left: 25%; }
                
                /* STEP 1: GATHERING LINKS SYSTEM */
                .onboarding-links-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .floating-card {
                    position: absolute;
                    background: rgba(30, 41, 59, 0.85);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
                    z-index: 5;
                    transition: all 0.3s;
                }
                .card-lbl {
                    color: #cbd5e1;
                    font-size: 11px;
                    font-weight: 600;
                }
                .link-c1 {
                    top: 25px;
                    left: 20px;
                    animation: float-c1 5s ease-in-out infinite;
                }
                .link-c2 {
                    bottom: 25px;
                    left: 25px;
                    animation: float-c2 6s ease-in-out infinite;
                }
                .link-c3 {
                    top: 40px;
                    right: 20px;
                    animation: float-c3 5.5s ease-in-out infinite;
                }
                .central-vault {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
                .vault-core {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: rgba(99, 102, 241, 0.15);
                    border: 2px solid #6366f1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
                    position: relative;
                    z-index: 12;
                }
                .glow-icon-indigo {
                    color: white;
                    filter: drop-shadow(0 0 6px #6366f1);
                }
                .vault-ring {
                    position: absolute;
                    border: 1px dashed rgba(99, 102, 241, 0.3);
                    border-radius: 50%;
                }
                .ring-1 {
                    width: 100px;
                    height: 100px;
                    animation: spin-clockwise 25s linear infinite;
                }
                .ring-2 {
                    width: 130px;
                    height: 130px;
                    animation: spin-counter 35s linear infinite;
                }
                .stream-particle {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #818cf8;
                    box-shadow: 0 0 8px #6366f1;
                }
                .p1 { animation: stream-1 3.5s infinite linear; }
                .p2 { animation: stream-2 4.2s infinite linear; }
                .p3 { animation: stream-3 3.8s infinite linear; }

                /* STEP 2: AI SCANNING SYSTEM */
                .ai-process-container {
                    position: relative;
                    width: 80%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .raw-link-bar {
                    background: rgba(30, 41, 59, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 8px 14px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    color: #94a3b8;
                    font-size: 11px;
                    font-weight: 500;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    position: relative;
                }
                .ai-laser {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #ec4899, transparent);
                    box-shadow: 0 0 12px #ec4899, 0 0 20px #ec4899;
                    z-index: 10;
                    animation: laser-move 3s ease-in-out infinite;
                }
                .ai-result-card {
                    background: rgba(20, 26, 46, 0.95);
                    border: 1px solid rgba(236, 72, 153, 0.25);
                    border-radius: 14px;
                    padding: 14px 16px;
                    width: 100%;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.4);
                    transform-origin: top center;
                    animation: scale-up-card 3s infinite ease-in-out;
                }
                .ai-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .sparkle-glow {
                    color: #ec4899;
                    filter: drop-shadow(0 0 4px #ec4899);
                    animation: spin-clockwise 8s linear infinite;
                }
                .ai-badge {
                    background: rgba(236, 72, 153, 0.12);
                    border: 1px solid rgba(236, 72, 153, 0.3);
                    color: #f472b6;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 20px;
                }
                .ai-card-title {
                    color: white;
                    font-size: 13.5px;
                    font-weight: 700;
                    margin-bottom: 6px;
                    text-align: left;
                }
                .ai-card-desc {
                    color: #94a3b8;
                    font-size: 11.5px;
                    line-height: 1.4;
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 12px;
                    text-align: left;
                }
                .ai-tags {
                    display: flex;
                    gap: 6px;
                }
                .tag-pill {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .tag-pink { background: rgba(236,72,153,0.12); color: #f472b6; border: 1px solid rgba(236,72,153,0.2); }
                .tag-blue { background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.2); }

                /* STEP 3: HIGH SAFETY SECURITY BARRIER */
                .security-visual-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .glass-shield {
                    width: 84px;
                    height: 84px;
                    border-radius: 50%;
                    background: rgba(16, 185, 129, 0.08);
                    border: 2px solid rgba(16, 185, 129, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    z-index: 10;
                    box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
                    animation: pulse-shield 2.5s infinite ease-in-out;
                }
                .shield-icon-glow {
                    color: #10b981;
                    filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.6));
                }
                .shield-grid {
                    position: absolute;
                    inset: 4px;
                    border-radius: 50%;
                    border: 1px dashed rgba(16, 185, 129, 0.2);
                    animation: spin-clockwise 30s linear infinite;
                }
                .security-threat {
                    position: absolute;
                    background: rgba(15, 23, 42, 0.85);
                    border-radius: 8px;
                    padding: 6px 10px;
                    font-size: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
                }
                .security-threat.blocked {
                    left: 20px;
                    top: 35px;
                    border: 1px solid rgba(244, 63, 94, 0.3);
                    color: #f43f5e;
                    animation: attack-blocked 4s infinite ease-in-out;
                }
                .security-threat.allowed {
                    right: 20px;
                    bottom: 35px;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    color: #34d399;
                    animation: attack-allowed 4s infinite ease-in-out;
                }
                .status-badge {
                    font-size: 8px;
                    font-weight: 800;
                    padding: 1px 4px;
                    border-radius: 3px;
                    text-transform: uppercase;
                }
                .status-blocked { background: rgba(244,63,94,0.15); color: #f43f5e; }
                .status-allowed { background: rgba(16,185,129,0.15); color: #34d399; }

                /* STEP 4: SMARTPHONE LIVE PREVIEW */
                .phone-mockup-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                }
                .real-phone {
                    width: 110px;
                    height: 180px;
                    border: 4px solid #334155;
                    border-radius: 22px;
                    background: #020617;
                    padding: 6px;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .phone-notch {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 44px;
                    height: 10px;
                    background: #334155;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                    z-index: 100;
                }
                .phone-inner-screen {
                    flex: 1;
                    border-radius: 14px;
                    overflow: hidden;
                    background: #090d16;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                .sim-header {
                    background: #0d1527;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding: 8px 6px 4px 6px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 8px;
                    font-weight: 800;
                    color: white;
                }
                .sim-scrollable {
                    flex: 1;
                    padding: 8px 6px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    overflow: hidden;
                }
                .sim-stat-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6px;
                }
                .sim-stat {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 6px;
                    padding: 4px;
                    text-align: center;
                }
                .sim-stat-val { color: white; font-size: 10px; font-weight: 800; display: block; }
                .sim-stat-lbl { color: #475569; font-size: 6px; font-weight: 600; }
                
                .sim-item {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.03);
                    border-radius: 6px;
                    padding: 6px;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .sim-item-line {
                    height: 3px;
                    border-radius: 1.5px;
                    background: #1e293b;
                }
                .sim-item-line.w-80 { width: 80%; }
                .sim-item-line.w-60 { width: 60%; }
                .sim-item-line.w-50 { width: 50%; }
                .sim-item-line.w-40 { width: 40%; }
                .sim-item-tag {
                    width: 14px;
                    height: 5px;
                    border-radius: 2px;
                    margin-top: 2px;
                }
                .sim-item-tag.pink { background: rgba(236,72,153,0.3); }
                .sim-item-tag.blue { background: rgba(56,189,248,0.3); }
                
                .sim-fab {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #a78bfa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(167,139,250,0.4);
                    animation: float-fab 2s infinite ease-in-out;
                }

                /* KEYFRAMES & KEYBOARD ANIMATIONS */
                @keyframes spin-clockwise {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-counter {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                
                /* Floatings */
                @keyframes float-c1 {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(-1.5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes float-c2 {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(6px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes float-c3 {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-7px) rotate(1deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes float-fab {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                    100% { transform: translateY(0); }
                }

                /* Particle Streams */
                @keyframes stream-1 {
                    0% { top: 25px; left: 30px; opacity: 1; transform: scale(1); }
                    80% { top: 100px; left: 190px; opacity: 0.8; }
                    100% { top: 110px; left: 200px; opacity: 0; transform: scale(0.3); }
                }
                @keyframes stream-2 {
                    0% { bottom: 25px; left: 35px; opacity: 1; transform: scale(1); }
                    80% { bottom: 100px; left: 180px; opacity: 0.8; }
                    100% { bottom: 110px; left: 190px; opacity: 0; transform: scale(0.3); }
                }
                @keyframes stream-3 {
                    0% { top: 40px; right: 30px; opacity: 1; transform: scale(1); }
                    80% { top: 100px; right: 180px; opacity: 0.8; }
                    100% { top: 110px; right: 190px; opacity: 0; transform: scale(0.3); }
                }

                /* AI Scan Laser */
                @keyframes laser-move {
                    0% { top: 10%; opacity: 0.3; }
                    50% { top: 90%; opacity: 1; }
                    100% { top: 10%; opacity: 0.3; }
                }
                @keyframes scale-up-card {
                    0% { transform: scale(0.95); opacity: 0.6; filter: brightness(0.8); }
                    40% { transform: scale(1); opacity: 1; filter: brightness(1.1); }
                    70% { transform: scale(1); opacity: 1; filter: brightness(1); }
                    100% { transform: scale(0.95); opacity: 0.6; filter: brightness(0.8); }
                }

                /* Shield protections */
                @keyframes pulse-shield {
                    0% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
                    50% { transform: scale(1.04); box-shadow: 0 0 35px rgba(16, 185, 129, 0.4); }
                    100% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
                }
                @keyframes attack-blocked {
                    0% { transform: translateX(-40px); opacity: 0; }
                    20% { transform: translateX(0px); opacity: 1; }
                    35% { transform: translateX(-5px); filter: saturate(1.5); }
                    50% { transform: translateX(-15px) scale(0.9); opacity: 0; }
                    100% { transform: translateX(-40px); opacity: 0; }
                }
                @keyframes attack-allowed {
                    0% { transform: translateX(40px); opacity: 0; }
                    40% { transform: translateX(20px); opacity: 1; }
                    70% { transform: translateX(-30px); opacity: 0.9; }
                    85% { transform: translateX(-50px); opacity: 0; }
                    100% { transform: translateX(40px); opacity: 0; }
                }
            `}} />
        </div>
    );
};

export default Onboarding;
