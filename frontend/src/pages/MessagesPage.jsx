import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Send, MessageSquare, MapPin, Search as SearchIcon, MoreVertical, Phone, Video, Info, Activity } from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'
import DashboardSidebar from '../components/DashboardSidebar'
import SkillSwapLoader from '../components/SkillSwapLoader'
import DashboardHeader from '../components/DashboardHeader'

const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

export default function MessagesPage() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const [conversations, setConversations] = useState([])
    const [active, setActive] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)

    useScrollReveal()

    useEffect(() => {
        api.get('/conversations').then(r => {
            setConversations(r.data)
            const userId = searchParams.get('user')
            if (userId) {
                const existing = r.data.find(c => c.partner?.id === parseInt(userId))
                if (existing) {
                    setActive(existing.partner)
                } else {
                    api.get(`/profile/${userId}`).then(p => setActive(p.data.user)).catch(() => { })
                }
            } else if (r.data.length > 0 && !active) {
                setActive(r.data[0].partner)
            }
        }).finally(() => setTimeout(() => setLoading(false), 300))
    }, [])

    useEffect(() => {
        if (!active) return
        api.get(`/messages/${active.id}`).then(r => {
            setMessages(r.data)
            scrollToBottom()
        })

        const interval = setInterval(() => {
            api.get(`/messages/${active.id}`).then(r => setMessages(r.data))
        }, 5000)
        return () => clearInterval(interval)
    }, [active])

    useEffect(() => { scrollToBottom() }, [messages])

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!input.trim() || !active) return
        setSending(true)
        const text = input
        setInput('')
        try {
            const res = await api.post('/messages', { receiver_id: active.id, message: text })
            setMessages(prev => [...prev, res.data.data])
            api.get('/conversations').then(r => setConversations(r.data))
        } catch {
            toast.error('Failed to send')
            setInput(text)
        } finally {
            setSending(false)
        }
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatDate = (date) => {
        const d = new Date(date)
        const today = new Date()
        if (d.toDateString() === today.toDateString()) return 'Today'
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
        return d.toLocaleDateString()
    }

    if (loading) return <SkillSwapLoader />

    return (
        <div className="sidebar-layout">
            <DashboardSidebar />

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <DashboardHeader title="Neural Link" />

                <div className="reveal" style={{ flex: 1, display: 'flex', padding: '0 0 32px 0', gap: 24, minHeight: 0 }}>

                    {/* Conversations Sidebar (Internal to Messages) */}
                    <div className="reveal glass" style={{
                        width: 380, display: 'flex', flexDirection: 'column',
                        borderRadius: 24, padding: 0, overflow: 'hidden', border: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ padding: '32px 24px 20px', background: 'var(--bg-card)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Inboxes</h2>
                                <Link to="/swaps" className="btn-icon" style={{ borderRadius: 12 }}><Activity size={18} /></Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <SearchIcon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                <input className="form-input" placeholder="Search chats..." style={{ paddingLeft: 40, height: 44, borderRadius: 12, background: 'var(--surface)', fontSize: '0.9rem' }} />
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-thin">
                            {conversations.length === 0 ? (
                                <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-dim)' }}>
                                    <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                    <p style={{ fontSize: '0.9rem' }}>No conversations.</p>
                                </div>
                            ) : conversations.map(conv => (
                                <button key={conv.partner?.id} onClick={() => setActive(conv.partner)}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '16px 24px',
                                        background: active?.id === conv.partner?.id ? 'var(--primary-glow)' : 'transparent',
                                        border: 'none', borderLeft: active?.id === conv.partner?.id ? '4px solid var(--primary)' : '4px solid transparent',
                                        cursor: 'pointer', transition: 'var(--transition)', display: 'flex', gap: 16, alignItems: 'center',
                                    }}>
                                    <div style={{ position: 'relative' }}>
                                        <div className="avatar avatar-md" style={{ border: active?.id === conv.partner?.id ? '2px solid var(--primary)' : '2px solid transparent' }}>
                                            {conv.partner?.profile?.photo
                                                ? <img src={`http://localhost:8000/storage/${conv.partner.profile.photo}`} alt="" />
                                                : initial(conv.partner?.name)}
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <div style={{
                                                position: 'absolute', top: -2, right: -2,
                                                width: 18, height: 18, borderRadius: '50%',
                                                background: 'var(--secondary)', fontSize: 10, fontWeight: 900,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                                                boxShadow: '0 0 0 3px var(--bg-card)'
                                            }}>{conv.unread_count}</div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 2, color: active?.id === conv.partner?.id ? 'var(--text-bright)' : 'var(--text)' }}>
                                            {conv.partner?.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {conv.last_message?.message || 'Start a conversation'}
                                        </div>
                                    </div>
                                    {conv.last_message && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                                            {formatTime(conv.last_message.created_at)}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Display Area */}
                    <div className="reveal reveal-delay-1 glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                        {active ? (
                            <>
                                {/* Chat Header */}
                                <div style={{
                                    padding: '24px 32px', borderBottom: '1px solid var(--glass-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: 'var(--bg-card)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div className="avatar avatar-md" style={{ border: '2px solid var(--primary-glow)' }}>
                                            {active.profile?.photo
                                                ? <img src={`http://localhost:8000/storage/${active.profile.photo}`} alt="" />
                                                : initial(active.name)}
                                        </div>
                                        <div>
                                            <Link to={`/profile/${active.id}`}>
                                                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-bright)' }}>{active.name}</div>
                                            </Link>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(to bottom, #43e97b, #38f9d7)' }}></div>
                                                {active.profile?.location || 'Active Now'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn-icon" style={{ borderRadius: 12 }}><Phone size={20} /></button>
                                        <button className="btn-icon" style={{ borderRadius: 12 }}><Video size={20} /></button>
                                        <button className="btn-icon" style={{ borderRadius: 12 }}><Info size={20} /></button>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="scroll-thin chat-container">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {messages.map((msg, i) => {
                                            const isMine = msg.sender_id === user.id
                                            const showDate = i === 0 || formatDate(messages[i - 1]?.created_at) !== formatDate(msg.created_at)
                                            return (
                                                <div key={msg.id}>
                                                    {showDate && (
                                                        <div style={{ textAlign: 'center', margin: '24px 0', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                            {formatDate(msg.created_at)}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 12, alignItems: 'flex-end' }}>
                                                        {!isMine && (
                                                            <div className="avatar avatar-sm">{initial(active.name)}</div>
                                                        )}
                                                        <div style={{ maxWidth: '65%' }}>
                                                            <div className={`msg-bubble-premium ${isMine ? 'sent' : 'received'}`}>
                                                                {msg.message}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 6, fontWeight: 700, textAlign: isMine ? 'right' : 'left' }}>
                                                                {formatTime(msg.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* Chat Input Area */}
                                <div style={{ padding: '24px 32px', background: 'var(--bg-card)', borderTop: '1px solid var(--glass-border)' }}>
                                    <form onSubmit={sendMessage} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <input
                                                className="form-input"
                                                placeholder={`Type your message...`}
                                                value={input}
                                                onChange={e => setInput(e.target.value)}
                                                style={{ height: 56, borderRadius: 16, paddingLeft: 24, fontSize: '1rem', border: '1px solid var(--glass-border)', background: 'var(--surface)' }}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary" disabled={!input.trim() || sending}
                                            style={{ height: 56, width: 56, borderRadius: 16, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {sending ? <div className="spinner-premium" style={{ width: 24, height: 24, borderTopColor: 'white' }} /> : <Send size={24} />}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div className="reveal">
                                    <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,101,132,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                                        <MessageSquare size={60} style={{ color: 'var(--secondary)', opacity: 0.3 }} />
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 12 }}>Your Conversations</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 400 }}>Select a member from the sidebar to view your message history.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style>{`
                .msg-bubble-premium {
                    padding: 16px 20px;
                    border-radius: 20px;
                    font-size: 0.95rem;
                    line-height: 1.55;
                    position: relative;
                }
                .msg-bubble-premium.sent {
                    background: var(--grad-primary);
                    color: white;
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 10px 20px rgba(108, 99, 255, 0.2);
                }
                .msg-bubble-premium.received {
                    background: rgba(255,255,255,0.06);
                    color: var(--text-bright);
                    border-bottom-left-radius: 4px;
                    border: 1px solid var(--glass-border);
                }
                .chat-container {
                    background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0);
                    background-size: 32px 32px;
                }
            `}</style>
        </div>
    )
}
