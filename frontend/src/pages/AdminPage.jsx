import { useState, useEffect } from 'react'
import api from '../lib/api'
import {
    Users, Wrench, ArrowLeftRight, Trash2,
    Shield, ShieldOff, RefreshCw, BarChart3,
    Activity, BookOpen, Globe, Search,
    Star, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useScrollReveal from '../hooks/useScrollReveal'
import DashboardSidebar from '../components/DashboardSidebar'
import SkillSwapLoader from '../components/SkillSwapLoader'

import DashboardHeader from '../components/DashboardHeader'

export default function AdminPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState('overview')
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [skills, setSkills] = useState([])
    const [swaps, setSwaps] = useState([])
    const [loading, setLoading] = useState(true)

    useScrollReveal()

    useEffect(() => {
        if (user?.role !== 'admin') { navigate('/'); return }
        loadData()
    }, [tab])

    const loadData = async () => {
        setLoading(true)
        try {
            if (tab === 'overview') {
                const r = await api.get('/admin/stats')
                setStats(r.data)
            } else if (tab === 'users') {
                const r = await api.get('/admin/users')
                setUsers(r.data.data || [])
            } else if (tab === 'skills') {
                const r = await api.get('/admin/skills')
                setSkills(r.data.data || [])
            } else if (tab === 'swaps') {
                const r = await api.get('/admin/swaps')
                setSwaps(r.data.data || [])
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to synchronize platform data')
        } finally {
            setTimeout(() => setLoading(false), 300)
        }
    }

    const blockUser = async (id) => {
        try {
            const res = await api.patch(`/admin/users/${id}/block`)
            setUsers(prev => prev.map(u => u.id === id ? { ...u, is_blocked: res.data.user.is_blocked } : u))
            toast.success(res.data.message)
        } catch { toast.error('Action failed') }
    }

    const deleteUser = async (id) => {
        if (!confirm('Permanently delete this user? Action cannot be undone.')) return
        try {
            await api.delete(`/admin/users/${id}`)
            setUsers(prev => prev.filter(u => u.id !== id))
            toast.success('User removed from database')
        } catch { toast.error('Failed to delete user') }
    }

    const deleteSkill = async (id) => {
        if (!confirm('Remove this skill listing from marketplace?')) return
        try {
            await api.delete(`/admin/skills/${id}`)
            setSkills(prev => prev.filter(s => s.id !== id))
            toast.success('Listing removed')
        } catch { toast.error('Action failed') }
    }

    const initials = (name) => name ? name.charAt(0).toUpperCase() : '?'

    if (loading) return <SkillSwapLoader />

    return (
        <div className="sidebar-layout">
            <DashboardSidebar />

            <main className="main-content">
                <DashboardHeader title="Administrator Hub" />

                <header className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-dim)' }}>
                            {tab === 'overview' && 'Platform Intelligence'}
                            {tab === 'users' && 'Access Control'}
                            {tab === 'skills' && 'Market Inventory'}
                            {tab === 'swaps' && 'Transaction Ledger'}
                        </h2>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={loadData} className={`btn btn-ghost ${loading ? 'spinning' : ''}`} style={{ padding: 12 }}>
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </header>

                {/* Dashboard Tabs */}
                <div className="reveal reveal-delay-half" style={{ display: 'flex', gap: 8, marginBottom: 40, background: 'var(--surface)', padding: 6, borderRadius: 16, width: 'fit-content', border: '1px solid var(--glass-border)' }}>
                    <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={<BarChart3 size={18} />} label="Overview" />
                    <TabButton active={tab === 'users'} onClick={() => setTab('users')} icon={<Users size={18} />} label="Users" />
                    <TabButton active={tab === 'skills'} onClick={() => setTab('skills')} icon={<Wrench size={18} />} label="Listing Control" />
                    <TabButton active={tab === 'swaps'} onClick={() => setTab('swaps')} icon={<ArrowLeftRight size={18} />} label="Swap Feed" />
                </div>

                <div className="reveal">
                    {tab === 'overview' && stats && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
                                <MetricCard label="Total Users" value={stats.total_users} trend="+12% this month" icon={<Users size={24} />} color="var(--primary)" />
                                <MetricCard label="Active Listings" value={stats.total_skills} trend="+5 new today" icon={<img src="/image/img (2).png" alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />} color="var(--secondary)" />
                                <MetricCard label="Swaps Conducted" value={stats.total_swaps} trend="95% success rate" icon={<ArrowLeftRight size={24} />} color="var(--accent)" />
                            </div>

                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>System Health</h2>
                                <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
                                    <HealthIndicator label="API Gateway" status="Operational" lastSync="2s ago" />
                                    <HealthIndicator label="Database Engine" status="Optimal" lastSync="5s ago" />
                                    <HealthIndicator label="Identity Provider" status="Secure" lastSync="1m ago" />
                                    <HealthIndicator label="Marketplace Feed" status="Live" lastSync="Just now" />
                                </div>
                            </section>
                        </div>
                    )}

                    {tab === 'users' && (
                        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--surface)', borderBottom: '1px solid var(--glass-border)' }}>
                                    <tr style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <th style={{ padding: 24 }}>User Identity</th>
                                        <th>Access Level</th>
                                        <th>Joined Date</th>
                                        <th style={{ textAlign: 'right', paddingRight: 24 }}>Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="hover-row" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div className="avatar avatar-sm">{initials(u.name)}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: 'var(--text-bright)' }}>{u.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${u.role === 'admin' ? 'primary' : (u.is_blocked ? 'error' : 'success')}`}>
                                                    {u.role === 'admin' ? 'Admin' : (u.is_blocked ? 'Blocked' : 'Verified')}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                                {u.role !== 'admin' && (
                                                    <div style={{ display: 'inline-flex', gap: 8 }}>
                                                        <button onClick={() => blockUser(u.id)} className="btn-icon" title={u.is_blocked ? "Unblock" : "Block"} style={{ padding: 8, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-dim)' }}>
                                                            {u.is_blocked ? <Shield size={18} color="var(--success)" /> : <ShieldOff size={18} color="var(--warning)" />}
                                                        </button>
                                                        <button onClick={() => deleteUser(u.id)} className="btn-icon" title="Delete" style={{ padding: 8, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--error)' }}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === 'skills' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                            {skills.map(s => (
                                <div key={s.id} className="glass-card" style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <span className={`badge badge-${s.type === 'offer' ? 'success' : 'primary'}`}>{s.type}</span>
                                        <button onClick={() => deleteSkill(s.id)} style={{ color: 'var(--error)', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>{s.skill_name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>{s.category?.name || 'Uncategorized'}</p>
                                    <div className="divider" style={{ margin: '16px 0', opacity: 0.3 }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className="avatar avatar-xs">{initials(s.user?.name)}</div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.user?.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'swaps' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {swaps.map(sw => (
                                <div key={sw.id} className="glass-card hover-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', alignItems: 'center', gap: 32 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800 }}>{sw.sender?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{sw.offered_skill?.skill_name}</div>
                                    </div>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ArrowLeftRight size={16} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{sw.receiver?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{sw.requested_skill?.skill_name}</div>
                                    </div>
                                    <span className={`badge badge-${sw.status === 'completed' ? 'success' : (sw.status === 'pending' ? 'warning' : 'error')}`}>
                                        {sw.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none',
            background: active ? 'var(--grad-primary)' : 'transparent',
            color: active ? '#fff' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: '0.3s'
        }}>
            {icon} {label}
        </button>
    )
}

function MetricCard({ label, value, trend, icon, color }) {
    return (
        <div className="glass-card" style={{ borderLeft: `5px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 12, color }}>{icon}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>{trend}</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
        </div>
    )
}

function HealthIndicator({ label, status, lastSync }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{status}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Sync: {lastSync}</div>
        </div>
    )
}
