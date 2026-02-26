import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Settings, Shield, Bell, Eye, Lock, Globe, Moon, Smartphone } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar'
import useScrollReveal from '../hooks/useScrollReveal'
import toast from 'react-hot-toast'
import SkillSwapLoader from '../components/SkillSwapLoader'

import DashboardHeader from '../components/DashboardHeader'

export default function SettingsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    useScrollReveal()

    const handleSave = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            toast.success('Preferences synchronized!')
        }, 800)
    }

    return (
        <div className="sidebar-layout">
            <DashboardSidebar />

            <main className="main-content">
                <DashboardHeader title="System Config" />

                <div className="container" style={{ maxWidth: 800 }}>
                    <header className="reveal" style={{ marginBottom: 48 }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-dim)' }}>Workstation Protocols</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Fine-tune your interface and communication preferences.</p>
                    </header>

                    <div className="reveal reveal-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Account Security */}
                        <section className="glass-card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Lock size={24} color="var(--primary)" />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Access Control</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div className="form-group">
                                    <label className="form-label">Email Handle</label>
                                    <input className="form-input" value={user.email} disabled style={{ opacity: 0.6 }} />
                                </div>
                                <button className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>Request Password Reset</button>
                            </div>
                        </section>

                        {/* Notifications */}
                        <section className="glass-card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,101,132,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bell size={24} color="var(--secondary)" />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Push Protocols</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <SettingToggle label="New Swap Requests" active={true} />
                                <SettingToggle label="Direct Messages" active={true} />
                                <SettingToggle label="System Updates" active={false} />
                            </div>
                        </section>

                        {/* Appearance */}
                        <section className="glass-card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,165,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Moon size={24} color="var(--warning)" />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Visual Matrix</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <SettingToggle label="Dark Horizon Mode" active={true} disabled />
                                <SettingToggle label="Glassmorphism Effects" active={true} />
                                <SettingToggle label="Motion & Transitions" active={true} />
                            </div>
                        </section>

                        <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '14px 40px', minWidth: 180 }} disabled={loading}>
                                {loading ? <><div className="spinner-premium" style={{ width: 18, height: 18, marginRight: 10 }} /> Syncing...</> : 'Save Configuration'}
                            </button>
                            <button className="btn btn-ghost">Reset to Defaults</button>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
            `}</style>
        </div>
    )
}

function SettingToggle({ label, active, disabled = false }) {
    const [on, setOn] = useState(active)
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: disabled ? 0.6 : 1 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{label}</span>
            <button
                onClick={() => !disabled && setOn(!on)}
                style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: on ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    position: 'relative', border: 'none', cursor: disabled ? 'default' : 'pointer',
                    transition: '0.3s'
                }}
            >
                <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'white', position: 'absolute',
                    top: 3, left: on ? 23 : 3, transition: '0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
            </button>
        </div>
    )
}
