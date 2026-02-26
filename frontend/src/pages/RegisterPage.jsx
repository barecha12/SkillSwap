import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Check, Shield } from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'

// ── Runaway button hook ────────────────────────────────────────────────────────
function useRunawayButton(isReady) {
    const [pos, setPos] = useState({ x: 0, y: 0 })
    const [isRunning, setIsRunning] = useState(false)
    const timeoutRef = useRef(null)

    const dodge = useCallback(() => {
        if (isReady) return

        const rx = (Math.random() - 0.5) * 300
        const ry = (Math.random() - 0.5) * 160
        setPos({ x: rx, y: ry })
        setIsRunning(true)

        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            setPos({ x: 0, y: 0 })
            setIsRunning(false)
        }, 1500)
    }, [isReady])

    const reset = useCallback(() => {
        clearTimeout(timeoutRef.current)
        setPos({ x: 0, y: 0 })
        setIsRunning(false)
    }, [])

    return { pos, isRunning, dodge, reset }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [errors, setErrors] = useState({})

    useScrollReveal()

    // All 4 fields must have content AND passwords must match
    const isReady =
        form.name.trim().length > 0 &&
        form.email.trim().length > 0 &&
        form.password.length >= 8 &&
        form.password === form.password_confirmation

    const { pos, isRunning, dodge, reset } = useRunawayButton(isReady)

    const prevReady = useRef(false)
    if (isReady && !prevReady.current) { reset(); prevReady.current = true }
    if (!isReady && prevReady.current) { prevReady.current = false }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isReady) { dodge(); return }
        setLoading(true)
        setErrors({})
        try {
            await register(form.name, form.email, form.password, form.password_confirmation)
            toast.success('Welcome to SkillSwap! 🎉')
            navigate('/dashboard')
        } catch (err) {
            const data = err.response?.data
            if (data?.errors) setErrors(data.errors)
            else toast.error(data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const passwordStrength = () => {
        const p = form.password
        if (!p) return null
        if (p.length < 6) return { label: 'Weak', color: 'var(--error)', width: '30%' }
        if (p.length < 10) return { label: 'Good', color: 'var(--warning)', width: '60%' }
        return { label: 'Secure', color: 'var(--success)', width: '100%' }
    }
    const strength = passwordStrength()

    // Dynamic label shown inside the button when form isn't ready
    const notReadyLabel = () => {
        if (!form.name.trim()) return '✍️ Enter your name'
        if (!form.email.trim()) return '📧 Enter your email'
        if (form.password.length < 8) return '🔐 Password too short'
        if (form.password !== form.password_confirmation) return '🔑 Passwords don\'t match'
        return '👀 Almost there!'
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
            <div className="blob" style={{ top: '5%', right: '10%', width: '500px', height: '500px', background: 'var(--secondary-glow)', filter: 'blur(100px)', opacity: 0.35 }} />
            <div className="blob" style={{ bottom: '10%', left: '5%', width: '450px', height: '450px', background: 'var(--primary-glow)', filter: 'blur(100px)', opacity: 0.3, animationDelay: '-8s' }} />

            <div className="reveal" style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 20, background: 'var(--grad-vibrant)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: 'var(--shadow-glow)',
                        padding: 10
                    }}>
                        <img src="/image/img (2).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-1.5px' }}>Join the Tribe</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Master new skills through real-world exchange</p>
                </div>

                <div className="glass-card" style={{ padding: 48, border: '1px solid var(--glass-border)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label">Display Name</label>
                            <input className="form-input" type="text" placeholder="John Doe"
                                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            {errors.name && <span className="error-msg">{errors.name[0]}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="email" placeholder="name@example.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            {errors.email && <span className="error-msg">{errors.email[0]}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Create Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingRight: 48 }} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {strength && (
                                <div style={{ marginTop: 12 }}>
                                    <div style={{ height: 6, background: 'var(--surface)', borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
                                        <div style={{ width: strength.width, height: '100%', background: strength.color, borderRadius: 10, transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 700, textTransform: 'uppercase' }}>{strength.label}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                                            <Shield size={12} /> Encrypted
                                        </div>
                                    </div>
                                </div>
                            )}
                            {errors.password && <span className="error-msg">{errors.password[0]}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input className="form-input" type="password" placeholder="Repeat for security"
                                value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation: e.target.value })} />
                            {form.password_confirmation && form.password === form.password_confirmation && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontWeight: 600 }}>
                                    <Check size={16} /> Identity confirmed
                                </span>
                            )}
                        </div>

                        {/* ── Runaway / normal submit button ── */}
                        <div style={{ position: 'relative', height: 56, marginTop: 12 }}>
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
                                    fontSize: '1.05rem',
                                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                                    transition: isRunning
                                        ? 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                        : 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    cursor: isReady ? 'pointer' : 'not-allowed',
                                    zIndex: 20,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {loading
                                    ? <><div className="spinner-premium" style={{ width: 22, height: 22 }} /> Creating Profile...</>
                                    : isReady
                                        ? <>Get Started <ArrowRight size={20} /></>
                                        : notReadyLabel()
                                }
                            </button>
                        </div>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Already a member?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>Sign In</Link>
                </p>
            </div>

            <style>{`
                .blob {
                    position: absolute;
                    border-radius: 50%;
                    animation: float 25s infinite alternate ease-in-out;
                    z-index: 1;
                }
                @keyframes float {
                    0%   { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(100px, -50px) scale(1.1); }
                }

                /* Runaway button states */
                .runaway-btn.not-ready {
                    background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%) !important;
                    box-shadow: 0 4px 20px rgba(236,72,153,0.35) !important;
                }
                .runaway-btn.is-running {
                    box-shadow: 0 16px 48px rgba(236,72,153,0.7) !important;
                    filter: brightness(1.1);
                }
                .runaway-btn.not-ready:hover {
                    animation: btnWiggle 0.35s ease;
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
