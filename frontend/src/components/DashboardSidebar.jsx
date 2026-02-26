import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard, Repeat, BookOpen, MessageCircle, Users, Settings, Bell, LogOut, Shield,
    Sun, Moon
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const initial = (name) => name ? name.charAt(0).toUpperCase() : '?'

export default function DashboardSidebar() {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const isActive = (path) => location.pathname === path

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon" style={{ overflow: 'hidden', padding: 5 }}>
                    <img src="/image/img (2).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <span className="brand-text">SkillSwap</span>
            </div>

            <nav className="sidebar-nav">
                {user.role === 'admin' ? (
                    <>
                        <div style={{ padding: '0 16px', marginBottom: 8, fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform Control</div>
                        <SidebarLink to="/admin" icon={<Shield size={20} />} label="Admin Hub" active={isActive('/admin')} color="var(--primary)" />
                    </>
                ) : (
                    <>
                        {/* Standard Workspace Links */}
                        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={isActive('/dashboard')} />
                        <SidebarLink to="/swaps" icon={<Repeat size={20} />} label="My Swaps" active={isActive('/swaps')} />
                        <SidebarLink to="/skills" icon={<BookOpen size={20} />} label="Marketplace" active={isActive('/skills')} />
                        <SidebarLink to="/messages" icon={<MessageCircle size={20} />} label="Messages" active={isActive('/messages')} />
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-divider" />
                <button onClick={handleLogout} className="sidebar-link-danger">
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>

            <style>{`
                .dashboard-sidebar {
                    width: 280px; height: 100vh; position: fixed; top: 0; left: 0;
                    background: var(--bg-card); border-right: 1px solid var(--glass-border);
                    padding: 24px; display: flex; flex-direction: column; z-index: 1000;
                }
                .sidebar-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; padding: 0 8px; }
                .brand-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--grad-primary); display: flex; align-items: center; justify-content: center; }
                .brand-text { font-weight: 800; font-size: 1.25rem; letter-spacing: -0.5px; color: var(--text-bright); }
                .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 6px; }
                .sidebar-divider { height: 1px; background: var(--glass-border); margin: 16px 0; opacity: 0.5; }
                .sidebar-link-danger {
                    display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px;
                    color: var(--text-main); font-weight: 700; font-size: 0.9rem; transition: var(--transition);
                    cursor: pointer; background: transparent; border: none; width: 100%;
                }
                .sidebar-link-danger:hover { color: var(--error); background: rgba(239, 68, 68, 0.05); }
                .sidebar-footer { margin-top: auto; }
                .sidebar-theme-toggle {
                    width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px;
                    background: var(--surface); border: 1px solid var(--glass-border); color: var(--text-main);
                    font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: var(--transition);
                }
                .sidebar-theme-toggle:hover { border-color: var(--primary); }
                .user-pill { background: var(--surface); border: 1px solid var(--glass-border); padding: 12px; border-radius: 16px; display: flex; align-items: center; gap: 12px; }
                .user-info { overflow: hidden; }
                .user-name { font-size: 0.85rem; font-weight: 700; margin: 0; white-space: nowrap; text-overflow: ellipsis; color: var(--text-bright); }
                .user-role { font-size: 0.7rem; color: var(--text-muted); margin: 0; }
            `}</style>
        </aside>
    )
}

function SidebarLink({ to, icon, label, active = false, color = 'var(--text-dim)' }) {
    return (
        <Link to={to} style={{
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: '12px',
            color: active ? 'var(--primary)' : color,
            backgroundColor: active ? 'var(--primary-glow)' : 'transparent',
            fontWeight: 700, fontSize: '0.9rem', transition: 'var(--transition)'
        }}>
            {icon} {label}
        </Link>
    )
}
