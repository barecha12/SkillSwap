import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import SkillSwapLoader from '../components/SkillSwapLoader'
import { ArrowLeftRight, MessageSquare, MapPin, Star, ChevronLeft, Send, Award, BookOpen } from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'
import DashboardSidebar from '../components/DashboardSidebar'

import DashboardHeader from '../components/DashboardHeader'

const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

export default function SkillDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [skill, setSkill] = useState(null)
    const [mySkills, setMySkills] = useState([])
    const [ratings, setRatings] = useState({ avg_rating: 0, total: 0, ratings: [] })
    const [loading, setLoading] = useState(true)
    const [showSwapModal, setShowSwapModal] = useState(false)
    const [swapForm, setSwapForm] = useState({ offered_skill_id: '', message: '' })
    const [submitting, setSubmitting] = useState(false)

    useScrollReveal()

    useEffect(() => {
        const fetchSkill = async () => {
            try {
                const s = await api.get(`/skills/${id}`)
                setSkill(s.data)
                const r = await api.get(`/ratings/${s.data.user_id}`)
                setRatings(r.data)
            } catch (err) {
                toast.error('Skill not found')
                navigate('/skills')
            } finally {
                setTimeout(() => setLoading(false), 300)
            }
        }
        fetchSkill()

        if (user) {
            api.get('/my-skills').then(r => setMySkills(r.data.filter(s => s.type === 'offer')))
        }
    }, [id, user])

    const handleSwapRequest = async (e) => {
        e.preventDefault()
        if (!user) { navigate('/login'); return }
        setSubmitting(true)
        try {
            await api.post('/swaps', {
                receiver_id: skill.user_id,
                offered_skill_id: swapForm.offered_skill_id,
                requested_skill_id: skill.id,
                message: swapForm.message,
            })
            toast.success('Swap request sent! 🎉')
            setShowSwapModal(false)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request')
        } finally {
            setSubmitting(false)
        }
    }

    const handleMessage = async () => {
        if (!user) { navigate('/login'); return }
        navigate(`/messages?user=${skill.user_id}`)
    }

    if (loading) return <SkillSwapLoader />

    if (!skill) return <div className="container page"><p>Skill not found.</p></div>

    const isOwner = user?.id === skill.user_id
    const stars = Math.round(ratings.avg_rating)


    const Layout = ({ children }) => {
        if (user) {
            return (
                <div className="sidebar-layout">
                    <DashboardSidebar />
                    <main className="main-content">
                        <DashboardHeader title="Skill Intelligence" />
                        {children}
                    </main>
                </div>
            )
        }
        return <div className="page">{children}</div>
    }

    return (
        <Layout>
            <div className="container" style={{ maxWidth: 1000 }}>
                {/* Back Link */}
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm reveal" style={{ marginBottom: 32 }}>
                    <ChevronLeft size={16} /> Back
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, alignItems: 'start' }}>
                    {/* Main Content */}
                    <div className="reveal reveal-delay-1">
                        <div className="glass-card" style={{ padding: 40 }}>
                            {/* Header Section */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                        <span className={`badge badge-${skill.type}`}>{skill.type === 'offer' ? 'Offering' : 'Seeking'}</span>
                                        <span className={`badge badge-${skill.level}`}>{skill.level}</span>
                                    </div>
                                    <h1 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>{skill.skill_name}</h1>
                                    {skill.category && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                                            <div style={{ padding: 8, borderRadius: 8, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src="/image/skillswap.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                                            </div>
                                            {skill.category.name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="divider" style={{ margin: '32px 0' }} />

                            <section>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BookOpen size={20} color="var(--primary)" /> Description
                                </h3>
                                <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                                    {skill.description || 'The provider hasn\'t added a detailed description for this skill yet.'}
                                </div>
                            </section>

                            <div className="divider" style={{ margin: '32px 0' }} />

                            {/* Reviews Section */}
                            <section>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Star size={20} color="var(--warning)" fill="var(--warning)" /> Member Reviews
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,165,0,0.1)', padding: '6px 12px', borderRadius: 100 }}>
                                        <div className="stars" style={{ color: 'var(--warning)', letterSpacing: 2 }}>
                                            {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                                        </div>
                                        <span style={{ fontWeight: 800, color: 'var(--warning)' }}>{ratings.avg_rating || '5.0'}</span>
                                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>({ratings.total})</span>
                                    </div>
                                </div>

                                {ratings.ratings.length === 0 ? (
                                    <div className="glass" style={{ padding: 40, textAlign: 'center', borderRadius: 20 }}>
                                        <p style={{ color: 'var(--text-dim)' }}>No reviews yet for this user. Be the first to swap and rate!</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {ratings.ratings.slice(0, 3).map(r => (
                                            <div key={r.id} className="glass" style={{ padding: 24, borderRadius: 20 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                    <div className="avatar avatar-sm">{initial(r.rater?.name)}</div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-bright)' }}>{r.rater?.name}</div>
                                                        <div className="stars" style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>
                                                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.review}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="reveal reveal-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="glass-card" style={{ padding: 32, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'var(--grad-primary)', opacity: 0.1 }} />
                            <div style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                                    <div className="avatar avatar-xl" style={{ border: '4px solid var(--bg-card)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
                                        {skill.user?.profile?.photo
                                            ? <img src={`http://localhost:8000/storage/${skill.user.profile.photo}`} alt="" />
                                            : initial(skill.user?.name)}
                                    </div>
                                </div>
                                <h3 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: 4 }}>{skill.user?.name}</h3>
                                {skill.user?.profile?.location && (
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
                                        <MapPin size={14} color="var(--primary)" /> {skill.user.profile.location}
                                    </p>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, margin: '20px 0' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-bright)' }}>{ratings.total}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Reviews</div>
                                    </div>
                                    <div style={{ width: 1, height: 30, background: 'var(--glass-border)' }} />
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-bright)' }}>{skill.user?.skills_count || '—'}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Skills</div>
                                    </div>
                                </div>
                                <div className="divider" style={{ margin: '20px 0' }} />
                                <Link to={`/profile/${skill.user_id}`} style={{ width: '100%' }}>
                                    <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.85rem' }}>View Full Profile</button>
                                </Link>
                            </div>
                        </div>

                        {user?.role === 'admin' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div className="glass" style={{ padding: 24, textAlign: 'center', border: '1px dashed var(--primary)' }}>
                                    <Shield size={24} color="var(--primary)" style={{ marginBottom: 12 }} />
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform Moderator View</p>
                                </div>
                                <button className="btn btn-danger" onClick={() => {
                                    if (confirm('Delete this listing from marketplace?')) {
                                        api.delete(`/admin/skills/${skill.id}`).then(() => {
                                            toast.success('Listing removed');
                                            navigate('/skills');
                                        });
                                    }
                                }} style={{ width: '100%', padding: '16px' }}>
                                    <Trash2 size={18} /> Delete Listing
                                </button>
                            </div>
                        ) : !isOwner ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {skill.type === 'offer' ? (
                                    <button className="btn btn-primary" onClick={() => user ? setShowSwapModal(true) : navigate('/login')}
                                        style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}>
                                        <ArrowLeftRight size={20} /> Request This Swap
                                    </button>
                                ) : (
                                    <button className="btn btn-vibrant" onClick={() => user ? setShowSwapModal(true) : navigate('/login')}
                                        style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}>
                                        <img src="/image/skillswap.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} /> Offer This Skill
                                    </button>
                                )}
                                <button className="btn btn-outline" onClick={handleMessage}
                                    style={{ width: '100%', padding: '16px' }}>
                                    <MessageSquare size={18} /> Direct Message
                                </button>
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: 24, textAlign: 'center', border: '1px dashed var(--primary)' }}>
                                <Award size={24} color="var(--primary)" style={{ marginBottom: 12 }} />
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This is your listing.</p>
                                <Link to="/dashboard" style={{ display: 'block', marginTop: 12, color: 'var(--primary)', fontWeight: 700 }}>Manage Portfolio</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showSwapModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: 40, border: '1px solid var(--primary-glow)', animation: 'fadeIn 0.3s' }}>
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8 }}>Propose a Swap</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Requesting <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{skill.skill_name}</span>.</p>
                        </div>
                        <form onSubmit={handleSwapRequest} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="form-group">
                                <label className="form-label">What will you teach in return?</label>
                                <select className="form-input" value={swapForm.offered_skill_id}
                                    onChange={e => setSwapForm({ ...swapForm, offered_skill_id: e.target.value })}
                                    style={{ color: 'var(--text-bright)', background: 'var(--surface)', cursor: 'pointer' }}
                                    required>
                                    <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Select a skill...</option>
                                    {mySkills.map(s => <option key={s.id} value={s.id} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>{s.skill_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Introduction Message</label>
                                <textarea className="form-input" rows={4} value={swapForm.message}
                                    onChange={e => setSwapForm({ ...swapForm, message: e.target.value })}
                                    placeholder="Introduce yourself..." />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary" disabled={submitting || !swapForm.offered_skill_id} style={{ flex: 2 }}>
                                    {submitting ? 'Sending...' : 'Send Proposal'}
                                </button>
                                <button type="button" onClick={() => setShowSwapModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </Layout>
    )
}
