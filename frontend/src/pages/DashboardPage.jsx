import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
    Plus, ChevronRight, X, LayoutDashboard,
    Repeat, Star, BookOpen, Settings, Bell, Trash2,
    Activity, Award, MessageCircle, Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import useScrollReveal from '../hooks/useScrollReveal'
import DashboardSidebar from '../components/DashboardSidebar'
import SkillSwapLoader from '../components/SkillSwapLoader'

const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

import DashboardHeader from '../components/DashboardHeader'

export default function DashboardPage() {
    const { user } = useAuth()
    useScrollReveal()

    // Data States
    const [mySkills, setMySkills] = useState([])
    const [swaps, setSwaps] = useState([])
    const [matches, setMatches] = useState([])
    const [categories, setCategories] = useState([])
    const [avgRating, setAvgRating] = useState(0)

    // UI States
    const [loading, setLoading] = useState(true)
    const [showAddSkill, setShowAddSkill] = useState(false)
    const [skillForm, setSkillForm] = useState({
        skill_name: '', description: '', type: 'offer', level: 'intermediate', category_id: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sk, sw, m, cat, r] = await Promise.all([
                    api.get('/my-skills'),
                    api.get('/swaps'),
                    api.get('/skills-match'),
                    api.get('/categories'),
                    api.get(`/ratings/${user.id}`).catch(() => ({ data: { avg_rating: 0 } }))
                ])
                setMySkills(sk.data || [])
                setSwaps(sw.data.data || [])
                setMatches(m.data?.slice(0, 4) || [])
                setCategories(cat.data || [])
                setAvgRating(r.data.avg_rating || 0)
            } catch (err) {
                toast.error('Failed to sync dashboard data')
            } finally {
                setTimeout(() => setLoading(false), 300)
            }
        }
        fetchData()
    }, [user.id])

    const stats = useMemo(() => ({
        offered: mySkills.filter(s => s.type === 'offer').length,
        wanted: mySkills.filter(s => s.type === 'request').length,
        pending: swaps.filter(s => s.status === 'pending').length,
        completed: swaps.filter(s => s.status === 'completed').length,
        rating: avgRating
    }), [mySkills, swaps, avgRating])

    const addSkill = async (e) => {
        e.preventDefault()
        try {
            // Filter out empty optional fields to prevent validation errors
            const payload = { ...skillForm }
            if (!payload.description) delete payload.description
            if (!payload.category_id) delete payload.category_id
            if (!payload.level) payload.level = 'intermediate'

            const res = await api.post('/skills', payload)
            setMySkills(prev => [res.data.skill, ...prev])
            setShowAddSkill(false)
            setSkillForm({ skill_name: '', description: '', type: 'offer', level: 'intermediate', category_id: '' })
            toast.success('Skill published!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add skill')
        }
    }

    const deleteSkill = async (id) => {
        if (!window.confirm('Remove this skill from your portfolio?')) return
        try {
            await api.delete(`/skills/${id}`)
            setMySkills(prev => prev.filter(s => s.id !== id))
            toast.success('Skill removed')
        } catch {
            toast.error('Delete failed')
        }
    }

    if (loading) return <SkillSwapLoader />

    return (
        <div className="sidebar-layout">
            <DashboardSidebar />

            <main className="main-content">
                <DashboardHeader title="Workspace" />

                <header className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-dim)' }}>Quick Release</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Manage your active swap portfolio and market presence.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setShowAddSkill(true)} className="btn btn-primary">
                            <Plus size={18} /> Add New Skill
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="reveal reveal-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 48 }}>
                    <StatCard label="Live Skills" value={stats.offered} icon={<img src="/image/img (2).png" alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />} />
                    <StatCard label="Active Swaps" value={stats.pending} trend={stats.pending > 0 ? "Action required" : "All caught up"} highlight={stats.pending > 0} icon={<Repeat size={20} color="var(--secondary)" />} />
                    <StatCard label="Completed" value={stats.completed} icon={<Award size={20} color="var(--accent)" />} />
                    <StatCard label="Platform Rating" value={stats.rating ? `${stats.rating}★` : 'N/A'} icon={<Star size={20} fill="var(--warning)" color="var(--warning)" />} />
                </div>

                <div className="reveal reveal-delay-2" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>

                    {/* Skill List Section */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Skill Portfolio</h2>
                            <Link to="/skills/me" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Manage All</Link>
                        </div>
                        <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
                            {mySkills.length === 0 ? (
                                <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                                    <p>No skills listed yet. Start by adding your first one!</p>
                                </div>
                            ) : (
                                mySkills.map((skill, i) => (
                                    <div key={skill.id} style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', borderBottom: i === mySkills.length - 1 ? 'none' : '1px solid var(--glass-border)', transition: 'var(--transition)' }} className="hover-row">
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 700, margin: 0, fontSize: '1rem', color: 'var(--text-bright)' }}>{skill.skill_name}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '4px 0 0' }}>{skill.category?.name || 'Uncategorized'} • {skill.level}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                            <span className={`badge badge-${skill.type}`}>
                                                {skill.type}
                                            </span>
                                            <button onClick={() => deleteSkill(skill.id)} className="btn-icon danger" style={{ border: 'none', background: 'transparent', padding: 8 }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Smart Matches */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Smart Matches</h2>
                            <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '0.65rem' }}>AI</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {matches.map(match => (
                                <Link to={`/skills/${match.id}`} key={match.id}>
                                    <div className="glass-card" style={{ padding: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                            <img src="/image/img (2).png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-bright)' }}>{match.skill_name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="avatar avatar-xs">{initial(match.user?.name)}</div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{match.user?.name}</p>
                                            <span className={`badge badge-${match.level}`} style={{ marginLeft: 'auto', fontSize: '0.6rem' }}>{match.level}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {matches.length === 0 && (
                                <div className="empty-state" style={{ padding: 32 }}>
                                    <p style={{ fontSize: '0.8rem' }}>Add more skills to see AI matches</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* --- ADD SKILL MODAL --- */}
            {showAddSkill && (
                <div className="modal-overlay" style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div className="glass modal-content" style={{ padding: 40, borderRadius: 24, width: '100%', maxWidth: 480, border: '2px solid var(--glass-border-bright)', boxShadow: 'var(--shadow-strong)', animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Create Listing</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Share your expertise with the community</p>
                            </div>
                            <button onClick={() => setShowAddSkill(false)} className="btn-icon" style={{ borderRadius: '50%' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={addSkill} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Skill Name</label>
                                <input
                                    className="form-input" placeholder="e.g. Advanced Piano, Python Dev"
                                    value={skillForm.skill_name} onChange={e => setSkillForm({ ...skillForm, skill_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Swap Type</label>
                                    <select className="form-input" value={skillForm.type} onChange={e => setSkillForm({ ...skillForm, type: e.target.value })}>
                                        <option value="offer">Offering</option>
                                        <option value="request">Requesting</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Expertise Level</label>
                                    <select className="form-input" value={skillForm.level} onChange={e => setSkillForm({ ...skillForm, level: e.target.value })}>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Category</label>
                                <select
                                    className="form-input"
                                    value={skillForm.category_id} onChange={e => setSkillForm({ ...skillForm, category_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Skill Description</label>
                                <textarea
                                    className="form-input"
                                    placeholder="Describe what you can teach or what you want to learn..."
                                    value={skillForm.description}
                                    onChange={e => setSkillForm({ ...skillForm, description: e.target.value })}
                                    rows={3}
                                    style={{ resize: 'none', background: 'var(--surface)', fontSize: '0.9rem' }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publish Listing</button>
                                <button type="button" onClick={() => setShowAddSkill(false)} className="btn btn-ghost">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .hover-row:hover { background: var(--surface) !important; cursor: pointer; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
        </div>
    )
}

function StatCard({ label, value, trend, icon, highlight = false }) {
    return (
        <div className="glass" style={{ padding: '24px', borderRadius: 20, border: highlight ? '2px solid var(--primary)' : '1px solid var(--glass-border-bright)', boxShadow: highlight ? 'var(--shadow-glow)' : 'var(--shadow-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>{label}</p>
                <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 10 }}>{icon}</div>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: '12px 0 0 0', color: 'var(--text-bright)' }}>{value}</h3>
            {trend && <p style={{ fontSize: '0.7rem', color: highlight ? 'var(--primary)' : 'var(--text-dim)', margin: '4px 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{trend}</p>}
        </div>
    )
}
