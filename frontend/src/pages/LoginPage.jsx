import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'

// ── Runaway button hook ────────────────────────────────────────────────────────
function useRunawayButton(isReady) {
    const [pos, setPos] = useState({ x: 0, y: 0 })
    const [isRunning, setIsRunning] = useState(false)
    const timeoutRef = useRef(null)

    const dodge = useCallback(() => {
        if (isReady) return   // form is valid → let it stay

        // Pick a random offset within a safe range so it stays on-screen
        const rx = (Math.random() - 0.5) * 320
        const ry = (Math.random() - 0.5) * 180
        setPos({ x: rx, y: ry })
        setIsRunning(true)

        // Snap back after 1.5s if untouched
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            setPos({ x: 0, y: 0 })
            setIsRunning(false)
        }, 1500)
    }, [isReady])

    // Reset immediately when form becomes valid
    const reset = useCallback(() => {
        clearTimeout(timeoutRef.current)
        setPos({ x: 0, y: 0 })
        setIsRunning(false)
    }, [])

    return { pos, isRunning, dodge, reset }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [errors, setErrors] = useState({})

    useScrollReveal()

    // Form is "ready" only when both fields have content
    const isReady = form.email.trim().length > 0 && form.password.length > 0
    const { pos, isRunning, dodge, reset } = useRunawayButton(isReady)

    // Keep reset in sync when form becomes valid
    const prevReady = useRef(false)
    if (isReady && !prevReady.current) { reset(); prevReady.current = true }
    if (!isReady && prevReady.current) { prevReady.current = false }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isReady) { dodge(); return }
        setLoading(true)
        setErrors({})
        try {
            const user = await login(form.email, form.password)
            toast.success(`Welcome back, ${user.name}!`)
            navigate(user.role === 'admin' ? '/admin' : '/dashboard')
        } catch (err) {
            const data = err.response?.data
            if (data?.errors) setErrors(data.errors)
            else toast.error(data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-main)',
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Blobs */}
            <div className="blob" style={{ top: '10%', left: '10%', width: '400px', height: '400px', background: 'var(--primary-glow)', filter: 'blur(80px)', opacity: 0.4 }} />
            <div className="blob" style={{ bottom: '10%', right: '10%', width: '350px', height: '350px', background: 'var(--secondary-glow)', filter: 'blur(80px)', opacity: 0.3, animationDelay: '-5s' }} />

            <div className="reveal" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
                {/* Logo Section */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 20, background: 'var(--grad-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: 'var(--shadow-glow)',
                        padding: 10
                    }}>
                        <img src="/image/img (2).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-1px' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Sign in to continue your skill swapping journey</p>
                </div>

                <div className="glass-card" style={{ padding: 48, border: '1px solid var(--glass-border)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                            {errors.email && <span className="error-msg">{errors.email[0]}</span>}
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Forgot?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="form-input"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    style={{ paddingRight: 48 }}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center'
                                }}>
                                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <span className="error-msg">{errors.password[0]}</span>}
                        </div>

                        {/* ── Runaway / normal submit button ── */}
                        <div style={{ position: 'relative', height: 56, marginTop: 8 }}>
                            <button
                                type={isReady ? 'submit' : 'button'}
                                className={`btn btn-primary runaway-btn${isRunning ? ' is-running' : ''}${!isReady ? ' not-ready' : ''}`}
                                disabled={loading}
                                onMouseEnter={!isReady ? dodge : undefined}
                                onClick={!isReady ? dodge : undefined}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '1.1rem',
                                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                                    transition: isRunning
                                        ? 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                        : 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    cursor: isReady ? 'pointer' : 'not-allowed',
                                    zIndex: 20,
                                }}
                            >
                                {loading
                                    ? <><div className="spinner-premium" style={{ width: 22, height: 22 }} /> Authenticating...</>
                                    : isReady
                                        ? <>Sign In <ArrowRight size={20} /></>
                                        : <>👀 Fill the fields first!</>
                                }
                            </button>
                        </div>

                        {/* Demo Credentials Section */}
                        <div className="glass" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid var(--primary-glow)', borderRadius: 12, padding: 16, fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--primary)', fontWeight: 800 }}>
                                <ShieldCheck size={16} /> Quick Access
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 12px', color: 'var(--text-dim)' }}>
                                <strong>User:</strong> <span>john@example.com / password</span>
                                <strong>Admin:</strong> <span>admin@skillswap.com / password</span>
                            </div>
                        </div>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    New to the community?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>Create an account</Link>
                </p>
            </div>

            <style>{`
                .blob {
                    position: absolute;
                    border-radius: 50%;
                    animation: float 20s infinite alternate ease-in-out;
                    z-index: 1;
                }
                @keyframes float {
                    0%   { transform: translate(0, 0) rotate(0deg); }
                    100% { transform: translate(50px, 100px) rotate(360deg); }
                }

                /* Runaway button states */
                .runaway-btn.not-ready {
                    background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%) !important;
                    box-shadow: 0 4px 20px rgba(236,72,153,0.35) !important;
                }
                .runaway-btn.is-running {
                    box-shadow: 0 12px 40px rgba(236,72,153,0.6) !important;
                }
                /* Wiggle hint on hover when not ready */
                .runaway-btn.not-ready:hover {
                    animation: btnWiggle 0.4s ease;
                }
                @keyframes btnWiggle {
                    0%,100% { rotate: 0deg; }
                    25%     { rotate: -4deg; }
                    75%     { rotate:  4deg; }
                }
            `}</style>
        </div>
    )
}
