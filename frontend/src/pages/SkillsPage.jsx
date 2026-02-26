import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { Search, Filter, X, BookOpen, MapPin, ChevronRight, Award } from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'
import { useAuth } from '../context/AuthContext'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardHeader from '../components/DashboardHeader'

const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="glass-card skill-skeleton-card" style={{ padding: 28, height: 260 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <div className="skel" style={{ width: 72, height: 22, borderRadius: 99 }} />
                <div className="skel" style={{ width: 80, height: 22, borderRadius: 99 }} />
            </div>
            <div className="skel" style={{ width: '75%', height: 22, borderRadius: 8, marginBottom: 10 }} />
            <div className="skel" style={{ width: '45%', height: 14, borderRadius: 8, marginBottom: 20 }} />
            <div className="skel" style={{ width: '100%', height: 13, borderRadius: 6, marginBottom: 8 }} />
            <div className="skel" style={{ width: '85%', height: 13, borderRadius: 6, marginBottom: 8 }} />
            <div className="skel" style={{ width: '60%', height: 13, borderRadius: 6, marginBottom: 24 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                <div className="skel" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                    <div className="skel" style={{ width: '55%', height: 14, borderRadius: 6, marginBottom: 7 }} />
                    <div className="skel" style={{ width: '38%', height: 12, borderRadius: 6 }} />
                </div>
            </div>
        </div>
    )
}

// ── Skeleton grid ─────────────────────────────────────────────────────────────
function SkeletonGrid() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, marginBottom: 48 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
    )
}
// ── Page-level wrapper ────────────────────────────────────────────────────────
function SkillsPageLayout({ user, children }) {
    if (user) {
        return (
            <div className="sidebar-layout">
                <DashboardSidebar />
                <main className="main-content">
                    <DashboardHeader title="Skill Matrix" />
                    {children}
                </main>
            </div>
        )
    }
    return <div className="page">{children}</div>
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SkillsPage() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const [skills, setSkills] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({})
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || '',
        category_id: searchParams.get('category_id') || '',
        level: '',
        page: 1,
    })

    useScrollReveal()

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data))
    }, [])

    useEffect(() => {
        setLoading(true)
        const params = {}
        Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
        api.get('/skills', { params }).then(r => {
            setSkills(r.data.data || [])
            setPagination(r.data)
        }).finally(() => setTimeout(() => setLoading(false), 400))
    }, [filters])

    const clearFilters = () => setFilters({ search: '', type: '', category_id: '', level: '', page: 1 })
    const hasFilters = filters.search || filters.type || filters.category_id || filters.level

    return (
        <SkillsPageLayout user={user}>
            <div className="container" style={{ maxWidth: 1200 }}>
                <div className="reveal" style={{ marginBottom: 48, textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-1.5px' }}>
                        Skill <span style={{ color: 'var(--primary)' }}>Marketplace</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: 600, margin: '0 auto' }}>
                        Discover {pagination.total || 0} unique skills from creators, developers, and craftsmen worldwide.
                    </p>
                </div>

                {/* ── Filters ───────────────────────────────────────────────── */}
                <div className="reveal reveal-delay-1 glass" style={{ padding: 32, marginBottom: 48, borderRadius: 24, border: '1px solid var(--glass-border-bright)', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 16, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input className="form-input" placeholder="What do you want to learn today?"
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                style={{ paddingLeft: 48, height: 50, background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 12 }}
                            />
                        </div>

                        <select className="form-input" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}
                            style={{ width: 140, height: 50, background: 'var(--surface)', borderRadius: 12, color: 'var(--text-bright)', cursor: 'pointer' }}>
                            <option value="">All Types</option>
                            <option value="offer">Offering</option>
                            <option value="request">Seeking</option>
                        </select>

                        <select className="form-input" value={filters.category_id} onChange={e => setFilters({ ...filters, category_id: e.target.value, page: 1 })}
                            style={{ width: 180, height: 50, background: 'var(--surface)', borderRadius: 12, color: 'var(--text-bright)', cursor: 'pointer' }}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>{c.name}</option>)}
                        </select>

                        <select className="form-input" value={filters.level} onChange={e => setFilters({ ...filters, level: e.target.value, page: 1 })}
                            style={{ width: 140, height: 50, background: 'var(--surface)', borderRadius: 12, color: 'var(--text-bright)', cursor: 'pointer' }}>
                            <option value="">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>

                        {hasFilters && (
                            <button className="btn btn-ghost" onClick={clearFilters} style={{ padding: '0 12px' }}>
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Content ───────────────────────────────────────────────── */}
                {loading ? (
                    <SkeletonGrid />
                ) : skills.length === 0 ? (
                    <div className="reveal glass" style={{ padding: 100, textAlign: 'center', borderRadius: 32 }}>
                        <div style={{ padding: 32, background: 'var(--surface)', borderRadius: '50%', display: 'inline-flex', marginBottom: 24 }}>
                            <Search size={64} style={{ opacity: 0.2 }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>No matches found</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>We couldn't find any skills matching your current search criteria.</p>
                        <button className="btn btn-primary" onClick={clearFilters} style={{ padding: '12px 32px' }}>View All Skills</button>
                    </div>
                ) : (
                    <>
                        <div className="reveal reveal-delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, marginBottom: 48 }}>
                            {skills.map(skill => (
                                <Link to={`/skills/${skill.id}`} key={skill.id}>
                                    <div className="glass-card h-100 skill-card-premium" style={{ height: '100%', padding: 28, transition: 'var(--transition)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                            <div style={{ flex: 1, marginRight: 12 }}>
                                                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                                                    <span className={`badge badge-${skill.type}`} style={{ textTransform: 'capitalize' }}>{skill.type === 'offer' ? 'Offering' : 'Seeking'}</span>
                                                    <span className={`badge badge-${skill.level}`} style={{ textTransform: 'capitalize' }}>{skill.level}</span>
                                                </div>
                                                <h3 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: 6, color: 'var(--text-bright)' }}>{skill.skill_name}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}>
                                                    <Award size={14} /> {skill.category?.name || 'Exchange'}
                                                </div>
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }} className="line-clamp-3">
                                            {skill.description || 'Join this session to master the fundamentals and advanced techniques of this skill.'}
                                        </p>

                                        <div className="divider" style={{ margin: '0 0 20px 0', opacity: 0.5 }} />

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="avatar avatar-md" style={{ border: '2px solid var(--primary-glow)' }}>
                                                {skill.user?.profile?.photo
                                                    ? <img src={`http://localhost:8000/storage/${skill.user.profile.photo}`} alt="" />
                                                    : initial(skill.user?.name)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-bright)' }}>{skill.user?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <MapPin size={12} /> {skill.user?.profile?.location || 'Remote'}
                                                </div>
                                            </div>
                                            <div className="btn-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '50%', width: 32, height: 32 }}>
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {pagination.last_page > 1 && (
                            <div className="reveal reveal-delay-3" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 60 }}>
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => { setFilters({ ...filters, page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className={`btn`}
                                        style={{
                                            width: 44, height: 44, padding: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: p === pagination.current_page ? 'var(--primary)' : 'var(--bg-card)',
                                            color: p === pagination.current_page ? 'white' : 'var(--text-muted)',
                                            border: '1px solid var(--glass-border)',
                                            fontWeight: 700
                                        }}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .skill-card-premium:hover {
                    background: rgba(255,255,255,0.05) !important;
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-glow);
                    border-color: var(--primary-glow) !important;
                }

                /* Skeleton shimmer */
                @keyframes shimmer {
                    0%   { background-position: -600px 0; }
                    100% { background-position:  600px 0; }
                }

                .skel {
                    background: linear-gradient(
                        90deg,
                        var(--surface)          25%,
                        rgba(255,255,255,0.08)   50%,
                        var(--surface)          75%
                    );
                    background-size: 600px 100%;
                    animation: shimmer 1.6s infinite linear;
                    border-radius: 6px;
                }

                [data-theme='light'] .skel {
                    background: linear-gradient(
                        90deg,
                        rgba(139,92,246,0.06)  25%,
                        rgba(139,92,246,0.12)  50%,
                        rgba(139,92,246,0.06)  75%
                    );
                    background-size: 600px 100%;
                    animation: shimmer 1.6s infinite linear;
                }

                .skill-skeleton-card {
                    pointer-events: none;
                    display: flex;
                    flex-direction: column;
                }
            `}</style>
        </SkillsPageLayout>
    )
}
