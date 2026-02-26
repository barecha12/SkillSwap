import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
    MapPin, Star, Edit2, Save, X, Camera, ArrowLeftRight,
    Award, BookOpen, MessageSquare, ChevronRight, Shield
} from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'
import DashboardSidebar from '../components/DashboardSidebar'
import SkillSwapLoader from '../components/SkillSwapLoader'

import DashboardHeader from '../components/DashboardHeader'

const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

const ProfileLayout = ({ children, user }) => {
    if (user) {
        return (
            <div className="sidebar-layout">
                <DashboardSidebar />
                <main className="main-content">
                    <DashboardHeader title="Identity Core" />
                    {children}
                </main>
            </div>
        )
    }
    return <div className="page">{children}</div>
}

export default function ProfilePage() {
    const { id } = useParams()
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [ratings, setRatings] = useState({ avg_rating: 0, total: 0, ratings: [] })
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [editForm, setEditForm] = useState({})
    const [saving, setSaving] = useState(false)
    const [photoFile, setPhotoFile] = useState(null)

    const isMe = user?.id === parseInt(id)
    useScrollReveal()

    useEffect(() => {
        setLoading(true)
        Promise.all([
            api.get(`/profile/${id}`),
            api.get(`/ratings/${id}`),
        ]).then(([p, r]) => {
            setData(p.data)
            setRatings(r.data)
            setEditForm({
                name: p.data.user.name,
                bio: p.data.profile.bio || '',
                location: p.data.profile.location || '',
            })
        }).catch(() => navigate('/404'))
            .finally(() => setTimeout(() => setLoading(false), 300))
    }, [id])

    const handleSave = async () => {
        setSaving(true)
        try {
            const formData = new FormData()
            Object.entries(editForm).forEach(([k, v]) => formData.append(k, v))
            if (photoFile) formData.append('photo', photoFile)

            // Laravel requires POST + _method=PUT for multipart updates
            formData.append('_method', 'PUT')

            const res = await api.post('/profile', formData, {
                headers: { 'Content-Type': undefined }
            })
            await refreshUser()
            setData(prev => ({ ...prev, user: res.data.user, profile: res.data.user.profile }))
            setEditing(false)
            setPhotoFile(null)
            toast.success('Profile updated!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <SkillSwapLoader />
    if (!data) return null

    const { profile, user: profileUser, skills_offered, skills_wanted, total_swaps, avg_rating } = data
    const stars = Math.round(avg_rating)

    return (
        <ProfileLayout user={user}>
            <div className="container" style={{ maxWidth: 1000 }}>
                {/* Profile Header */}
                <div className="glass-card reveal" style={{ marginBottom: 32, padding: 0, overflow: 'hidden' }}>

                    <div style={{
                        height: 160,
                        background: 'var(--grad-vibrant)',
                        opacity: 0.15,
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, var(--primary-glow), transparent)' }} />
                    </div>

                    <div style={{ padding: '0 40px 40px', marginTop: -60, position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
                                <div style={{ position: 'relative' }}>
                                    <div className="avatar avatar-xl" style={{
                                        width: 140, height: 140, fontSize: '3rem',
                                        border: '6px solid var(--bg-card)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}>
                                        {photoFile
                                            ? <img src={URL.createObjectURL(photoFile)} alt="" />
                                            : profile?.photo
                                                ? <img src={`http://localhost:8000/storage/${profile.photo}`} alt="" />
                                                : initial(profileUser?.name)}
                                    </div>
                                    {isMe && editing && (
                                        <label style={{
                                            position: 'absolute', bottom: 8, right: 8,
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', border: '3px solid var(--bg-card)',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)', color: 'white'
                                        }}>
                                            <Camera size={18} />
                                            <input type="file" accept="image/*" hidden onChange={e => setPhotoFile(e.target.files[0])} />
                                        </label>
                                    )}
                                </div>
                                <div style={{ paddingBottom: 8 }}>
                                    {editing ? (
                                        <input className="form-input" value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8, width: 280, background: 'var(--surface)' }} />
                                    ) : (
                                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 4 }}>{profileUser?.name}</h1>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        {editing ? (
                                            <input className="form-input" value={editForm.location} placeholder="Your Location"
                                                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                                style={{ width: 180, fontSize: '0.9rem' }} />
                                        ) : (
                                            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem' }}>
                                                <MapPin size={16} color="var(--primary)" /> {profile?.location || "Digital Nomad"}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ color: 'var(--warning)', display: 'flex' }}>
                                                {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                                            </div>
                                            <span style={{ fontWeight: 800 }}>{avg_rating || '5.0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingBottom: 12 }}>
                                <div style={{ display: 'flex', gap: 32, marginRight: 8 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-bright)' }}>{total_swaps}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Swaps</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-bright)' }}>{skills_offered.length}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offers</div>
                                    </div>
                                </div>

                                {isMe ? (
                                    editing ? (
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ padding: '10px 24px' }}>
                                                {saving ? <div className="spinner-premium" style={{ width: 18, height: 18 }} /> : <><Save size={18} /> Save</>}
                                            </button>
                                            <button onClick={() => { setEditing(false); setPhotoFile(null) }} className="btn btn-ghost" style={{ padding: '10px 16px' }}><X size={20} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setEditing(true)} className="btn btn-outline" style={{ padding: '10px 24px' }}><Edit2 size={16} /> Edit Profile</button>
                                    )
                                ) : user?.role === 'admin' ? (
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button onClick={() => {
                                            api.patch(`/admin/users/${profileUser.id}/block`).then(res => {
                                                toast.success(res.data.message);
                                                setData(prev => ({ ...prev, user: { ...prev.user, is_blocked: res.data.user.is_blocked } }));
                                            });
                                        }} className={`btn ${profileUser.is_blocked ? 'badge-success' : 'btn-danger'}`} style={{ padding: '12px 24px' }}>
                                            {profileUser.is_blocked ? 'Unblock User' : 'Block User'}
                                        </button>
                                        <Link to="/admin">
                                            <button className="btn btn-ghost" style={{ padding: '12px 24px' }}>
                                                <Shield size={18} /> Admin Hub
                                            </button>
                                        </Link>
                                    </div>
                                ) : (
                                    <Link to={`/messages?user=${profileUser.id}`}>
                                        <button className="btn btn-primary" style={{ padding: '12px 32px' }}>
                                            <MessageSquare size={18} /> Message
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="divider" style={{ margin: '32px 0' }} />

                        <div className="reveal reveal-delay-1">
                            {editing ? (
                                <div className="form-group">
                                    <label className="form-label">About You</label>
                                    <textarea className="form-input" value={editForm.bio} placeholder="Share your story and expertise..."
                                        onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                        rows={4} style={{ resize: 'none', background: 'var(--surface)', fontSize: '1rem', lineHeight: 1.6 }} />
                                </div>
                            ) : (
                                <div style={{ maxWidth: 800 }}>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                                        {profile?.bio || (isMe ? "Tell the community about yourself by clicking Edit Profile." : "This user prefers to keep their bio a mystery.")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div >

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }} className="reveal reveal-delay-2">
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src="/image/skillswap.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} /> Expertise Offered
                        </h2>
                        <div style={{ display: 'grid', gap: 12 }}>
                            {skills_offered.map(s => (
                                <Link to={`/skills/${s.id}`} key={s.id}>
                                    <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--text-bright)' }}>{s.skill_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>{s.category?.name}</div>
                                        </div>
                                        <span className={`badge badge-${s.level}`}>{s.level}</span>
                                    </div>
                                </Link>
                            ))}
                            {skills_offered.length === 0 && (
                                <div className="glass" style={{ padding: 32, textAlign: 'center', borderRadius: 16 }}>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No skills offered at the moment.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <BookOpen size={20} color="var(--primary)" /> Learning Interest
                        </h2>
                        <div style={{ display: 'grid', gap: 12 }}>
                            {skills_wanted.map(s => (
                                <div key={s.id} className="glass" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)', borderRadius: 14 }}>
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-bright)' }}>{s.skill_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>{s.category?.name}</div>
                                    </div>
                                    <span className="badge badge-request">Request</span>
                                </div>
                            ))}
                            {skills_wanted.length === 0 && (
                                <div className="glass" style={{ padding: 32, textAlign: 'center', borderRadius: 16 }}>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No specific learning requests yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {ratings.ratings.length > 0 && (
                    <div style={{ marginTop: 48 }} className="reveal reveal-delay-3">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 24 }}>Community Feedback</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
                            {ratings.ratings.map(r => (
                                <div key={r.id} className="glass-card" style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                        <div className="avatar avatar-sm">{initial(r.rater?.name)}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-bright)' }}>{r.rater?.name}</div>
                                            <div style={{ display: 'flex', gap: 2, color: 'var(--warning)', marginTop: 2 }}>
                                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                                    </div>
                                    {r.review && <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.review}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ProfileLayout>
    )
}
