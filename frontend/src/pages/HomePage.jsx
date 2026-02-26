import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { ArrowRight, Users, ArrowLeftRight, Star, Search, TrendingUp, ChevronRight, Award, BookOpen } from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'

const CATEGORY_ICONS = {
    'Programming': '💻', 'Design': '🎨', 'Music': '🎵',
    'Languages': '🌍', 'Sports': '⚽', 'Cooking': '🍳',
    'Photography': '📷', 'Marketing': '📈'
}

export default function HomePage() {
    const { user } = useAuth()
    const [skills, setSkills] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useScrollReveal()

    useEffect(() => {
        Promise.all([
            api.get('/skills?type=offer'),
            api.get('/categories'),
        ]).then(([s, c]) => {
            setSkills(s.data.data || [])
            setCategories(c.data)
        }).finally(() => {
            setTimeout(() => setLoading(false), 400)
        })
    }, [])

    const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

    return (
        <div style={{ overflowX: 'hidden' }}>
            {/* Massive Hero Section */}
            <section style={{
                minHeight: '92vh', display: 'flex', alignItems: 'center',
                background: 'radial-gradient(circle at 50% -20%, var(--primary-glow) 0%, transparent 60%)',
                position: 'relative', overflow: 'hidden', padding: '80px 0'
            }}>
                {/* Dynamic Ambient Backgrounds */}
                <div style={{
                    position: 'absolute', width: '80vw', height: '80vw',
                    borderRadius: '50%', filter: 'blur(120px)',
                    background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
                    top: '-20%', left: '-10%', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', width: '60vw', height: '60vw',
                    borderRadius: '50%', filter: 'blur(120px)',
                    background: 'radial-gradient(circle, var(--secondary-glow) 0%, transparent 70%)',
                    bottom: '-10%', right: '-5%', pointerEvents: 'none'
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 100, padding: '8px 20px', marginBottom: 32, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <img src="/image/img (2).png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} /> Welcome to the Skill-Based Economy
                        </div>

                        <h1 className="reveal reveal-delay-1" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 900, lineHeight: 1, marginBottom: 24, letterSpacing: '-3px' }}>
                            Learn Anything<br />
                            <span style={{ background: 'var(--grad-vibrant)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                For Exactly $0.00
                            </span>
                        </h1>

                        <p className="reveal reveal-delay-2" style={{ fontSize: '1.25rem', color: 'var(--text-dim)', maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 500 }}>
                            Join the world's premier knowledge exchange network.
                            Trade your unique expertise for the skills you've always wanted to master.
                            Teaching is the new currency.
                        </p>

                        {/* Search bar Area */}
                        <div className="reveal reveal-delay-3" style={{ maxWidth: 680, margin: '0 auto 56px', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: -2, background: 'var(--grad-primary)', borderRadius: 100, opacity: 0.2, filter: 'blur(15px)' }} />
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="form-input"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') window.location.href = `/skills?search=${search}` }}
                                    placeholder="What do you want to learn today?"
                                    style={{ height: 72, paddingLeft: 64, paddingRight: 160, borderRadius: 100, fontSize: '1.1rem', background: 'var(--bg-card)', border: '1px solid var(--glass-border-bright)' }}
                                />
                                <Search size={24} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <Link to={`/skills?search=${search}`}>
                                    <button className="btn btn-primary" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', borderRadius: 100, height: 56, padding: '0 32px' }}>
                                        Search Skills
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="reveal reveal-delay-4" style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {user ? (
                                <Link to="/skills"><button className="btn btn-primary btn-lg" style={{ borderRadius: 100 }}>Explore Marketplace <ArrowRight size={20} /></button></Link>
                            ) : (
                                <>
                                    <Link to="/register"><button className="btn btn-vibrant btn-lg" style={{ borderRadius: 100 }}>Start Your Journey <ArrowRight size={20} /></button></Link>
                                    <Link to="/skills"><button className="btn btn-ghost btn-lg" style={{ borderRadius: 100, border: '1px solid var(--glass-border)' }}>Browse Knowledge</button></Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Trust / Stats */}
            <section className="reveal reveal-delay-5" style={{ paddingBottom: 100 }}>
                <div className="container">
                    <div className="glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, padding: '40px 60px', borderRadius: 32 }}>
                        {[
                            { value: '10K+', label: 'Global Experts', icon: Users },
                            { value: '500+', label: 'Sectors Covered', icon: Award },
                            { value: '8K+', label: 'Swaps Processed', icon: ArrowLeftRight },
                            { value: '4.9★', label: 'Average Trust', icon: Star },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <div style={{ background: 'var(--primary-glow)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <s.icon size={20} color="var(--primary)" />
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-bright)', letterSpacing: '-1px' }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section" style={{ position: 'relative' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <h2 className="reveal section-title" style={{ fontSize: '3rem', letterSpacing: '-1.5px' }}>Learn by <span style={{ color: 'var(--primary)' }}>Interest Area</span></h2>
                        <p className="reveal reveal-delay-1 section-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Dive into specific knowledge domains curated for you</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
                        {categories.map((cat, idx) => (
                            <Link to={`/skills?category_id=${cat.id}`} key={cat.id} className={`reveal reveal-delay-${idx % 4}`}>
                                <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 24 }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 20, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))' }}>{cat.icon || CATEGORY_ICONS[cat.name] || '🔧'}</div>
                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-bright)' }}>{cat.name}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - Premium Version */}
            <section className="section" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <h2 className="reveal section-title" style={{ fontSize: '3rem' }}>The <span style={{ color: 'var(--secondary)' }}>Swap Lifecycle</span></h2>
                        <p className="reveal reveal-delay-1 section-subtitle">Transparent, secure, and community-driven</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
                        {[
                            { step: '01', title: 'Curate Your Portfolio', desc: 'List your offerings and your wishlist. Our AI builds your identity.', icon: '✍️', col: 'var(--primary)' },
                            { step: '02', title: 'Smart Match Discovery', desc: 'Auto-discovery connects you with users in your local or global area.', icon: '🔍', col: 'var(--secondary)' },
                            { step: '03', title: 'Knowledge Exchange', desc: 'Connect via encrypted chat, schedule a session, and master new skills.', icon: '🚀', col: 'var(--accent)' },
                        ].map((item, idx) => (
                            <div key={item.step} className={`reveal reveal-delay-${idx} glass-card`} style={{ padding: 48, borderRadius: 32 }}>
                                <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--text-ghost)', position: 'absolute', top: 20, right: 30, lineHeight: 1 }}>{item.step}</div>
                                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: 32 }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 16, color: 'var(--text-bright)' }}>{item.title}</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.7 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recently Added Skills */}
            <section className="section">
                <div className="container">
                    <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>New <span style={{ color: 'var(--primary)' }}>Opportunities</span></h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginTop: 8 }}>Recently published knowledge offerings from the network</p>
                        </div>
                        <Link to="/skills"><button className="btn btn-ghost" style={{ borderRadius: 100 }}>View Entire Library <ChevronRight size={18} /></button></Link>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner-premium" style={{ width: 44, height: 44 }} /></div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                            {skills.slice(0, 12).map((skill, idx) => (
                                <Link to={`/skills/${skill.id}`} key={skill.id} className={`reveal reveal-delay-${idx % 3}`}>
                                    <div className="glass-card" style={{ padding: 28, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                            <div style={{ background: 'var(--surface)', padding: '6px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>
                                                {skill.category?.name || 'Knowledge'}
                                            </div>
                                            <span className={`badge badge-${skill.type}`} style={{ borderRadius: 8 }}>{skill.type}</span>
                                        </div>
                                        <h3 style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: 12, color: 'var(--text-bright)' }}>{skill.skill_name}</h3>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 24, flex: 1 }} className="line-clamp-2">
                                            {skill.description || 'No description provided.'}
                                        </p>
                                        <div className="divider" style={{ margin: '16px 0', opacity: 0.3 }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="avatar avatar-sm" style={{ border: '2px solid var(--primary-glow)' }}>{initial(skill.user?.name)}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-bright)' }}>{skill.user?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Level: <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{skill.level}</span></div>
                                            </div>
                                            <button className="btn-icon" style={{ borderRadius: 10, width: 36, height: 36 }}><ArrowRight size={16} /></button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Immersive CTA */}
            {!user && (
                <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'var(--grad-primary)', opacity: 0.05 }} />
                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="glass" style={{ textAlign: 'center', padding: '100px 40px', borderRadius: 48, border: '1px solid var(--primary-glow)', boxShadow: 'var(--shadow-glow)' }}>
                            <h2 className="reveal" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: 20, letterSpacing: '-2px' }}>The knowledge revolution starts here.</h2>
                            <p className="reveal reveal-delay-1" style={{ color: 'var(--text-dim)', fontSize: '1.4rem', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
                                Connect with your first partner in under 2 minutes.
                                Free forever. No hidden fees. Just learning.
                            </p>
                            <Link to="/register" className="reveal reveal-delay-2">
                                <button className="btn btn-vibrant btn-lg" style={{ borderRadius: 100, padding: '20px 60px', fontSize: '1.3rem' }}>Create Account <ArrowRight size={24} style={{ marginLeft: 12 }} /></button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--glass-border)', padding: '80px 0 40px' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 60, marginBottom: 80, textAlign: 'left' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5 }}>
                                    <img src="/image/img (2).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-bright)' }}>SkillSwap</span>
                            </div>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Bridging the gap between knowledge and accessibility through a modern skill-based economy.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--text-bright)', fontWeight: 800, marginBottom: 20 }}>Platform</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                <Link to="/skills">Market Library</Link>
                                <Link to="/swaps">Active Swaps</Link>
                                <Link to="/dashboard">Personal Space</Link>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--text-bright)', fontWeight: 800, marginBottom: 20 }}>Identity</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                <Link to="/login">Authentication</Link>
                                <Link to="/register">Join Platform</Link>
                                <Link to="/notifications">Activity Feed</Link>
                            </div>
                        </div>
                    </div>
                    <div className="divider" style={{ opacity: 0.1, marginBottom: 40 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        <p>© 2026 SkillSwap Network. Managed by Decentralized Knowledge DAO.</p>
                        <div style={{ display: 'flex', gap: 32 }}>
                            <span>User Agreement</span>
                            <span>Privacy Protocol</span>
                            <span>Audit Logs</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
