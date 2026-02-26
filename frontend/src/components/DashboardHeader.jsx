import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../lib/api'
import {
    Bell, Sun, Moon, LogOut, User, ChevronDown,
    Shield, LayoutDashboard, Search, Menu, Globe, Activity
} from 'lucide-react'

export default function DashboardHeader({ title }) {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
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

    const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

    return (
        <header className="dashboard-header">
            <div className="header-left">
                <h1 className="page-title">{title}</h1>
            </div>

            <div className="header-right">
                {/* Search Bar Shortcut */}
                <div className="header-search">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Quick find skills..." onClick={() => navigate('/skills')} readOnly />
                </div>

                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="header-action-btn" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <Link to="/notifications" className="header-action-btn notification-btn">
                    <Bell size={20} />
                    {unread > 0 && <span className="notification-dot">{unread > 9 ? '9+' : unread}</span>}
                </Link>

                <div className="header-divider" />

                {/* Profile Dropdown */}
                <div className="profile-dropdown-container">
                    <button className="profile-trigger" onClick={() => setDropOpen(!dropOpen)}>
                        <div className="avatar avatar-sm">
                            {user.profile?.photo
                                ? <img src={`http://localhost:8000/storage/${user.profile.photo}`} alt="" />
                                : initial(user.name)}
                        </div>
                        <div className="profile-meta">
                            <span className="profile-name">{user.name.split(' ')[0]}</span>
                            <ChevronDown size={14} className={`chevron ${dropOpen ? 'open' : ''}`} />
                        </div>
                    </button>

                    {dropOpen && (
                        <>
                            <div className="dropdown-overlay" onClick={() => setDropOpen(false)} />
                            <div className="dropdown-menu glass-card">
                                <div className="dropdown-header">
                                    <p className="user-fullname">{user.name}</p>
                                    <p className="user-email">{user.email}</p>
                                </div>
                                <Link to={`/profile/${user.id}`} className="dropdown-link" onClick={() => setDropOpen(false)}>
                                    <Globe size={18} /> Public Identity
                                </Link>

                                {user.role !== 'admin' && (
                                    <Link to="/settings" className="dropdown-link" onClick={() => setDropOpen(false)}>
                                        <LayoutDashboard size={18} /> Settings
                                    </Link>
                                )}

                                {user.role === 'admin' && (
                                    <div className="dropdown-link status-link" style={{ pointerEvents: 'none', opacity: 0.8 }}>
                                        <Activity size={18} color="var(--success)" />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>System Health</span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--success)' }}>All systems nominal</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .dashboard-header {
                    position: sticky; top: 0; left: 0; right: 0;
                    height: 80px; background: var(--nav-bg);
                    backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border);
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 40px; z-index: 900;
                    margin: -60px -60px 48px -60px; /* Offset main-content padding */
                }
                .page-title { font-size: 1.5rem; fontWeight: 900; margin: 0; color: var(--text-bright); }
                .header-right { display: flex; align-items: center; gap: 20px; }
                .header-search { position: relative; display: flex; align-items: center; background: var(--surface); border: 1px solid var(--glass-border); borderRadius: 12px; padding: 0 16px; height: 44px; width: 240px; transition: var(--transition); }
                .header-search:hover { border-color: var(--primary); }
                .header-search input { background: transparent; border: none; outline: none; padding-left: 10px; font-size: 0.85rem; color: var(--text-main); width: 100%; cursor: pointer; }
                .search-icon { color: var(--text-dim); }
                .header-action-btn { width: 44px; height: 44px; borderRadius: 12px; background: var(--surface); border: 1px solid var(--glass-border); color: var(--text-dim); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition); position: relative; }
                .header-action-btn:hover { background: var(--glass-bg-hover); color: var(--primary); transform: translateY(-2px); }
                .notification-dot { position: absolute; top: -5px; right: -5px; background: var(--secondary); color: white; fontSize: 10px; fontWeight: 900; padding: 2px 6px; borderRadius: 10px; border: 2px solid var(--bg-card); }
                .header-divider { width: 1px; height: 24px; background: var(--glass-border); margin: 0 8px; }
                .profile-dropdown-container { position: relative; }
                .profile-trigger { display: flex; align-items: center; gap: 12px; background: transparent; border: none; cursor: pointer; padding: 4px; borderRadius: 12px; transition: var(--transition); }
                .profile-trigger:hover { background: var(--surface); }
                .profile-meta { display: flex; align-items: center; gap: 8px; }
                .profile-name { fontSize: 0.9rem; fontWeight: 800; color: var(--text-bright); }
                .chevron { color: var(--text-dim); transition: 0.3s; }
                .chevron.open { transform: rotate(180deg); }
                .dropdown-overlay { position: fixed; inset: 0; z-index: 1000; }
                .dropdown-menu { position: absolute; top: calc(100% + 12px); right: 0; width: 240px; padding: 12px; z-index: 1001; animation: slideDown 0.2s ease-out; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .dropdown-header { padding: 8px 16px 16px; border-bottom: 1px solid var(--glass-border); marginBottom: 8px; }
                .user-fullname { fontWeight: 900; color: var(--text-bright); margin: 0; }
                .user-email { fontSize: 0.75rem; color: var(--text-dim); margin: 4px 0 0; }
                .dropdown-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; borderRadius: 10px; color: var(--text-main); text-decoration: none; fontSize: 0.9rem; fontWeight: 700; transition: var(--transition); }
                .dropdown-link:hover { background: var(--surface); color: var(--text-bright); }
                .dropdown-divider { height: 1px; background: var(--glass-border); margin: 8px 16px; }
                .logout-link:hover { background: rgba(239, 68, 68, 0.05); color: var(--error); }
                .admin-link { color: var(--primary); }
            `}</style>
        </header>
    )
}
