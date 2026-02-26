import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const res = await api.get('/me')
                    setUser(res.data)
                    localStorage.setItem('user', JSON.stringify(res.data))
                } catch (err) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    setUser(null)
                }
            }
            // Small delay for smooth transition as requested by user's "alive" feel
            setTimeout(() => setLoading(false), 800)
        }
        checkAuth()
    }, [])

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password })
        const { user, token } = res.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        return user
    }

    const register = async (name, email, password, password_confirmation) => {
        const res = await api.post('/register', { name, email, password, password_confirmation })
        const { user, token } = res.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        return user
    }

    const logout = async () => {
        try { await api.post('/logout') } catch { }
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const refreshUser = async () => {
        try {
            const res = await api.get('/me')
            setUser(res.data)
            localStorage.setItem('user', JSON.stringify(res.data))
        } catch { }
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
