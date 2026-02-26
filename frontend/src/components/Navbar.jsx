import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
    Home, Search, ArrowLeftRight, MessageSquare, User,
    Bell, LogOut, Menu, X, Shield, ChevronDown, LayoutDashboard,
    Sun, Moon
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [dropOpen, setDropOpen] = useState(false)
    const [unread, setUnread] = useState(0)

    useEffect(() => {
        if (user) {
            api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => { })
        }
    }, [user, location.pathname])

    const handleLogout = async () => {
        setDropOpen(false)
        await logout()
        navigate('/')
    }

    const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

    const navLinks = [
        { to: '/', icon: <Home size={18} />, label: 'Home' },
        { to: '/skills', icon: <Search size={18} />, label: 'Market' },
        { to: '/swaps', icon: <ArrowLeftRight size={18} />, label: 'My Swaps', auth: true, hideForAdmin: true },
        { to: '/messages', icon: <MessageSquare size={18} />, label: 'Inbox', auth: true, hideForAdmin: true },
    ]

    const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 1000,
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(32px) saturate(180%)',
            borderBottom: '1px solid var(--glass-border)',
            height: 84, display: 'flex', alignItems: 'center'
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Brand Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'var(--grad-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(108, 99, 255, 0.3)',
                        transform: 'rotate(-5deg)',
                        overflow: 'hidden',
                        padding: 6
                    }}>
                        <img src="/image/img (2).png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{
                        fontSize: '1.5rem', fontWeight: 900,
                        background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1px'
                    }}>
                        SkillSwap
                    </span>
                </Link>

                <div style={{ display: 'flex', gap: 10, background: 'var(--surface)', padding: 6, borderRadius: 100, border: '1px solid var(--glass-border)' }}>
                    {navLinks.filter(l => (!l.auth || user) && (!l.hideForAdmin || (user && user.role !== 'admin'))).map(l => (
                        <Link key={l.to} to={l.to} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 20px', borderRadius: 100,
                            fontSize: '0.9rem', fontWeight: 700,
                            color: isActive(l.to) ? 'var(--text-bright)' : 'var(--text-dim)',
                            background: isActive(l.to) ? 'var(--surface)' : 'transparent',
                            transition: 'var(--transition)',
                            boxShadow: isActive(l.to) ? 'inset 0 0 10px rgba(139, 92, 246, 0.05)' : 'none',
                            textDecoration: 'none'
                        }}>
                            <span style={{ color: isActive(l.to) ? 'var(--primary)' : 'inherit' }}>{l.icon}</span>
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Actions / Profile Area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="btn-icon" style={{ borderRadius: 14 }} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <>
                            {/* Dashboard Shortcut */}
                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} title={user.role === 'admin' ? 'Admin Hub' : 'Dashboard'} className="btn-icon" style={{ borderRadius: 14 }}>
                                <LayoutDashboard size={20} />
                            </Link>

                            {/* Enhanced Notifications */}
                            <Link to="/notifications" style={{ position: 'relative' }}>
                                <button className="btn-icon" style={{ borderRadius: 14 }}>
                                    <Bell size={20} />
                                </button>
                                {unread > 0 && (
                                    <span style={{
                                        position: 'absolute', top: -4, right: -4,
                                        background: 'var(--secondary)', color: 'white',
                                        borderRadius: 8, padding: '2px 6px',
                                        fontSize: 10, fontWeight: 900, border: '2px solid var(--bg-main)',
                                        boxShadow: '0 4px 10px rgba(236, 72, 153, 0.4)'
                                    }}>{unread > 9 ? '9+' : unread}</span>
                                )}
                            </Link>

                            {/* Account Dropdown */}
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setDropOpen(!dropOpen)} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    background: 'var(--surface)', border: '1px solid var(--glass-border)',
                                    borderRadius: 16, padding: '6px 14px 6px 6px',
                                    cursor: 'pointer', transition: 'var(--transition)',
                                }}>
                                    <div className="avatar avatar-sm" style={{ border: '2px solid var(--primary-glow)' }}>
                                        {user.profile?.photo
                                            ? <img src={`http://localhost:8000/storage/${user.profile.photo}`} alt="" />
                                            : initial(user.name)}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                                        {user.name.split(' ')[0]}
                                    </span>
                                    <ChevronDown size={14} style={{ opacity: 0.5, transform: dropOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                </button>

                                {dropOpen && (
                                    <>
                                        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }} onClick={() => setDropOpen(false)} />
                                        <div className="glass-card" style={{
                                            position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                                            width: 240, padding: 12, paddingBottom: 16,
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 1001,
                                            animation: 'reveal 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            borderRadius: 20
                                        }}>
                                            <div style={{ padding: '8px 16px 16px', borderBottom: '1px solid var(--glass-border)', marginBottom: 12 }}>
                                                <div style={{ fontWeight: 900, color: 'var(--text-bright)' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>{user.email}</div>
                                            </div>

                                            {user.role === 'admin' ? (
                                                <Link to="/admin" className="dropdown-item" onClick={() => setDropOpen(false)} style={{ color: 'var(--primary)' }}>
                                                    <Shield size={18} /> Admin Hub
                                                </Link>
                                            ) : (
                                                <Link to={`/profile/${user.id}`} className="dropdown-item" onClick={() => setDropOpen(false)}>
                                                    <User size={18} /> My Identity
                                                </Link>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Link to="/login" style={{ textDecoration: 'none' }}><button className="btn btn-ghost" style={{ fontWeight: 800 }}>Login</button></Link>
                            <Link to="/register" style={{ textDecoration: 'none' }}><button className="btn btn-primary" style={{ fontWeight: 800, padding: '10px 24px', borderRadius: 14 }}>Join Network</button></Link>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .dropdown-item {
                    display: flex; align-items: center; gap: 12px; padding: 12px 16px; 
                    border-radius: 12px; color: var(--text-main); text-decoration: none; 
                    font-size: 0.95rem; font-weight: 700; transition: var(--transition);
                    background: transparent; border: none; width: 100%; cursor: pointer;
                }
                .dropdown-item:hover { background: var(--surface); color: var(--text-bright); }
                .dropdown-item.danger:hover { background: rgba(255,71,87,0.1); color: var(--error); }
                
                .btn-icon {
                    width: 44px; height: 44px; display: flex; align-items: center; justifyContent: center;
                    background: var(--surface); border: 1px solid var(--glass-border);
                    color: var(--text-dim); cursor: pointer; transition: var(--transition);
                }
                .btn-icon:hover { background: var(--glass-bg-hover); color: var(--text-bright); transform: translateY(-2px); }
            `}</style>
        </nav >
    )
}
