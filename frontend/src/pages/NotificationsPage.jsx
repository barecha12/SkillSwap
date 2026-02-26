import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Bell, Check, CheckCheck, RefreshCw, Trash2, ArrowRight, MessageSquare, Award, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import SkillSwapLoader from '../components/SkillSwapLoader'
import useScrollReveal from '../hooks/useScrollReveal'
import DashboardSidebar from '../components/DashboardSidebar'

const TYPE_ICONS = {
    swap_request: <RefreshCw size={18} color="var(--primary)" />,
    swap_accepted: <Check size={18} color="var(--success)" />,
    swap_rejected: <Trash2 size={18} color="var(--error)" />,
    swap_completed: <Award size={18} color="var(--warning)" />,
    message: <MessageSquare size={18} color="var(--secondary)" />,
    default: <Bell size={18} color="var(--text-dim)" />,
}

const TYPE_BG = {
    swap_request: 'var(--primary-glow)',
    swap_accepted: 'var(--success-glow)',
    swap_rejected: 'rgba(239,68,68,0.1)',
    swap_completed: 'rgba(255,165,0,0.1)',
    message: 'rgba(255,101,132,0.1)',
    default: 'rgba(255,255,255,0.05)',
}

import DashboardHeader from '../components/DashboardHeader'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useScrollReveal()

    const load = () => {
        api.get('/notifications').then(r => setNotifications(r.data.data || [])).finally(() => setTimeout(() => setLoading(false), 300))
    }

    useEffect(() => { load() }, [])

    const markRead = async (id) => {
        await api.patch(`/notifications/${id}/read`)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    const markAll = async () => {
        try {
            await api.patch('/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            toast.success('All clear! ✨')
        } catch {
            toast.error('Something went wrong')
        }
    }

    const formatTime = (date) => {
        const d = new Date(date)
        const diff = Date.now() - d.getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    if (loading) return <SkillSwapLoader />

    return (
        <div className="sidebar-layout">
            <DashboardSidebar />

            <main className="main-content">
                <DashboardHeader title="Activity Stream" />

                <div className="container" style={{ maxWidth: 800 }}>
                    <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                Event Logging
                                {unreadCount > 0 && <span className="unread-pill">{unreadCount} Pending</span>}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {unreadCount > 0 && (
                                <button onClick={markAll} className="btn btn-ghost" style={{ padding: '8px 16px', borderRadius: 12, fontWeight: 700 }}>
                                    <CheckCheck size={18} /> Mark All Read
                                </button>
                            )}
                        </div>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="reveal reveal-delay-1 glass" style={{ padding: 100, textAlign: 'center', borderRadius: 32 }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Bell size={40} style={{ opacity: 0.2 }} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Quiet in here...</h3>
                            <p style={{ color: 'var(--text-muted)' }}>We'll notify you when someone interacts with your skills.</p>
                        </div>
                    ) : (
                        <div className="reveal reveal-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {notifications.map((n) => (
                                <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                                    className={`glass-card notification-item ${!n.is_read ? 'unread' : ''}`}
                                    style={{
                                        padding: 24, cursor: !n.is_read ? 'pointer' : 'default',
                                        display: 'flex', gap: 20, alignItems: 'center',
                                        transition: 'var(--transition)', border: '1px solid var(--glass-border)',
                                        borderRadius: 20
                                    }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 16,
                                        background: TYPE_BG[n.type] || TYPE_BG.default,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {TYPE_ICONS[n.type] || TYPE_ICONS.default}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            fontSize: '1.05rem', margin: 0, lineHeight: 1.5,
                                            color: n.is_read ? 'var(--text-dim)' : 'var(--text-bright)',
                                            fontWeight: n.is_read ? 500 : 700
                                        }}>{n.message}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                            <Clock size={12} /> {formatTime(n.created_at)}
                                        </div>
                                    </div>
                                    {!n.is_read ? (
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)', flexShrink: 0 }} />
                                    ) : (
                                        <ArrowRight size={16} color="var(--text-dim)" style={{ opacity: 0.3 }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .unread-pill {
                    background: var(--grad-secondary);
                    color: white;
                    border-radius: 12px;
                    padding: 4px 12px;
                    font-size: 0.9rem;
                    font-weight: 900;
                    box-shadow: 0 4px 12px rgba(255, 101, 132, 0.3);
                }
                .notification-item:hover {
                    transform: translateX(8px);
                    background: rgba(255,255,255,0.03);
                    border-color: var(--primary-glow) !important;
                }
                .notification-item.unread {
                    background: rgba(108, 99, 255, 0.03);
                    border-left: 4px solid var(--primary) !important;
                }
            `}</style>
        </div>
    )
}
