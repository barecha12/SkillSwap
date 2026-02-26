import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeftRight, Check, X, Star, ChevronRight, MessageSquare, Send, Clock, User, BookOpen } from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'
import DashboardSidebar from '../components/DashboardSidebar'
import SkillSwapLoader from '../components/SkillSwapLoader'

const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

const StatusBadge = ({ status }) => <span className={`badge badge-${status}`} style={{ textTransform: 'capitalize' }}>{status}</span>

import DashboardHeader from '../components/DashboardHeader'

export default function SwapsPage() {
    const { user } = useAuth()
    const [swaps, setSwaps] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('all')
    const [ratingModal, setRatingModal] = useState(null)
    const [ratingForm, setRatingForm] = useState({ rating: 5, review: '' })
    const [submitting, setSubmitting] = useState(false)

    useScrollReveal()

    useEffect(() => {
        api.get('/swaps').then(r => setSwaps(r.data.data || [])).finally(() => setTimeout(() => setLoading(false), 300))
    }, [])

    const filtered = swaps.filter(s => {
        if (tab === 'all') return true
        if (tab === 'sent') return s.sender_id === user.id
        if (tab === 'received') return s.receiver_id === user.id
        return s.status === tab
    })

    const updateStatus = async (swapId, status) => {
        try {
            const res = await api.patch(`/swaps/${swapId}/status`, { status })
            setSwaps(prev => prev.map(s => s.id === swapId ? res.data.swap : s))
            toast.success(`Swap ${status}!`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed')
        }
    }

    const submitRating = async (swap) => {
        setSubmitting(true)
        const ratedId = swap.sender_id === user.id ? swap.receiver_id : swap.sender_id
        try {
            await api.post('/ratings', {
                swap_id: swap.id,
                rated_id: ratedId,
                ...ratingForm,
            })
            toast.success('Rating submitted! ⭐')
            setRatingModal(null)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit rating')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <SkillSwapLoader />

    return (
        <div className="sidebar-layout">
            <DashboardSidebar />

            <main className="main-content">
                <DashboardHeader title="My Swaps" />

                <div className="reveal" style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-dim)' }}>Exchange Ledger</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Track and manage your active knowledge transfer protocols.</p>
                </div>

                {/* Status Tabs */}
                <div className="reveal reveal-delay-1" style={{
                    display: 'flex', gap: 8, marginBottom: 32, padding: 6,
                    background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--glass-border)',
                    overflowX: 'auto', whiteSpace: 'nowrap', width: 'fit-content'
                }}>
                    {['all', 'sent', 'received', 'pending', 'accepted', 'completed'].map(t => (
                        <button key={t}
                            className={`tab ${tab === t ? 'active' : ''}`}
                            onClick={() => setTab(t)}
                            style={{
                                padding: '10px 20px', borderRadius: 12, border: 'none',
                                background: tab === t ? 'var(--primary-glow)' : 'transparent',
                                color: tab === t ? 'var(--primary)' : 'var(--text-dim)',
                                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'var(--transition)'
                            }}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="reveal reveal-delay-2 glass" style={{ padding: 80, textAlign: 'center', borderRadius: 24 }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <ArrowLeftRight size={40} style={{ opacity: 0.3 }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>No swaps found</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Try changing your filters or browse the marketplace for matches.</p>
                        <Link to="/skills"><button className="btn btn-primary" style={{ padding: '12px 32px' }}>Explore Skills</button></Link>
                    </div>
                ) : (
                    <div className="reveal reveal-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {filtered.map(swap => {
                            const isSender = swap.sender_id === user.id
                            const other = isSender ? swap.receiver : swap.sender

                            return (
                                <div key={swap.id} className="glass-card" style={{ padding: 32 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                                        {/* Member Info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 300 }}>
                                            <Link to={`/profile/${other?.id}`}>
                                                <div className="avatar avatar-lg" style={{ border: '3px solid var(--primary-glow)', boxShadow: 'var(--shadow-glow)' }}>
                                                    {other?.profile?.photo
                                                        ? <img src={`http://localhost:8000/storage/${other.profile.photo}`} alt="" />
                                                        : initial(other?.name)}
                                                </div>
                                            </Link>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                    <Link to={`/profile/${other?.id}`}>
                                                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-bright)' }}>{other?.name}</span>
                                                    </Link>
                                                    <StatusBadge status={swap.status} />
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'var(--surface)', padding: '4px 10px', borderRadius: 8 }}>
                                                        {isSender ? 'Outgoing' : 'Incoming'}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--success-glow)', padding: '6px 14px', borderRadius: 10 }}>
                                                        <img src="/image/skillswap.png" alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-bright)' }}>{swap.offered_skill?.skill_name}</span>
                                                    </div>
                                                    <ArrowLeftRight size={16} color="var(--text-dim)" />
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--primary-glow)', padding: '6px 14px', borderRadius: 10 }}>
                                                        <BookOpen size={14} color="var(--primary)" />
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-bright)' }}>{swap.requested_skill?.skill_name}</span>
                                                    </div>
                                                </div>

                                                {swap.message && (
                                                    <div className="msg-bubble" style={{ marginTop: 16, maxWidth: '100%' }}>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>"{swap.message}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Row Actions */}
                                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                            {swap.status === 'pending' && swap.receiver_id === user.id && (
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    <button onClick={() => updateStatus(swap.id, 'accepted')} className="btn btn-primary btn-sm">
                                                        <Check size={16} /> Accept
                                                    </button>
                                                    <button onClick={() => updateStatus(swap.id, 'rejected')} className="btn btn-outline btn-sm" style={{ color: 'var(--error)', borderColor: 'rgba(239,68,68,0.2)' }}>
                                                        <X size={16} /> Decline
                                                    </button>
                                                </div>
                                            )}

                                            {swap.status === 'accepted' && (
                                                <button onClick={() => updateStatus(swap.id, 'completed')} className="btn btn-vibrant btn-sm">
                                                    <Check size={16} /> Mark as Completed
                                                </button>
                                            )}

                                            {swap.status === 'completed' && (
                                                <button onClick={() => setRatingModal(swap)} className="btn btn-primary btn-sm" style={{ background: 'var(--grad-vibrant)' }}>
                                                    <Star size={16} fill="white" /> Give Rating
                                                </button>
                                            )}

                                            <Link to={`/messages?user=${other?.id}`}>
                                                <button className="btn btn-ghost btn-sm" style={{ padding: '10px 16px' }}>
                                                    <MessageSquare size={18} /> Chat
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {ratingModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 40, animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,165,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Star size={32} color="var(--warning)" fill="var(--warning)" />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8 }}>Rate Experience</h2>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Share your feedback on swapping with <strong>{ratingModal.sender_id === user.id ? ratingModal.receiver?.name : ratingModal.sender?.name}</strong>
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                                    style={{
                                        fontSize: '2.5rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                                        transform: ratingForm.rating >= star ? 'scale(1.15)' : 'scale(1)',
                                        color: ratingForm.rating >= star ? 'var(--warning)' : 'var(--text-dim)'
                                    }}
                                >
                                    {ratingForm.rating >= star ? '★' : '☆'}
                                </button>
                            ))}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Write a short review</label>
                            <textarea className="form-input" rows={4} placeholder="How was the session? What did you learn?"
                                value={ratingForm.review} onChange={e => setRatingForm({ ...ratingForm, review: e.target.value })}
                                style={{ resize: 'none', padding: 16 }} />
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                            <button onClick={() => submitRating(ratingModal)} className="btn btn-primary" disabled={submitting}
                                style={{ flex: 2, height: 50, fontSize: '1rem' }}>
                                {submitting ? <div className="spinner-premium" style={{ width: 20, height: 20 }} /> : <><Send size={18} /> Submit Feedback</>}
                            </button>
                            <button onClick={() => setRatingModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
            `}</style>
        </div>
    )
}
